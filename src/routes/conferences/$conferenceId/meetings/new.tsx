import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute(
  "/conferences/$conferenceId/meetings/new"
)({
  component: NewMeeting,
  validateSearch: z.object({
    invitee: z.string().optional(),
  }),
});

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  isPublic: z.boolean(),
});

function NewMeeting() {
  const { conferenceId } = Route.useParams();
  const navigate = useNavigate();
  const create = useMutation(api.meetings.create);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      startTime: "",
      duration: 60,
      isPublic: false,
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      const startDateTime = new Date(`${value.startDate}T${value.startTime}`);
      const endDateTime = new Date(
        startDateTime.getTime() + value.duration * 60000
      );

      const meetingId = await create({
        conferenceId: conferenceId as Id<"conferences">,
        title: value.title,
        description: value.description || undefined,
        startTime: startDateTime.getTime(),
        endTime: endDateTime.getTime(),
        isPublic: value.isPublic,
      });

      await navigate({
        to: "/conferences/$conferenceId/meetings/$meetingId",
        params: { conferenceId, meetingId },
      });
    },
  });

  return (
    <div className="not-prose max-w-2xl mx-auto">
      <button
        onClick={() =>
          void navigate({
            to: "/conferences/$conferenceId",
            params: { conferenceId },
          })
        }
        className="btn btn-ghost btn-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Conference
      </button>

      <h1 className="text-3xl font-bold mt-0 mb-6">Create New Meeting</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
        className="card bg-base-200"
      >
        <div className="card-body space-y-4">
          <form.Field name="title">
            {(field) => (
              <div className="w-full">
                <label className="label">
                  <span className="label-text">Meeting Title</span>
                </label>
                <input
                  type="text"
                  className="input input-border w-full"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Coffee Chat"
                />
                {!field.state.meta.isValid && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {field.state.meta.errors.map((e) => e?.message).join(", ")}
                    </span>
                  </label>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="w-full">
                <label className="label">
                  <span className="label-text">Description (optional)</span>
                </label>
                <textarea
                  className="textarea textarea-border w-full"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="What would you like to discuss?"
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="startDate">
              {(field) => (
                <div className="w-full">
                  <label className="label">
                    <span className="label-text">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-border w-full"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {field.state.meta.errors
                          .map((e) => e?.message)
                          .join(", ")}
                      </span>
                    </label>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="startTime">
              {(field) => (
                <div className="w-full">
                  <label className="label">
                    <span className="label-text">Start Time</span>
                  </label>
                  <input
                    type="time"
                    className="input input-border w-full"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {field.state.meta.errors
                          .map((e) => e?.message)
                          .join(", ")}
                      </span>
                    </label>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="duration">
            {(field) => (
              <div className="w-full">
                <label className="label">
                  <span className="label-text">Duration (minutes)</span>
                </label>
                <input
                  type="number"
                  className="input input-border w-full"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                  min={15}
                  step={15}
                />
                {!field.state.meta.isValid && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {field.state.meta.errors.map((e) => e?.message).join(", ")}
                    </span>
                  </label>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="isPublic">
            {(field) => (
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  <div>
                    <span className="label-text font-semibold">
                      Public Meeting
                    </span>
                    <p className="text-sm text-base-content/70">
                      Make this meeting visible to all conference attendees
                    </p>
                  </div>
                </label>
              </div>
            )}
          </form.Field>

          <div className="card-actions justify-end mt-4">
            <button
              type="button"
              onClick={() =>
                void navigate({
                  to: "/conferences/$conferenceId",
                  params: { conferenceId },
                })
              }
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!form.state.canSubmit || form.state.isSubmitting}
            >
              {form.state.isSubmitting ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
