import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getActivityLog } from '../../utils/storage';
import Icon from '../../components/Icon';

export default function ActivityLogView() {
    const { user, isDeptAdmin } = useAuth();
    const [logs, setLogs] = useState([]);
    const [limit, setLimit] = useState(50);

    useEffect(() => {
        async function loadLogs() {
            // Super admin sees all, dept admin sees only their own
            const userId = isDeptAdmin ? user?.id : null;
            setLogs(await getActivityLog(limit, userId));
        }
        loadLogs();
    }, [limit, isDeptAdmin, user]);

    const formatTime = (isoString) => {
        if (!isoString) return 'Unknown';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Unknown';
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getTypeLabel = (type) => {
        const labels = {
            login: 'Login',
            logout: 'Logout',
            upload_paper: 'Paper Upload',
            delete_paper: 'Paper Deleted',
            create_dept: 'Dept Created',
            update_dept: 'Dept Updated',
            delete_dept: 'Dept Deleted',
            create_user: 'Admin Created',
            update_user: 'Admin Updated',
            delete_user: 'Admin Deleted',
        };
        return labels[type] || type;
    };

    return (
        <div className="activity-log">
            <div className="dash-section-header">
                <h2>Activity Log</h2>
                <span className="badge badge-light">{logs.length} entries</span>
            </div>

            {logs.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><Icon name="clipboard" size={40} /></div>
                        <h3>No activity yet</h3>
                        <p>Actions like uploads, logins, and changes will appear here.</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="activity-list">
                        {logs.map(log => (
                            <div key={log.id} className="activity-item">
                                <div className={`activity-dot ${log.type}`}></div>
                                <div className="activity-info">
                                    <div className="activity-message">
                                        <span className="badge badge-light" style={{ marginRight: '8px', fontSize: '10px' }}>
                                            {getTypeLabel(log.type)}
                                        </span>
                                        {log.message}
                                    </div>
                                    <div className="activity-time">{formatTime(log.createdAt)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {logs.length >= limit && (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setLimit(prev => prev + 50)}
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
