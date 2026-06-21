import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { extractAudioFromFile, extractAudioFromUrl, isSupportedVideoUrl, getPlatformName } from "./_core/videoProcessing";
import { transcribeAudio } from "./_core/voiceTranscription";
import { invokeLLM } from "./_core/llm";
import { getDb, getUserVideoTranscripts, deleteVideoTranscript } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  scripts: router({
    generate: protectedProcedure
      .input(
        z.object({
          movieTitle: z.string().min(1),
          year: z.number().optional(),
          genre: z.string().optional(),
          plotSummary: z.string().min(10),
          tone: z.enum(["Dramatic", "Comedic", "Suspenseful", "Educational", "Casual"]),
          length: z.enum(["Short", "Medium", "Long"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Calculate target word count based on length
        const wordCountMap = {
          Short: 600,
          Medium: 1400,
          Long: 2400,
        };
        const targetWordCount = wordCountMap[input.length];

        // Create prompt based on tone and parameters
        const toneDescriptions = {
          Dramatic: "dramatic, intense, and emotionally compelling",
          Comedic: "humorous, witty, and entertaining",
          Suspenseful: "suspenseful, thrilling, and mysterious",
          Educational: "informative, analytical, and insightful",
          Casual: "casual, conversational, and approachable",
        };

        const prompt = `You are a professional movie recap script writer. Create a compelling movie recap script for:

Movie: ${input.movieTitle}${input.year ? ` (${input.year})` : ""}
Genre: ${input.genre || "Unknown"}
Plot Summary: ${input.plotSummary}

Style: Write in a ${toneDescriptions[input.tone]} tone.
Target Length: Approximately ${targetWordCount} words.

Structure the script with:
1. OPENING - Hook the audience with an intriguing introduction
2. ACT BREAKDOWN - Cover the main plot points and character arcs
3. CLIMAX - Highlight the turning point and resolution
4. CLOSING - End with a memorable conclusion

Make it engaging, well-paced, and suitable for a movie recap video. Use clear section headers.`;

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an expert movie recap script writer who creates engaging, well-structured scripts for video content.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const scriptContent = typeof response.choices[0]?.message.content === 'string' 
            ? response.choices[0].message.content 
            : "";
          if (!scriptContent) {
            throw new Error("Failed to generate script content");
          }

          const wordCount = scriptContent.split(/\s+/).length;

          // Save to database
          const db = await getDb();
          if (db) {
            const { scripts } = await import("../drizzle/schema");
            await db.insert(scripts).values([
              {
                userId: ctx.user.id,
                movieTitle: input.movieTitle,
                year: input.year || undefined,
                genre: input.genre || undefined,
                plotSummary: input.plotSummary,
                tone: input.tone,
                length: input.length,
                generatedScript: scriptContent,
                wordCount,
              },
            ]);
          }

          return {
            script: scriptContent,
            wordCount,
          };
        } catch (error) {
          console.error("[Script Generation Error]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate script. Please try again.",
          });
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const { scripts } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const result = await db
        .select()
        .from(scripts)
        .where(eq(scripts.userId, ctx.user.id))
        .orderBy((t) => t.createdAt);

      return result;
    }),

    getById: protectedProcedure.input(z.object({ scriptId: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const { scripts } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");

      const result = await db
        .select()
        .from(scripts)
        .where(and(eq(scripts.id, input.scriptId), eq(scripts.userId, ctx.user.id)))
        .limit(1);

      return result[0] || null;
    }),

    delete: protectedProcedure.input(z.object({ scriptId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { scripts } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");

      await db
        .delete(scripts)
        .where(and(eq(scripts.id, input.scriptId), eq(scripts.userId, ctx.user.id)));

      return { success: true };
    }),
  }),

  videoTranscripts: router({
    extractTranscript: protectedProcedure
      .input(
        z.object({
          videoUrl: z.string().optional(),
          sourceLanguage: z.enum(["English", "Chinese", "Myanmar"]).default("English"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!input.videoUrl) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Video URL or file upload is required",
          });
        }

        try {
          let audioBuffer: Buffer;
          let platform = "Direct URL";

          // Check if it's a supported video platform URL
          if (isSupportedVideoUrl(input.videoUrl)) {
            platform = getPlatformName(input.videoUrl);
            console.log(`[Video Processing] Extracting audio from ${platform}: ${input.videoUrl}`);
            audioBuffer = await extractAudioFromUrl(input.videoUrl, "mp3");
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Unsupported video URL. Please provide a direct video link or a supported platform URL (YouTube, TikTok, Instagram, etc.)`,
            });
          }

          // Transcribe audio using Whisper API
          console.log(`[Transcription] Starting transcription for ${platform} video...`);

          // Create a temporary file-like object for transcription
          const audioUrl = `data:audio/mp3;base64,${audioBuffer.toString("base64")}`;

          const transcription = await transcribeAudio({
            audioUrl,
            language: input.sourceLanguage === "English" ? "en" : input.sourceLanguage === "Chinese" ? "zh" : "my",
          });

          if ('error' in transcription) {
            throw new Error(`Transcription failed: ${transcription.error}`);
          }

          if (!transcription.text) {
            throw new Error("No transcription text returned");
          }

          console.log(`[Transcription] Successfully transcribed ${transcription.text.split(" ").length} words`);

          return {
            transcript: transcription.text,
            language: input.sourceLanguage,
            platform,
          };
        } catch (error) {
          console.error("[Video Processing Error]", error);

          const errorMessage = error instanceof Error ? error.message : String(error);

          if (errorMessage.includes("FILE_TOO_LARGE")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Video file is too large (max 16MB). Please use a shorter video.",
            });
          }

          if (errorMessage.includes("INVALID_FORMAT")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid audio format or unable to download video. Please try another link.",
            });
          }

          if (errorMessage.includes("not supported")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: errorMessage,
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to extract transcript: ${errorMessage}`,
          });
        }
      }),

    convertToScript: protectedProcedure
      .input(
        z.object({
          rawTranscript: z.string().min(50, "Transcript must be at least 50 characters"),
          sourceLanguage: z.enum(["English", "Chinese", "Myanmar"]).default("English"),
          targetLanguage: z.enum(["English", "Chinese", "Myanmar"]).default("English"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const languageNames = {
            English: "English",
            Chinese: "Chinese",
            Myanmar: "Myanmar (Burmese)",
          };

          const prompt = `You are a professional movie recap script writer. Transform the following raw video dialogue/transcript into a well-structured, engaging movie recap script.

SOURCE LANGUAGE: ${languageNames[input.sourceLanguage]}
TARGET LANGUAGE: ${languageNames[input.targetLanguage]}

RAW TRANSCRIPT:
${input.rawTranscript}

Please create a professional movie recap script that:
1. Summarizes the key plot points from the dialogue
2. Maintains the narrative flow and emotional beats
3. Is written in ${languageNames[input.targetLanguage]}
4. Includes clear section headers (INTRO, ACT 1, ACT 2, CLIMAX, CONCLUSION)
5. Is suitable for a movie recap video
6. Is approximately 800-1200 words

Format the output with clear sections and make it engaging and well-paced.`;

          console.log(`[Script Generation] Converting transcript to ${languageNames[input.targetLanguage]} recap script...`);

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert movie recap script writer who creates engaging, well-structured scripts in multiple languages. You are fluent in ${languageNames[input.sourceLanguage]} and ${languageNames[input.targetLanguage]}.`,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const scriptContent = typeof response.choices[0]?.message.content === 'string' 
            ? response.choices[0].message.content 
            : "";
          if (!scriptContent) {
            throw new Error("Failed to generate script content");
          }

          const wordCount = scriptContent.split(/\s+/).length;

          // Save to database
          const db = await getDb();
          if (db) {
            const { videoTranscripts } = await import("../drizzle/schema");
            await db.insert(videoTranscripts).values([
              {
                userId: ctx.user.id,
                videoUrl: null,
                videoFileName: undefined,
                sourceLanguage: input.sourceLanguage,
                targetLanguage: input.targetLanguage,
                rawTranscript: input.rawTranscript,
                generatedScript: scriptContent,
                wordCount,
              },
            ]);
          }

          console.log(`[Script Generation] Successfully generated ${wordCount} word script`);

          return {
            script: scriptContent,
            wordCount,
            language: input.targetLanguage,
          };
        } catch (error) {
          console.error("[Script Conversion Error]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to convert transcript to script: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserVideoTranscripts(ctx.user.id);
    }),

    getById: protectedProcedure.input(z.object({ transcriptId: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const { videoTranscripts } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");

      const result = await db
        .select()
        .from(videoTranscripts)
        .where(and(eq(videoTranscripts.id, input.transcriptId), eq(videoTranscripts.userId, ctx.user.id)))
        .limit(1);

      return result[0] || null;
    }),

    delete: protectedProcedure.input(z.object({ transcriptId: z.number() })).mutation(async ({ ctx, input }) => {
      await deleteVideoTranscript(input.transcriptId, ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
