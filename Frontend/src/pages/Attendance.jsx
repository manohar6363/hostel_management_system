import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StaffSidebar from '../components/StaffSidebar';
import AdminSidebar from '../components/AdminSidebar';

const BASE_URL = 'http://localhost:8080/api/attendances';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function StatusBadge({ value }) {
  if (value === null || value === undefined) {
    return <span className="att-badge att-badge--pending">Not Marked</span>;
  }
  return value
    ? <span className="att-badge att-badge--present">Present</span>
    : <span className="att-badge att-badge--absent">Absent</span>;
}

// ── History Modal ─────────────────────────────────────────────────────────────

function HistoryModal({ student, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BASE_URL}/history/${student.id}`)
      .then(res => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [student.id]);

  return (
    <div className="att-modal-overlay" onClick={onClose}>
      <div className="att-modal" onClick={e => e.stopPropagation()}>
        <div className="att-modal-header">
          <div>
            <h2 className="att-modal-title">{student.name}</h2>
            <p className="att-modal-subtitle">Attendance History · {student.id}</p>
          </div>
          <button className="att-modal-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="att-modal-loading">Loading records…</div>
        ) : history.length === 0 ? (
          <div className="att-modal-empty">No attendance records found.</div>
        ) : (
          <div className="att-modal-body">
            <table className="att-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Morning</th>
                  <th>Morning Time</th>
                  <th>Evening</th>
                  <th>Evening Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map(record => (
                  <tr key={record.id}>
                    <td className="att-date-cell">{formatDate(record.date)}</td>
                    <td><StatusBadge value={record.morningStatus} /></td>
                    <td className="att-time-cell">{formatTime(record.morningMarkedTime)}</td>
                    <td><StatusBadge value={record.eveningStatus} /></td>
                    <td className="att-time-cell">{formatTime(record.eveningMarkedTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

const AttendancePage = () => {
  const role = localStorage.getItem("role");
  const Sidebar = role === "ADMIN" ? AdminSidebar : StaffSidebar;
  const [records, setRecords] = useState([]);
  const [windows, setWindows] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyStudent, setHistoryStudent] = useState(null);
  const [marking, setMarking] = useState({});   // { "studentId-session": true }
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Data fetching ──
  const fetchData = useCallback(async () => {
    try {
      const [recRes, winRes] = await Promise.all([
        axios.get(`${BASE_URL}/today`),
        axios.get(`${BASE_URL}/windows`),
      ]);
      setRecords(recRes.data);
      setWindows(winRes.data);
    } catch {
      addToast('Failed to load attendance data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Toast notifications ──
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // ── Mark present handler ──
  const handleMarkPresent = async (studentId, session) => {
    const key = `${studentId}-${session}`;
    setMarking(prev => ({ ...prev, [key]: true }));
    try {
      await axios.post(`${BASE_URL}/mark`, null, { params: { studentId, session } });
      addToast(`${session.charAt(0).toUpperCase() + session.slice(1)} attendance marked.`, 'success');
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not mark attendance.';
      addToast(msg, 'error');
    } finally {
      setMarking(prev => ({ ...prev, [key]: false }));
    }
  };

  // ── Filtering ──
  const filteredRecords = records.filter(r =>
    r.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Window status helpers ──
  const isWindowOpen = (start, end) => {
    if (!windows) return false;
    const now = new Date();
    const pad = t => t.padStart(5, '0');
    const toDate = t => { const [h, m] = pad(t).split(':'); const d = new Date(); d.setHours(+h, +m, 0, 0); return d; };
    return now >= toDate(start) && now <= toDate(end);
  };

  const morningOpen = windows && isWindowOpen(windows.morningStart, windows.morningEnd);
  const eveningOpen = windows && isWindowOpen(windows.eveningStart, windows.eveningEnd);

  // ── Render ──
  return (
    <div className="attendance">
      <Sidebar>
        <div className="att-page">

          {/* ── Header ── */}
          <div className="att-header">
            <div>
              <h1 className="att-title">Attendance</h1>
              <p className="att-subtitle">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            {windows && (
              <div className="att-windows">
                <div className={`att-window-pill ${morningOpen ? 'att-window-pill--open' : ''}`}>
                  <span className="att-window-dot" />
                  Morning&nbsp;
                  <span className="att-window-time">
                    {formatTime(windows.morningStart + ':00')} – {formatTime(windows.morningEnd + ':00')}
                  </span>
                </div>
                <div className={`att-window-pill ${eveningOpen ? 'att-window-pill--open' : ''}`}>
                  <span className="att-window-dot" />
                  Evening&nbsp;
                  <span className="att-window-time">
                    {formatTime(windows.eveningStart + ':00')} – {formatTime(windows.eveningEnd + ':00')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Search ── */}
          <div className="att-search-row">
            <div className="att-search-wrap">
              <span className="att-search-icon">&#9906;</span>
              <input
                className="att-search-input"
                type="text"
                placeholder="Search by name or student ID…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="att-search-clear" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>
            <span className="att-count">{filteredRecords.length} student{filteredRecords.length !== 1 ? 's' : ''}</span>
          </div>

          {/* ── Table ── */}
          {loading ? (
            <div className="att-loading">Loading today's attendance…</div>
          ) : (
            <div className="att-table-wrap">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Morning</th>
                    <th>Morning Time</th>
                    <th>Evening</th>
                    <th>Evening Time</th>
                    <th>History</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="att-empty">No students found.</td>
                    </tr>
                  ) : filteredRecords.map(record => {
                    const s = record.student;
                    const morningKey = `${s.id}-morning`;
                    const eveningKey = `${s.id}-evening`;

                    return (
                      <tr key={record.id}>
                        <td className="att-id-cell">{s.id}</td>
                        <td className="att-name-cell">{s.name}</td>
                        <td className="att-course-cell">{s.course || '—'}</td>

                        {/* Morning */}
                        <td>
                          {record.morningStatus !== null && record.morningStatus !== undefined ? (
                            <StatusBadge value={record.morningStatus} />
                          ) : morningOpen ? (
                            <button
                              className="att-mark-btn att-mark-btn--morning"
                              disabled={marking[morningKey]}
                              onClick={() => handleMarkPresent(s.id, 'morning')}
                            >
                              {marking[morningKey] ? '…' : '✓ Present'}
                            </button>
                          ) : (
                            <StatusBadge value={null} />
                          )}
                        </td>
                        <td className="att-time-cell">{formatTime(record.morningMarkedTime)}</td>

                        {/* Evening */}
                        <td>
                          {record.eveningStatus !== null && record.eveningStatus !== undefined ? (
                            <StatusBadge value={record.eveningStatus} />
                          ) : eveningOpen ? (
                            <button
                              className="att-mark-btn att-mark-btn--evening"
                              disabled={marking[eveningKey]}
                              onClick={() => handleMarkPresent(s.id, 'evening')}
                            >
                              {marking[eveningKey] ? '…' : '✓ Present'}
                            </button>
                          ) : (
                            <StatusBadge value={null} />
                          )}
                        </td>
                        <td className="att-time-cell">{formatTime(record.eveningMarkedTime)}</td>

                        {/* History */}
                        <td>
                          <button
                            className="att-history-btn"
                            onClick={() => setHistoryStudent(s)}
                          >
                            History
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── History Modal ── */}
        {historyStudent && (
          <HistoryModal
            student={historyStudent}
            onClose={() => setHistoryStudent(null)}
          />
        )}

        {/* ── Toast Notifications ── */}
        <div className="att-toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`att-toast att-toast--${t.type}`}>{t.message}</div>
          ))}
        </div>
      </Sidebar>
    </div>
  );
};

export default AttendancePage;
