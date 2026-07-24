import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

export default function AppLayout() {
  const { user, booting, logoutUser } = useAuth();

  if (booting) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#050508",
        }}
      >
        <CircularProgress sx={{ color: "#F5C518" }} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        height: "100dvh",
        maxHeight: "100dvh",
        width: "100%",
        bgcolor: "#050508",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Navbar user={user} onLogout={logoutUser} />
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Outlet context={{ user }} />
      </Box>
    </Box>
  );
}
