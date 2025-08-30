import { customMutation } from "convex-helpers/server/customFunctions";
import { mutation } from "./_generated/server";
import schema from "./schema";

const testingMutation = customMutation(mutation, {
  args: {},
  input: async (_ctx, _args) => {
    if (process.env.IS_TEST !== "true") {
      throw new Error("Calling a test-only function in non-test environment");
    }
    return { ctx: {}, args: {} };
  },
});

export const clearAllTestData = testingMutation(async (ctx) => {
  const tables = Object.keys(schema.tables);
  for (const table of tables) {
    const docs = await ctx.db.query(table as any).collect();
    await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
  }
  
  const scheduled = await ctx.db.system.query("_scheduled_functions").collect();
  await Promise.all(scheduled.map((s) => ctx.scheduler.cancel(s._id)));
  
  const storedFiles = await ctx.db.system.query("_storage").collect();
  await Promise.all(storedFiles.map((s) => ctx.storage.delete(s._id)));
});