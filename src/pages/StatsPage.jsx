import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { getLeaderboards, getMyRegistrations } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

const fmt = (value) => (value != null && value !== "" ? value : "—");

export default function StatsPage() {
  const { teams } = useAuth();
  const [leaderboardEntry, setLeaderboardEntry] = useState(null);
  const [tournamentCount, setTournamentCount] = useState(0);

  const teamIds = useMemo(
    () =>
      teams
        .map((m) => m.team?.id || m.Team?.id)
        .filter(Boolean),
    [teams]
  );

  useEffect(() => {
    let alive = true;

    Promise.all([
      getLeaderboards({ type: "weekly", limit: 50 }).catch(() => ({ data: { entries: [] } })),
      getMyRegistrations().catch(() => ({ data: { registrations: [] } })),
    ]).then(([lbRes, regRes]) => {
      if (!alive) return;

      const rows = lbRes.data?.entries || [];
      const match = rows.find((e) => {
        const teamId = e.Team?.id || e.team?.id;
        return teamId && teamIds.includes(teamId);
      });
      setLeaderboardEntry(match || null);
      setTournamentCount((regRes.data?.registrations || []).length);
    });

    return () => {
      alive = false;
    };
  }, [teamIds]);

  const stats = [
    ["Kills", fmt(leaderboardEntry?.killPoints)],
    ["Placement pts", fmt(leaderboardEntry?.placementPoints)],
    ["Total pts", fmt(leaderboardEntry?.totalPoints)],
    ["Weekly rank", leaderboardEntry?.rank != null ? `#${leaderboardEntry.rank}` : "—"],
    ["Win rate", "—"],
    ["Tournaments", tournamentCount],
    ["MVP awards", "—"],
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Statistics
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Performance overview across scrims and tournaments.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(([label, value]) => (
          <Grid item xs={6} md={3} key={label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography sx={{ fontFamily: "Orbitron, sans-serif", fontWeight: 700, fontSize: "1.4rem" }}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Ranking progression
          </Typography>
          <Box
            sx={{
              height: 180,
              borderRadius: 2,
              border: `1px dashed ${colors.border}`,
              display: "grid",
              placeItems: "center",
              bgcolor: colors.elevated,
            }}
          >
            <Typography color="text.secondary">
              {leaderboardEntry
                ? "Charts will sync from Overstat / match scores in Phase 3"
                : "No leaderboard data yet for your team."}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
