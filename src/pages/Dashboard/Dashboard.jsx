import { useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    getStats,
    getDepartments,
    getDepartmentById,
    getPapersByFilters,
    getActivityLog,
} from '../../utils/storage';

// Sub-components
import DashboardOverview from './DashboardOverview';
import PaperManager from './PaperManager';
import DepartmentManager from './DepartmentManager';
import AdminManager from './AdminManager';
import ActivityLogView from './ActivityLogView';
import ProfileSettings from './ProfileSettings';
import './Dashboard.css';

export default function Dashboard() {
    const { user, isSuperAdmin, isDeptAdmin } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Icon name="bar-chart" size={16} /> },
        { id: 'papers', label: 'Papers', icon: <Icon name="file-text" size={16} /> },
        ...(isSuperAdmin ? [
            { id: 'departments', label: 'Departments', icon: <Icon name="building" size={16} /> },
            { id: 'admins', label: 'Admins', icon: <Icon name="user" size={16} /> },
        ] : []),
        { id: 'activity', label: 'Activity', icon: <Icon name="clipboard" size={16} /> },
        { id: 'profile', label: 'Profile', icon: <Icon name="settings" size={16} /> },
    ];

    const [deptName, setDeptName] = useState(null);

    useEffect(() => {
        if (isDeptAdmin && user?.departmentId) {
            getDepartmentById(user.departmentId).then(dept => setDeptName(dept?.name || null));
        }
    }, [isDeptAdmin, user]);

    return (
        <div className="dashboard animate-fade-in">
            <div className="container">
                {/* Dashboard Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>
                            {isSuperAdmin
                                ? 'Super Admin — Full Access'
                                : `Department Admin — ${deptName || 'Unknown Department'}`}
                        </p>
                    </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="tabs" id="dashboard-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            id={`tab-${tab.id}`}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="dashboard-content animate-fade-in" key={activeTab}>
                    {activeTab === 'overview' && <DashboardOverview />}
                    {activeTab === 'papers' && <PaperManager />}
                    {activeTab === 'departments' && isSuperAdmin && <DepartmentManager />}
                    {activeTab === 'admins' && isSuperAdmin && <AdminManager />}
                    {activeTab === 'activity' && <ActivityLogView />}
                    {activeTab === 'profile' && <ProfileSettings />}
                </div>
            </div>
        </div>
    );
}
