import { parseInviteCode } from "./utils/invite";

const getBaseUrl = () => {
  const env = import.meta.env?.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

async function request(path, options = {}) {
  const base = getBaseUrl();
  const token = localStorage.getItem("chapaquiz_token");

  const res = await fetch(`${base}${path}`, {
    ...options,
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
}

export async function login({ phone, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
}

export async function register({ phone, nickname, password, email }) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ phone, nickname, password, email: email || undefined }),
  });
}

export async function getMe() {
  return request("/api/users/me");
}

export async function getWalletBalance() {
  return request("/api/wallet/balance");
}

export async function getWalletTransactions({ limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return request(`/api/wallet/transactions?${params}`);
}

export async function initiateDeposit(amount) {
  return request("/api/wallet/deposit", {
    method: "POST",
    body: JSON.stringify({ amount: parseFloat(amount) }),
  });
}

export async function getDepositStatus(callbackId) {
  return request(`/api/wallet/deposits/${callbackId}/status`);
}

export async function initiateWithdrawal(amount) {
  return request("/api/withdrawals", {
    method: "POST",
    body: JSON.stringify({ amount: parseFloat(amount) }),
  });
}

export async function getMyWithdrawals() {
  return request("/api/withdrawals/mine");
}

export async function updateMyProfile({ nickname, phone, email }) {
  return request("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify({ nickname, phone, email }),
  });
}

export async function changeMyPassword({ currentPassword, newPassword }) {
  return request("/api/users/me/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function saveSession({ token, user }) {
  localStorage.setItem("chapaquiz_token", token);
  localStorage.setItem("chapaquiz_user", JSON.stringify(user));
}

export function updateStoredUser(user) {
  localStorage.setItem("chapaquiz_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("chapaquiz_token");
  localStorage.removeItem("chapaquiz_user");
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("chapaquiz_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getMatchPlayerLimits() {
  return request("/api/matches/limits");
}

export async function getOpenPublicMatches() {
  return request("/api/matches/public/open");
}

export async function joinPublicMatch(entryFee, requiredPlayers) {
  return request("/api/matches/public/join", {
    method: "POST",
    body: JSON.stringify({
      entryFee: String(entryFee),
      requiredPlayers: Number(requiredPlayers),
    }),
  });
}

export async function joinPublicMatchById(matchId) {
  return request(`/api/matches/public/${matchId}/join`, { method: "POST" });
}

export async function createPrivateMatch(entryFee, requiredPlayers) {
  return request("/api/matches/private/create", {
    method: "POST",
    body: JSON.stringify({
      entryFee: String(entryFee),
      requiredPlayers: Number(requiredPlayers),
    }),
  });
}

export async function joinPrivateMatch(inviteLinkCode) {
  return request("/api/matches/private/join", {
    method: "POST",
    body: JSON.stringify({ inviteLinkCode: parseInviteCode(inviteLinkCode) }),
  });
}

export async function getMatch(matchId) {
  return request(`/api/matches/${matchId}`);
}

export async function getMatchQuestions(matchId) {
  return request(`/api/matches/${matchId}/questions`);
}

export async function submitMatchAnswer(matchId, { questionId, selectedOption }) {
  return request(`/api/matches/${matchId}/answer`, {
    method: "POST",
    body: JSON.stringify({ questionId, selectedOption }),
  });
}

export async function submitMatchEarly(matchId) {
  return request(`/api/matches/${matchId}/submit`, { method: "POST" });
}

export async function leaveMatch(matchId) {
  return request(`/api/matches/${matchId}/leave`, { method: "POST" });
}
