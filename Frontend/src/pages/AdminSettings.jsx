import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../CSS/Adminlogin.css';
import '../CSS/adminsettings.css';
import AdminSidebar from '../components/AdminSidebar';

function AdminSettings() {
  const location = useLocation();
  const loggedInUsername = location.state?.username || '';

  const [activeTab, setActiveTab] = useState('profile');

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({ id: '', username: '' });
  const [profileError, setProfileError] = useState('');

  // ── Change Password state ──────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ── Create Admin state ─────────────────────────────────────────────────────
  const [newUsername, setNewUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminConfirm, setNewAdminConfirm] = useState('');
  const [createMsg, setCreateMsg] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (!loggedInUsername) {
      setProfileError('No admin session found. Please log in again.');
      return;
    }
    fetch(`http://localhost:8080/login/admin/profile?username=${loggedInUsername}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch(() => setProfileError('Could not load profile.'));
  }, [loggedInUsername]);

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (!currentPassword) { setPasswordError('Enter your current password.'); return; }
    if (!newPassword) { setPasswordError('Enter a new password.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('New password and confirm password do not match.'); return; }

    fetch('http://localhost:8080/login/admin/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loggedInUsername, currentPassword, newPassword }),
    })
      .then((res) => {
        if (!res.ok) return res.text().then((t) => { throw new Error(t); });
        return res.text();
      })
      .then((msg) => {
        setPasswordMsg(msg);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((err) => setPasswordError(err.message));
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    setCreateMsg('');
    setCreateError('');

    if (!newUsername) { setCreateError('Enter a username.'); return; }
    if (!newAdminPassword) { setCreateError('Enter a password.'); return; }
    if (newAdminPassword !== newAdminConfirm) { setCreateError('Passwords do not match.'); return; }

    fetch('http://localhost:8080/login/admin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, password: newAdminPassword }),
    })
      .then((res) => {
        if (!res.ok) return res.text().then((t) => { throw new Error(t); });
        return res.text();
      })
      .then((msg) => {
        setCreateMsg(msg);
        setNewUsername('');
        setNewAdminPassword('');
        setNewAdminConfirm('');
      })
      .catch((err) => setCreateError(err.message));
  };

  return (
    <AdminSidebar>
      <div className="settings-page">
        <h1 className="settings-title">Admin Settings</h1>

        <div className="settings-tabs">
          <button
            className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`settings-tab-btn ${activeTab === 'changePassword' ? 'active' : ''}`}
            onClick={() => setActiveTab('changePassword')}
          >
            Change Password
          </button>
          <button
            className={`settings-tab-btn ${activeTab === 'createAdmin' ? 'active' : ''}`}
            onClick={() => setActiveTab('createAdmin')}
          >
            Create Admin
          </button>
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="settings-card">
            <h2>Profile</h2>
            {profileError ? (
              <p className="settings-error">{profileError}</p>
            ) : (
              <div className="profile-info">
                <div className="profile-row">
                  <span className="profile-label">Admin ID</span>
                  <span className="profile-value">{profile.id}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Username</span>
                  <span className="profile-value">{profile.username}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Change Password Tab ── */}
        {activeTab === 'changePassword' && (
          <div className="settings-card">
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword} className="settings-form">
              <div className="settings-field">
                <label>Current Password<span>*</span></label>
                <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="settings-field">
                <label>New Password<span>*</span></label>
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="settings-field">
                <label>Confirm New Password<span>*</span></label>
                <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              {passwordError && <p className="settings-error">{passwordError}</p>}
              {passwordMsg && <p className="settings-success">{passwordMsg}</p>}
              <div className="settings-submit">
                <input type="submit" value="Update Password" />
              </div>
            </form>
          </div>
        )}

        {/* ── Create Admin Tab ── */}
        {activeTab === 'createAdmin' && (
          <div className="settings-card">
            <h2>Create New Admin</h2>
            <form onSubmit={handleCreateAdmin} className="settings-form">
              <div className="settings-field">
                <label>Username<span>*</span></label>
                <input type="text" placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
              </div>
              <div className="settings-field">
                <label>Password<span>*</span></label>
                <input type="password" placeholder="Password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} />
              </div>
              <div className="settings-field">
                <label>Confirm Password<span>*</span></label>
                <input type="password" placeholder="Confirm Password" value={newAdminConfirm} onChange={(e) => setNewAdminConfirm(e.target.value)} />
              </div>
              {createError && <p className="settings-error">{createError}</p>}
              {createMsg && <p className="settings-success">{createMsg}</p>}
              <div className="settings-submit">
                <input type="submit" value="Create Admin" />
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}

export default AdminSettings;
