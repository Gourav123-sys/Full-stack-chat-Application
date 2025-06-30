// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://full-stack-chat-application-zz0h.onrender.com";
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://full-stack-chat-application-zz0h.onrender.com";

// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users/register`,

  // Group endpoints
  GROUPS: `${API_BASE_URL}/api/groups`,
  JOIN_GROUP: (groupId) => `${API_BASE_URL}/api/groups/${groupId}/join`,
  LEAVE_GROUP: (groupId) => `${API_BASE_URL}/api/groups/${groupId}/leave`,

  // Secure group endpoints
  PENDING_REQUESTS: (groupId) =>
    `${API_BASE_URL}/api/groups/${groupId}/pending`,
  ALL_PENDING_REQUESTS: `${API_BASE_URL}/api/groups/admin/pending`,
  APPROVE_REQUEST: (groupId, userId) =>
    `${API_BASE_URL}/api/groups/${groupId}/approve/${userId}`,
  REJECT_REQUEST: (groupId, userId) =>
    `${API_BASE_URL}/api/groups/${groupId}/reject/${userId}`,

  // Message endpoints
  MESSAGES: `${API_BASE_URL}/api/messages`,
  GROUP_MESSAGES: (groupId) => `${API_BASE_URL}/api/messages/${groupId}`,
  UPLOAD_FILE: `${API_BASE_URL}/api/messages/file`,
};

export { SOCKET_URL };
export default API_BASE_URL;
