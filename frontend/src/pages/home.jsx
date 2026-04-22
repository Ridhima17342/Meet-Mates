import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './home.css';

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [joining, setJoining] = useState(false);
  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    setJoining(true);
    try {
      await addToUserHistory(meetingCode);
      navigate(`/${meetingCode}`);
    } catch {
      navigate(`/${meetingCode}`);
    } finally {
      setJoining(false);
    }
  };

  const handleNewMeeting = () => {
    const code = Math.random().toString(36).substring(2, 10);
    navigate(`/${code}`);
  };

  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="home-logo">
          <div className="logo-mark">M</div>
          <span>MeetMates</span>
        </div>
        <div className="home-nav-right">
          <button className="home-nav-btn" onClick={() => navigate('/history')}>
            <span className="nav-icon">🕐</span>
            History
          </button>
          <button
            className="home-nav-logout"
            onClick={() => { localStorage.removeItem("token"); navigate("/auth"); }}
          >
            Sign Out
          </button>
        </div>
      </nav>


      <main className="home-main">
        <div className="home-left">
          <h1 className="home-title">
            Your space to<br />
            <span className="home-highlight">talk, share</span><br />
            and connect.
          </h1>
          <p className="home-subtitle">
            Start a new meeting or join an existing one with a meeting code.
          </p>

          <div className="home-actions">
            <button className="btn-new-meeting" onClick={handleNewMeeting}>
              <span>+</span> New Meeting
            </button>
            <div className="join-divider"><span>or</span></div>
            <div className="join-row">
              <input
                className="join-input"
                placeholder="Enter meeting code"
                value={meetingCode}
                onChange={e => setMeetingCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoinVideoCall()}
              />
              <button
                className={`btn-join ${joining ? 'loading' : ''}`}
                onClick={handleJoinVideoCall}
                disabled={joining || !meetingCode.trim()}
              >
                {joining ? <span className="home-spinner" /> : 'Join'}
              </button>
            </div>
          </div>

          <div className="home-tips">
            <div className="tip-item">
              <span className="tip-icon">💡</span>
              <span>Share your meeting code with others to invite them</span>
            </div>
          </div>
        </div>

        <div className="home-right">
          <div className="home-illustration">
            <div className="meeting-preview">
              <div className="mp-header">
                <div className="mp-dot red" /><div className="mp-dot yellow" /><div className="mp-dot green" />
                <span className="mp-title">Team Standup</span>
              </div>
              <div className="mp-grid">
                <div className="mp-video v1"><div className="mp-avatar">AK</div><span>Aryan K</span></div>
                <div className="mp-video v2"><div className="mp-avatar a2">PV</div><span>Priya V</span></div>
                <div className="mp-video v3"><div className="mp-avatar a3">RS</div><span>Rohan S</span></div>
                <div className="mp-video you"><div className="mp-avatar a4">You</div><span>You</span></div>
              </div>
              <div className="mp-controls">
                <div className="mp-ctrl active">🎙</div>
                <div className="mp-ctrl end">✕</div>
                <div className="mp-ctrl">📹</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomeComponent);