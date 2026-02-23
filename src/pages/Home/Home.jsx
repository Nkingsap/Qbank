import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDepartments, getPapers, SEMESTERS, EXAM_TYPES, incrementPaperViews, incrementPaperDownloads } from '../../utils/storage';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Home.css';

export default function Home() {
    const [departments, setDepartments] = useState([]);
    const [stats, setStats] = useState({ papers: 0, departments: 0, downloads: 0 });
    const [recentPapers, setRecentPapers] = useState([]);
    const [showAllRecentPapers, setShowAllRecentPapers] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const depts = await getDepartments();
            const papers = await getPapers();
            setDepartments(depts);
            setRecentPapers(papers.sort((a, b) => new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt)));
            setStats({
                papers: papers.length,
                departments: depts.length,
                downloads: papers.reduce((sum, p) => sum + (p.downloads || 0), 0),
            });
            setLoading(false);
        }
        loadData();
    }, []);

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

    const handleDownload = async (paper) => {
        incrementPaperDownloads(paper.id);
        if (paper.fileUrl) {
            setDownloadingId(paper.id);
            try {
                const res = await fetch(paper.fileUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = paper.fileName || `${paper.subject}_${paper.examType}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
            } catch {
                const link = document.createElement('a');
                link.href = paper.fileUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.click();
            } finally {
                setDownloadingId(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="home" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner message="Loading..." />
            </div>
        );
    }

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero" id="hero-section">
                <div className="hero-content animate-fade-in-up">
                    <h1 className="hero-title">
                        Your Gateway to<br />
                        <span className="hero-highlight">Previous Year Papers</span>
                    </h1>
                    <p className="hero-subtitle">
                        Access question papers from all departments and semesters.
                        Weekly tests, CIA exams, and end semester papers — all in one place.
                    </p>
                    <div className="hero-actions">
                        <Link to="/browse" className="btn btn-primary btn-lg" id="browse-papers-btn">
                            Browse Papers
                            <span>→</span>
                        </Link>
                        <Link to="/departments" className="btn btn-secondary btn-lg" id="view-departments-btn">
                            View Departments
                        </Link>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-value">{stats.papers}</span>
                            <span className="hero-stat-label">Question Papers</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-value">{stats.departments}</span>
                            <span className="hero-stat-label">Departments</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-value">{SEMESTERS.length}</span>
                            <span className="hero-stat-label">Semesters</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-value">{EXAM_TYPES.length}</span>
                            <span className="hero-stat-label">Exam Types</span>
                        </div>
                    </div>
                </div>
                <div className="hero-decoration">
                    <div className="hero-grid">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="hero-grid-item" style={{ animationDelay: `${i * 100}ms` }}></div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="how-it-works" id="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">How It Works</span>
                        <h2 className="section-title">Find Papers in 3 Simple Steps</h2>
                    </div>
                    <div className="steps-grid stagger-children">
                        <div className="step-card">
                            <div className="step-number">01</div>
                            <h3>Choose Department</h3>
                            <p>Select your department from the available list to filter relevant papers.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">02</div>
                            <h3>Select Semester & Exam</h3>
                            <p>Pick your semester and exam type — Weekly Test, CIA, or End Semester.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">03</div>
                            <h3>Download & Study</h3>
                            <p>View or download the question paper and start preparing for your exams.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Departments */}
            <section className="departments-section" id="departments">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Departments</span>
                        <h2 className="section-title">Browse by Department</h2>
                        <p className="section-desc">Select a department to explore available question papers</p>
                    </div>
                    <div className="departments-grid stagger-children">
                        {departments.slice(0, 3).map(dept => {
                            const paperCount = recentPapers.filter(p => p.departmentId === dept.id).length;
                            const totalPapers = recentPapers.filter(p => p.departmentId === dept.id).length;
                            return (
                                <Link
                                    to={`/browse?department=${dept.id}`}
                                    key={dept.id}
                                    className="department-card card card-elevated"
                                    id={`dept-card-${dept.code}`}
                                >
                                    <div className="dept-card-header">
                                        <div className="dept-code-badge">{dept.code}</div>
                                        <span className="dept-paper-count">{totalPapers} papers</span>
                                    </div>
                                    <h3 className="dept-name">{dept.name}</h3>
                                    <div className="dept-card-footer">
                                        <span className="dept-view-text">View Papers →</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    {departments.length > 3 && (
                        <div className="section-cta">
                            <Link to="/departments" className="btn btn-secondary">
                                View All Departments →
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Exam Types */}
            <section className="exam-types-section" id="exam-types">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Exam Categories</span>
                        <h2 className="section-title">Papers by Exam Type</h2>
                    </div>
                    <div className="exam-types-grid stagger-children">
                        {EXAM_TYPES.map(type => {
                            const count = recentPapers.filter(p => p.examType === type).length;
                            return (
                                <Link
                                    to={`/browse?examType=${encodeURIComponent(type)}`}
                                    key={type}
                                    className="exam-type-card card"
                                    id={`exam-type-${type.replace(/\s+/g, '-').toLowerCase()}`}
                                >
                                    <div className="exam-type-icon">
                                        {type.includes('Weekly') ? '📝' : type.includes('CIA') ? '📋' : '📄'}
                                    </div>
                                    <h3>{type}</h3>
                                    <p>{count} {count === 1 ? 'paper' : 'papers'} available</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Recent Papers */}
            {recentPapers.length > 0 && (
                <section className="recent-section" id="recent-papers">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">Recently Added</span>
                            <h2 className="section-title">Latest Uploads</h2>
                        </div>
                        <div className="recent-grid stagger-children">
                            {recentPapers.slice(0, showAllRecentPapers ? 10 : 3).map(paper => {
                                const dept = departments.find(d => d.id === paper.departmentId);
                                return (
                                    <div key={paper.id} className="recent-card card">
                                        <div className="recent-card-inner">
                                            <div className="recent-card-top" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                                                    <span className="badge badge-dark">{dept?.code || 'N/A'}</span>
                                                    <span className="badge badge-outline">Sem {paper.semester}</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {paper.subjectCode && (
                                                            <span className="badge badge-outline" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{paper.subjectCode}</span>
                                                        )}
                                                        <span className="badge badge-outline" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{paper.examType}</span>
                                                    </div>
                                                    <span className="badge badge-outline" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{paper.year}</span>
                                                </div>
                                            </div>
                                            <h4 className="recent-card-title">{paper.subject}</h4>
                                            <div className="recent-card-footer">
                                                <span className="recent-card-date">
                                                    {paper.uploadedAt || paper.createdAt
                                                        ? new Date(paper.uploadedAt || paper.createdAt).toLocaleDateString()
                                                        : '—'}
                                                </span>
                                                <div className="paper-actions">
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleView(paper)}>
                                                        View
                                                    </button>
                                                    <button
                                                        className={`btn btn-primary btn-sm ${downloadingId === paper.id ? 'btn-loading' : ''}`}
                                                        onClick={() => handleDownload(paper)}
                                                        disabled={downloadingId === paper.id}
                                                    >
                                                        <span className="btn-text">Download</span>
                                                        {downloadingId === paper.id && <span className="btn-spinner"></span>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {recentPapers.length > 3 && (
                            <div className="section-cta">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowAllRecentPapers(!showAllRecentPapers)}
                                >
                                    {showAllRecentPapers ? 'View Less' : 'View All Latest Uploads'} {showAllRecentPapers ? '↑' : '→'}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="cta-section" id="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2>Are you a Department Admin?</h2>
                        <p>
                            Login to upload and manage question papers for your department.
                            Help juniors access the study materials they need.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Admin Login →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
