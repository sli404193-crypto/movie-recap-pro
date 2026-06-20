import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
        const { invokeLLM } = await import("./_core/llm");
        
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
          Casual: "conversational, relaxed, and approachable",
        };
        
        const prompt = `You are a professional movie recap script writer. Generate a ${toneDescriptions[input.tone]} movie recap script for the following movie:

Title: ${input.movieTitle}
Year: ${input.year || "Unknown"}
Genre: ${input.genre || "Unknown"}
Plot Summary: ${input.plotSummary}

Write a comprehensive recap script that includes:
1. An engaging introduction that hooks the viewer
2. Act-by-act breakdown of the main plot points
3. Key character moments and development
4. A compelling conclusion that summarizes the film's impact

Target length: approximately ${targetWordCount} words
Tone: ${input.tone}

Format the script with clear section headers and make it suitable for narration. Ensure the script is engaging and maintains the ${input.tone} tone throughout.`;
        
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a professional movie recap script writer who creates engaging, well-structured scripts for various tones and audiences.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });
          
          const content = response.choices[0]?.message.content;
          let generatedScript = "";
          
          if (typeof content === "string") {
            generatedScript = content.trim();
          } else if (Array.isArray(content)) {
            // Handle array of content blocks
            generatedScript = content
              .filter((block: any) => block.type === "text")
              .map((block: any) => block.text)
              .join("\n")
              .trim();
          }
          
          // Validate that we got meaningful content
          if (!generatedScript || generatedScript.length < 50) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Generated script is too short or empty. Please try again with more detailed plot information.",
            });
          }
          
          const wordCount = generatedScript.split(/\s+/).length;
          
          // Save script to database
          const { createScript } = await import("./db");
          await createScript({
            userId: ctx.user.id,
            movieTitle: input.movieTitle,
            year: input.year,
            genre: input.genre,
            plotSummary: input.plotSummary,
            tone: input.tone,
            length: input.length,
            generatedScript,
            wordCount,
          });
          
          return {
            generatedScript,
            wordCount,
            movieTitle: input.movieTitle,
          };
        } catch (error) {
          console.error("Script generation error:", error);
          
          // Re-throw if it's already a TRPCError
          if (error instanceof TRPCError) {
            throw error;
          }
          
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to generate script. Please try again.",
          });
        }
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserScripts } = await import("./db");
      return await getUserScripts(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ scriptId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getScriptById } = await import("./db");
        const script = await getScriptById(input.scriptId, ctx.user.id);
        if (!script) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Script not found",
          });
        }
        return script;
      }),
    
    update: protectedProcedure
      .input(
        z.object({
          scriptId: z.number(),
          generatedScript: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { updateScript } = await import("./db");
        const updates: Record<string, any> = {};
        
        if (input.generatedScript) {
          updates.generatedScript = input.generatedScript;
          updates.wordCount = input.generatedScript.split(/\s+/).length;
        }
        
        await updateScript(input.scriptId, ctx.user.id, updates);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ scriptId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteScript } = await import("./db");
        await deleteScript(input.scriptId, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
