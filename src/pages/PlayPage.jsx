import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Alert,
  CircularProgress,
  TextField,
  LinearProgress,
  alpha,
} from "@mui/material";
import {
  SportsEsports,
  Groups,
  AccountBalanceWallet,
  Lock,
  Link as LinkIcon,
  MeetingRoom,
  EmojiEvents,
  People,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import {
  getMe,
  getWalletBalance,
  getMatchPlayerLimits,
  getOpenPublicMatches,
  joinPublicMatch,
  joinPublicMatchById,
  createPrivateMatch,
} from "../api";
import { useAuth } from "../context/AuthContext";
import { parseInviteCode } from "../utils/invite";

const ENTRY_FEES = [
  { value: "10", label: "KSh 10", desc: "Quick casual match" },
  { value: "20", label: "KSh 20", desc: "Standard competition" },
  { value: "50", label: "KSh 50", desc: "High stakes room" },
];

const OPEN_ROOMS_POLL_MS = 5000;

const cardSx = {
  borderRadius: 3,
  bgcolor: "rgba(12,12,20,0.85)",
  border: "1px solid rgba(255,255,255,0.08)",
};

function formatMoney(value) {
  return `KSh ${parseFloat(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

export default function PlayPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [creating, setCreating] = useState(null);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [error, setError] = useState("");
  const [openRooms, setOpenRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [joiningRoomId, setJoiningRoomId] = useState(null);
  const [minRoomPlayers, setMinRoomPlayers] = useState(2);
  const [maxRoomPlayers, setMaxRoomPlayers] = useState(null);
  const [roomSizeInput, setRoomSizeInput] = useState("2");

  const busy = !!joining || !!creating || !!joiningRoomId;

  const parsedRoomSize = (() => {
    const value = parseInt(roomSizeInput, 10);
    if (!Number.isFinite(value) || value < minRoomPlayers) return null;
    if (maxRoomPlayers != null && value > maxRoomPlayers) return null;
    return value;
  })();

  const resolveRoomSize = () => {
    const value = parseInt(roomSizeInput, 10);
    if (!Number.isFinite(value) || value < minRoomPlayers) {
      setError(`Room size must be at least ${minRoomPlayers} players.`);
      return null;
    }
    if (maxRoomPlayers != null && value > maxRoomPlayers) {
      setError(`Room size cannot exceed ${maxRoomPlayers} players.`);
      return null;
    }
    return value;
  };

  const handleJoinError = async (err, fallbackMessage) => {
    if (err.status === 402) {
      setError("Insufficient balance. Deposit funds to your wallet first.");
    } else if (err.status === 409) {
      try {
        const meRes = await getMe();
        const matchId = meRes.data?.activeMatch?.matchId;
        if (matchId) {
          navigate(`/play/${matchId}`, { replace: true });
          return;
        }
      } catch {
        /* fall through */
      }
      setError(err.message || fallbackMessage);
    } else {
      setError(err.message || fallbackMessage);
    }
  };

  const loadOpenRooms = async () => {
    try {
      const res = await getOpenPublicMatches();
      setOpenRooms(res.data?.matches || []);
    } catch {
      /* keep last list */
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [meRes, balRes, limitsRes] = await Promise.all([
          getMe(),
          getWalletBalance(),
          getMatchPlayerLimits(),
        ]);
        if (cancelled) return;

        const active = meRes.data?.activeMatch;
        if (active?.matchId) {
          navigate(`/play/${active.matchId}`, { replace: true });
          return;
        }

        const min = limitsRes.data?.min;
        const max = limitsRes.data?.max;
        if (Number.isFinite(min)) setMinRoomPlayers(min);
        setMaxRoomPlayers(Number.isFinite(max) && max > 0 ? max : null);

        setBalance(balRes.data?.balance ?? 0);
      } catch {
        if (!cancelled) setError("Could not load your account. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (loading) return undefined;

    loadOpenRooms();
    const id = setInterval(loadOpenRooms, OPEN_ROOMS_POLL_MS);
    return () => clearInterval(id);
  }, [loading]);

  const hasOpenRoomAtFee = (entryFee) =>
    openRooms.some((r) => String(r.entryFee) === String(entryFee));

  const handleJoin = async (entryFee) => {
    setError("");

    const hosting = !hasOpenRoomAtFee(entryFee);
    const roomSize = hosting ? resolveRoomSize() : parsedRoomSize ?? minRoomPlayers;
    if (roomSize == null) return;

    setJoining(entryFee);

    try {
      const res = await joinPublicMatch(entryFee, roomSize);
      const matchId = res.data?.match?.id;
      if (!matchId) throw new Error("Invalid server response");
      navigate(`/play/${matchId}`, { replace: true });
    } catch (err) {
      await handleJoinError(err, "Could not join match.");
      loadOpenRooms();
    } finally {
      setJoining(null);
    }
  };

  const handleJoinRoom = async (room) => {
    setError("");
    setRoomSizeInput(String(room.requiredPlayers));
    setJoiningRoomId(room.id);

    try {
      const res = await joinPublicMatchById(room.id);
      const matchId = res.data?.match?.id;
      if (!matchId) throw new Error("Invalid server response");
      navigate(`/play/${matchId}`, { replace: true });
    } catch (err) {
      await handleJoinError(err, "Could not join this room.");
      loadOpenRooms();
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleCreate = async (entryFee) => {
    setError("");
    const roomSize = resolveRoomSize();
    if (roomSize == null) return;

    setCreating(entryFee);

    try {
      const res = await createPrivateMatch(entryFee, roomSize);
      const matchId = res.data?.match?.id;
      if (!matchId) throw new Error("Invalid server response");
      navigate(`/play/${matchId}`, { replace: true });
    } catch (err) {
      await handleJoinError(err, "Could not create challenge.");
    } finally {
      setCreating(null);
    }
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    const code = parseInviteCode(inviteCodeInput);
    if (!code) return;
    navigate(`/join/${code}`);
  };

  if (loading) {
    return (
      <PageShell>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: "#F5C518" }} />
        </Box>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <SportsEsports sx={{ color: "#F5C518", fontSize: 28 }} />
              <Typography variant="h5" fontWeight={800}>
                Play
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              Pick a specific open room, or tap an entry fee to join any waiting room at that price.
              If none exists, you become host with the room size you choose.
            </Typography>
          </Box>

          <Card sx={{ ...cardSx, borderColor: alpha("#F5C518", 0.2) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccountBalanceWallet sx={{ color: "#10F0A0" }} />
                  <Typography fontWeight={700}>Wallet balance</Typography>
                </Stack>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#10F0A0" }}>
                  {formatMoney(balance)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {error && (
            <Alert
              severity="error"
              action={
                error.includes("balance") ? (
                  <Button color="inherit" size="small" component={RouterLink} to="/wallet">
                    Deposit
                  </Button>
                ) : null
              }
            >
              {error}
            </Alert>
          )}

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <MeetingRoom sx={{ color: "#8B5CF6", fontSize: 20 }} />
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                Open public rooms
              </Typography>
            </Stack>
            {loadingRooms && <CircularProgress size={18} sx={{ color: "#8B5CF6" }} />}
          </Stack>

          {!loadingRooms && openRooms.length === 0 && (
            <Alert severity="info" sx={{ bgcolor: alpha("#8B5CF6", 0.08), color: "text.secondary" }}>
              No open rooms right now. Pick an entry fee below to host a new room.
            </Alert>
          )}

          <Stack spacing={1.5}>
            {openRooms.map((room) => {
              const amount = parseFloat(room.entryFee);
              const canAfford = balance != null && balance >= amount;
              const fillPct = Math.min(100, (room.currentPlayers / room.requiredPlayers) * 100);
              const isJoiningRoom = joiningRoomId === room.id;

              return (
                <Card
                  key={room.id}
                  sx={{
                    ...cardSx,
                    borderColor: alpha("#8B5CF6", 0.2),
                    transition: "border-color 0.2s",
                    "&:hover": canAfford ? { borderColor: alpha("#8B5CF6", 0.4) } : {},
                  }}
                >
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
                          <Typography variant="h6" fontWeight={800}>
                            KSh {room.entryFee} room
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            {room.currentPlayers}/{room.requiredPlayers} players
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={fillPct}
                          sx={{
                            mb: 1.25,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "rgba(255,255,255,0.08)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              background: "linear-gradient(90deg, #8B5CF6, #F5C518)",
                            },
                          }}
                        />
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <EmojiEvents sx={{ fontSize: 16, color: "#F5C518" }} />
                          <Typography variant="caption" color="text.secondary">
                            Prize up to {formatMoney(room.maxPrize)} · {room.spotsLeft} spot
                            {room.spotsLeft === 1 ? "" : "s"} left
                          </Typography>
                        </Stack>
                      </Box>
                      <Button
                        variant="contained"
                        disabled={!canAfford || busy}
                        onClick={() => handleJoinRoom(room)}
                        sx={{
                          minWidth: { sm: 120 },
                          bgcolor: "#8B5CF6",
                          color: "#fff",
                          fontWeight: 700,
                          "&:hover": { bgcolor: "#7C4FE0" },
                          "&.Mui-disabled": { opacity: 0.5 },
                        }}
                      >
                        {isJoiningRoom ? (
                          <CircularProgress size={22} sx={{ color: "#fff" }} />
                        ) : (
                          "Join room"
                        )}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          <Card sx={{ ...cardSx, borderColor: alpha("#C4B5FD", 0.25) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <People sx={{ color: "#C4B5FD", fontSize: 20 }} />
                <Typography fontWeight={700}>Host a new room</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Only used when no open room exists at that entry fee. Pick how many players must join
                before the quiz starts.
              </Typography>
              <TextField
                type="number"
                label="Players in your room"
                value={roomSizeInput}
                onChange={(e) => setRoomSizeInput(e.target.value.replace(/[^\d]/g, ""))}
                inputProps={{
                  min: minRoomPlayers,
                  ...(maxRoomPlayers != null ? { max: maxRoomPlayers } : {}),
                  step: 1,
                }}
                helperText={
                  maxRoomPlayers != null
                    ? `Between ${minRoomPlayers} and ${maxRoomPlayers} players`
                    : `At least ${minRoomPlayers} players`
                }
                size="small"
                sx={{ maxWidth: 280 }}
              />
            </CardContent>
          </Card>

          <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ pt: 0.5 }}>
            Join by entry fee
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: -1.5, mb: 0.5 }}>
            Joins an open room at that fee automatically, or hosts a new one using the size above.
          </Typography>

          <Stack spacing={1.5}>
            {ENTRY_FEES.map((fee) => {
              const amount = parseFloat(fee.value);
              const canAfford = balance != null && balance >= amount;
              const isJoining = joining === fee.value;
              const openAtFee = hasOpenRoomAtFee(fee.value);
              const canJoin = openAtFee || parsedRoomSize != null;

              return (
                <Card
                  key={`public-${fee.value}`}
                  sx={{
                    ...cardSx,
                    transition: "border-color 0.2s",
                    "&:hover": canAfford ? { borderColor: alpha("#F5C518", 0.35) } : {},
                  }}
                >
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          {fee.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {fee.desc}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                          <Groups sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            {openAtFee
                              ? "Open room available — join instantly"
                              : `No room yet — host with ${parsedRoomSize ?? "—"} players`}
                            {" · "}5 questions · 60s
                          </Typography>
                        </Stack>
                      </Box>
                      <Button
                        variant="contained"
                        disabled={!canAfford || busy || !canJoin}
                        onClick={() => handleJoin(fee.value)}
                        sx={{
                          minWidth: { sm: 140 },
                          bgcolor: "#F5C518",
                          color: "#050508",
                          "&:hover": { bgcolor: "#FFE566" },
                          "&.Mui-disabled": { opacity: 0.5 },
                        }}
                      >
                        {isJoining ? (
                          <CircularProgress size={22} sx={{ color: "#050508" }} />
                        ) : openAtFee ? (
                          `Join ${fee.label}`
                        ) : parsedRoomSize != null ? (
                          `Host ${fee.label}`
                        ) : (
                          "Set room size"
                        )}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ pt: 1 }}>
            Challenge friends
          </Typography>

          <Stack spacing={1.5}>
            {ENTRY_FEES.map((fee) => {
              const amount = parseFloat(fee.value);
              const canAfford = balance != null && balance >= amount;
              const isCreating = creating === fee.value;

              return (
                <Card
                  key={`private-${fee.value}`}
                  sx={{
                    ...cardSx,
                    borderColor: alpha("#25D366", 0.15),
                    transition: "border-color 0.2s",
                    "&:hover": canAfford ? { borderColor: alpha("#25D366", 0.35) } : {},
                  }}
                >
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                          <Lock sx={{ fontSize: 18, color: "#25D366" }} />
                          <Typography variant="h6" fontWeight={800}>
                            {fee.label} challenge
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Create a private room and share the link on WhatsApp
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        disabled={!canAfford || busy}
                        onClick={() => handleCreate(fee.value)}
                        sx={{
                          minWidth: { sm: 160 },
                          bgcolor: "#25D366",
                          color: "#fff",
                          fontWeight: 700,
                          "&:hover": { bgcolor: "#1EBE5A" },
                          "&.Mui-disabled": { opacity: 0.5 },
                        }}
                      >
                        {isCreating ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Create challenge"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          <Card sx={{ ...cardSx, borderColor: alpha("#8B5CF6", 0.2) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <LinkIcon sx={{ color: "#C4B5FD", fontSize: 20 }} />
                <Typography fontWeight={700}>Have an invite code?</Typography>
              </Stack>
              <Box component="form" onSubmit={handleJoinByCode}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Paste link or code (e.g. A1B2C3D4)"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    inputProps={{ style: { fontFamily: "monospace", letterSpacing: 1 } }}
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    disabled={!inviteCodeInput.trim() || !!joining || !!creating}
                    sx={{ minWidth: { sm: 120 }, whiteSpace: "nowrap" }}
                  >
                    Join
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ bgcolor: alpha("#F5C518", 0.06), color: "text.secondary" }}>
            <Typography variant="body2">
              Enter <strong>players in room</strong> first — e.g. 3 at KSh 10. Others who quick-join with
              the same fee and size will enter your room.
            </Typography>
          </Alert>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            Logged in as {user?.nickname || "player"}
          </Typography>
        </Stack>
      </motion.div>
    </PageShell>
  );
}
