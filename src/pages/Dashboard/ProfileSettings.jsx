import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateUser, updateCurrentUserSession, getDepartmentById } from '../../utils/storage';

export default function ProfileSettings() {
    const { user, isSuperAdmin, isDeptAdmin, setUser } = useAuth();
    const { showToast } = useToast();

    // Profile editing
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);

    // Password change
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Department name
    const [deptName, setDeptName] = useState(null);

    useEffect(() => {
        if (isDeptAdmin && user?.departmentId) {
            getDepartmentById(user.departmentId).then(dept => setDeptName(dept?.name || null));
        }
    }, [isDeptAdmin, user]);

    const handleSaveProfile = async () => {
        if (!editName.trim() || !editEmail.trim()) {
            showToast('Name and email are required', 'error');
            return;
        }
        setSaving(true);
        try {
            const result = await updateUser(user.id, { name: editName.trim(), email: editEmail.trim() });
            if (result.success) {
                const updatedUser = { ...user, name: editName.trim(), email: editEmail.trim() };
                updateCurrentUserSession(updatedUser);
                setUser(updatedUser);
                setIsEditing(false);
                showToast('Profile updated successfully', 'success');
            } else {
                showToast(result.error || 'Failed to update profile', 'error');
            }
        } catch {
            showToast('An error occurred while updating profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditName(user?.name || '');
        setEditEmail(user?.email || '');
        setIsEditing(false);
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            showToast('Please fill in all password fields', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        setChangingPassword(true);
        try {
            const result = await updateUser(user.id, { password: newPassword });
            if (result.success) {
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordForm(false);
                showToast('Password changed successfully', 'success');
            } else {
                showToast(result.error || 'Failed to change password', 'error');
            }
        } catch {
            showToast('An error occurred while changing password', 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="profile-settings">
            {/* Profile Details Card */}
            <div className="profile-card card card-elevated">
                <div className="profile-card-header">
                    <div className="profile-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="profile-header-info">
                        <h2>{user?.name}</h2>
                        <span className="profile-role-badge">
                            {isSuperAdmin ? '🛡️ Super Admin' : '🏛️ Department Admin'}
                        </span>
                    </div>
                    {!isEditing && (
                        <button
                            className="btn btn-secondary btn-sm profile-edit-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="profile-edit-form">
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="profile-edit-actions">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={handleCancelEdit}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn btn-primary btn-sm ${saving ? 'btn-loading' : ''}`}
                                onClick={handleSaveProfile}
                                disabled={saving}
                            >
                                <span className="btn-text">{saving ? 'Saving...' : 'Save Changes'}</span>
                                {saving && <span className="btn-spinner"></span>}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="profile-details-grid">
                        <div className="profile-detail-item">
                            <span className="profile-detail-label">Name</span>
                            <span className="profile-detail-value">{user?.name || '—'}</span>
                        </div>
                        <div className="profile-detail-item">
                            <span className="profile-detail-label">Email</span>
                            <span className="profile-detail-value">{user?.email || '—'}</span>
                        </div>
                        <div className="profile-detail-item">
                            <span className="profile-detail-label">Username</span>
                            <span className="profile-detail-value">{user?.username || '—'}</span>
                        </div>
                        <div className="profile-detail-item">
                            <span className="profile-detail-label">Role</span>
                            <span className="profile-detail-value">
                                {isSuperAdmin ? 'Super Admin' : 'Department Admin'}
                            </span>
                        </div>
                        {isDeptAdmin && (
                            <div className="profile-detail-item">
                                <span className="profile-detail-label">Department</span>
                                <span className="profile-detail-value">{deptName || '—'}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Change Password Card */}
            <div className="profile-card card card-elevated">
                <div className="profile-card-section-header">
                    <div>
                        <h3>Change Password</h3>
                        <p className="profile-card-desc">Update your account password</p>
                    </div>
                    {!showPasswordForm && (
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowPasswordForm(true)}
                        >
                            🔒 Change Password
                        </button>
                    )}
                </div>

                {showPasswordForm && (
                    <div className="profile-password-form">
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min. 6 characters)"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <div className="profile-edit-actions">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                                disabled={changingPassword}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn btn-primary btn-sm ${changingPassword ? 'btn-loading' : ''}`}
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                            >
                                <span className="btn-text">{changingPassword ? 'Changing...' : 'Update Password'}</span>
                                {changingPassword && <span className="btn-spinner"></span>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
