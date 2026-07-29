import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

/* ── Eye icon SVGs ─────────────────────────────────────────── */
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ── Live field validation ─────────────────────────────── */
  const validateEmail = (val) => {
    if (!val.trim()) return "Email is required.";
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required.";
    return "";
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (errors.email) {
      const msg = validateEmail(val);
      setErrors((prev) => ({ ...prev, email: msg }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (errors.password) {
      const msg = validatePassword(val);
      setErrors((prev) => ({ ...prev, password: msg }));
    }
  };

  /* ── Submit (original logic untouched) ────────────────── */
  const validate = () => {
    const next = {};
    const emailMsg = validateEmail(email);
    const passwordMsg = validatePassword(password);
    if (emailMsg)    next.email    = emailMsg;
    if (passwordMsg) next.password = passwordMsg;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    try {
      await login(email.trim(), password);
      const dest = location.state?.from || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      setApiError(extractErrorMessage(err, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <span className="auth-logo-dot" />
            <div className="mark">Task Management</div>
          </div>
          <span className="sub">Task management for teams</span>
        </div>

        <div className="auth-divider" />

        {/* API Error */}
        {apiError && (
          <div className="form-error-banner">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" />
              <path d="M8 5v3M8 11h.01" strokeLinecap="round" />
            </svg>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className={errors.email ? "invalid" : ""}
              value={email}
              onChange={handleEmailChange}
              onBlur={() => setErrors((prev) => ({ ...prev, email: validateEmail(email) }))}
              placeholder="e.g. mohamed@gmail.com"
              autoFocus
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-with-action">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={errors.password ? "invalid" : ""}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setErrors((prev) => ({ ...prev, password: validatePassword(password) }))}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
            style={{ marginTop: 8 }}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
