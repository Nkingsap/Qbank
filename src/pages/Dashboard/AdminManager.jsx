import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    getDepartments,
    getDeptAdmins,
    createUser,
    updateUser,
    deleteUser,
    getDepartmentById,
    logActivity,
} from '../../utils/storage';
import LoadingButton from '../../components/LoadingButton';
import Icon from '../../components/Icon';

export default function AdminManager() {
    const { user } = useAuth();
    const toast = useToast();
    const [admins, setAdmins] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [form, setForm] = useState({
        name: '',
        username: '',
        password: '',
        email: '',
        departmentId: '',
    });

    const [deptMap, setDeptMap] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [adminsList, deptsList] = await Promise.all([getDeptAdmins(), getDepartments()]);
        setAdmins(adminsList);
        setDepartments(deptsList);
        // Build dept lookup map
        const map = {};
        deptsList.forEach(d => { map[d.id] = d; });
        setDeptMap(map);
    };

    const resetForm = () => {
        setForm({ name: '', username: '', password: '', email: '', departmentId: '' });
        setEditingAdmin(null);
        setShowForm(false);
        setShowPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.username.trim() || !form.departmentId) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingAdmin) {
                const updates = {
                    name: form.name.trim(),
                    username: form.username.trim(),
                    email: form.email.trim(),
                    departmentId: form.departmentId,
                };
                if (form.password) {
                    updates.password = form.password;
                }
                const result = await updateUser(editingAdmin.id, updates);
                if (result.success) {
                    toast.success('Admin updated successfully');
                    logActivity('update_user', `${user.name} updated admin "${form.name.trim()}"`, user.id);
                    resetForm();
                    await loadData();
                } else {
                    toast.error(result.error);
                }
            } else {
                if (!form.password) {
                    toast.error('Password is required for new admin');
                    return;
                }
                const result = await createUser({
                    name: form.name.trim(),
                    username: form.username.trim(),
                    password: form.password,
                    email: form.email.trim(),
                    departmentId: form.departmentId,
                    role: 'dept_admin',
                });
                if (result.success) {
                    toast.success('Department admin created successfully');
                    logActivity('create_user', `${user.name} created admin "${form.name.trim()}"`, user.id);
                    resetForm();
                    await loadData();
                } else {
                    toast.error(result.error);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setForm({
            name: admin.name,
            username: admin.username,
            password: '',
            email: admin.email || '',
            departmentId: admin.departmentId,
        });
        setShowForm(true);
    };

    const handleDelete = async (adminId) => {
        setDeletingId(adminId);
        try {
            const result = await deleteUser(adminId);
            if (result.success) {
                const admin = admins.find(a => a.id === adminId);
                toast.success('Admin deleted successfully');
                logActivity('delete_user', `${user.name} deleted admin "${admin?.name || 'Unknown'}"`, user.id);
                setDeleteConfirm(null);
                await loadData();
            } else {
                toast.error(result.error);
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="admin-manager">
            <div className="dash-section-header">
                <h2>Manage Department Admins</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                    id="add-admin-btn"
                >
                    {showForm ? '✕ Cancel' : '+ Add Admin'}
                </button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <form className="upload-form animate-fade-in-up" onSubmit={handleSubmit} id="admin-form">
                    <h3>{editingAdmin ? 'Edit Admin' : 'Create New Department Admin'}</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., John Doe"
                                value={form.name}
                                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                required
                                id="admin-name-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="e.g., john@college.edu"
                                value={form.email}
                                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                id="admin-email-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Username *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Login username"
                                value={form.username}
                                onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                                required
                                id="admin-username-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Password {editingAdmin ? '(leave blank to keep)' : '*'}
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder={editingAdmin ? 'Leave blank to keep current' : 'Set password'}
                                    value={form.password}
                                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                                    required={!editingAdmin}
                                    id="admin-password-input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <Icon name="eye-off" size={18} /> : <Icon name="eye" size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Department *</label>
                        <select
                            className="form-select"
                            value={form.departmentId}
                            onChange={e => setForm(prev => ({ ...prev, departmentId: e.target.value }))}
                            required
                            id="admin-department-select"
                        >
                            <option value="">Select Department</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                            Cancel
                        </button>
                        <LoadingButton type="submit" loading={isSubmitting} className="btn btn-primary" id="submit-admin-btn">
                            {editingAdmin ? 'Update Admin' : 'Create Admin'}
                        </LoadingButton>
                    </div>
                </form>
            )}

            {/* Admins Table */}
            {admins.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><Icon name="user" size={40} /></div>
                        <h3>No department admins yet</h3>
                        <p>Create admins so they can upload papers for their departments.</p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table" id="admins-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th className="hide-on-mobile">Username</th>
                                <th className="hide-on-mobile">Email</th>
                                <th>Department</th>
                                <th className="hide-on-mobile">Created</th>
                                <th style={{ width: '180px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => {
                                const dept = deptMap[admin.departmentId];
                                return (
                                    <tr key={admin.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                                                    {admin.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{admin.name}</span>
                                            </div>
                                        </td>
                                        <td className="hide-on-mobile"><code style={{ fontSize: '13px' }}>{admin.username}</code></td>
                                        <td className="hide-on-mobile" style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                                            {admin.email || '—'}
                                        </td>
                                        <td>
                                            <span className="badge badge-dark">{dept?.code || '—'}</span>
                                        </td>
                                        <td className="hide-on-mobile" style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                                            {new Date(admin.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            {deleteConfirm === admin.id ? (
                                                <div className="papers-table-actions">
                                                    <LoadingButton
                                                        loading={deletingId === admin.id}
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(admin.id)}
                                                    >
                                                        Confirm
                                                    </LoadingButton>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setDeleteConfirm(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="papers-table-actions">
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleEdit(admin)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setDeleteConfirm(admin.id)}
                                                        style={{ color: 'var(--color-danger)' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
