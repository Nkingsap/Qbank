// ===== API Client =====
// All requests go through the backend Cloudflare Worker

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

function getAuthToken() {
    const session = localStorage.getItem('qbank_session');
    if (session) {
        try {
            return JSON.parse(session).access_token;
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * Convert snake_case keys to camelCase so frontend code stays unchanged
 */
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function normalizeKeys(obj) {
    if (Array.isArray(obj)) return obj.map(normalizeKeys);
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const normalized = {};
        for (const [key, value] of Object.entries(obj)) {
            normalized[snakeToCamel(key)] = normalizeKeys(value);
        }
        return normalized;
    }
    return obj;
}

/**
 * Make an authenticated API request
 */
export async function api(path, options = {}) {
    const token = getAuthToken();
    const headers = {
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser sets boundary automatically)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return normalizeKeys(data);
}

/**
 * Upload a file via FormData
 */
export async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return api('/api/uploads', {
        method: 'POST',
        body: formData,
    });
}
