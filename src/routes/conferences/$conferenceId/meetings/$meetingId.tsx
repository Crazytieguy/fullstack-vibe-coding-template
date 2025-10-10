import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { ArrowLeft, Calendar, Users, Check, X } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute(
  "/conferences/$conferenceId/meetings/$meetingId"
)({
  component: MeetingDetail,
  loader: async ({ context: { queryClient }, params }) => {
    const meetingId = params.meetingId as Id<"meetings">;
    await queryClient.ensureQueryData(
      convexQuery(api.meetings.get, { meetingId })
    );
  },
});

function MeetingDetail() {
  const { conferenceId, meetingId } = Route.useParams();
  const navigate = useNavigate();

  const { data: meeting } = useSuspenseQuery(
    convexQuery(api.meetings.get, {
      meetingId: meetingId as Id<"meetings">,
    })
  );

  const respond = useMutation(api.meetings.respond);
  const joinPublic = useMutation(api.meetings.joinPublic);
  const leave = useMutation(api.meetings.leave);

  if (!meeting) {
    return <div>Meeting not found</div>;
  }

  const currentUserAttendance = meeting.attendees.find(
    (a) => a.userId === meeting.createdBy
  );

  return (
    <div className="not-prose max-w-4xl mx-auto">
      <button
        onClick={() =>
          navigate({
            to: "/conferences/$conferenceId",
            params: { conferenceId },
          })
        }
        className="btn btn-ghost btn-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Conference
      </button>

      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold mt-0">{meeting.title}</h1>
                {meeting.isPublic && (
                  <span className="badge badge-info">Public</span>
                )}
              </div>
              {meeting.description && (
                <p className="text-base-content/70 mb-4">
                  {meeting.description}
                </p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-base-content/70" />
                  <span>
                    {new Date(meeting.startTime).toLocaleString()} -{" "}
                    {new Date(meeting.endTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-base-content/70" />
                  <span>Organized by {meeting.creatorName}</span>
                </div>
              </div>
            </div>
            {currentUserAttendance ? (
              <div className="flex gap-2">
                {currentUserAttendance.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        void respond({
                          meetingId: meetingId as Id<"meetings">,
                          status: "accepted",
                        })
                      }
                      className="btn btn-success btn-sm"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        void respond({
                          meetingId: meetingId as Id<"meetings">,
                          status: "rejected",
                        })
                      }
                      className="btn btn-error btn-sm"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </>
                )}
                {currentUserAttendance.status !== "owner" &&
                  currentUserAttendance.status !== "pending" && (
                    <button
                      onClick={() =>
                        void leave({ meetingId: meetingId as Id<"meetings"> })
                      }
                      className="btn btn-ghost btn-sm"
                    >
                      Leave Meeting
                    </button>
                  )}
              </div>
            ) : (
              meeting.isPublic && (
                <button
                  onClick={() =>
                    void joinPublic({ meetingId: meetingId as Id<"meetings"> })
                  }
                  className="btn btn-primary btn-sm"
                >
                  Join Meeting
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Attendees ({meeting.attendees.length})</h2>
          <div className="divide-y divide-base-300">
            {meeting.attendees.map((attendee) => (
              <div
                key={attendee.userId}
                className="flex justify-between items-center py-3"
              >
                <span>{attendee.name}</span>
                <div className="flex items-center gap-2">
                  {attendee.status === "owner" && (
                    <span className="badge badge-primary badge-sm">Owner</span>
                  )}
                  {attendee.status === "accepted" && (
                    <span className="badge badge-success badge-sm">
                      Accepted
                    </span>
                  )}
                  {attendee.status === "pending" && (
                    <span className="badge badge-warning badge-sm">
                      Pending
                    </span>
                  )}
                  {attendee.status === "rejected" && (
                    <span className="badge badge-error badge-sm">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
