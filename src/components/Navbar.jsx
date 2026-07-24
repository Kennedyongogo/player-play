import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountBalanceWallet,
  Logout,
  SportsEsports,
  Settings,
} from "@mui/icons-material";

const NAV_ITEMS = [
  { label: "Play", path: "/play", icon: SportsEsports },
  { label: "My Wallet", path: "/wallet", icon: AccountBalanceWallet },
  { label: "Profile & Settings", shortLabel: "Settings", path: "/settings", icon: Settings },
];

export default function Navbar({ user, onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setDrawerOpen(false);
    onLogout();
    navigate("/", { replace: true });
  };

  const navLink = (item) => {
    const selected = location.pathname === item.path;
    const common = {
      borderRadius: 2,
      mb: 0.5,
      opacity: item.disabled ? 0.45 : 1,
      pointerEvents: item.disabled ? "none" : "auto",
    };

    return (
      <ListItemButton
        key={item.path}
        component={RouterLink}
        to={item.path}
        selected={selected}
        onClick={() => setDrawerOpen(false)}
        sx={{
          ...common,
          "&.Mui-selected": {
            bgcolor: "rgba(245,197,24,0.12)",
            border: "1px solid rgba(245,197,24,0.25)",
            "&:hover": { bgcolor: "rgba(245,197,24,0.18)" },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: selected ? "#F5C518" : "text.secondary" }}>
          <item.icon />
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontWeight: 700, fontSize: "0.95rem" }}
        />
      </ListItemButton>
    );
  };

  const drawerContent = (
    <Box sx={{ width: 280, height: "100%", display: "flex", flexDirection: "column", bgcolor: "#0a0a12" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={logoSx}>CQ</Box>
          <Typography fontWeight={800}>ChapaQuiz</Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
      <Box sx={{ p: 1.5, flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, py: 1, display: "block", fontWeight: 600 }}>
          MENU
        </Typography>
        <List disablePadding>{NAV_ITEMS.map(navLink)}</List>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25 }}>
          {user.nickname}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          {user.phone}
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            borderColor: "rgba(255,255,255,0.12)",
            color: "text.secondary",
            "&:hover": { borderColor: "rgba(255,255,255,0.25)", bgcolor: "rgba(255,255,255,0.04)" },
          }}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(5,5,8,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
          {isMobile ? (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              sx={{ color: "#F5C518" }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}

          <Box
            component={RouterLink}
            to="/play"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              color: "inherit",
              mr: isMobile ? "auto" : 2,
            }}
          >
            <Box sx={{ ...logoSx, width: 36, height: 36, fontSize: "0.85rem", borderRadius: "12px" }}>CQ</Box>
            <Typography
              fontWeight={800}
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, display: { xs: "none", sm: "block" } }}
            >
              ChapaQuiz
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
              {NAV_ITEMS.map((item) => {
                const selected = location.pathname === item.path;
                if (item.disabled) {
                  return (
                    <Button
                      key={item.path}
                      disabled
                      startIcon={<item.icon />}
                      sx={{ color: "text.secondary", opacity: 0.5 }}
                    >
                      {item.label}
                    </Button>
                  );
                }
                return (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    startIcon={<item.icon />}
                    sx={{
                      fontWeight: 700,
                      color: selected ? "#F5C518" : "text.secondary",
                      bgcolor: selected ? "rgba(245,197,24,0.1)" : "transparent",
                      "&:hover": { bgcolor: "rgba(245,197,24,0.08)", color: "#F5C518" },
                    }}
                  >
                    {item.shortLabel || item.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {isMobile ? (
            <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.85rem" }}>
              {user.nickname}
            </Typography>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                  {user.nickname}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.phone}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  borderColor: "rgba(255,255,255,0.12)",
                  color: "text.secondary",
                  "&:hover": { borderColor: "rgba(255,255,255,0.25)", bgcolor: "rgba(255,255,255,0.04)" },
                }}
              >
                Sign out
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { border: "none" } }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

const logoSx = {
  background: "linear-gradient(135deg, #F5C518 0%, #FF9F1C 100%)",
  color: "#050508",
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 16px rgba(245,197,24,0.35)",
};
