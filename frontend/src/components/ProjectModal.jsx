import { useState } from "react";

export default function ProjectModal({ project, onClose, onSubmit }) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const isEdit = Boolean(project);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Project name is required.";
    else if (name.trim().length < 2)
      next.name = "Name must be at least 2 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } catch (err) {
      setApiError(err.message || "Could not save the project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEdit ? "Edit project" : "New project"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 1l10 10M11 1L1 11" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {apiError && (
          <div className="form-error-banner">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="8" cy="8" r="7" />
              <path d="M8 5v3M8 11h.01" strokeLinecap="round" />
            </svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              className={errors.name ? "invalid" : ""}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              autoFocus
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="project-desc">
              Description{" "}
              <span
                style={{
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                  color: "var(--muted-2)",
                }}
              >
                (optional)
              </span>
            </label>
            <textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner"
                    style={{ width: 13, height: 13, borderWidth: 2 }}
                  />{" "}
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
