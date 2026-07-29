import { useState } from "react";

export default function TaskModal({
  task,
  members,
  onClose,
  onSubmit,
  onDelete,
  canDelete,
}) {
  const isEdit = Boolean(task);

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "todo");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.slice(0, 10) : "",
  );
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id || "");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "Title is required.";
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
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || null,
      });
    } catch (err) {
      setApiError(err.message || "Could not save the task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: 520 }}
      >
        <div className="modal-head">
          <h2>{isEdit ? "Edit task" : "New task"}</h2>
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
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              className={errors.title ? "invalid" : ""}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix login redirect bug"
              autoFocus
            />
            {errors.title && (
              <span className="field-error">{errors.title}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="task-desc">
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
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any useful context…"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="task-due">Due date</label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="task-assignee">Assignee</label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className={`modal-actions${isEdit && canDelete ? " split" : ""}`}
          >
            {isEdit && canDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={onDelete}
              >
                Delete task
              </button>
            )}
            <div className="modal-actions-right">
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
                  "Create task"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
