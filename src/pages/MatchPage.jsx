import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TextField,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Groups,
  Timer,
  EmojiEvents,
  CheckCircle,
  SportsEsports,
  ArrowForward,
  Logout,
  AccountBalanceWallet,
  HourglassTop,
  Person,
  ContentCopy,
  Share,
  Lock,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "../components/PageShell";
import {
  getMatch,
  getMatchQuestions,
  submitMatchAnswer,
  submitMatchEarly,
  leaveMatch,
} from "../api";
import { useAuth } from "../context/AuthContext";
import {
  buildInviteUrl,
  buildWhatsAppShareText,
  copyInviteLink,
  shareOnWhatsApp,
} from "../utils/invite";

const POLL_MS = 2500;
const OPTIONS = ["A", "B", "C", "D"];

const cardSx = {
  borderRadius: 3,
  bgcolor: "rgba(12,12,20,0.85)",
  border: "1px solid rgba(255,255,255,0.08)",
};

function formatMoney(value) {
  return `KSh ${parseFloat(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

function getPlayers(match) {
  return match?.MatchPlayers || match?.MatchPlayer || [];
}

function getMyPlayer(match, userId) {
  return getPlayers(match).find((p) => p.userId === userId);
}

function useSecondsLeft(timerEndsAt) {
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (!timerEndsAt) {
      setSecondsLeft(null);
      return undefined;
    }

    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(timerEndsAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
    };

    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [timerEndsAt]);

  return secondsLeft;
}

function WaitingView({ match, userId, userNickname, onLeave }) {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down("sm"));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState("");
  const [copied, setCopied] = useState(false);

  const isPrivate = match.matchType === "private_challenge";
  const inviteCode = match.inviteLinkCode;
  const inviteUrl = inviteCode ? buildInviteUrl(inviteCode) : "";

  const players = getPlayers(match).filter((p) => p.status !== "refunded");
  const fillPct = Math.min(100, (match.currentPlayers / match.requiredPlayers) * 100);
  const spotsLeft = Math.max(0, match.requiredPlayers - match.currentPlayers);
  const currentPool = parseFloat(match.totalPrizePool || 0);
  const maxPool = parseFloat(match.entryFee) * match.requiredPlayers;
  const maxPrize = maxPool * 0.8;

  const slots = Array.from({ length: match.requiredPlayers }, (_, i) => players[i] || null);

  const handleCopyLink = async () => {
    if (!inviteCode) return;
    try {
      await copyInviteLink(inviteCode);
      setCopied(true);
    } catch {
      /* clipboard blocked */
    }
  };

  const handleWhatsAppShare = () => {
    if (!inviteCode) return;
    const text = buildWhatsAppShareText({
      inviteCode,
      entryFee: match.entryFee,
      hostName: match.creator?.nickname || userNickname,
    });
    shareOnWhatsApp(text);
  };

  const handleLeaveConfirm = async () => {
    setLeaving(true);
    setLeaveError("");
    try {
      await leaveMatch(match.id);
      setConfirmOpen(false);
      onLeave();
    } catch (err) {
      setLeaveError(err.message || "Could not leave match");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Button
          startIcon={<Logout sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          onClick={() => setConfirmOpen(true)}
          disabled={leaving}
          size={isNarrow ? "small" : "medium"}
          sx={{
            alignSelf: { xs: "flex-start", sm: "center" },
            whiteSpace: "nowrap",
            fontSize: { xs: "0.8125rem", sm: "0.875rem" },
            color: "#FF8FA3",
            borderColor: alpha("#FF4D6A", 0.4),
            "&:hover": {
              color: "#FF4D6A",
              borderColor: "#FF4D6A",
              bgcolor: alpha("#FF4D6A", 0.08),
            },
          }}
          variant="outlined"
        >
          Leave match
        </Button>
        <Chip
          icon={
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#10F0A0",
                animation: "pulse 1.5s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.35 },
                },
              }}
            />
          }
          label="Waiting for players"
          sx={{
            fontWeight: 700,
            bgcolor: alpha("#8B5CF6", 0.15),
            color: "#C4B5FD",
            border: `1px solid ${alpha("#8B5CF6", 0.35)}`,
            "& .MuiChip-icon": { ml: 1 },
          }}
        />
      </Stack>

      <Card
        sx={{
          ...cardSx,
          width: "100%",
          mb: 2.5,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${alpha("#8B5CF6", 0.14)} 0%, rgba(12,12,20,0.95) 45%, ${alpha("#F5C518", 0.08)} 100%)`,
          borderColor: alpha("#8B5CF6", 0.25),
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="overline" sx={{ color: "#C4B5FD", fontWeight: 700, letterSpacing: 1.2 }}>
                {isPrivate ? "Private challenge" : "Public match"} · KSh {match.entryFee} entry
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, mb: 1, lineHeight: 1.15 }}>
                {isPrivate ? "Invite friends to join" : "Room filling up"}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
                {isPrivate
                  ? "Share your link on WhatsApp or Telegram. Friends pay the same entry fee to join this room."
                  : "Match starts automatically when all spots are taken."}{" "}
                Use &quot;Leave match&quot; to cancel and get your entry fee refunded.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  textAlign: "center",
                  py: { xs: 2, sm: 3 },
                  px: 2,
                  borderRadius: 3,
                  bgcolor: alpha("#000", 0.25),
                  border: `1px solid ${alpha("#fff", 0.06)}`,
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
                  Players ready
                </Typography>
                <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={0.5}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: { xs: "3.5rem", sm: "4.5rem" },
                      fontWeight: 900,
                      lineHeight: 1,
                      color: "#F5C518",
                    }}
                  >
                    {match.currentPlayers}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" }, fontWeight: 700, color: "text.secondary" }}
                  >
                    / {match.requiredPlayers}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={fillPct}
                  sx={{
                    mt: 2,
                    mx: "auto",
                    maxWidth: 360,
                    height: 12,
                    borderRadius: 6,
                    bgcolor: "rgba(255,255,255,0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                      background: "linear-gradient(90deg, #8B5CF6, #F5C518)",
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  {spotsLeft === 0
                    ? "Starting match…"
                    : `Waiting for ${spotsLeft} more player${spotsLeft === 1 ? "" : "s"}`}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isPrivate && inviteCode && (
        <Card
          sx={{
            ...cardSx,
            width: "100%",
            mb: 2.5,
            borderColor: alpha("#25D366", 0.35),
            background: `linear-gradient(135deg, ${alpha("#25D366", 0.08)} 0%, rgba(12,12,20,0.95) 100%)`,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Lock sx={{ color: "#25D366", fontSize: 20 }} />
              <Typography variant="h6" fontWeight={800}>
                Challenge invite
              </Typography>
            </Stack>
            <TextField
              fullWidth
              size="small"
              value={inviteUrl}
              InputProps={{
                readOnly: true,
                sx: { fontFamily: "monospace", fontSize: "0.85rem" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleCopyLink} aria-label="Copy link">
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="contained"
                startIcon={<Share />}
                onClick={handleWhatsAppShare}
                sx={{
                  flex: 1,
                  bgcolor: "#25D366",
                  color: "#fff",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#1EBE5A" },
                }}
              >
                Share on WhatsApp
              </Button>
              <Button variant="outlined" onClick={handleCopyLink} sx={{ flex: { sm: "0 0 auto" } }}>
                Copy link
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
              Invite code: <strong style={{ fontFamily: "monospace" }}>{inviteCode}</strong>
            </Typography>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        message="Invite link copied!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ ...cardSx, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: alpha("#F5C518", 0.12),
                    color: "#F5C518",
                    display: "flex",
                  }}
                >
                  <AccountBalanceWallet />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Current pool
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatMoney(currentPool)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ ...cardSx, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: alpha("#10F0A0", 0.12),
                    color: "#10F0A0",
                    display: "flex",
                  }}
                >
                  <EmojiEvents />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Winner takes (80%)
                  </Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: "#10F0A0" }}>
                    {formatMoney(maxPrize)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ ...cardSx, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: alpha("#8B5CF6", 0.12),
                    color: "#C4B5FD",
                    display: "flex",
                  }}
                >
                  <HourglassTop />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Quiz format
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    5 Q · 60 sec
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ ...cardSx, width: "100%", mb: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
            sx={{ mb: 2.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Groups sx={{ color: "#F5C518" }} />
              <Typography variant="h6" fontWeight={800}>
                Players in room
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {match.currentPlayers} of {match.requiredPlayers} joined
            </Typography>
          </Stack>

          <Grid container spacing={1.5}>
            {slots.map((player, index) => {
              const isMe = player?.userId === userId;
              const nickname = player?.User?.nickname || null;

              if (player) {
                return (
                  <Grid key={player.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        border: `1px solid ${isMe ? alpha("#F5C518", 0.45) : "rgba(255,255,255,0.08)"}`,
                        bgcolor: isMe ? alpha("#F5C518", 0.06) : "rgba(255,255,255,0.02)",
                        textAlign: "center",
                      }}
                    >
                      <Avatar
                        sx={{
                          mx: "auto",
                          mb: 1,
                          width: 44,
                          height: 44,
                          bgcolor: isMe ? "#F5C518" : alpha("#8B5CF6", 0.35),
                          color: isMe ? "#050508" : "#FAFAFA",
                          fontWeight: 800,
                        }}
                      >
                        {(nickname || "P").charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={700} noWrap title={nickname || "Player"}>
                        {nickname || "Player"}
                        {isMe ? " (you)" : ""}
                      </Typography>
                      <Chip
                        size="small"
                        label={player.status}
                        sx={{ mt: 0.75, textTransform: "capitalize", fontSize: "0.7rem", height: 22 }}
                      />
                    </Box>
                  </Grid>
                );
              }

              return (
                <Grid key={`empty-${index}`} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: "1px dashed rgba(255,255,255,0.12)",
                      bgcolor: "rgba(255,255,255,0.01)",
                      textAlign: "center",
                      minHeight: 118,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        mb: 1,
                        bgcolor: "rgba(255,255,255,0.04)",
                        color: "text.secondary",
                      }}
                    >
                      <Person fontSize="small" />
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Open slot
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1.25}
        sx={{
          py: 1.5,
          px: 2,
          borderRadius: 2,
          bgcolor: alpha("#8B5CF6", 0.06),
          border: `1px solid ${alpha("#8B5CF6", 0.15)}`,
        }}
      >
        <CircularProgress size={18} thickness={5} sx={{ color: "#8B5CF6" }} />
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Listening for new players…
        </Typography>
      </Stack>

      {leaveError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {leaveError}
        </Alert>
      )}

      <Dialog open={confirmOpen} onClose={() => !leaving && setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={800}>Leave this match?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Your {formatMoney(match.entryFee)} entry fee will be refunded to your wallet. You can join
            another match anytime from Play.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: 2,
            pt: 0,
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: "stretch",
            gap: 1,
            "& .MuiButton-root": {
              width: { xs: "100%", sm: "auto" },
              whiteSpace: "nowrap",
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              py: { xs: 1, sm: 0.75 },
            },
          }}
        >
          <Button onClick={() => setConfirmOpen(false)} disabled={leaving} color="inherit">
            Stay
          </Button>
          <Button
            onClick={handleLeaveConfirm}
            disabled={leaving}
            variant="contained"
            color="error"
            startIcon={leaving ? <CircularProgress size={16} color="inherit" /> : <Logout fontSize="small" />}
          >
            {leaving ? "Leaving…" : "Leave\u00a0&\u00a0refund"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function QuizView({ match, questionsData, userId, onAnswered, onFinished, onAdvanceQuestion }) {
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const secondsLeft = useSecondsLeft(questionsData.timerEndsAt);
  const timerExpiredRef = useRef(false);
  const advanceTimerRef = useRef(null);

  const myPlayer = getMyPlayer(match, userId);
  const questionIndex = questionsData.currentQuestionIndex ?? myPlayer?.currentQuestionIndex ?? 0;
  const currentQuestion = questionsData.questions?.[questionIndex];
  const totalQuestions = questionsData.questions?.length || 5;

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (secondsLeft === 0 && !timerExpiredRef.current && match.status === "active") {
      timerExpiredRef.current = true;
      onFinished();
    }
  }, [secondsLeft, match.status, onFinished]);

  const handleSelect = async (option) => {
    if (!currentQuestion || submitting || feedback) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await submitMatchAnswer(match.id, {
        questionId: currentQuestion.id,
        selectedOption: option,
      });
      const newIndex = res.data?.currentQuestionIndex ?? questionIndex + 1;
      const isCorrect = res.data?.isCorrect;
      setFeedback(isCorrect ? "correct" : "wrong");

      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        setFeedback(null);
        if (newIndex >= totalQuestions) {
          onFinished();
        } else {
          onAdvanceQuestion(newIndex);
        }
        onAnswered();
      }, 700);
    } catch (err) {
      if (err.status === 400 && /expired/i.test(err.message || "")) {
        onFinished();
      } else {
        setError(err.message || "Could not submit answer");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishEarly = async () => {
    setSubmitting(true);
    setError("");
    try {
      await submitMatchEarly(match.id);
      onFinished();
    } catch (err) {
      setError(err.message || "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
        <CircularProgress sx={{ color: "#F5C518" }} />
        <Typography color="text.secondary">Loading questions…</Typography>
      </Stack>
    );
  }

  const optionLabel = (key) => {
    const map = { A: "optionA", B: "optionB", C: "optionC", D: "optionD" };
    return currentQuestion[map[key]];
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Chip
          icon={<SportsEsports />}
          label={`Question ${questionIndex + 1} of ${totalQuestions}`}
          sx={{ fontWeight: 700 }}
        />
        <Chip
          icon={<Timer />}
          label={secondsLeft != null ? `${secondsLeft}s left` : "—"}
          color={secondsLeft != null && secondsLeft <= 10 ? "error" : "default"}
          sx={{ fontWeight: 700, fontFamily: "monospace" }}
        />
      </Stack>

      {secondsLeft != null && (
        <LinearProgress
          variant="determinate"
          value={Math.min(100, (secondsLeft / (questionsData.timeLimitSeconds || 60)) * 100)}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.08)",
            "& .MuiLinearProgress-bar": {
              bgcolor: secondsLeft <= 10 ? "#FF4D6A" : "#F5C518",
            },
          }}
        />
      )}

      {error && <Alert severity="error">{error}</Alert>}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Card sx={{ ...cardSx, borderColor: alpha("#F5C518", 0.15) }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5, lineHeight: 1.45 }}>
                {currentQuestion.questionText}
              </Typography>
              <Stack spacing={1.25}>
                {OPTIONS.map((opt) => (
                  <Button
                    key={opt}
                    fullWidth
                    variant="outlined"
                    disabled={submitting || !!feedback}
                    onClick={() => handleSelect(opt)}
                    sx={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      py: 1.5,
                      px: 2,
                      borderColor: "rgba(255,255,255,0.12)",
                      "&:hover": {
                        borderColor: "#F5C518",
                        bgcolor: alpha("#F5C518", 0.06),
                      },
                    }}
                  >
                    <Typography component="span" fontWeight={800} sx={{ mr: 1.5, color: "#F5C518" }}>
                      {opt}.
                    </Typography>
                    <Typography component="span">{optionLabel(opt)}</Typography>
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {feedback && (
        <Alert severity={feedback === "correct" ? "success" : "warning"}>
          {feedback === "correct" ? "Correct!" : "Wrong answer — keep going!"}
        </Alert>
      )}

      {questionIndex < totalQuestions - 1 && !feedback && (
        <Button variant="text" color="inherit" disabled={submitting} onClick={handleFinishEarly} sx={{ alignSelf: "center" }}>
          Finish early
        </Button>
      )}
    </Stack>
  );
}

function ResultsView({ match, userId }) {
  const myPlayer = getMyPlayer(match, userId);
  const players = [...getPlayers(match)].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  const won = myPlayer?.rank === 1 && parseFloat(myPlayer?.prizeWon || 0) > 0;

  return (
    <Stack spacing={3}>
      <Box sx={{ textAlign: "center", py: 1 }}>
        {won ? (
          <>
            <EmojiEvents sx={{ fontSize: 56, color: "#F5C518", mb: 1 }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: "#F5C518" }}>
              You won!
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
              {formatMoney(myPlayer.prizeWon)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Credited to your wallet
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h5" fontWeight={800}>
              Match complete
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              You finished rank #{myPlayer?.rank ?? "—"} with {myPlayer?.score ?? 0}/5 correct
            </Typography>
          </>
        )}
      </Box>

      <Card sx={cardSx}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Leaderboard
          </Typography>
          <Stack spacing={1}>
            {players.map((p) => {
              const isMe = p.userId === userId;
              return (
                <Stack
                  key={p.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: isMe ? alpha("#F5C518", 0.08) : "transparent",
                    border: isMe ? `1px solid ${alpha("#F5C518", 0.25)}` : "1px solid transparent",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography fontWeight={800} sx={{ minWidth: 28, color: p.rank === 1 ? "#F5C518" : "text.secondary" }}>
                      #{p.rank ?? "—"}
                    </Typography>
                    <Typography fontWeight={isMe ? 700 : 500}>
                      {p.User?.nickname || "Player"}
                      {isMe ? " (you)" : ""}
                    </Typography>
                  </Stack>
                  <Stack alignItems="flex-end">
                    <Typography variant="body2" fontWeight={700}>
                      {p.score ?? 0}/5
                    </Typography>
                    {parseFloat(p.prizeWon || 0) > 0 && (
                      <Typography variant="caption" sx={{ color: "#10F0A0" }}>
                        +{formatMoney(p.prizeWon)}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          component={RouterLink}
          to="/play"
          variant="contained"
          fullWidth
          endIcon={<ArrowForward />}
          sx={{ bgcolor: "#F5C518", color: "#050508", "&:hover": { bgcolor: "#FFE566" } }}
        >
          Play again
        </Button>
        <Button component={RouterLink} to="/wallet" variant="outlined" fullWidth>
          View wallet
        </Button>
      </Stack>
    </Stack>
  );
}

export default function MatchPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("loading");
  const questionsLoadedRef = useRef(false);

  const loadMatch = useCallback(async () => {
    const res = await getMatch(matchId);
    return res.data?.match;
  }, [matchId]);

  const loadQuestions = useCallback(async () => {
    const res = await getMatchQuestions(matchId);
    return res.data;
  }, [matchId]);

  const refresh = useCallback(async () => {
    try {
      const nextMatch = await loadMatch();
      if (!nextMatch) throw new Error("Match not found");
      setMatch(nextMatch);

      if (nextMatch.status === "waiting") {
        setPhase("waiting");
        return;
      }

      if (nextMatch.status === "active") {
        const myPlayer = getMyPlayer(nextMatch, user?.id);

        if (myPlayer?.status === "completed") {
          setPhase("quiz");
          setError("");
          return;
        }

        setPhase("quiz");
        try {
          const qData = await loadQuestions();
          setQuestionsData((prev) => {
            if (!prev || !questionsLoadedRef.current) return qData;
            const serverIndex = qData.currentQuestionIndex ?? 0;
            const localIndex = prev.currentQuestionIndex ?? 0;
            return {
              ...qData,
              currentQuestionIndex: Math.max(serverIndex, localIndex),
            };
          });
          questionsLoadedRef.current = true;
          setError("");
        } catch (err) {
          const waitingMsg = /not playing|not active|expired/i.test(err.message || "");
          if ((err.status === 403 || err.status === 400) && waitingMsg) {
            const again = await loadMatch();
            setMatch(again);
            if (again?.status === "completed") {
              setPhase("results");
            } else {
              setPhase("quiz");
            }
            setError("");
            return;
          }
          if (!questionsLoadedRef.current) {
            throw err;
          }
        }
        return;
      }

      if (nextMatch.status === "completed") {
        setPhase("results");
        setError("");
      }
    } catch (err) {
      setError(err.message || "Failed to load match");
    }
  }, [loadMatch, loadQuestions, user?.id]);

  const handleAdvanceQuestion = useCallback((newIndex) => {
    setQuestionsData((prev) => (prev ? { ...prev, currentQuestionIndex: newIndex } : prev));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load match");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (loading || error || phase === "results") return undefined;

    const id = setInterval(() => {
      refresh().catch(() => {});
    }, POLL_MS);

    return () => clearInterval(id);
  }, [loading, error, phase, refresh]);

  const handleAnswered = useCallback(async () => {
    try {
      await refresh();
    } catch {
      /* background poll will retry */
    }
  }, [refresh]);

  const handleFinished = useCallback(async () => {
    try {
      await refresh();
    } catch {
      /* polling will retry */
    }
  }, [refresh]);

  if (loading) {
    return (
      <PageShell>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: "#F5C518" }} />
        </Box>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button component={RouterLink} to="/play" variant="contained">
          Back to Play
        </Button>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {phase === "waiting" && match && (
          <WaitingView
            match={match}
            userId={user?.id}
            userNickname={user?.nickname}
            onLeave={() => navigate("/play", { replace: true })}
          />
        )}

        {phase === "quiz" && match && (
          <>
            {getMyPlayer(match, user?.id)?.status === "completed" ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 6, px: 2, textAlign: "center" }}>
                <CheckCircle sx={{ fontSize: 48, color: "#10F0A0" }} />
                <Typography variant="h6" fontWeight={800}>
                  All answers submitted
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 360 }}>
                  Waiting for the other player to finish. Results will appear here automatically.
                </Typography>
                <CircularProgress size={28} sx={{ color: "#8B5CF6", mt: 1 }} />
              </Stack>
            ) : (
              <QuizView
                match={match}
                questionsData={questionsData || {}}
                userId={user?.id}
                onAnswered={handleAnswered}
                onFinished={handleFinished}
                onAdvanceQuestion={handleAdvanceQuestion}
              />
            )}
          </>
        )}

        {phase === "results" && match && (
          <ResultsView match={match} userId={user?.id} />
        )}

      </motion.div>
    </PageShell>
  );
}
