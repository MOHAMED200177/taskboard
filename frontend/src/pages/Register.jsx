import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/client";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/* ── Password strength rules (for live checklist) ─────────── */
const RULES = [
  { id: "length",    label: "At least 8 characters",  test: (p) => p.length >= 8 },
  { id: "upper",     label: "One uppercase letter",    test: (p) => /[A-Z]/.test(p) },
  { id: "lower",     label: "One lowercase letter",   test: (p) => /[a-z]/.test(p) },
  { id: "number",    label: "One number",             test: (p) => /\d/.test(p) },
];

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

/* ── Check / X icons for requirements list ─────────────────── */
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3.5 3.5L13 4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("member");
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done,     setDone]     = useState(false);

  const [showPassword,  setShowPassword]  = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  /* ── Live per-field validators ─────────────────────────── */
  const validateName     = (v) => (!v.trim() ? "Full name is required." : "");
  const validateEmail    = (v) => (!v.trim() ? "Email address is required." : "");
  const validatePassword = (v) => (!PASSWORD_RULE.test(v) ? "Password does not meet the requirements below." : "");

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (errors.name) setErrors((prev) => ({ ...prev, name: validateName(val) }));
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (errors.email) setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordTouched(true);
    if (errors.password) setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
  };

  /* ── Submit (original logic untouched) ────────────────── */
  const validate = () => {
    const next = {};
    const nm = validateName(name);
    const em = validateEmail(email);
    const pm = validatePassword(password);
    if (nm) next.name     = nm;
    if (em) next.email    = em;
    if (pm) next.password = pm;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordTouched(true);
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    try {
      await register({ name: name.trim(), email: email.trim(), password, role });
      setDone(true);
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      setApiError(extractErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  const allRulesMet = RULES.every((r) => r.test(password));

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <span className="auth-logo-dot" />
            <div className="mark">Task Management</div>
          </div>
          <span className="sub">Create your account</span>
        </div>

        <div className="auth-divider" />

        {done ? (
          <div className="state-block" style={{ border: "none", padding: "24px 0", background: "transparent" }}>
            <div
              className="state-icon"
              style={{ background: "var(--emerald-dim)", borderColor: "var(--emerald-ring)", color: "var(--emerald)", fontSize: 18 }}
            >
              ✓
            </div>
            <h3>Account created</h3>
            <p>Taking you to sign in…</p>
          </div>
        ) : (
          <>
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
              {/* Full name */}
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  className={errors.name ? "invalid" : ""}
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => setErrors((prev) => ({ ...prev, name: validateName(name) }))}
                  placeholder="e.g. Mohamed Ahmed"
                  autoFocus
                  autoComplete="name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

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
                    onBlur={() => {
                      setPasswordTouched(true);
                      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
                    }}
                    placeholder="Enter a strong password"
                    autoComplete="new-password"
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

                {/* Requirements checklist — appears once user starts typing */}
                {passwordTouched && (
                  <ul className="password-rules">
                    {RULES.map((rule) => {
                      const met = rule.test(password);
                      return (
                        <li key={rule.id} className={`password-rule ${met ? "met" : "unmet"}`}>
                          <span className="rule-icon">{met ? <CheckIcon /> : <XIcon />}</span>
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Account type */}
              <div className="field">
                <label htmlFor="role">Account type</label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="member">Member — Can create and edit tasks</option>
                  <option value="admin">Admin — Full project control</option>
                </select>
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
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
