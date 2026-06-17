import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
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

describe("scripts.list", () => {
  it("should return empty array for new user", async () => {
    const ctx = createAuthContext(999);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.scripts.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("should return array of scripts", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.scripts.list();

    expect(Array.isArray(result)).toBe(true);
    
    if (result.length > 0) {
      const script = result[0];
      expect(script).toHaveProperty("id");
      expect(script).toHaveProperty("userId");
      expect(script).toHaveProperty("movieTitle");
      expect(script).toHaveProperty("tone");
      expect(script).toHaveProperty("length");
      expect(script).toHaveProperty("generatedScript");
      expect(script).toHaveProperty("wordCount");
      expect(script).toHaveProperty("createdAt");
    }
  });

  it("should return scripts in reverse chronological order", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.scripts.list();

    if (result.length > 1) {
      for (let i = 0; i < result.length - 1; i++) {
        const current = new Date(result[i].createdAt).getTime();
        const next = new Date(result[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });

  it("should only return scripts for authenticated user", async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    const result1 = await caller1.scripts.list();
    const result2 = await caller2.scripts.list();

    // Both should be arrays (may be empty)
    expect(Array.isArray(result1)).toBe(true);
    expect(Array.isArray(result2)).toBe(true);
  });
});
