import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import MemberModal from "../components/MemberModal";
import Toast from "../components/Toast";
import { projectsApi } from "../api/projects";
import { tasksApi } from "../api/tasks";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const DEFAULT_FILTERS = {
  status: "",
  priority: "",
  assigneeId: "",
  search: "",
  sortBy: "createdAt",
  sortOrder: "DESC",
};

export default function ProjectBoard() {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const isAdmin = project?.createdBy?.id === user?.id;

  const loadAll = useCallback(async () => {
    setStatus("loading");
    try {
      const [proj, taskRes] = await Promise.all([
        projectsApi.get(id),
        tasksApi.list(id, { page: 1, limit: pagination.limit }),
      ]);
      setProject(proj);
      setTasks(taskRes.data);
      setPagination({
        page: taskRes.page,
        limit: taskRes.limit,
        total: taskRes.total,
        totalPages: taskRes.totalPages,
      });
      setStatus("ready");
    } catch (err) {
      setErrorMsg(extractErrorMessage(err, "Could not load this project."));
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const reloadTasks = useCallback(
    async (activeFilters = filters, page = 1) => {
      const cleaned = Object.fromEntries(
        Object.entries({
          ...activeFilters,
          page,
          limit: pagination.limit,
        }).filter(([, v]) => v !== "" && v !== undefined && v !== null),
      );
      const res = await tasksApi.list(id, cleaned);
      setTasks(res.data);
      setPagination({
        page: res.page,
        limit: res.limit,
        total: res.total,
        totalPages: res.totalPages,
      });
    },
    [id, filters, pagination.limit],
  );

  const handleFilterChange = async (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    try {
      await reloadTasks(next, 1);
    } catch (err) {
      setToast({
        type: "error",
        message: extractErrorMessage(err, "Could not apply filters."),
      });
    }
  };

  // Debounced search — waits 400ms after typing stops before hitting the API
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange("search", searchInput);
      }
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const clearFilters = async () => {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
    await reloadTasks(DEFAULT_FILTERS, 1);
  };

  const goToPage = async (page) => {
    try {
      await reloadTasks(filters, page);
    } catch (err) {
      setToast({
        type: "error",
        message: extractErrorMessage(err, "Could not load that page."),
      });
    }
  };

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) g[t.status]?.push(t);
    return g;
  }, [tasks]);

  const canModify = (task) =>
    isAdmin || task.creator.id === user.id || task.assignee?.id === user.id;
  const canDeleteTask = (task) => isAdmin || task.creator.id === user.id;

  const handleCreateTask = async (payload) => {
    const created = await tasksApi.create(id, payload);
    await reloadTasks(filters, pagination.page);
    setShowCreate(false);
    setToast({ type: "success", message: "Task created." });
  };

  const handleEditTask = async (payload) => {
    const updated = await tasksApi.update(id, editingTask.id, payload);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
    setToast({ type: "success", message: "Task updated." });
  };

  const handleDeleteTask = async () => {
    try {
      await tasksApi.remove(id, editingTask.id);
      await reloadTasks(filters, pagination.page);
      setToast({ type: "success", message: "Task deleted." });
    } catch (err) {
      setToast({
        type: "error",
        message: extractErrorMessage(err, "Could not delete task."),
      });
    } finally {
      setEditingTask(null);
    }
  };

  const handleDragStart = (e, task) => {
    if (!canModify(task)) {
      e.preventDefault();
      return;
    }
    setDraggingId(task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (colKey) => {
    setDragOverCol(null);
    const task = tasks.find((t) => t.id === draggingId);
    setDraggingId(null);
    if (!task || task.status === colKey) return;

    const prevTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: colKey } : t)),
    );
    try {
      await tasksApi.update(id, task.id, { status: colKey });
    } catch (err) {
      setTasks(prevTasks);
      setToast({
        type: "error",
        message: extractErrorMessage(err, "Could not move that task."),
      });
    }
  };

  const handleAddMember = async (userId) => {
    const updated = await projectsApi.addMember(id, userId);
    setProject(updated);
    setToast({ type: "success", message: "Member added." });
  };

  const handleRemoveMember = async (userId) => {
    try {
      const updated = await projectsApi.removeMember(id, userId);
      setProject(updated);
      setToast({ type: "success", message: "Member removed." });
    } catch (err) {
      setToast({
        type: "error",
        message: extractErrorMessage(err, "Could not remove member."),
      });
    }
  };

  if (status === "loading") {
    return (
      <Layout>
        <div className="page-loading">
          <span className="spinner" /> Loading project…
        </div>
      </Layout>
    );
  }

  if (status === "error") {
    return (
      <Layout>
        <div className="state-block">
          <h3>Couldn't load this project</h3>
          <p>{errorMsg}</p>
          <Link to="/" className="btn btn-secondary">
            Back to projects
          </Link>
        </div>
      </Layout>
    );
  }

  const hasActiveFilters =
    filters.status || filters.priority || filters.assigneeId || filters.search;

  return (
    <Layout>
      <div className="main-header">
        <div>
          <span className="eyebrow">
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              Projects
            </Link>{" "}
            / {project.name}
          </span>
          <h1>{project.name}</h1>
          {project.description && (
            <p className="page-desc">{project.description}</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowMembers(true)}
          >
            Members ({project.members.length})
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + New task
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search tasks…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange("priority", e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={filters.assigneeId}
          onChange={(e) => handleFilterChange("assigneeId", e.target.value)}
        >
          <option value="">Everyone</option>
          {project.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
        >
          <option value="createdAt">Sort: newest</option>
          <option value="dueDate">Sort: due date</option>
          <option value="priority">Sort: priority</option>
          <option value="title">Sort: title</option>
        </select>
        <select
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
        >
          <option value="DESC">Descending</option>
          <option value="ASC">Ascending</option>
        </select>
        {hasActiveFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="state-block">
          <h3>No tasks match right now</h3>
          <p>Create a task or adjust your filters to see the board fill up.</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + New task
          </button>
        </div>
      ) : (
        <>
          <div className="board">
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                className={`board-col ${dragOverCol === col.key ? "drag-over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col.key);
                }}
                onDragLeave={() =>
                  setDragOverCol((c) => (c === col.key ? null : c))
                }
                onDrop={() => handleDrop(col.key)}
              >
                <div className="board-col-head">
                  <span className={`dot dot-${col.key}`} />
                  <span className="label">{col.label}</span>
                  <span className="count">{grouped[col.key].length}</span>
                </div>
                {grouped[col.key].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    dragging={draggingId === task.id}
                    onDragStart={handleDragStart}
                    onOpen={setEditingTask}
                  />
                ))}
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination-bar">
              <button
                className="btn btn-secondary"
                disabled={pagination.page <= 1}
                onClick={() => goToPage(pagination.page - 1)}
              >
                ← Prev
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} tasks)
              </span>
              <button
                className="btn btn-secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => goToPage(pagination.page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <TaskModal
          members={project.members}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {editingTask && (
        <TaskModal
          task={editingTask}
          members={project.members}
          canDelete={canDeleteTask(editingTask)}
          onClose={() => setEditingTask(null)}
          onSubmit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}

      {showMembers && (
        <MemberModal
          project={project}
          onClose={() => setShowMembers(false)}
          onAdd={handleAddMember}
          onRemove={handleRemoveMember}
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
