import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="mark-dot" />
          <span className="mark">Task Management</span>
        </div>

        {/* Nav */}
        <div className="sidebar-section">
          <span className="sidebar-section-label">Navigation</span>
          <nav className="sidebar-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <svg
                className="nav-icon"
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
              Projects
            </NavLink>
          </nav>
        </div>

        {/* User info */}
        <div style={{ flex: 1 }} />
        <div className="sidebar-user" style={{ margin: "0 12px 12px" }}>
          <div className="user-avatar">{initials(user?.name)}</div>
          <div className="name">{user?.name}</div>
          <div className="email">{user?.email}</div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
