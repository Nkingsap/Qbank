import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout, logActivity } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getCurrentUser());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const stored = getCurrentUser();
        if (stored) setUser(stored);
    }, []);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const result = await apiLogin(email, password);
            if (result.success) {
                setUser(result.user);
                logActivity('login', `${result.user.name} logged in`, result.user.id);
            }
            return result;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            logActivity('logout', `${currentUser.name} logged out`, currentUser.id);
        }
        await apiLogout();
        setUser(null);
    }, []);

    const value = {
        user,
        isLoggedIn: !!user,
        isSuperAdmin: user?.role === 'super_admin',
        isDeptAdmin: user?.role === 'dept_admin',
        isLoading,
        login,
        logout,
        setUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
