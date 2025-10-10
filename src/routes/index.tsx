import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { Calendar, Plus, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: ConferenceList,
  loader: async ({ context: { queryClient } }) => {
    const queryOptions = convexQuery(api.conferences.list, {});
    await queryClient.ensureQueryData(queryOptions);
  },
});

function ConferenceList() {
  const { data: conferences } = useSuspenseQuery(
    convexQuery(api.conferences.list, {})
  );

  return (
    <div className="not-prose">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mt-0">Conferences</h1>
          <p className="text-base-content/70">
            Browse and join upcoming conferences
          </p>
        </div>
        <Link to="/conferences/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Create Conference
        </Link>
      </div>

      {conferences.length === 0 ? (
        <div className="card bg-base-200">
          <div className="card-body text-center">
            <Calendar className="w-16 h-16 mx-auto text-base-content/30" />
            <h3 className="card-title justify-center">No conferences yet</h3>
            <p className="text-base-content/70">
              Be the first to create a conference!
            </p>
            <div className="card-actions justify-center">
              <Link to="/conferences/new" className="btn btn-primary">
                <Plus className="w-5 h-5" />
                Create Conference
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conferences.map((conference) => {
            const startDate = new Date(conference.startDate);
            const endDate = new Date(conference.endDate);
            const isUpcoming = startDate > new Date();
            const isOngoing =
              startDate <= new Date() && endDate >= new Date();

            return (
              <Link
                key={conference._id}
                to="/conferences/$conferenceId"
                params={{ conferenceId: conference._id }}
                className="card bg-base-200 hover:bg-base-300 transition-colors"
              >
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title">{conference.name}</h2>
                    {isOngoing && (
                      <span className="badge badge-success badge-sm">Live</span>
                    )}
                    {isUpcoming && (
                      <span className="badge badge-info badge-sm">
                        Upcoming
                      </span>
                    )}
                  </div>
                  {conference.description && (
                    <p className="text-sm text-base-content/70">
                      {conference.description}
                    </p>
                  )}
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2 text-base-content/70">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {startDate.toLocaleDateString()} -{" "}
                        {endDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/70">
                      <Users className="w-4 h-4" />
                      <span>by {conference.creatorName}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
