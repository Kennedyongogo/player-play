import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import { getLeaderboards, getMyRegistrations } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

const fmt = (value) => (value != null && value !== "" ? value : "—");

const STAT_META = [
  { label: "Kills", icon: SportsEsportsOutlinedIcon, accent: colors.danger },
  { label: "Placement pts", icon: PlaceOutlinedIcon, accent: colors.accent },
  { label: "Total pts", icon: TimelineOutlinedIcon, accent: colors.primaryLight },
  { label: "Weekly rank", icon: LeaderboardOutlinedIcon, accent: colors.warning },
  { label: "Win rate", icon: PercentOutlinedIcon, accent: colors.cyan },
  { label: "Tournaments", icon: EmojiEventsOutlinedIcon, accent: colors.success },
  { label: "MVP awards", icon: StarOutlineOutlinedIcon, accent: "#FBBF24" },
];

export default function StatsPage() {
  const { teams } = useAuth();
  const [leaderboardEntry, setLeaderboardEntry] = useState(null);
  const [tournamentCount, setTournamentCount] = useState(0);

  const teamIds = useMemo(
    () => teams.map((m) => m.team?.id || m.Team?.id).filter(Boolean),
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

  const values = [
    fmt(leaderboardEntry?.killPoints),
    fmt(leaderboardEntry?.placementPoints),
    fmt(leaderboardEntry?.totalPoints),
    leaderboardEntry?.rank != null ? `#${leaderboardEntry.rank}` : "—",
    "—",
    tournamentCount,
    "—",
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Statistics
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Performance overview across scrims and tournaments.
      </Typography>

      {/* Edge-to-edge: md = 4 top + 3 bottom · xs = 2+2+2+1 */}
      <Box
        sx={{
          mx: { xs: -2, md: -3 },
          mb: 3,
          px: { xs: 1.5, md: 2 },
          py: { xs: 1.5, md: 2 },
          bgcolor: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
          backgroundImage: `
            linear-gradient(180deg, rgba(124,58,237,0.1), transparent 70%),
            linear-gradient(90deg, rgba(0,194,255,0.05), transparent 40%)
          `,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: { xs: 1.5, md: 2 },
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(12, 1fr)",
            },
            width: "100%",
          }}
        >
          {STAT_META.map((item, index) => {
            const Icon = item.icon;
            const value = values[index];
            const isLast = index === STAT_META.length - 1;
            const isTopRow = index < 4;

            return (
              <Box
                key={item.label}
                sx={{
                  gridColumn: {
                    xs: isLast ? "1 / -1" : "auto",
                    md: isTopRow ? "span 3" : "span 4",
                  },
                  px: { xs: 1.75, md: 2.25 },
                  py: { xs: 2, md: 2.5 },
                  minHeight: { xs: 96, md: 108 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 1,
                  borderRadius: 2.5,
                  border: `1px solid ${colors.border}`,
                  bgcolor: colors.elevated,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      fontSize: { xs: "0.65rem", md: "0.7rem" },
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(255,255,255,0.04)",
                      color: item.accent,
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 16 }} />
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontFamily: "Orbitron, sans-serif",
                    fontWeight: 800,
                    fontSize: { xs: "1.6rem", md: "1.85rem" },
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    background: `linear-gradient(180deg, #fff 30%, ${item.accent})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

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
