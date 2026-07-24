const TOKEN_KEY = "apac_south_token";
const USER_KEY = "apac_south_user";

const getBaseUrl = () => {
  const env = import.meta.env?.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

async function request(path, options = {}) {
  const base = getBaseUrl();
  const token = localStorage.getItem(TOKEN_KEY);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || "Request failed");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Request timed out");
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

const qs = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, v);
  });
  return q.toString();
};

export async function login(payload) {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export async function register(payload) {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export async function getMe() {
  return request("/api/users/me");
}

export async function updateMyProfile(payload) {
  return request("/api/users/me", { method: "PATCH", body: JSON.stringify(payload) });
}

export async function changeMyPassword(payload) {
  return request("/api/users/me/password", { method: "PUT", body: JSON.stringify(payload) });
}

export async function getTournaments(params = {}) {
  return request(`/api/tournaments?${qs(params)}`);
}

export async function getTournament(id) {
  return request(`/api/tournaments/${id}`);
}

export async function getTournamentBySlug(slug) {
  return request(`/api/tournaments/slug/${slug}`);
}

export async function registerTeamForTournament(tournamentId, teamId) {
  return request(`/api/tournaments/${tournamentId}/register`, {
    method: "POST",
    body: JSON.stringify({ teamId }),
  });
}

export async function getMyRegistrations() {
  return request("/api/registrations/mine");
}

export async function cancelRegistration(registrationId) {
  return request(`/api/registrations/${registrationId}/cancel`, { method: "POST" });
}

export async function getMyTeams() {
  return request("/api/teams/mine");
}

export async function getTeams(params = {}) {
  return request(`/api/teams?${qs(params)}`);
}

export async function getTeam(id) {
  return request(`/api/teams/${id}`);
}

export async function createTeam(payload) {
  return request("/api/teams", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateTeam(id, payload) {
  return request(`/api/teams/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function invitePlayer(teamId, payload) {
  return request(`/api/teams/${teamId}/invites`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function acceptInvite(code) {
  return request(`/api/teams/invites/${code}/accept`, { method: "POST" });
}

export async function removeMember(teamId, userId) {
  return request(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" });
}

export async function revokeInvite(inviteId) {
  return request(`/api/teams/invites/${inviteId}`, { method: "DELETE" });
}

export async function getMyLobbyCodes() {
  return request("/api/lobbies/mine/codes");
}

export async function getLeaderboards(params = {}) {
  return request(`/api/leaderboards?${qs(params)}`);
}

export async function getNotifications(params = {}) {
  return request(`/api/notifications?${qs(params)}`);
}

export async function markNotificationRead(id) {
  return request(`/api/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return request("/api/notifications/read-all", { method: "PATCH" });
}

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
