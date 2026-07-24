import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyLobbyCodes, getMyRegistrations, getNotifications } from "../api";
import { formatDate } from "../constants";
import { colors } from "../theme";
import StatusBadge from "../components/StatusBadge";

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

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your competitive hub for {user?.preferredRegion || "APAC South"}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["Registrations", regs.length],
          ["Upcoming", schedule.length],
          ["Alerts", notes.length],
          ["Teams", teams.length],
        ].map(([label, value]) => (
          <Grid item xs={6} md={3} key={label}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography sx={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 2 }}>
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 2 }}>
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

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Quick actions
              </Typography>
              <Stack spacing={1}>
                <Button component={RouterLink} to="/tournaments" variant="contained">
                  Register for tournament
                </Button>
                <Button component={RouterLink} to="/schedule" variant="outlined">
                  View lobby codes
                </Button>
                {isCaptain && (
                  <Button component={RouterLink} to="/team" variant="outlined">
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
        </Grid>
      </Grid>
    </Box>
  );
}
