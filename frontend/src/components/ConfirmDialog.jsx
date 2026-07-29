export default function ConfirmDialog({ title, body, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="modal" style={{ maxWidth: 380 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>{body}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
