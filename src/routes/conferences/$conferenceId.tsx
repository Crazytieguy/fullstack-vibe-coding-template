import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Users,
  Plus,
  User,
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Calendar, type CalendarEvent } from "../../components/Calendar";

export const Route = createFileRoute("/conferences/$conferenceId")({
  component: ConferenceDetail,
  loader: async ({ context: { queryClient }, params }) => {
    const conferenceId = params.conferenceId as Id<"conferences">;
    await Promise.all([
      queryClient.ensureQueryData(
        convexQuery(api.conferences.get, { conferenceId })
      ),
      queryClient.ensureQueryData(
        convexQuery(api.conferences.isAttending, { conferenceId })
      ),
      queryClient.ensureQueryData(
        convexQuery(api.conferences.getAttendees, { conferenceId })
      ),
      queryClient.ensureQueryData(
        convexQuery(api.meetings.getPublicMeetings, { conferenceId })
      ),
      queryClient.ensureQueryData(
        convexQuery(api.meetings.getMyMeetings, { conferenceId })
      ),
    ]);
  },
});

function ConferenceDetail() {
  const { conferenceId } = Route.useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "attendees" | "meetings" | "my-meetings" | "calendar"
  >("attendees");

  const { data: conference } = useSuspenseQuery(
    convexQuery(api.conferences.get, {
      conferenceId: conferenceId as Id<"conferences">,
    })
  );

  const { data: isAttending } = useSuspenseQuery(
    convexQuery(api.conferences.isAttending, {
      conferenceId: conferenceId as Id<"conferences">,
    })
  );

  const { data: attendees } = useSuspenseQuery(
    convexQuery(api.conferences.getAttendees, {
      conferenceId: conferenceId as Id<"conferences">,
    })
  );

  const { data: publicMeetings } = useSuspenseQuery(
    convexQuery(api.meetings.getPublicMeetings, {
      conferenceId: conferenceId as Id<"conferences">,
    })
  );

  const { data: myMeetings } = useSuspenseQuery(
    convexQuery(api.meetings.getMyMeetings, {
      conferenceId: conferenceId as Id<"conferences">,
    })
  );

  const join = useMutation(api.conferences.join);
  const leave = useMutation(api.conferences.leave);

  if (!conference) {
    return <div>Conference not found</div>;
  }

  const startDate = new Date(conference.startDate);
  const endDate = new Date(conference.endDate);

  return (
    <div className="not-prose">
      <button
        onClick={() => navigate({ to: "/" })}
        className="btn btn-ghost btn-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Conferences
      </button>

      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mt-0">{conference.name}</h1>
              {conference.description && (
                <p className="text-base-content/70 mt-2">
                  {conference.description}
                </p>
              )}
              <div className="flex gap-4 mt-4 text-sm text-base-content/70">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {startDate.toLocaleDateString()} -{" "}
                    {endDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{attendees.length} attendees</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isAttending ? (
                <>
                  <Link
                    to="/conferences/$conferenceId/meetings/new"
                    params={{ conferenceId }}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New Meeting
                  </Link>
                  <button
                    onClick={() =>
                      void leave({
                        conferenceId: conferenceId as Id<"conferences">,
                      })
                    }
                    className="btn btn-ghost btn-sm"
                  >
                    Leave
                  </button>
                </>
              ) : (
                <button
                  onClick={() =>
                    void join({
                      conferenceId: conferenceId as Id<"conferences">,
                    })
                  }
                  className="btn btn-primary btn-sm"
                >
                  Join Conference
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAttending && (
        <>
          <div role="tablist" className="tabs tabs-border mb-6">
            <button
              role="tab"
              className={`tab ${activeTab === "calendar" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("calendar")}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </button>
            <button
              role="tab"
              className={`tab ${activeTab === "attendees" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("attendees")}
            >
              <Users className="w-4 h-4 mr-2" />
              Attendees
            </button>
            <button
              role="tab"
              className={`tab ${activeTab === "meetings" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("meetings")}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Public Meetings
            </button>
            <button
              role="tab"
              className={`tab ${activeTab === "my-meetings" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("my-meetings")}
            >
              <User className="w-4 h-4 mr-2" />
              My Meetings
            </button>
          </div>

          {activeTab === "calendar" && (
            <div>
              <Calendar
                events={[...publicMeetings, ...myMeetings].map((meeting) => ({
                  id: meeting._id,
                  title: meeting.title,
                  startTime: new Date(meeting.startTime),
                  endTime: new Date(meeting.endTime),
                  color: meeting.isPublic ? "#3b82f6" : "#8b5cf6",
                  onClick: () =>
                    navigate({
                      to: "/conferences/$conferenceId/meetings/$meetingId",
                      params: { conferenceId, meetingId: meeting._id },
                    }),
                }))}
                view="week"
                onEventClick={(event: CalendarEvent) => {
                  event.onClick?.();
                }}
              />
            </div>
          )}

          {activeTab === "attendees" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendees.map((attendee) => (
                <div key={attendee._id} className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title">{attendee.name}</h3>
                    {attendee.bio && (
                      <p className="text-sm text-base-content/70">
                        {attendee.bio}
                      </p>
                    )}
                    <div className="card-actions justify-end mt-2">
                      <Link
                        to="/conferences/$conferenceId/meetings/new"
                        params={{ conferenceId }}
                        search={{ invitee: attendee.userId }}
                        className="btn btn-primary btn-sm"
                      >
                        Invite to Meeting
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "meetings" && (
            <div className="space-y-4">
              {publicMeetings.length === 0 ? (
                <div className="card bg-base-200">
                  <div className="card-body text-center">
                    <CalendarIcon className="w-16 h-16 mx-auto text-base-content/30" />
                    <p className="text-base-content/70">
                      No public meetings yet
                    </p>
                  </div>
                </div>
              ) : (
                publicMeetings.map((meeting) => (
                  <div key={meeting._id} className="card bg-base-200">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="card-title">{meeting.title}</h3>
                          {meeting.description && (
                            <p className="text-sm text-base-content/70 mt-1">
                              {meeting.description}
                            </p>
                          )}
                          <div className="text-sm mt-2 space-y-1">
                            <div>
                              <CalendarIcon className="w-4 h-4 inline mr-2" />
                              {new Date(meeting.startTime).toLocaleString()} -{" "}
                              {new Date(meeting.endTime).toLocaleTimeString()}
                            </div>
                            <div>
                              <Users className="w-4 h-4 inline mr-2" />
                              {meeting.attendeeCount} attendees
                            </div>
                            <div className="text-base-content/60">
                              by {meeting.creatorName}
                            </div>
                          </div>
                        </div>
                        <Link
                          to="/conferences/$conferenceId/meetings/$meetingId"
                          params={{ conferenceId, meetingId: meeting._id }}
                          className="btn btn-primary btn-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "my-meetings" && (
            <div className="space-y-4">
              {myMeetings.length === 0 ? (
                <div className="card bg-base-200">
                  <div className="card-body text-center">
                    <CalendarIcon className="w-16 h-16 mx-auto text-base-content/30" />
                    <p className="text-base-content/70">
                      You don't have any meetings yet
                    </p>
                    <div className="card-actions justify-center">
                      <Link
                        to="/conferences/$conferenceId/meetings/new"
                        params={{ conferenceId }}
                        className="btn btn-primary"
                      >
                        <Plus className="w-4 h-4" />
                        Create Meeting
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                myMeetings.map((meeting) => (
                  <div key={meeting._id} className="card bg-base-200">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="card-title">{meeting.title}</h3>
                            {meeting.myStatus === "owner" && (
                              <span className="badge badge-primary badge-sm">
                                Owner
                              </span>
                            )}
                            {meeting.myStatus === "pending" && (
                              <span className="badge badge-warning badge-sm">
                                Pending
                              </span>
                            )}
                            {meeting.myStatus === "accepted" && (
                              <span className="badge badge-success badge-sm">
                                Accepted
                              </span>
                            )}
                            {meeting.myStatus === "rejected" && (
                              <span className="badge badge-error badge-sm">
                                Declined
                              </span>
                            )}
                            {meeting.isPublic && (
                              <span className="badge badge-info badge-sm">
                                Public
                              </span>
                            )}
                          </div>
                          {meeting.description && (
                            <p className="text-sm text-base-content/70 mt-1">
                              {meeting.description}
                            </p>
                          )}
                          <div className="text-sm mt-2">
                            <CalendarIcon className="w-4 h-4 inline mr-2" />
                            {new Date(meeting.startTime).toLocaleString()} -{" "}
                            {new Date(meeting.endTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <Link
                          to="/conferences/$conferenceId/meetings/$meetingId"
                          params={{ conferenceId, meetingId: meeting._id }}
                          className="btn btn-primary btn-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {!isAttending && (
        <div className="card bg-base-200">
          <div className="card-body text-center">
            <h3 className="card-title justify-center">Join to see more</h3>
            <p className="text-base-content/70">
              Join this conference to browse attendees and meetings
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
