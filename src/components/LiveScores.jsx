import { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { getScores } from "../api";
import { colors } from "../theme";

const POLL_MS = 15000;

/** Compact live scoreboard for the caller's tournament, polling on an interval. */
export default function LiveScores({ tournamentId, teamIds = [] }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (!tournamentId) return undefined;
    let alive = true;

    const load = () => {
      getScores({ tournamentId })
        .then((res) => {
          if (alive) setScores(res.data?.scores || []);
        })
        .catch(() => {
          if (alive) setScores([]);
        });
    };

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [tournamentId]);

  if (!tournamentId || scores.length === 0) return null;

  const latestMatch = Math.max(...scores.map((s) => s.matchNumber || 1));
  const rows = scores
    .filter((s) => (s.matchNumber || 1) === latestMatch)
    .slice()
    .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
    .slice(0, 6);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BoltOutlinedIcon sx={{ color: colors.warning, fontSize: 20 }} />
            <Typography variant="h6">Live scores · Match {latestMatch}</Typography>
          </Stack>
          <Chip
            size="small"
            label="LIVE"
            sx={{
              bgcolor: "rgba(255,59,48,0.15)",
              color: colors.danger,
              border: `1px solid ${colors.danger}55`,
              fontWeight: 700,
            }}
          />
        </Stack>
        <Stack spacing={1}>
          {rows.map((s, idx) => {
            const isMine = teamIds.includes(s.Team?.id || s.teamId);
            return (
              <Box
                key={s.id}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: `1px solid ${isMine ? colors.primary : colors.border}`,
                  bgcolor: isMine ? "rgba(124,58,237,0.14)" : colors.elevated,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Typography
                  sx={{ width: 22, fontFamily: "Orbitron, sans-serif", fontWeight: 700, color: "text.secondary" }}
                >
                  #{idx + 1}
                </Typography>
                <Typography sx={{ flex: 1 }} fontWeight={700} noWrap>
                  {s.Team?.tag ? `[${s.Team.tag}] ` : ""}
                  {s.Team?.name || "Team"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.kills ?? 0} kills
                </Typography>
                <Typography fontWeight={800} sx={{ color: colors.primaryLight, minWidth: 48, textAlign: "right" }}>
                  {s.totalPoints ?? 0} pts
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
