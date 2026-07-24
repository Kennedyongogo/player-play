import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getMyLobbyCodes } from "../api";
import { formatDate } from "../constants";
import StatusBadge from "../components/StatusBadge";
import { colors } from "../theme";

export default function SchedulePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getMyLobbyCodes()
      .then((res) => setItems(res.data?.assignments || []))
      .catch(() => setItems([]));
  }, []);

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // ignore
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Match Schedule
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Lobby assignments and player codes for your teams.
      </Typography>

      <Grid container spacing={2}>
        {items.map((a) => (
          <Grid item xs={12} md={6} key={a.id}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <StatusBadge status={a.lobby?.status || "open"} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(a.lobby?.scheduledAt)}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem" }}>
                  {a.lobby?.tournament?.name || "Tournament"}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {a.lobby?.name} · {a.team?.name}
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(0,194,255,0.1)",
                    border: "1px solid rgba(0,194,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="secondary.main">
                      PLAYER LOBBY CODE
                    </Typography>
                    <Typography fontWeight={800} letterSpacing={1.5} fontSize="1.1rem">
                      {a.playerCode}
                    </Typography>
                  </Box>
                  <Button startIcon={<ContentCopyIcon />} onClick={() => copy(a.playerCode)} size="small">
                    Copy
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {items.length === 0 && (
        <Typography color="text.secondary">No lobby assignments yet.</Typography>
      )}
    </Box>
  );
}
