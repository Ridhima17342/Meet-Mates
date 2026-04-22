import * as React from "react";
import { AuthContext } from "../contexts/AuthContext";
import './authentication.css';

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  let handleAuth = async () => {
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        setMessage(result);
        setShowSuccess(true);
        setUsername(""); setPassword(""); setName("");
        setFormState(0);
        setTimeout(() => setShowSuccess(false), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAuth();
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-logo-mark">M</div>
            <span>MeetMates</span>
          </div>
          <h2 className="auth-left-title">
            The easiest way to<br />connect, anywhere.
          </h2>
          <p className="auth-left-sub">
            Join millions of people using MeetMates for seamless video calls with family, friends, and colleagues.
          </p>
          <div className="auth-features-list">
            <div className="auth-feature-item">
              <span className="af-icon">✓</span>
              <span>Free HD video calls</span>
            </div>
            <div className="auth-feature-item">
              <span className="af-icon">✓</span>
              <span>Real-time group chat</span>
            </div>
            <div className="auth-feature-item">
              <span className="af-icon">✓</span>
              <span>Screen sharing</span>
            </div>
            <div className="auth-feature-item">
              <span className="af-icon">✓</span>
              <span>Meeting history</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">
            {formState === 0 ? "Welcome back" : "Create account"}
          </h1>
          <p className="auth-subtitle">
            {formState === 0 ? "Sign in to continue to MeetMates" : "Get started for free today"}
          </p>

          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${formState === 0 ? 'active' : ''}`}
              onClick={() => { setFormState(0); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${formState === 1 ? 'active' : ''}`}
              onClick={() => { setFormState(1); setError(""); }}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-form">
            {formState === 1 && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus={formState === 0}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter your Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠</span> {error}
              </div>
            )}

            {showSuccess && (
              <div className="auth-success">
                <span>✓</span> {message}
              </div>
            )}

            <button
              className={`auth-submit ${loading ? 'loading' : ''}`}
              onClick={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                formState === 0 ? "Sign In →" : "Create Account →"
              )}
            </button>
          </div>

          <p className="auth-switch">
            {formState === 0 ? "Don't have an account? " : "Already have an account? "}
            <button
              className="auth-switch-btn"
              onClick={() => { setFormState(formState === 0 ? 1 : 0); setError(""); }}
            >
              {formState === 0 ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}