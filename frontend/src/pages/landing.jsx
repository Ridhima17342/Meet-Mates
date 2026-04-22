import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './landing.css';

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-mark">M</div>
          <span>MeetMates</span>
        </div>
        <div className="landing-nav-links">
          <button className="nav-ghost" onClick={() => router('/aljk23')}>Join as Guest</button>
          <button className="nav-ghost" onClick={() => router('/auth')}>Register</button>
          <button className="nav-primary" onClick={() => router('/auth')}>Login</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">✦ Video calling, reimagined</div>
          <h1 className="hero-title">
            Connect with your<br />
            <span className="hero-highlight">loved ones</span>
          </h1>
          <p className="hero-subtitle">
            Crystal-clear video calls, real-time chat, and effortless screen sharing — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/auth" className="cta-primary">Get Started Free</Link>
            <button className="cta-ghost" onClick={() => router('/aljk23')}>
              <span className="play-icon">▶</span>
              Join a Meeting
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>HD</strong>
              <span>Video Quality</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>E2E</strong>
              <span>Encrypted</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>Free</strong>
              <span>Always</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="video-card main-card">
            <div className="video-placeholder">
              <div className="avatar-large">JD</div>
            </div>
            <div className="card-label">
              <span className="live-dot" />
              Live
            </div>
          </div>
          <div className="video-card mini-card card-1">
            <div className="avatar-small">SA</div>
            <div className="mini-label">Sara A.</div>
          </div>
          <div className="video-card mini-card card-2">
            <div className="avatar-small av2">RK</div>
            <div className="mini-label">Raj K.</div>
          </div>
          <div className="floating-chat">
            <div className="chat-bubble">Hey, can you see my screen? 👋</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="feature-card">
          <div className="feature-icon fi-blue">📹</div>
          <h3>HD Video</h3>
          <p>Crystal-clear 1080p video with adaptive bitrate for smooth calls on any connection.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon fi-green">💬</div>
          <h3>Live Chat</h3>
          <p>Send messages and share links in real time without interrupting the conversation.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon fi-orange">🖥️</div>
          <h3>Screen Share</h3>
          <p>Present your work, collaborate on docs, or just watch videos together.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon fi-purple">📋</div>
          <h3>Meeting History</h3>
          <p>Revisit and rejoin any past meeting with one click from your history.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 MeetMates. Made with ♥ for better connections.</p>
      </footer>
    </div>
  );
}