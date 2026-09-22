import { useState } from "react";
import { login, signup } from "../services/authService";

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState('login')

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0F172A' }}>
      {/* Card */}
      <div
        className="w-full max-w-md rounded-2xl p-12"
        style={{
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
        }}
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: '#F1F5F9' }}>
            DocuFlow
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>
            Your intelligent document workspace
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8" style={{ borderBottom: '1px solid #334155' }}>
          <button
            type="button"
            onClick={() => setTab('login')}
            className="flex-1 pb-3 text-sm font-medium focus:outline-none"
            style={{
              color: tab === 'login' ? '#F1F5F9' : '#94A3B8',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: tab === 'login' ? '2px solid #6366F1' : '2px solid transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
              background: 'transparent',
              paddingBottom: '0.75rem',
              transition: 'color 0.15s ease',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className="flex-1 pb-3 text-sm font-medium focus:outline-none"
            style={{
              color: tab === 'signup' ? '#F1F5F9' : '#94A3B8',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: tab === 'signup' ? '2px solid #6366F1' : '2px solid transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
              background: 'transparent',
              paddingBottom: '0.75rem',
              transition: 'color 0.15s ease',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        {tab === 'login' ? (
          <LoginForm onSwitch={() => setTab('signup')} onLogin={onLogin} />
        ) : (
          <SignupForm onSwitch={() => setTab('login')} onLogin={onLogin} />
        )}
      </div>
    </div>
  )
}

/* ── Input ────────────────────────────────────────────────── */
function Field({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: '#94A3B8' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-shadow"
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          color: '#F1F5F9',
        }}
        onFocus={e => (e.target.style.boxShadow = '0 0 0 2px #6366F1')}
        onBlur={e => (e.target.style.boxShadow = 'none')}
      />
    </div>
  )
}

/* ── Password Input with visibility toggle ────────────────── */
function PasswordField({ id, label, placeholder, value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: '#94A3B8' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg text-sm outline-none transition-shadow"
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            color: '#F1F5F9',
            padding: '0.625rem 2.75rem 0.625rem 0.875rem',
          }}
          onFocus={e => (e.target.style.boxShadow = '0 0 0 2px #6366F1')}
          onBlur={e => (e.target.style.boxShadow = 'none')}
        />
        {/* type="button" is critical — prevents this from submitting the form */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            padding: '0',
            cursor: 'pointer',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
        >
          {show ? (
            /* Eye-off SVG */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            /* Eye SVG */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Login Form ───────────────────────────────────────────── */
function LoginForm({ onSwitch, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      // Pass the authenticated user up to App immediately
      onLogin(data.user);
    } catch (err) {
      // Extract a readable message; never expose raw errors
      const message =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <Field
        id="login-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <PasswordField
        id="login-password"
        label="Password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-lg py-2.5 text-sm font-semibold focus:outline-none"
        style={{
          backgroundColor: "#6366F1",
          color: "#F1F5F9",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          border: 'none',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
        onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.99)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {loading ? "Signing in..." : "Log In"}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-center" style={{ color: '#F87171' }}>
          {error}
        </p>
      )}

      <p className="text-center text-xs" style={{ color: "#94A3B8" }}>
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium underline underline-offset-2 focus:outline-none"
          style={{ color: "#6366F1", cursor: 'pointer', background: 'transparent', border: 'none' }}
        >
          Sign up
        </button>
      </p>
    </form>
  );
}

/* ── Signup Form ──────────────────────────────────────────── */
function SignupForm({ onSwitch, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signup(name, email, password);
      // Pass the authenticated user up to App immediately
      onLogin(data.user);
    } catch (err) {
      // Extract a readable message; never expose raw errors
      const message =
        err?.response?.data?.message ||
        "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <Field
        id="signup-name"
        label="Name"
        type="text"
        placeholder="Jane Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Field
        id="signup-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <PasswordField
        id="signup-password"
        label="Password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-lg py-2.5 text-sm font-semibold focus:outline-none"
        style={{
          backgroundColor: "#6366F1",
          color: "#F1F5F9",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          border: 'none',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
        onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.99)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-center" style={{ color: '#F87171' }}>
          {error}
        </p>
      )}

      <p className="text-center text-xs" style={{ color: "#94A3B8" }}>
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium underline underline-offset-2 focus:outline-none"
          style={{ color: "#6366F1", cursor: 'pointer', background: 'transparent', border: 'none' }}
        >
          Log in
        </button>
      </p>
    </form>
  );
}
