import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema defines your data model for the database.
// For more information, see https://docs.convex.dev/database/schema
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  conferences: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(), // timestamp
    endDate: v.number(), // timestamp
    createdBy: v.id("users"),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_startDate", ["startDate"]),

  conferenceAttendees: defineTable({
    conferenceId: v.id("conferences"),
    userId: v.id("users"),
  })
    .index("by_conference", ["conferenceId"])
    .index("by_user", ["userId"])
    .index("by_conference_and_user", ["conferenceId", "userId"]),

  meetings: defineTable({
    conferenceId: v.id("conferences"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(), // timestamp
    endTime: v.number(), // timestamp
    isPublic: v.boolean(), // true = public to all conference attendees, false = private to invitees
    createdBy: v.id("users"),
  })
    .index("by_conference", ["conferenceId"])
    .index("by_conference_and_time", ["conferenceId", "startTime"])
    .index("by_createdBy", ["createdBy"]),

  meetingAttendees: defineTable({
    meetingId: v.id("meetings"),
    userId: v.id("users"),
    status: v.union(
      v.literal("owner"),
      v.literal("accepted"),
      v.literal("pending"),
      v.literal("rejected")
    ),
  })
    .index("by_meeting", ["meetingId"])
    .index("by_user", ["userId"])
    .index("by_meeting_and_user", ["meetingId", "userId"])
    .index("by_user_and_status", ["userId", "status"]),
});
