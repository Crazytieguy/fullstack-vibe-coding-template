import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrCrash } from "./users";

// List all public conferences
export const list = query({
  args: {},
  handler: async (ctx) => {
    const conferences = await ctx.db
      .query("conferences")
      .withIndex("by_startDate")
      .order("desc")
      .collect();

    return await Promise.all(
      conferences.map(async (conference) => {
        const creator = await ctx.db.get(conference.createdBy);
        return {
          ...conference,
          creatorName: creator?.name ?? "Unknown",
        };
      })
    );
  },
});

// Get a single conference by ID
export const get = query({
  args: { conferenceId: v.id("conferences") },
  handler: async (ctx, args) => {
    const conference = await ctx.db.get(args.conferenceId);
    if (!conference) return null;

    const creator = await ctx.db.get(conference.createdBy);
    return {
      ...conference,
      creatorName: creator?.name ?? "Unknown",
    };
  },
});

// Create a new conference
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrCrash(ctx);

    const conferenceId = await ctx.db.insert("conferences", {
      name: args.name,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      createdBy: user._id,
    });

    // Automatically join as attendee
    await ctx.db.insert("conferenceAttendees", {
      conferenceId,
      userId: user._id,
    });

    return conferenceId;
  },
});

// Join a conference
export const join = mutation({
  args: { conferenceId: v.id("conferences") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrCrash(ctx);

    // Check if already joined
    const existing = await ctx.db
      .query("conferenceAttendees")
      .withIndex("by_conference_and_user", (q) =>
        q.eq("conferenceId", args.conferenceId).eq("userId", user._id)
      )
      .unique();

    if (existing) {
      throw new Error("Already joined this conference");
    }

    await ctx.db.insert("conferenceAttendees", {
      conferenceId: args.conferenceId,
      userId: user._id,
    });
  },
});

// Leave a conference
export const leave = mutation({
  args: { conferenceId: v.id("conferences") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrCrash(ctx);

    const attendee = await ctx.db
      .query("conferenceAttendees")
      .withIndex("by_conference_and_user", (q) =>
        q.eq("conferenceId", args.conferenceId).eq("userId", user._id)
      )
      .unique();

    if (!attendee) {
      throw new Error("Not a member of this conference");
    }

    await ctx.db.delete(attendee._id);
  },
});

// Check if current user is attending a conference
export const isAttending = query({
  args: { conferenceId: v.id("conferences") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return false;

    const attendee = await ctx.db
      .query("conferenceAttendees")
      .withIndex("by_conference_and_user", (q) =>
        q.eq("conferenceId", args.conferenceId).eq("userId", user._id)
      )
      .unique();

    return !!attendee;
  },
});

// Get all attendees of a conference
export const getAttendees = query({
  args: { conferenceId: v.id("conferences") },
  handler: async (ctx, args) => {
    const attendees = await ctx.db
      .query("conferenceAttendees")
      .withIndex("by_conference", (q) => q.eq("conferenceId", args.conferenceId))
      .collect();

    return await Promise.all(
      attendees.map(async (attendee) => {
        const user = await ctx.db.get(attendee.userId);
        return {
          _id: attendee._id,
          userId: attendee.userId,
          name: user?.name ?? "Unknown",
          bio: user?.bio,
        };
      })
    );
  },
});
