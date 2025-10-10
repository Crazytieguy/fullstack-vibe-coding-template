import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrCrash } from "./users";

// Create a new meeting
export const create = mutation({
  args: {
    conferenceId: v.id("conferences"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    isPublic: v.boolean(),
    inviteeUserIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrCrash(ctx);

    // Verify user is attending the conference
    const attendee = await ctx.db
      .query("conferenceAttendees")
      .withIndex("by_conference_and_user", (q) =>
        q.eq("conferenceId", args.conferenceId).eq("userId", user._id)
      )
      .unique();

    if (!attendee) {
      throw new Error("You must be a conference attendee to create meetings");
    }

    const meetingId = await ctx.db.insert("meetings", {
      conferenceId: args.conferenceId,
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      isPublic: args.isPublic,
      createdBy: user._id,
    });

    // Add creator as owner
    await ctx.db.insert("meetingAttendees", {
      meetingId,
      userId: user._id,
      status: "owner",
    });

    // Add invitees as pending
    if (args.inviteeUserIds) {
      await Promise.all(
        args.inviteeUserIds.map((inviteeId) =>
          ctx.db.insert("meetingAttendees", {
            meetingId,
            userId: inviteeId,
            status: "pending",
          })
        )
      );
    }

    return meetingId;
  },
});

// Get public meetings for a conference
export const getPublicMeetings = query({
  args: { conferenceId: v.id("conferences") },
  handler: async (ctx, args) => {
    const meetings = await ctx.db
      .query("meetings")
      .withIndex("by_conference_and_time", (q) =>
        q.eq("conferenceId", args.conferenceId)
      )
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    return await Promise.all(
      meetings.map(async (meeting) => {
        const creator = await ctx.db.get(meeting.createdBy);
        const attendeeCount = await ctx.db
          .query("meetingAttendees")
          .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
          .collect();

        return {
          ...meeting,
          creatorName: creator?.name ?? "Unknown",
          attendeeCount: attendeeCount.length,
        };
      })
    );
  },
});

// Get meetings for current user (all statuses)
export const getMyMeetings = query({
  args: { conferenceId: v.id("conferences") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrCrash(ctx);

    // Get all meeting attendee records for this user
    const myAttendances = await ctx.db
      .query("meetingAttendees")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Filter for meetings in this conference and fetch details
    const meetingsData = await Promise.all(
      myAttendances.map(async (attendance) => {
        const meeting = await ctx.db.get(attendance.meetingId);
        if (!meeting || meeting.conferenceId !== args.conferenceId) {
          return null;
        }

        const creator = await ctx.db.get(meeting.createdBy);
        const attendees = await ctx.db
          .query("meetingAttendees")
          .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
          .collect();

        return {
          ...meeting,
          myStatus: attendance.status,
          creatorName: creator?.name ?? "Unknown",
          attendeeCount: attendees.length,
        };
      })
    );

    return meetingsData.filter((m) => m !== null);
  },
});

// Get a single meeting with details
export const get = query({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) return null;

    const creator = await ctx.db.get(meeting.createdBy);
    const attendees = await ctx.db
      .query("meetingAttendees")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .collect();

    const attendeesWithDetails = await Promise.all(
      attendees.map(async (attendee) => {
        const user = await ctx.db.get(attendee.userId);
        return {
          userId: attendee.userId,
          status: attendee.status,
          name: user?.name ?? "Unknown",
        };
      })
    );

    return {
      ...meeting,
      creatorName: creator?.name ?? "Unknown",
      attendees: attendeesWithDetails,
    };
  },
});

// Respond to a meeting invitation
export const respond = mutation({
  args: {
    meetingId: v.id("meetings"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrCrash(ctx);

    const attendance = await ctx.db
      .query("meetingAttendees")
      .withIndex("by_meeting_and_user", (q) =>
        q.eq("meetingId", args.meetingId).eq("userId", user._id)
      )
      .unique();

    if (!attendance) {
      throw new Error("You are not invited to this meeting");
    }

    if (attendance.status === "owner") {
      throw new Error("Cannot change owner status");
    }

    await ctx.db.patch(attendance._id, {
      status: args.status,
    });
  },
});

// Join a public meeting
export const joinPublic = mutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrCrash(ctx);

    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) {
      throw new Error("Meeting not found");
    }

    if (!meeting.isPublic) {
      throw new Error("This meeting is not public");
    }

    // Check if user is attending the conference
    const conferenceAttendee = await ctx.db
      .query("conferenceAttendees")
      .withIndex("by_conference_and_user", (q) =>
        q.eq("conferenceId", meeting.conferenceId).eq("userId", user._id)
      )
      .unique();

    if (!conferenceAttendee) {
      throw new Error("You must be a conference attendee to join this meeting");
    }

    // Check if already joined
    const existing = await ctx.db
      .query("meetingAttendees")
      .withIndex("by_meeting_and_user", (q) =>
        q.eq("meetingId", args.meetingId).eq("userId", user._id)
      )
      .unique();

    if (existing) {
      throw new Error("Already joined this meeting");
    }

    await ctx.db.insert("meetingAttendees", {
      meetingId: args.meetingId,
      userId: user._id,
      status: "accepted",
    });
  },
});

// Leave a meeting
export const leave = mutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrCrash(ctx);

    const attendance = await ctx.db
      .query("meetingAttendees")
      .withIndex("by_meeting_and_user", (q) =>
        q.eq("meetingId", args.meetingId).eq("userId", user._id)
      )
      .unique();

    if (!attendance) {
      throw new Error("You are not part of this meeting");
    }

    if (attendance.status === "owner") {
      throw new Error("Meeting owner cannot leave the meeting");
    }

    await ctx.db.delete(attendance._id);
  },
});
