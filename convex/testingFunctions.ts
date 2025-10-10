import { v } from "convex/values";
import { customMutation } from "convex-helpers/server/customFunctions";
import { mutation } from "./_generated/server";

const testingMutation = customMutation(mutation, {
  args: {},
  input: async (_ctx, _args) => {
    // Allow testing functions in local anonymous deployments (for CI/development)
    // or when IS_TEST is explicitly set to true
    const deploymentName = process.env.CONVEX_CLOUD_URL || process.env.CONVEX_DEPLOYMENT || "";
    const isLocalDeployment = deploymentName.includes("anonymous") || deploymentName.includes("127.0.0.1");
    const isTestEnv = process.env.IS_TEST === "true";

    if (!isLocalDeployment && !isTestEnv) {
      throw new Error("Calling a test-only function in non-test environment");
    }
    return { ctx: {}, args: {} };
  },
});

export const deleteTestUser = testingMutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const users = await ctx.db.query("users").collect();
    const user = users.find(u => u.name === name);
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
