import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-message">{message}</p>
        </div>
    );
}
