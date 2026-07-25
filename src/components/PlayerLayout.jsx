import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUnreadCount } from "../api";
import { colors } from "../theme";
import BrandLogo from "./BrandLogo";

const UNREAD_POLL_MS = 30000;

const WIDTH = 260;

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardOutlinedIcon /> },
  { to: "/team", label: "My Team", icon: <GroupsOutlinedIcon /> },
  { to: "/tournaments", label: "Tournaments", icon: <EmojiEventsOutlinedIcon /> },
  { to: "/schedule", label: "Match Schedule", icon: <CalendarMonthOutlinedIcon /> },
  { to: "/stats", label: "Statistics", icon: <BarChartOutlinedIcon /> },
  { to: "/notifications", label: "Notifications", icon: <NotificationsOutlinedIcon /> },
  { to: "/profile", label: "Profile", icon: <PersonOutlineIcon /> },
];

function SideNav({ onNavigate }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: colors.surface }}>
      <Box sx={{ px: 2, py: 2.5 }}>
        <BrandLogo variant="nav" height={48} to="/dashboard" />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, pl: 0.5 }}>
          Player Portal
        </Typography>
      </Box>
      <Divider sx={{ borderColor: colors.border }} />
      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {NAV.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={onNavigate}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.active": {
                bgcolor: "rgba(124,58,237,0.18)",
                color: colors.primaryLight,
                "& .MuiListItemIcon-root": { color: colors.primaryLight },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ borderColor: colors.border }} />
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
          {(user?.username || "?").slice(0, 1).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap fontWeight={700} fontSize={14}>
            {user?.username}
          </Typography>
          <Typography noWrap variant="caption" color="text.secondary">
            {user?.preferredRegion || "Player"}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => {
            logoutUser();
            navigate("/login");
          }}
          title="Log out"
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default function PlayerLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    let alive = true;
    const load = () => {
      getUnreadCount()
        .then((res) => {
          if (alive) setUnreadCount(res.data?.unreadCount || 0);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, UNREAD_POLL_MS);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", bgcolor: "background.default" }}>
      {!isMobile && (
        <Box
          component="aside"
          sx={{
            width: WIDTH,
            flexShrink: 0,
            borderRight: `1px solid ${colors.border}`,
            position: "sticky",
            top: 0,
            height: "100dvh",
          }}
        >
          <SideNav />
        </Box>
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: WIDTH, bgcolor: colors.surface } }}
      >
        <SideNav onNavigate={() => setOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            px: { xs: 2, md: 3 },
            py: 1.5,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: "rgba(11,15,26,0.9)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setOpen(true)} color="inherit">
              <MenuIcon />
            </IconButton>
          )}
          <Typography sx={{ flex: 1, fontWeight: 700 }}>
            Welcome{user?.username ? `, ${user.username}` : ""}
          </Typography>
          <IconButton component={NavLink} to="/notifications" color="inherit">
            <Badge color="error" badgeContent={unreadCount} max={99} invisible={unreadCount === 0}>
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, width: "100%" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
