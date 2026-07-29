import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import ProjectModal from "../components/ProjectModal";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { projectsApi } from "../api/projects";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await projectsApi.list();
      setProjects(data);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(extractErrorMessage(err, "Could not load your projects."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (payload) => {
    const created = await projectsApi.create(payload);
    setProjects((prev) => [created, ...prev]);
    setShowCreate(false);
    setToast({ type: "success", message: "Project created." });
  };

  const handleEdit = async (payload) => {
    const updated = await projectsApi.update(editingProject.id, payload);
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
    );
    setEditingProject(null);
    setToast({ type: "success", message: "Project updated." });
  };

  const handleDelete = async () => {
    try {
      await projectsApi.remove(deletingProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      setToast({ type: "success", message: "Project deleted." });
    } catch (err) {
      setToast({
        type: "error",
        message: extractErrorMessage(err, "Could not delete project."),
      });
    } finally {
      setDeletingProject(null);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="main-header">
        <div>
          <div className="eyebrow">
            <svg
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="1" y="1" width="6" height="6" rx="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" />
            </svg>
            Workspace
          </div>
          <h1>Projects</h1>
          <p className="page-desc">
            Every project you're a member of, in one place.
          </p>
        </div>
        <div className="main-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
            </svg>
            New project
          </button>
        </div>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <div className="page-loading">
          <span className="spinner" /> Loading projects…
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="state-block">
          <div className="state-icon">⚠</div>
          <h3>Couldn't load projects</h3>
          <p>{errorMsg}</p>
          <button className="btn btn-secondary" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {status === "ready" && projects.length === 0 && (
        <div className="state-block">
          <div className="state-icon" style={{ fontSize: 22 }}>
            ◫
          </div>
          <h3>No projects yet</h3>
          <p>
            Create your first project to start tracking tasks with your team.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
            </svg>
            New project
          </button>
        </div>
      )}

      {/* Project list */}
      {status === "ready" && projects.length > 0 && (
        <div className="ledger">
          {projects.map((p, i) => {
            const isAdmin = p.createdBy?.id === user?.id;
            return (
              <div className="ledger-row" key={p.id}>
                <span className="ledger-index">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Monogram icon */}
                <div className="ledger-icon" aria-hidden="true">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Main content — navigate on click */}
                <Link
                  to={`/projects/${p.id}`}
                  style={{
                    display: "flex",
                    flex: 1,
                    minWidth: 0,
                    gap: 16,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div className="ledger-main">
                    <div className="title">{p.name}</div>
                    <div className="desc">
                      {p.description || "No description"}
                    </div>
                  </div>

                  <div className="ledger-meta">
                    <span className="avatar-stack">
                      {p.members.slice(0, 4).map((m) => (
                        <span className="avatar" key={m.id} title={m.name}>
                          {initials(m.name)}
                        </span>
                      ))}
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>
                      {p.members.length} member
                      {p.members.length === 1 ? "" : "s"}
                    </span>
                    {isAdmin && <span className="tag tag-admin">Admin</span>}
                  </div>
                </Link>

                {/* Admin actions — visible on hover */}
                {isAdmin && (
                  <div className="ledger-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(p);
                      }}
                      title="Edit project"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--rose)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProject(p);
                      }}
                      title="Delete project"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <ProjectModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={handleEdit}
        />
      )}
      {deletingProject && (
        <ConfirmDialog
          title="Delete project?"
          body={`"${deletingProject.name}" and all of its tasks will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProject(null)}
        />
      )}

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </Layout>
  );
}
