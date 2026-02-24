import React from 'react';
import Icon from './Icon';
import './PaperCard.css';

export default function PaperCard({ paper, department, onView, onDownload, isDownloading, onDelete, isDeleting }) {
    if (!paper) return null;

    return (
        <div className="paper-card card card-elevated">
            <div className="paper-card-header">
                <div className="paper-card-badges">
                    <span className="badge badge-dark">{department?.code || '—'}</span>
                    <span className="badge badge-light">Sem {paper.semester}</span>
                </div>
                <div className="paper-card-top-right" style={{ alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginTop: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {paper.subjectCode && (
                                <span className="badge badge-outline" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{paper.subjectCode}</span>
                            )}
                            <span className="badge badge-outline" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{paper.examType}</span>
                        </div>
                        <span className="badge badge-outline" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>{paper.year}</span>
                    </div>
                </div>
            </div>

            <div className="paper-card-body" onClick={() => onView && onView(paper)} style={{ cursor: onView ? 'pointer' : 'default' }}>
                <h3 className="paper-title">{paper.subject}</h3>
                {paper.description && (
                    <p className="paper-desc">{paper.description}</p>
                )}
            </div>

            <div className="paper-card-footer">
                <div className="paper-stats">
                    <span title="Views"><Icon name="eye" size={14} /> {paper.views || 0}</span>
                    <span title="Downloads">↓ {paper.downloads || 0}</span>
                </div>
                <div className="paper-actions">
                    {onView && (
                        <button className="btn btn-secondary btn-sm" onClick={() => onView(paper)}>
                            View
                        </button>
                    )}
                    {onDownload && (
                        <button
                            className={`btn btn-primary btn-sm ${isDownloading ? 'btn-loading' : ''}`}
                            onClick={() => onDownload(paper)}
                            disabled={isDownloading}
                        >
                            <span className="btn-text">Download</span>
                            {isDownloading && <span className="btn-spinner"></span>}
                        </button>
                    )}
                    {onDelete && (
                        <button
                            className={`btn btn-danger btn-sm ${isDeleting ? 'btn-loading' : ''}`}
                            onClick={() => onDelete(paper)}
                            disabled={isDeleting}
                        >
                            <span className="btn-text">Delete</span>
                            {isDeleting && <span className="btn-spinner"></span>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
