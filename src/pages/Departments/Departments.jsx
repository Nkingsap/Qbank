import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDepartments, getPapers } from '../../utils/storage';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Departments.css';

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [papers, setPapers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setDepartments(await getDepartments());
            setPapers(await getPapers());
            setLoading(false);
        }
        loadData();
    }, []);

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="departments-page animate-fade-in">
            <div className="container">
                <div className="departments-header">
                    <div>
                        <h1>All Departments</h1>
                        <p>Browse question papers by selecting your department below.</p>
                    </div>
                    <div className="search-wrapper departments-search">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner message="Loading departments..." />
                ) : filteredDepartments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏛</div>
                        <h3>No departments found</h3>
                        <p>Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="departments-page-grid stagger-children">
                        {filteredDepartments.map(dept => {
                            const totalPapers = papers.filter(p => p.departmentId === dept.id).length;
                            return (
                                <Link
                                    to={`/browse?department=${dept.id}`}
                                    key={dept.id}
                                    className="department-card card card-elevated"
                                    id={`page-dept-card-${dept.code}`}
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
                )}
            </div>
        </div>
    );
}
