import { v } from "convex/values";
import { customMutation } from "convex-helpers/server/customFunctions";
import { mutation } from "./_generated/server";

const testingMutation = customMutation(mutation, {
  args: {},
  input: async (_ctx, _args) => {
    if (process.env.IS_TEST !== "true") {
      throw new Error("Calling a test-only function in non-test environment");
    }
    return { ctx: {}, args: {} };
  },
});

export const deleteTestUser = testingMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.delete(userId);
  },
});
