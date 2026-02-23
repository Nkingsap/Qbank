import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStats, getDepartments, getPapersByFilters } from '../../utils/storage';
import PaperCard from '../../components/PaperCard';

export default function DashboardOverview() {
    const { user, isSuperAdmin, isDeptAdmin } = useAuth();
    const [stats, setStats] = useState(null);
    const [deptPapers, setDeptPapers] = useState([]);
    const [departments, setDepartments] = useState({});

    useEffect(() => {
        async function loadData() {
            const [s, depts] = await Promise.all([
                getStats(),
                getDepartments(),
            ]);
            setStats(s);

            // Build a lookup map: departmentId -> department object
            const deptMap = {};
            (depts || []).forEach(d => { deptMap[d.id || d._id] = d; });
            setDepartments(deptMap);

            if (isDeptAdmin && user?.departmentId) {
                const dp = await getPapersByFilters({ departmentId: user.departmentId });
                setDeptPapers(dp);
            }
        }
        loadData();
    }, [isDeptAdmin, user]);

    if (!stats) return null;

    const displayStats = isSuperAdmin
        ? [
            { label: 'Total Papers', value: stats.totalPapers, icon: '📄' },
            { label: 'Departments', value: stats.totalDepartments, icon: '🏛' },
            { label: 'Dept Admins', value: stats.totalAdmins, icon: '👤' },
            { label: 'Total Downloads', value: stats.totalDownloads, icon: '↓' },
        ]
        : [
            { label: 'Your Papers', value: deptPapers.length, icon: '📄' },
            { label: 'Total Views', value: deptPapers.reduce((s, p) => s + (p.views || 0), 0), icon: '👁' },
            { label: 'Downloads', value: deptPapers.reduce((s, p) => s + (p.downloads || 0), 0), icon: '↓' },
            { label: 'Semesters', value: 8, icon: '📚' },
        ];

    return (
        <div className="overview">
            {/* Stats Cards */}
            <div className="stats-grid stagger-children">
                {displayStats.map((stat, i) => (
                    <div key={i} className="stat-card card card-elevated">
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts Section (Visual representation with bars) */}
            {isSuperAdmin && (
                <>
                    <div className="dash-section">
                        <div className="dash-section-header">
                            <h2>Papers by Department</h2>
                        </div>
                        <div className="chart-grid">
                            {stats.papersByDept.map((item, i) => (
                                <div key={i} className="chart-card">
                                    <div className="chart-card-header">
                                        <div className="chart-card-title">
                                            {item.code}
                                            <span className="chart-card-subtitle">{item.department}</span>
                                        </div>
                                        <div className="chart-card-val">
                                            {item.count} <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-tertiary)' }}>papers</span>
                                        </div>
                                    </div>
                                    <div className="chart-card-bar-wrap">
                                        <div
                                            className="chart-card-bar"
                                            style={{
                                                width: `${stats.totalPapers > 0 ? (item.count / stats.totalPapers) * 100 : 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dash-section">
                        <div className="dash-section-header">
                            <h2>Papers by Exam Type</h2>
                        </div>
                        <div className="chart-grid">
                            {stats.papersByExam.map((item, i) => (
                                <div key={i} className="chart-card">
                                    <div className="chart-card-header">
                                        <div className="chart-card-title">{item.type}</div>
                                        <div className="chart-card-val">
                                            {item.count} <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-tertiary)' }}>papers</span>
                                        </div>
                                    </div>
                                    <div className="chart-card-bar-wrap">
                                        <div
                                            className="chart-card-bar"
                                            style={{
                                                width: `${stats.totalPapers > 0 ? (item.count / stats.totalPapers) * 100 : 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Recent Uploads */}
            <div className="dash-section">
                <div className="dash-section-header">
                    <h2>Recent Uploads</h2>
                </div>
                {stats.recentUploads.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <h3>No uploads yet</h3>
                            <p>Papers you upload will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="recent-uploads-grid">
                        {stats.recentUploads
                            .filter(p => isDeptAdmin ? p.departmentId === user.departmentId : true)
                            .slice(0, 6)
                            .map(paper => (
                                <PaperCard
                                    key={paper.id || paper._id}
                                    paper={paper}
                                    department={departments[paper.departmentId]}
                                />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
