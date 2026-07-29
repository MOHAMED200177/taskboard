import { formatDate, initials, isOverdue, shortId } from "../utils";

export default function TaskCard({ task, onOpen, onDragStart, dragging }) {
  const due = formatDate(task.dueDate);
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className={`ticket${dragging ? " dragging" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onOpen(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(task);
      }}
    >
      <div className="ticket-id">TB-{shortId(task.id)}</div>
      <div className="ticket-title">{task.title}</div>
      {task.description && (
        <div className="ticket-desc">{task.description}</div>
      )}
      <div className="ticket-foot">
        <span className={`priority-chip priority-${task.priority}`}>
          {task.priority}
        </span>

        {due && (
          <span className={`ticket-due${overdue ? " overdue" : ""}`}>
            {overdue ? "⚠ " : ""}
            {due}
          </span>
        )}

        {task.assignee && (
          <span className="ticket-avatar" title={task.assignee.name}>
            {initials(task.assignee.name)}
          </span>
        )}
      </div>
    </div>
  );
}
