import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
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
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("scripts.generate", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  it("should generate a script with valid input", async () => {
    // Skip LLM-dependent tests in test environment
    if (process.env.SKIP_LLM_TESTS) return;
    const caller = appRouter.createCaller(ctx);

    const result = await caller.scripts.generate({
      movieTitle: "The Matrix",
      year: 1999,
      genre: "Sci-Fi",
      plotSummary:
        "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
      tone: "Dramatic",
      length: "Medium",
    });

    expect(result).toHaveProperty("generatedScript");
    expect(result).toHaveProperty("wordCount");
    expect(result).toHaveProperty("movieTitle");
    expect(result.movieTitle).toBe("The Matrix");
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.generatedScript.length).toBeGreaterThan(50);
  });

  it("should reject empty movie title", async () => {
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.scripts.generate({
        movieTitle: "",
        plotSummary: "A detailed plot summary",
        tone: "Dramatic",
        length: "Medium",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      // Zod validation errors are returned as JSON strings
      const errorMsg = typeof error.message === "string" ? error.message : JSON.stringify(error.message);
      expect(errorMsg).toMatch(/movieTitle|movie title|Too small/);
    }
  });

  it("should reject short plot summary", async () => {
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.scripts.generate({
        movieTitle: "Test Movie",
        plotSummary: "Short",
        tone: "Dramatic",
        length: "Medium",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      // Zod validation errors are returned as JSON strings
      const errorMsg = typeof error.message === "string" ? error.message : JSON.stringify(error.message);
      expect(errorMsg).toMatch(/plotSummary|plot summary|Too small/);
    }
  }, { timeout: 10000 });

  it("should handle different tones", async () => {
    // Skip LLM-dependent tests in test environment
    if (process.env.SKIP_LLM_TESTS) return;
    const caller = appRouter.createCaller(ctx);
    const tones = ["Dramatic", "Comedic", "Suspenseful", "Educational", "Casual"] as const;

    for (const tone of tones) {
      const result = await caller.scripts.generate({
        movieTitle: `Test Movie - ${tone}`,
        plotSummary: "A comprehensive plot summary that describes the main story and characters.",
        tone,
        length: "Short",
      });

      expect(result.generatedScript.length).toBeGreaterThan(50);
      expect(result.wordCount).toBeGreaterThan(0);
    }
  });

  it("should handle different lengths", async () => {
    // Skip LLM-dependent tests in test environment
    if (process.env.SKIP_LLM_TESTS) return;
    const caller = appRouter.createCaller(ctx);
    const lengths = ["Short", "Medium", "Long"] as const;

    for (const length of lengths) {
      const result = await caller.scripts.generate({
        movieTitle: `Test Movie - ${length}`,
        plotSummary: "A comprehensive plot summary that describes the main story and characters.",
        tone: "Dramatic",
        length,
      });

      expect(result.generatedScript.length).toBeGreaterThan(50);
      expect(result.wordCount).toBeGreaterThan(0);
    }
  });

  it("should calculate word count correctly", async () => {
    // Skip LLM-dependent tests in test environment
    if (process.env.SKIP_LLM_TESTS) return;
    const caller = appRouter.createCaller(ctx);

    const result = await caller.scripts.generate({
      movieTitle: "Word Count Test",
      plotSummary: "A comprehensive plot summary that describes the main story and characters in detail.",
      tone: "Dramatic",
      length: "Short",
    });

    const manualWordCount = result.generatedScript.split(/\s+/).length;
    expect(result.wordCount).toBe(manualWordCount);
  });
});
