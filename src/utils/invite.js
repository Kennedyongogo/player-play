export const PENDING_INVITE_KEY = "chapaquiz_pending_invite";

/** Normalize raw input (code, path segment, or full /join/ URL) to an 8-char invite code. */
export function parseInviteCode(input) {
  if (!input) return "";

  let raw = String(input).trim();
  if (!raw) return "";

  const joinInPath = raw.match(/\/join\/([A-Za-z0-9]+)/i);
  if (joinInPath) return joinInPath[1].toUpperCase();

  raw = raw.split("?")[0].split("#")[0].trim();
  if (raw.includes("/")) {
    const parts = raw.replace(/\/+$/, "").split("/");
    raw = parts[parts.length - 1] || raw;
  }

  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function savePendingInvite(code) {
  const parsed = parseInviteCode(code);
  if (parsed) sessionStorage.setItem(PENDING_INVITE_KEY, parsed);
}
export function consumePendingInvite() {
  const code = sessionStorage.getItem(PENDING_INVITE_KEY);
  if (code) sessionStorage.removeItem(PENDING_INVITE_KEY);
  return code;
}

export function peekPendingInvite() {
  return sessionStorage.getItem(PENDING_INVITE_KEY);
}

export function buildInviteUrl(inviteCode) {
  const code = parseInviteCode(inviteCode);  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/join/${code}`;
  }
  return `/join/${code}`;
}

export function buildWhatsAppShareText({ inviteCode, entryFee, hostName }) {
  const url = buildInviteUrl(inviteCode);
  const host = hostName ? `${hostName} invited you` : "You're invited";
  return `${host} to a ChapaQuiz challenge! Entry KSh ${entryFee}. 5 questions, 60 seconds, real cash prizes. Join here: ${url}`;
}

export async function copyInviteLink(inviteCode) {
  const url = buildInviteUrl(inviteCode);
  await navigator.clipboard.writeText(url);
  return url;
}

export function shareOnWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}
