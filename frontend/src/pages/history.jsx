import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './history.css';

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const routeTo = useNavigate();

  const fetchHistory = useCallback(async () => {
    try {
      const history = await getHistoryOfUser();
      console.log("History API response:", history); // remove after debugging

      // Normalize all possible response shapes into an array
      let result = [];
      if (Array.isArray(history)) {
        result = history;
      } else if (history && Array.isArray(history.data)) {
        result = history.data;
      } else if (history && Array.isArray(history.history)) {
        result = history.history;
      } else if (history && Array.isArray(history.meetings)) {
        result = history.meetings;
      } else if (history && typeof history === "object") {
        // last resort: grab the first array value found in the object
        const firstArray = Object.values(history).find(Array.isArray);
        if (firstArray) result = firstArray;
      }
      setMeetings(result);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [getHistoryOfUser]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleRejoin = (code) => {
    routeTo(`/${code}`);
  };

  return (
    <div className="history-page">
      <nav className="history-nav">
        <button className="back-btn" onClick={() => routeTo('/home')}>
          ← Back
        </button>
        <div className="history-logo">
          <div className="logo-mark">M</div>
          <span>MeetMates</span>
        </div>
        <div style={{ width: '80px' }} />
      </nav>

      <main className="history-main">
        <div className="history-header">
          <h1 className="history-title">Meeting History</h1>
          <p className="history-subtitle">All your past meetings in one place</p>
        </div>

        {loading ? (
          <div className="history-loading">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <p>Loading your meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">📋</div>
            <h3>No meetings yet</h3>
            <p>Your meeting history will appear here once you've joined a call.</p>
            <button className="btn-go-home" onClick={() => routeTo('/home')}>
              Start a Meeting
            </button>
          </div>
        ) : (
          <div className="history-list">
            {meetings.map((e, i) => (
              <div className="history-card" key={i}>
                <div className="hc-left">
                  <div className="hc-icon">📹</div>
                  <div className="hc-info">
                    <div className="hc-code">{e.meetingCode}</div>
                    <div className="hc-date">
                      <span>{formatDate(e.date)}</span>
                      <span className="date-dot">·</span>
                      <span>{formatTime(e.date)}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="btn-rejoin"
                  onClick={() => handleRejoin(e.meetingCode)}
                >
                  Rejoin →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}