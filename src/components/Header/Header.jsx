import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
    const { user, isLoggedIn, isSuperAdmin, isDeptAdmin, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="header-inner">
                <Link to="/" className="header-logo" id="header-logo">
                    <div className="logo-icon">Q</div>
                    <div className="logo-text">
                        <span className="logo-name">QBank</span>
                        <span className="logo-tagline">Question Paper Repository</span>
                    </div>
                </Link>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`} id="main-nav">
                    <Link to="/" className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`} onClick={handleNavClick}>
                        Home
                    </Link>
                    <Link to="/departments" className={`nav-link ${isActive('/departments') ? 'active' : ''}`} onClick={handleNavClick}>
                        Departments
                    </Link>
                    <Link to="/browse" className={`nav-link ${isActive('/browse') ? 'active' : ''}`} onClick={handleNavClick}>
                        Browse
                    </Link>

                    {isLoggedIn && (isSuperAdmin || isDeptAdmin) && (
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={handleNavClick}>
                            Dashboard
                        </Link>
                    )}
                </nav>

                <div className="header-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    {isLoggedIn && (
                        <div className="user-menu">
                            <div className="user-avatar" id="user-avatar">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="user-info">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-role">
                                    {isSuperAdmin ? 'Super Admin' : 'Dept Admin'}
                                </span>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
                                Logout
                            </button>
                        </div>
                    )}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>
        </header>
    );
}
