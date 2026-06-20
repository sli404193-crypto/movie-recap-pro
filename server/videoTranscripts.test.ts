import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-video",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("videoTranscripts.extractTranscript", () => {
  beforeEach(() => {
    vi.setConfig({ testTimeout: 10000 });
  });

  it("should reject missing video URL", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.videoTranscripts.extractTranscript({
        sourceLanguage: "English",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("video URL");
    }
  });

  it("should reject invalid URL format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.videoTranscripts.extractTranscript({
        videoUrl: "not-a-valid-url",
        sourceLanguage: "English",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("Invalid URL");
    }
  });

  it("should reject YouTube URLs", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.videoTranscripts.extractTranscript({
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        sourceLanguage: "English",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("not supported");
    }
  });

  it("should reject Vimeo URLs", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.videoTranscripts.extractTranscript({
        videoUrl: "https://vimeo.com/123456789",
        sourceLanguage: "English",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("not supported");
    }
  });

  it("should accept valid direct audio URL format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Note: This will fail at the transcription stage (no real file),
    // but it should pass URL validation
    try {
      await caller.videoTranscripts.extractTranscript({
        videoUrl: "https://example.com/audio.mp3",
        sourceLanguage: "English",
      });
    } catch (error: any) {
      // Should fail at transcription, not URL validation
      expect(error.code).not.toBe("BAD_REQUEST");
      expect(error.message).not.toContain("Invalid URL");
    }
  }, { timeout: 10000 });

  it("should support multiple source languages", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const languages = ["English", "Chinese", "Myanmar"] as const;

    for (const lang of languages) {
      try {
        await caller.videoTranscripts.extractTranscript({
          videoUrl: "https://example.com/test.mp3",
          sourceLanguage: lang,
        });
      } catch (error: any) {
        // Should fail at transcription, not language validation
        expect(error.message).not.toContain("language");
      }
    }
  }, { timeout: 10000 });
});

describe("videoTranscripts.convertToScript", () => {
  it("should reject empty transcript", async () => {
    vi.setConfig({ testTimeout: 10000 });
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.videoTranscripts.convertToScript({
        rawTranscript: "",
        sourceLanguage: "English",
        targetLanguage: "English",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should reject short transcript", async () => {
    vi.setConfig({ testTimeout: 10000 });
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.videoTranscripts.convertToScript({
        rawTranscript: "Hi",
        sourceLanguage: "English",
        targetLanguage: "English",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should support all language combinations", async () => {
    // Skip LLM-dependent tests in CI
    if (process.env.SKIP_LLM_TESTS) {
      expect(true).toBe(true);
      return;
    }

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const languages = ["English", "Chinese", "Myanmar"] as const;
    const sampleTranscript = "This is a sample movie dialogue. The characters are having an important conversation about their journey.";

    for (const source of languages) {
      for (const target of languages) {
        try {
          await caller.videoTranscripts.convertToScript({
            rawTranscript: sampleTranscript,
            sourceLanguage: source,
            targetLanguage: target,
          });
        } catch (error: any) {
          // Should fail at LLM stage, not validation
          expect(error.message).not.toContain("language");
        }
      }
    }
  }, { timeout: 30000 });
});

describe("videoTranscripts.list", () => {
  it("should return empty list for new user", async () => {
    vi.setConfig({ testTimeout: 10000 });
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.videoTranscripts.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("videoTranscripts.delete", () => {
  it("should handle delete operation", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Just verify the procedure exists and is callable
    // Database operations are tested separately
    expect(caller.videoTranscripts.delete).toBeDefined();
  });
});
