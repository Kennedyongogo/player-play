import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyLobbyCodes, getMyRegistrations, getNotifications } from "../api";
import { formatDate } from "../constants";
import { colors } from "../theme";
import StatusBadge from "../components/StatusBadge";
import LiveScores from "../components/LiveScores";

const KPI = [
  {
    key: "registrations",
    label: "Registrations",
    to: "/tournaments",
    icon: HowToRegOutlinedIcon,
    accent: colors.primaryLight,
  },
  {
    key: "upcoming",
    label: "Upcoming",
    to: "/schedule",
    icon: EventOutlinedIcon,
    accent: colors.accent,
  },
  {
    key: "alerts",
    label: "Alerts",
    to: "/notifications",
    icon: NotificationsOutlinedIcon,
    accent: colors.warning,
  },
  {
    key: "teams",
    label: "Teams",
    to: "/team",
    icon: GroupsOutlinedIcon,
    accent: colors.cyan,
  },
];

export default function DashboardPage() {
  const { user, teams, isCaptain } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [regs, setRegs] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getMyLobbyCodes().catch(() => null),
      getMyRegistrations().catch(() => null),
      getNotifications({ limit: 5 }).catch(() => null),
    ]).then(([lobbies, registrations, notifications]) => {
      if (!alive) return;
      setSchedule(lobbies?.data?.assignments || []);
      setRegs(registrations?.data?.registrations || []);
      setNotes(notifications?.data?.notifications || []);
    });
    return () => {
      alive = false;
    };
  }, []);

  const primaryTeam = teams[0]?.team || teams[0]?.Team;
  const nextMatch = schedule[0];
  const teamIds = teams.map((m) => m.team?.id || m.Team?.id).filter(Boolean);
  const liveTournamentId =
    regs.find((r) => r.status === "approved")?.Tournament?.id || regs[0]?.Tournament?.id || null;
  const kpiValues = {
    registrations: regs.length,
    upcoming: schedule.length,
    alerts: notes.length,
    teams: teams.length,
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Your competitive hub for {user?.preferredRegion || "APAC South"}
      </Typography>

      {/* Full-width KPI strip — 2×2 on small screens with spacing all around */}
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
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: { xs: 1.5, md: 2 },
            width: "100%",
          }}
        >
          {KPI.map((item) => {
            const Icon = item.icon;
            const value = kpiValues[item.key];

            return (
              <Box
                key={item.key}
                component={RouterLink}
                to={item.to}
                sx={{
                  textDecoration: "none",
                  color: "inherit",
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
                  transition: "background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
                  "&:hover": {
                    bgcolor: "rgba(124,58,237,0.14)",
                    borderColor: "rgba(124,58,237,0.45)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
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
                </Stack>
                <Typography
                  sx={{
                    fontFamily: "Orbitron, sans-serif",
                    fontWeight: 800,
                    fontSize: { xs: "1.75rem", md: "2rem" },
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

      <Stack spacing={2}>
        <LiveScores tournamentId={liveTournamentId} teamIds={teamIds} />

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Upcoming match</Typography>
              <Button component={RouterLink} to="/schedule" size="small">
                Full schedule
              </Button>
            </Stack>
            {nextMatch ? (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${colors.border}`,
                  background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(17,24,39,1))",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <StatusBadge status={nextMatch.lobby?.status || "open"} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(nextMatch.lobby?.scheduledAt)}
                  </Typography>
                </Stack>
                <Typography variant="h5" sx={{ fontFamily: "Orbitron, sans-serif", mb: 0.5 }}>
                  {nextMatch.lobby?.tournament?.name || "Match"}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {nextMatch.lobby?.name} · Team {nextMatch.team?.name}
                </Typography>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: "rgba(0,194,255,0.12)",
                    border: "1px solid rgba(0,194,255,0.35)",
                  }}
                >
                  <Typography variant="caption" color="secondary.main">
                    PLAYER CODE
                  </Typography>
                  <Typography fontWeight={800} letterSpacing={1}>
                    {nextMatch.playerCode}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">No upcoming lobby assignments.</Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent activity
            </Typography>
            {notes.length === 0 ? (
              <Typography color="text.secondary">No recent activity yet.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {notes.slice(0, 5).map((n) => (
                  <Box
                    key={n.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: colors.elevated,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Typography fontWeight={700}>{n.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {n.message || n.detail}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.time || formatDate(n.createdAt)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Team status
            </Typography>
            {primaryTeam ? (
              <>
                <Typography variant="h5" fontWeight={700}>
                  {primaryTeam.name}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {teams[0]?.role === "captain" ? "Captain" : "Member"} · {primaryTeam.region}
                </Typography>
                <Button component={RouterLink} to="/team" variant="outlined" fullWidth>
                  Manage team
                </Button>
              </>
            ) : (
              <>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  You’re not on a team yet. Create one or accept an invite.
                </Typography>
                <Button component={RouterLink} to="/team" variant="contained" fullWidth>
                  Create / join team
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Quick actions
            </Typography>
            <Stack spacing={1}>
              <Button component={RouterLink} to="/tournaments" variant="contained" fullWidth>
                Register for tournament
              </Button>
              <Button component={RouterLink} to="/schedule" variant="outlined" fullWidth>
                View lobby codes
              </Button>
              {isCaptain && (
                <Button component={RouterLink} to="/team" variant="outlined" fullWidth>
                  Invite players
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              My registrations
            </Typography>
            {regs.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                No tournament registrations yet.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {regs.slice(0, 4).map((r) => (
                  <Stack key={r.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" noWrap sx={{ maxWidth: "60%" }}>
                      {r.Tournament?.name || "Tournament"}
                    </Typography>
                    <StatusBadge status={r.status} />
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
