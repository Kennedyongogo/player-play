import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { acceptInvite } from "../api";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";
import { showError } from "../utils/swal";

export default function AcceptInvitePage() {
  const { code: paramCode } = useParams();
  const [code, setCode] = useState(paramCode || "");
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const onAccept = async () => {
    setLoading(true);
    try {
      await acceptInvite(code.trim());
      await refreshUser();
      navigate("/team");
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent>
          <BrandLogo variant="full" height={64} link={false} sx={{ mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1 }}>
            Accept team invite
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Enter the invite code from your captain.
          </Typography>
          <Stack spacing={2}>
            <TextField label="Invite code" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
            <Button variant="contained" onClick={onAccept} disabled={loading || !code}>
              {loading ? "Joining..." : "Join team"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
