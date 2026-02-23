/**
 * LoadingButton — a button that shows a spinner and disables itself while loading.
 * Usage: <LoadingButton loading={isSubmitting} className="btn btn-primary" onClick={...}>Save</LoadingButton>
 */
export default function LoadingButton({ loading, children, className = '', disabled, ...props }) {
    return (
        <button
            className={`${className} ${loading ? 'btn-loading' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            <span className="btn-text">{children}</span>
            {loading && <span className="btn-spinner"></span>}
        </button>
    );
}
