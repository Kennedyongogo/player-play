import { Navigate, useParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { savePendingInvite } from "../utils/invite";
import JoinInvitePage from "./JoinInvitePage";

export default function JoinInviteGate() {
  const { inviteCode } = useParams();
  const { isAuthenticated, booting } = useAuth();

  if (booting) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#050508" }}>
        <CircularProgress sx={{ color: "#F5C518" }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    savePendingInvite(inviteCode);
    return <Navigate to="/" replace />;
  }

  return <JoinInvitePage />;
}
