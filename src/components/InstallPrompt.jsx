import { Box, Button, IconButton, Paper, Stack, Typography, alpha } from "@mui/material";
import { Close, GetApp, IosShare, InstallMobile, MoreVert } from "@mui/icons-material";
import { usePwaInstall } from "../hooks/usePwaInstall";

function installMessage(props) {
  const {
    showInsecureWarning,
    showIosHint,
    showAndroidManual,
    showDesktopManual,
    showDesktopInstall,
    showAndroidNative,
  } = props;

  if (showInsecureWarning) {
    return "Install needs HTTPS. On your phone, open the deployed site (https://…) or use localhost on the same PC — not http://192.168.x.x.";
  }
  if (showIosHint) {
    return "Add ChapaQuiz to your home screen — tap Share, then “Add to Home Screen”.";
  }
  if (showAndroidManual) {
    return "Tap the menu (⋮) in Chrome, then “Install app” or “Add to Home screen”.";
  }
  if (showDesktopManual) {
    return "Click the install icon in Chrome’s address bar (⊕ or computer icon), or use menu → Install ChapaQuiz.";
  }
  if (showDesktopInstall || showAndroidNative) {
    return "Install ChapaQuiz for quick access and a full-screen app experience.";
  }
  return "Install ChapaQuiz for quick access.";
}

export default function InstallPrompt() {
  const pwa = usePwaInstall();
  const {
    visible,
    showIosHint,
    showAndroidManual,
    showDesktopManual,
    showInsecureWarning,
    showAndroidNative,
    showDesktopInstall,
    dismiss,
    promptInstall,
  } = pwa;

  if (!visible) return null;

  const showInstallButton = showAndroidNative || showDesktopInstall;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1400,
        px: { xs: 1.5, sm: 2 },
        pb: "max(12px, env(safe-area-inset-bottom))",
        pointerEvents: "none",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          pointerEvents: "auto",
          mx: "auto",
          maxWidth: 520,
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          bgcolor: "rgba(12,12,20,0.96)",
          border: `1px solid ${alpha(showInsecureWarning ? "#FF4D6A" : "#F5C518", 0.35)}`,
          backgroundImage: `linear-gradient(135deg, ${alpha(showInsecureWarning ? "#FF4D6A" : "#F5C518", 0.08)} 0%, rgba(12,12,20,0.98) 100%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            component="img"
            src="/icon-192.png"
            alt=""
            sx={{ width: 44, height: 44, borderRadius: 2, flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.3 }}>
              {showInsecureWarning ? "Install unavailable on this link" : "Install ChapaQuiz"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {installMessage(pwa)}
            </Typography>
            {showInstallButton && (
              <Button
                size="small"
                variant="contained"
                startIcon={<GetApp />}
                onClick={promptInstall}
                sx={{
                  mt: 1.25,
                  bgcolor: "#F5C518",
                  color: "#050508",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#FFE566" },
                }}
              >
                Install app
              </Button>
            )}
            {showIosHint && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.25 }}>
                <IosShare sx={{ fontSize: 18, color: "#F5C518" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Safari → Share → Add to Home Screen
                </Typography>
              </Stack>
            )}
            {showAndroidManual && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.25 }}>
                <MoreVert sx={{ fontSize: 18, color: "#F5C518" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Chrome menu → Install app
                </Typography>
              </Stack>
            )}
            {showDesktopManual && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.25 }}>
                <InstallMobile sx={{ fontSize: 18, color: "#F5C518" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Address bar install icon or ⋮ → Install ChapaQuiz
                </Typography>
              </Stack>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            sx={{ color: "text.secondary", mt: -0.5, mr: -0.5 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
}
