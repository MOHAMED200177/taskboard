import { useState } from "react";
import { initials } from "../utils";

export default function MemberModal({ project, onClose, onAdd, onRemove }) {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError("Enter a user ID.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onAdd(userId.trim());
      setUserId("");
    } catch (err) {
      setError(err.message || "Could not add that member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Team members</h2>
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

        {/* Member list */}
        <div style={{ marginBottom: 18 }}>
          {project.members.map((m) => (
            <div className="member-row" key={m.id}>
              <div className="member-info">
                <div className="member-avatar">{initials(m.name)}</div>
                <div>
                  <div className="member-name">{m.name}</div>
                  {m.id === project.createdBy.id && (
                    <span
                      className="tag tag-admin"
                      style={{ fontSize: 10, padding: "1px 6px" }}
                    >
                      Admin
                    </span>
                  )}
                </div>
              </div>
              {m.id !== project.createdBy.id && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--rose)", flexShrink: 0 }}
                  onClick={() => onRemove(m.id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="hint-banner">
          <strong>How to find a user ID:</strong> Ask them to share it from
          their profile, or look it up in your database. The API does not expose
          a user search endpoint.
        </div>

        {/* Add member form */}
        <form onSubmit={handleAdd} noValidate>
          <div className="field">
            <label htmlFor="member-id">Add member by user ID</label>
            <input
              id="member-id"
              className={error ? "invalid" : ""}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 3f1a9c2e-…"
            />
            {error && <span className="field-error">{error}</span>}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
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
                  Adding…
                </>
              ) : (
                "Add member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
