import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Button, Stack, Alert, CircularProgress } from "@mui/material";
import { SportsEsports } from "@mui/icons-material";
import PageShell from "../components/PageShell";
import { getMe, joinPrivateMatch } from "../api";
import { consumePendingInvite, parseInviteCode } from "../utils/invite";

async function findMatchToResume() {
  const meRes = await getMe();
  const matchId = meRes.data?.activeMatch?.matchId;
  return matchId || null;
}

export default function JoinInvitePage() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(true);
  const [showManualHelp, setShowManualHelp] = useState(false);

  useEffect(() => {
    let disposed = false;
    const code = parseInviteCode(inviteCode || consumePendingInvite() || "");

    if (!code) {
      setError("Enter a valid invite code (e.g. A1B2C3D4) or paste the full invite link.");
      setJoining(false);
      return undefined;
    }

    const goToMatch = (matchId) => {
      if (matchId) navigate(`/play/${matchId}`, { replace: true });
    };

    async function tryJoin() {
      try {
        const existingId = await findMatchToResume();
        if (existingId) {
          goToMatch(existingId);
          return;
        }

        const res = await joinPrivateMatch(code);
        const matchId = res.data?.match?.id;
        if (!matchId) throw new Error("Invalid server response");
        goToMatch(matchId);
      } catch (err) {
        try {
          const existingId = await findMatchToResume();
          if (existingId) {
            goToMatch(existingId);
            return;
          }
        } catch {
          /* fall through */
        }

        if (disposed) return;

        if (err.status === 402) {
          setError("Insufficient balance. Deposit funds first, then open the invite link again.");
        } else {
          setError(err.message || "Could not join this challenge.");
        }
        setJoining(false);
      }
    }

    tryJoin();

    const helpTimer = setTimeout(() => {
      if (!disposed) setShowManualHelp(true);
    }, 4000);

    const pollTimer = setInterval(async () => {
      try {
        const matchId = await findMatchToResume();
        if (matchId) goToMatch(matchId);
      } catch {
        /* keep polling */
      }
    }, 2000);

    return () => {
      disposed = true;
      clearTimeout(helpTimer);
      clearInterval(pollTimer);
    };
  }, [inviteCode, navigate]);

  if (joining) {
    return (
      <PageShell>
        <Stack alignItems="center" spacing={2} sx={{ py: 10, px: 2 }}>
          <CircularProgress sx={{ color: "#F5C518" }} />
          <Typography fontWeight={700}>Joining challenge…</Typography>
          <Typography variant="body2" color="text.secondary">
            Code: {parseInviteCode(inviteCode || "")}
          </Typography>
          {showManualHelp && (
            <Stack spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Taking longer than expected? You may already be in the match.
              </Typography>
              <Button
                variant="outlined"
                onClick={async () => {
                  try {
                    const matchId = await findMatchToResume();
                    if (matchId) navigate(`/play/${matchId}`, { replace: true });
                    else navigate("/play", { replace: true });
                  } catch {
                    navigate("/play", { replace: true });
                  }
                }}
              >
                Go to my match
              </Button>
            </Stack>
          )}
        </Stack>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SportsEsports sx={{ color: "#F5C518" }} />
          <Typography variant="h5" fontWeight={800}>
            Could not join
          </Typography>
        </Stack>
        <Alert severity="error">{error}</Alert>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button component={RouterLink} to="/wallet" variant="contained" sx={{ bgcolor: "#F5C518", color: "#050508" }}>
            Go to wallet
          </Button>
          <Button component={RouterLink} to="/play" variant="outlined">
            Play lobby
          </Button>
        </Stack>
      </Stack>
    </PageShell>
  );
}
