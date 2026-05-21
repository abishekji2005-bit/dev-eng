const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function getToken() {
  // Clerk token is retrieved via useAuth().getToken() in components
  // Components pass token via apiFetch.setToken()
  return apiFetch._token || null;
}

export const apiFetch = {
  _token: null,
  setToken(t) { this._token = t; },

  async req(method, path, body) {
    const token = await getToken();
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
    return json;
  },

  get:    (path)        => apiFetch.req('GET', path),
  post:   (path, body)  => apiFetch.req('POST', path, body),
  put:    (path, body)  => apiFetch.req('PUT', path, body),
  patch:  (path, body)  => apiFetch.req('PATCH', path, body),
  delete: (path)        => apiFetch.req('DELETE', path),
};

// ── API methods ───────────────────────────────────────────────
export const api = {
  // Profile
  syncProfile:   (body)       => apiFetch.post('/api/profile/sync', body),
  getProfile:    ()           => apiFetch.get('/api/profile'),
  updateProfile: (body)       => apiFetch.put('/api/profile', body),

  // Tags
  getTags:       ()           => apiFetch.get('/api/tags'),

  // Requests
  listRequests:  (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return apiFetch.get(`/api/requests${qs ? '?' + qs : ''}`);
  },
  getRequest:    (id)         => apiFetch.get(`/api/requests/${id}`),
  createRequest: (body)       => apiFetch.post('/api/requests', body),
  myRequests:    ()           => apiFetch.get('/api/requests/mine'),
  myClaims:      ()           => apiFetch.get('/api/requests/claimed'),
  updateStatus:  (id, status) => apiFetch.patch(`/api/requests/${id}/status`, { status }),
  claimRequest:  (id, msg)    => apiFetch.post(`/api/requests/${id}/claim`, { message: msg }),

  // Mutations
  editRequest:   (id, body)    => apiFetch.put(`/api/requests/${id}`, body),
  deleteRequest: (id)          => apiFetch.delete(`/api/requests/${id}`),

  // Activity
  addProgress:  (rid, body)   => apiFetch.post(`/api/requests/${rid}/progress`, body),
  addComment:   (rid, body)   => apiFetch.post(`/api/requests/${rid}/comments`, body),
  deleteComment:(rid, cid)    => apiFetch.delete(`/api/requests/${rid}/comments/${cid}`),

  // AI (Grok/Groq)
  suggestTags:  (title, description) => apiFetch.post('/api/ai/suggest-tags', { title, description }),
  aiChat:       (messages, context)  => apiFetch.post('/api/ai/chat', { messages, context }),
  searchTags:   (query)              => apiFetch.post('/api/ai/search-tags', { query }),
};
