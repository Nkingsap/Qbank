import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    getDepartments,
    getPapersByFilters,
    createPaper,
    deletePaper,
    logActivity,
    uploadFile,
    incrementPaperViews,
    SEMESTERS,
    EXAM_TYPES,
    YEARS,
} from '../../utils/storage';
import LoadingButton from '../../components/LoadingButton';
import PaperCard from '../../components/PaperCard';

export default function PaperManager() {
    const { user, isSuperAdmin, isDeptAdmin } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [papers, setPapers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [filterDept, setFilterDept] = useState(isDeptAdmin ? user.departmentId : '');
    const [filterSemester, setFilterSemester] = useState('');
    const [filterExamType, setFilterExamType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Upload form state
    const [form, setForm] = useState({
        subject: '',
        subjectCode: '',
        semester: '',
        examType: '',
        year: new Date().getFullYear().toString(),
        departmentId: isDeptAdmin ? user.departmentId : '',
        description: '',
        fileName: '',
        file: null, // Store actual File object for upload
    });

    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        async function init() {
            setDepartments(await getDepartments());
            await loadPapers();
        }
        init();
    }, [filterDept, filterSemester, filterExamType, searchQuery]);

    const loadPapers = async () => {
        const filters = {
            search: searchQuery,
        };
        if (isDeptAdmin) {
            filters.departmentId = user.departmentId;
        } else if (filterDept) {
            filters.departmentId = filterDept;
        }
        if (filterSemester) filters.semester = filterSemester;
        if (filterExamType) filters.examType = filterExamType;

        setPapers(await getPapersByFilters(filters));
    };

    const updateForm = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        updateForm('file', file);
        updateForm('fileName', file.name);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!form.subject || !form.semester || !form.examType || !form.year || !form.departmentId) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload the file first if one was selected
            let fileUrl = null;
            if (form.file) {
                try {
                    const uploadResult = await uploadFile(form.file);
                    fileUrl = uploadResult.url;
                } catch (uploadErr) {
                    toast.error('Failed to upload file: ' + uploadErr.message);
                    return;
                }
            }

            const result = await createPaper({
                subject: form.subject,
                subjectCode: form.subjectCode,
                semester: Number(form.semester),
                examType: form.examType,
                year: form.year,
                departmentId: form.departmentId,
                description: form.description,
                fileName: form.fileName,
                fileUrl: fileUrl,
            });

            if (result.success) {
                toast.success('Paper uploaded successfully!');
                logActivity('upload_paper', `${user.name} uploaded "${form.subject}"`, user.id);
                resetForm();
                await loadPapers();
            } else {
                toast.error(result.error || 'Failed to upload paper');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setForm({
            subject: '',
            subjectCode: '',
            semester: '',
            examType: '',
            year: new Date().getFullYear().toString(),
            departmentId: isDeptAdmin ? user.departmentId : '',
            description: '',
            fileName: '',
            file: null,
        });
        setShowUploadForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (paperId) => {
        setDeletingId(paperId);
        try {
            const result = await deletePaper(paperId);
            if (result.success) {
                toast.success('Paper deleted successfully');
                const paper = papers.find(p => p.id === paperId);
                logActivity('delete_paper', `${user.name} deleted "${paper?.subject || 'Unknown'}"`, user.id);
                setDeleteConfirm(null);
                await loadPapers();
            } else {
                toast.error(result.error);
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleView = (paper) => {
        incrementPaperViews(paper.id);
        if (paper.fileUrl) {
            const link = document.createElement('a');
            link.href = paper.fileUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.click();
        }
    };

    const handleCardDelete = (paper) => {
        handleDelete(paper.id);
    };

    return (
        <div className="paper-manager">
            <div className="paper-manager-top">
                {/* Header with upload button (desktop only) */}
                <div className="dash-section-header paper-manager-header">
                    <h2>Manage Papers</h2>
                    <button
                        className="btn btn-primary paper-upload-btn-desktop"
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        id="upload-paper-btn"
                    >
                        {showUploadForm ? '✕ Cancel' : '+ Upload Paper'}
                    </button>
                </div>

                {/* Upload Form */}
                {showUploadForm && (
                    <form className="upload-form animate-fade-in-up paper-manager-form" onSubmit={handleUpload} id="upload-form">
                        <h3>Upload New Question Paper</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Subject Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Data Structures"
                                    value={form.subject}
                                    onChange={e => updateForm('subject', e.target.value)}
                                    required
                                    id="paper-subject"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject Code</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., CS301"
                                    value={form.subjectCode}
                                    onChange={e => updateForm('subjectCode', e.target.value)}
                                    id="paper-subject-code"
                                />
                            </div>
                        </div>

                        <div className="form-row-3">
                            {isSuperAdmin && (
                                <div className="form-group">
                                    <label className="form-label">Department *</label>
                                    <select
                                        className="form-select"
                                        value={form.departmentId}
                                        onChange={e => updateForm('departmentId', e.target.value)}
                                        required
                                        id="paper-department"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Semester *</label>
                                <select
                                    className="form-select"
                                    value={form.semester}
                                    onChange={e => updateForm('semester', e.target.value)}
                                    required
                                    id="paper-semester"
                                >
                                    <option value="">Select Semester</option>
                                    {SEMESTERS.map(s => (
                                        <option key={s} value={s}>Semester {s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Exam Type *</label>
                                <select
                                    className="form-select"
                                    value={form.examType}
                                    onChange={e => updateForm('examType', e.target.value)}
                                    required
                                    id="paper-exam-type"
                                >
                                    <option value="">Select Exam Type</option>
                                    {EXAM_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Year *</label>
                                <select
                                    className="form-select"
                                    value={form.year}
                                    onChange={e => updateForm('year', e.target.value)}
                                    required
                                    id="paper-year"
                                >
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Add any notes about this question paper..."
                                value={form.description}
                                onChange={e => updateForm('description', e.target.value)}
                                rows={3}
                                id="paper-description"
                            />
                        </div>

                        {/* File Upload */}
                        <div className="form-group">
                            <label className="form-label">Upload File</label>
                            <div
                                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {form.fileName ? (
                                    <div>
                                        <div className="upload-zone-icon">✓</div>
                                        <h4>{form.fileName}</h4>
                                        <p>Click to change file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="upload-zone-icon">↑</div>
                                        <h4>Drag & drop your file here or click to browse</h4>
                                        <p>Supports PDF, images, and documents (max 10MB)</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                                id="paper-file-input"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                            <LoadingButton type="submit" loading={isSubmitting} className="btn btn-primary" id="submit-paper-btn">
                                Upload Paper
                            </LoadingButton>
                        </div>
                    </form>
                )}

                {/* Filters Bar */}
                <div className="manager-filters paper-manager-filters">
                    <div className="search-wrapper" style={{ flex: 1, maxWidth: '300px' }}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search papers..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            id="manager-search"
                        />
                    </div>
                    {isSuperAdmin && (
                        <select
                            className="form-select"
                            value={filterDept}
                            onChange={e => setFilterDept(e.target.value)}
                            style={{ width: 'auto' }}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.code}</option>
                            ))}
                        </select>
                    )}
                    <select
                        className="form-select"
                        value={filterSemester}
                        onChange={e => setFilterSemester(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="">All Semesters</option>
                        {SEMESTERS.map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                    <select
                        className="form-select"
                        value={filterExamType}
                        onChange={e => setFilterExamType(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="">All Exam Types</option>
                        {EXAM_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    {/* Upload button (mobile - inside filters for same gap) */}
                    <button
                        className="btn btn-primary paper-upload-btn-mobile"
                        onClick={() => setShowUploadForm(!showUploadForm)}
                    >
                        {showUploadForm ? '✕ Cancel' : '+ Upload Paper'}
                    </button>
                </div>
            </div>

            {/* Papers Table */}
            {papers.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <h3>No papers found</h3>
                        <p>Upload your first question paper to get started.</p>
                        {!showUploadForm && (
                            <button className="btn btn-primary" onClick={() => setShowUploadForm(true)}>
                                + Upload Paper
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="table-container hide-on-mobile">
                        <table className="table" id="papers-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    {isSuperAdmin && <th>Department</th>}
                                    <th>Semester</th>
                                    <th>Exam Type</th>
                                    <th>Year</th>
                                    <th>Views</th>
                                    <th>Downloads</th>
                                    <th>Uploaded</th>
                                    <th style={{ width: '100px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {papers.map(paper => {
                                    const dept = departments.find(d => d.id === paper.departmentId);
                                    return (
                                        <tr key={paper.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{paper.subject}</div>
                                                {paper.subjectCode && (
                                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                                        {paper.subjectCode}
                                                    </div>
                                                )}
                                            </td>
                                            {isSuperAdmin && (
                                                <td><span className="badge badge-dark">{dept?.code || '—'}</span></td>
                                            )}
                                            <td>Sem {paper.semester}</td>
                                            <td><span className="badge badge-outline">{paper.examType}</span></td>
                                            <td>{paper.year}</td>
                                            <td>{paper.views || 0}</td>
                                            <td>{paper.downloads || 0}</td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                                                {paper.uploadedAt || paper.createdAt
                                                    ? new Date(paper.uploadedAt || paper.createdAt).toLocaleDateString()
                                                    : '—'}
                                            </td>
                                            <td>
                                                <div className="papers-table-actions">
                                                    {deleteConfirm === paper.id ? (
                                                        <>
                                                            <LoadingButton
                                                                loading={deletingId === paper.id}
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDelete(paper.id)}
                                                            >
                                                                Confirm
                                                            </LoadingButton>
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                onClick={() => setDeleteConfirm(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => setDeleteConfirm(paper.id)}
                                                            style={{ color: 'var(--color-danger)' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile: PaperCard grid with View + Delete */}
                    <div className="papers-grid show-on-mobile">
                        {papers.map(paper => {
                            const dept = departments.find(d => d.id === paper.departmentId);
                            return (
                                <PaperCard
                                    key={paper.id}
                                    paper={paper}
                                    department={dept}
                                    onView={handleView}
                                    onDelete={handleCardDelete}
                                    isDeleting={deletingId === paper.id}
                                />
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
