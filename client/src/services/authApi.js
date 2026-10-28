const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const TOKEN_KEY = 'markethub-auth-token';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(localStorage.getItem(TOKEN_KEY) ? { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success !== true) throw new Error(payload.message || 'Authentication request failed.');
  return payload.data;
}

const signup = (account) => request('/auth/signup', { method: 'POST', body: JSON.stringify(account) });
const login = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
const fetchMe = () => request('/auth/me');
const fetchUsers = () => request('/auth/users');
const updateUserStatus = (id, status) => request(`/auth/users/${encodeURIComponent(id)}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
});

export { TOKEN_KEY, fetchMe, fetchUsers, login, signup, updateUserStatus };
