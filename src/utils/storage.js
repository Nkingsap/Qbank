// ===== API-Backed Storage Layer =====
// All functions now call the backend Cloudflare Worker API
// Functions are async — components must await them

import { api, uploadFile } from '../lib/api.js';

// ===== Auth =====
export async function login(email, password) {
    try {
        const data = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        // Store session for token persistence
        localStorage.setItem('qbank_session', JSON.stringify(data.session));
        localStorage.setItem('qbank_current_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function logout() {
    try {
        await api('/api/auth/logout', { method: 'POST' });
    } catch {
        // Ignore errors during logout
    }
    localStorage.removeItem('qbank_session');
    localStorage.removeItem('qbank_current_user');
}

export function getCurrentUser() {
    try {
        const user = localStorage.getItem('qbank_current_user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

export function updateCurrentUserSession(updatedUser) {
    localStorage.setItem('qbank_current_user', JSON.stringify(updatedUser));
}

// ===== Departments =====
export async function getDepartments() {
    try {
        return await api('/api/departments');
    } catch {
        return [];
    }
}

export async function getDepartmentById(id) {
    try {
        return await api(`/api/departments/${id}`);
    } catch {
        return null;
    }
}

export async function createDepartment(dept) {
    try {
        const data = await api('/api/departments', {
            method: 'POST',
            body: JSON.stringify(dept),
        });
        return { success: true, department: data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function updateDepartment(id, updates) {
    try {
        const data = await api(`/api/departments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return { success: true, department: data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function deleteDepartment(id) {
    try {
        await api(`/api/departments/${id}`, { method: 'DELETE' });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// ===== Users (Admins) =====
export async function getUsers() {
    try {
        return await api('/api/users');
    } catch {
        return [];
    }
}

export async function getUsersByDepartment(deptId) {
    try {
        return await api(`/api/users?department=${deptId}`);
    } catch {
        return [];
    }
}

export async function getDeptAdmins() {
    try {
        return await api('/api/users?role=dept_admin');
    } catch {
        return [];
    }
}

export async function createUser(userData) {
    try {
        // Map frontend camelCase to backend snake_case
        const payload = {
            name: userData.name,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            department_id: userData.departmentId,
        };
        const data = await api('/api/users', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return { success: true, user: data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function updateUser(id, updates) {
    try {
        // Map frontend camelCase to backend snake_case
        const payload = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.username !== undefined) payload.username = updates.username;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.password) payload.password = updates.password;
        if (updates.departmentId !== undefined) payload.department_id = updates.departmentId;
        if (updates.role !== undefined) payload.role = updates.role;

        const data = await api(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        return { success: true, user: data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function deleteUser(id) {
    try {
        await api(`/api/users/${id}`, { method: 'DELETE' });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// ===== Papers =====
export async function getPapers() {
    try {
        return await api('/api/papers');
    } catch {
        return [];
    }
}

export async function getPaperById(id) {
    try {
        return await api(`/api/papers/${id}`);
    } catch {
        return null;
    }
}

export async function getPapersByDepartment(deptId) {
    try {
        return await api(`/api/papers?department=${deptId}`);
    } catch {
        return [];
    }
}

export async function getPapersByFilters(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.departmentId) params.set('department', filters.departmentId);
        if (filters.semester) params.set('semester', filters.semester);
        if (filters.examType) params.set('examType', filters.examType);
        if (filters.year) params.set('year', filters.year);
        if (filters.search) params.set('search', filters.search);
        if (filters.subject) params.set('search', filters.subject);

        return await api(`/api/papers?${params.toString()}`);
    } catch {
        return [];
    }
}

export async function createPaper(paperData) {
    try {
        // Map frontend field names to backend field names
        const payload = {
            subject: paperData.subject,
            subject_code: paperData.subjectCode,
            department_id: paperData.departmentId,
            semester: paperData.semester,
            exam_type: paperData.examType,
            year: paperData.year,
            description: paperData.description,
            file_url: paperData.fileUrl || null,
            uploaded_by: paperData.uploadedBy,
            uploaded_by_name: paperData.uploadedByName,
        };

        const data = await api('/api/papers', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return { success: true, paper: data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function updatePaper(id, updates) {
    try {
        const data = await api(`/api/papers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return { success: true, paper: data };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function deletePaper(id) {
    try {
        await api(`/api/papers/${id}`, { method: 'DELETE' });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function incrementPaperViews(id) {
    try {
        const viewedPapers = JSON.parse(localStorage.getItem('qbank_viewed_papers') || '[]');
        if (viewedPapers.includes(id)) return;

        await api(`/api/papers/${id}/views`, { method: 'POST' });

        viewedPapers.push(id);
        localStorage.setItem('qbank_viewed_papers', JSON.stringify(viewedPapers));
    } catch {
        // Silent fail for analytics
    }
}

export async function incrementPaperDownloads(id) {
    try {
        const downloadedPapers = JSON.parse(localStorage.getItem('qbank_downloaded_papers') || '[]');
        if (downloadedPapers.includes(id)) return;

        await api(`/api/papers/${id}/downloads`, { method: 'POST' });

        downloadedPapers.push(id);
        localStorage.setItem('qbank_downloaded_papers', JSON.stringify(downloadedPapers));
    } catch {
        // Silent fail for analytics
    }
}

// ===== Favorites =====
export async function getFavorites() {
    try {
        return await api('/api/favorites');
    } catch {
        return [];
    }
}

export async function toggleFavorite(paperId) {
    try {
        const result = await api(`/api/favorites/${paperId}`, { method: 'POST' });
        return result;
    } catch {
        return { favorited: false };
    }
}

export async function isFavorite(paperId) {
    try {
        const favs = await getFavorites();
        return favs.includes(paperId);
    } catch {
        return false;
    }
}

// ===== Activity Log =====
export async function logActivity(type, message, userId) {
    try {
        await api('/api/activity', {
            method: 'POST',
            body: JSON.stringify({ type, message, user_id: userId }),
        });
    } catch {
        // Silent fail for logging
    }
}

export async function getActivityLog(limit = 50, userId = null) {
    try {
        let url = `/api/activity?limit=${limit}`;
        if (userId) url += `&user_id=${userId}`;
        return await api(url);
    } catch {
        return [];
    }
}

// ===== Stats =====
export async function getStats() {
    try {
        return await api('/api/stats');
    } catch {
        return {
            totalPapers: 0,
            totalDepartments: 0,
            totalAdmins: 0,
            totalDownloads: 0,
            totalViews: 0,
            papersByDept: [],
            papersByExam: [],
            papersBySemester: [],
            recentUploads: [],
        };
    }
}

// ===== File Upload =====
export { uploadFile } from '../lib/api.js';

// ===== Constants =====
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const EXAM_TYPES = [
    'Weekly Test 1',
    'Weekly Test 2',
    'CIA 1',
    'CIA 2',
    'End Semester',
];

export const YEARS = (() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= currentYear - 10; y--) {
        years.push(String(y));
    }
    return years;
})();

// ===== Initialize (no-op — data lives in Supabase now) =====
export function initializeData() {
    // No longer needed — database is initialized via SQL migration
}

// ===== Generate ID (kept for backwards compat, but UUIDs come from Supabase) =====
export function generateId() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
