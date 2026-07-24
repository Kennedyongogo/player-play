import { useEffect, useState } from "react";
import { Box, Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api";
import { formatDate } from "../constants";
import { colors } from "../theme";
import { showError, showInfo } from "../utils/swal";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => {
    getNotifications({ limit: 50, unreadOnly: filter === "unread" ? "true" : undefined })
      .then((res) => {
        const rows = res.data?.notifications || [];
        setItems(rows);
      })
      .catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const markOne = async (id) => {
    try {
      await markNotificationRead(id);
      load();
    } catch {
      // ignore mark read failures
    }
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      showInfo("All marked as read");
      load();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" sx={{ mb: 2 }} spacing={2}>
        <Box>
          <Typography variant="h4">Notifications</Typography>
          <Typography color="text.secondary">Approvals, lobby codes, and announcements</Typography>
        </Box>
        <Button variant="outlined" onClick={markAll}>
          Mark all read
        </Button>
      </Stack>

      <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 2 }}>
        <Tab value="all" label="All" />
        <Tab value="unread" label="Unread" />
      </Tabs>

      <Stack spacing={1}>
        {items.map((n) => (
          <Box
            key={n.id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${colors.border}`,
              bgcolor: n.isRead === false ? "rgba(124,58,237,0.12)" : colors.surface,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography fontWeight={700}>{n.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {n.message || n.detail}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {n.time || formatDate(n.createdAt)} · {n.type}
                </Typography>
              </Box>
              {n.isRead === false && (
                <Button size="small" onClick={() => markOne(n.id)}>
                  Mark read
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
