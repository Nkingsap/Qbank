// ===== API Client =====
// All requests go through the backend Cloudflare Worker

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// ===== In-Memory Cache =====
const cache = new Map();
const CACHE_TTL = 60_000; // 60 seconds

function getCacheKey(path, options) {
    return `${options.method || 'GET'}:${path}`;
}

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    return entry;
}

function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

/** Clear all cached GET responses (called after mutations) */
export function clearApiCache() {
    cache.clear();
}

function getAuthToken() {
    const session = localStorage.getItem('qbank_session');
    if (session) {
        try {
            const parsed = JSON.parse(session);
            // normalizeKeys converts access_token → accessToken before storage
            return parsed.accessToken || parsed.access_token || null;
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
 * Make an authenticated API request (GET requests are cached)
 */
export async function api(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const isGet = method === 'GET';
    const cacheKey = getCacheKey(path, options);

    // For GET requests, return cached data if fresh
    if (isGet) {
        const cached = getCached(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            return cached.data;
        }
    }

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

    const normalized = normalizeKeys(data);

    // Cache GET responses; clear cache for mutations
    if (isGet) {
        setCache(cacheKey, normalized);
    } else {
        clearApiCache();
    }

    return normalized;
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
