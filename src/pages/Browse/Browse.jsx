import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getDepartments,
    getPapersByFilters,
    incrementPaperViews,
    incrementPaperDownloads,
    SEMESTERS,
    EXAM_TYPES,
    YEARS,
} from '../../utils/storage';
import PaperCard from '../../components/PaperCard';
import './Browse.css';

export default function Browse() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [departments, setDepartments] = useState([]);
    const [papers, setPapers] = useState([]);

    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        departmentId: searchParams.get('department') || '',
        semester: searchParams.get('semester') || '',
        examType: searchParams.get('examType') || '',
        year: searchParams.get('year') || '',
        search: searchParams.get('search') || '',
    });

    useEffect(() => {
        async function loadDepts() {
            setDepartments(await getDepartments());
        }
        loadDepts();
    }, []);

    useEffect(() => {
        async function loadPapers() {
            const result = await getPapersByFilters(filters);

            // Apply sort (sorting is also done server-side, but we re-sort locally for consistency)
            if (sortBy === 'newest') {
                result.sort((a, b) => new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt));
            } else if (sortBy === 'oldest') {
                result.sort((a, b) => new Date(a.uploadedAt || a.createdAt) - new Date(b.uploadedAt || b.createdAt));
            } else if (sortBy === 'name') {
                result.sort((a, b) => a.subject.localeCompare(b.subject));
            } else if (sortBy === 'downloads') {
                result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            }

            setPapers(result);
        }
        loadPapers();
    }, [filters, sortBy]);

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params.set(k === 'departmentId' ? 'department' : k, v);
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({ departmentId: '', semester: '', examType: '', year: '', search: '' });
        setSearchParams({});
    };



    const handleView = (paper) => {
        incrementPaperViews(paper.id);
        if (paper.fileUrl) {
            // Use <a> tag navigation — works reliably on Android & iOS (no popup blocker issues)
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
                // Fallback: open in new tab if download fails
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

    const activeFiltersCount = Object.values(filters).filter(v => v).length;
    const selectedDept = departments.find(d => d.id === filters.departmentId);

    return (
        <div className="browse-page animate-fade-in">
            <div className="container">
                {/* Page Header */}
                <div className="browse-header">
                    <div>
                        <h1>Browse Question Papers</h1>
                        <p>
                            {papers.length} {papers.length === 1 ? 'paper' : 'papers'} found
                            {selectedDept && ` in ${selectedDept.name}`}
                        </p>
                    </div>
                    <div className="browse-header-actions">
                        <button
                            className={`btn btn-ghost btn-sm ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                            id="toggle-filters-btn"
                        >
                            ☰ Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>
                    </div>
                </div>

                <div className="browse-layout">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <aside className="browse-filters animate-fade-in" id="filters-panel">
                            <div className="filters-header">
                                <h3>Filters</h3>
                                {activeFiltersCount > 0 && (
                                    <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="filter-group">
                                <label className="filter-label">Search</label>
                                <div className="search-wrapper">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Subject name or code..."
                                        value={filters.search}
                                        onChange={e => updateFilter('search', e.target.value)}
                                        id="search-papers-input"
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div className="filter-group">
                                <label className="filter-label">Department</label>
                                <select
                                    className="form-select"
                                    value={filters.departmentId}
                                    onChange={e => updateFilter('departmentId', e.target.value)}
                                    id="filter-department"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Semester */}
                            <div className="filter-group">
                                <label className="filter-label">Semester</label>
                                <div className="filter-chips">
                                    {SEMESTERS.map(s => (
                                        <button
                                            key={s}
                                            className={`filter-chip ${filters.semester === String(s) ? 'active' : ''}`}
                                            onClick={() => updateFilter('semester', filters.semester === String(s) ? '' : String(s))}
                                        >
                                            Sem {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Exam Type */}
                            <div className="filter-group">
                                <label className="filter-label">Exam Type</label>
                                <div className="filter-chips">
                                    {EXAM_TYPES.map(type => (
                                        <button
                                            key={type}
                                            className={`filter-chip ${filters.examType === type ? 'active' : ''}`}
                                            onClick={() => updateFilter('examType', filters.examType === type ? '' : type)}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Year */}
                            <div className="filter-group">
                                <label className="filter-label">Year</label>
                                <select
                                    className="form-select"
                                    value={filters.year}
                                    onChange={e => updateFilter('year', e.target.value)}
                                    id="filter-year"
                                >
                                    <option value="">All Years</option>
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </aside>
                    )}

                    {/* Papers Grid/List */}
                    <main className="browse-content">
                        {/* Sort Bar */}
                        <div className="sort-bar">
                            <span className="sort-label">Sort by:</span>
                            <select
                                className="form-select sort-select"
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                id="sort-papers"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="downloads">Most Downloaded</option>
                            </select>
                        </div>

                        {papers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📚</div>
                                <h3>No papers found</h3>
                                <p>
                                    {activeFiltersCount > 0
                                        ? 'Try adjusting your filters to find what you\'re looking for.'
                                        : 'No question papers have been uploaded yet. Check back later!'}
                                </p>
                                {activeFiltersCount > 0 && (
                                    <button className="btn btn-secondary" onClick={clearFilters}>
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="papers-grid stagger-children">
                                {papers.map(paper => {
                                    const dept = departments.find(d => d.id === paper.departmentId);
                                    return (
                                        <PaperCard
                                            key={paper.id}
                                            paper={paper}
                                            department={dept}
                                            onView={handleView}
                                            onDownload={handleDownload}
                                            isDownloading={downloadingId === paper.id}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
