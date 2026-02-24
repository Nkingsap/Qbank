import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getPapersByFilters,
    getUsersByDepartment,
    logActivity,
} from '../../utils/storage';
import LoadingButton from '../../components/LoadingButton';
import Icon from '../../components/Icon';

export default function DepartmentManager() {
    const { user } = useAuth();
    const toast = useToast();
    const [departments, setDepartments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({ name: '', code: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [paperCounts, setPaperCounts] = useState({});
    const [adminCounts, setAdminCounts] = useState({});

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        const depts = await getDepartments();
        setDepartments(depts);

        // Pre-load counts
        const pCounts = {};
        const aCounts = {};
        for (const dept of depts) {
            const papers = await getPapersByFilters({ departmentId: dept.id });
            pCounts[dept.id] = papers.length;
            const users = await getUsersByDepartment(dept.id);
            aCounts[dept.id] = users.length;
        }
        setPaperCounts(pCounts);
        setAdminCounts(aCounts);
    };

    const resetForm = () => {
        setForm({ name: '', code: '' });
        setEditingDept(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.code.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {

            if (editingDept) {
                const result = await updateDepartment(editingDept.id, {
                    name: form.name.trim(),
                    code: form.code.trim().toUpperCase(),
                });
                if (result.success) {
                    toast.success('Department updated successfully');
                    logActivity('update_dept', `${user.name} updated department "${form.name.trim()}"`, user.id);
                    resetForm();
                    await loadDepartments();
                } else {
                    toast.error(result.error);
                }
            } else {
                const result = await createDepartment({
                    name: form.name.trim(),
                    code: form.code.trim().toUpperCase(),
                });
                if (result.success) {
                    toast.success('Department created successfully');
                    logActivity('create_dept', `${user.name} created department "${form.name.trim()}"`, user.id);
                    resetForm();
                    await loadDepartments();
                } else {
                    toast.error(result.error);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (dept) => {
        setEditingDept(dept);
        setForm({ name: dept.name, code: dept.code });
        setShowForm(true);
    };

    const handleDelete = async (deptId) => {
        setDeletingId(deptId);
        try {
            const result = await deleteDepartment(deptId);
            if (result.success) {
                const dept = departments.find(d => d.id === deptId);
                toast.success('Department deleted successfully');
                logActivity('delete_dept', `${user.name} deleted department "${dept?.name || 'Unknown'}"`, user.id);
                setDeleteConfirm(null);
                await loadDepartments();
            } else {
                toast.error(result.error);
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="department-manager">
            <div className="dash-section-header">
                <h2>Manage Departments</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                    id="add-department-btn"
                >
                    {showForm ? '✕ Cancel' : '+ Add Department'}
                </button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <form className="upload-form animate-fade-in-up" onSubmit={handleSubmit} id="department-form">
                    <h3>{editingDept ? 'Edit Department' : 'Add New Department'}</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Department Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Computer Science & Engineering"
                                value={form.name}
                                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                required
                                id="dept-name-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department Code *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., CSE"
                                value={form.code}
                                onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))}
                                required
                                maxLength={10}
                                id="dept-code-input"
                            />
                            <span className="form-hint">Short unique code (will be uppercased)</span>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                            Cancel
                        </button>
                        <LoadingButton type="submit" loading={isSubmitting} className="btn btn-primary" id="submit-department-btn">
                            {editingDept ? 'Update Department' : 'Create Department'}
                        </LoadingButton>
                    </div>
                </form>
            )}

            {/* Departments List */}
            {departments.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><Icon name="building" size={40} /></div>
                        <h3>No departments yet</h3>
                        <p>Create your first department to get started.</p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table" id="departments-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Department Name</th>
                                <th className="hide-on-mobile">Papers</th>
                                <th className="hide-on-mobile">Admins</th>
                                <th className="hide-on-mobile">Created</th>
                                <th style={{ width: '180px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(dept => {
                                const paperCount = paperCounts[dept.id] || 0;
                                const adminCount = adminCounts[dept.id] || 0;
                                return (
                                    <tr key={dept.id}>
                                        <td>
                                            <span className="badge badge-dark">{dept.code}</span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{dept.name}</td>
                                        <td className="hide-on-mobile">{paperCount}</td>
                                        <td className="hide-on-mobile">{adminCount}</td>
                                        <td className="hide-on-mobile" style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                                            {new Date(dept.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            {deleteConfirm === dept.id ? (
                                                <div className="papers-table-actions">
                                                    <LoadingButton
                                                        loading={deletingId === dept.id}
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(dept.id)}
                                                    >
                                                        Confirm Delete
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
                                                        onClick={() => handleEdit(dept)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setDeleteConfirm(dept.id)}
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
