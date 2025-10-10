import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/conferences/new")({
  component: NewConference,
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

function NewConference() {
  const navigate = useNavigate();
  const create = useMutation(api.conferences.create);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      const conferenceId = await create({
        name: value.name,
        description: value.description || undefined,
        startDate: new Date(value.startDate).getTime(),
        endDate: new Date(value.endDate).getTime(),
      });

      await navigate({
        to: "/conferences/$conferenceId",
        params: { conferenceId },
      });
    },
  });

  return (
    <div className="not-prose max-w-2xl mx-auto">
      <button
        onClick={() => void navigate({ to: "/" })}
        className="btn btn-ghost btn-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Conferences
      </button>

      <h1 className="text-3xl font-bold mt-0 mb-6">Create New Conference</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
        className="card bg-base-200"
      >
        <div className="card-body space-y-4">
          <form.Field name="name">
            {(field) => (
              <div className="w-full">
                <label className="label">
                  <span className="label-text">Conference Name</span>
                </label>
                <input
                  type="text"
                  className="input input-border w-full"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., TechConf 2025"
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
                  placeholder="Tell attendees about your conference..."
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
                    <span className="label-text">Start Date</span>
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

            <form.Field name="endDate">
              {(field) => (
                <div className="w-full">
                  <label className="label">
                    <span className="label-text">End Date</span>
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
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              type="button"
              onClick={() => void navigate({ to: "/" })}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!form.state.canSubmit || form.state.isSubmitting}
            >
              {form.state.isSubmitting ? "Creating..." : "Create Conference"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
