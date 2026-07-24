import { createTheme } from "@mui/material/styles";

export const colors = {
  bg: "#0B0F1A",
  surface: "#111827",
  elevated: "#1A2234",
  border: "rgba(255,255,255,0.08)",
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  accent: "#00C2FF",
  cyan: "#22D3EE",
  success: "#34C759",
  warning: "#FFC107",
  danger: "#FF3B30",
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: colors.primary, light: colors.primaryLight, dark: "#5B21B6" },
    secondary: { main: colors.accent, light: "#67E8F9", dark: "#0891B2" },
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.danger },
    background: { default: colors.bg, paper: colors.surface },
    text: { primary: "#F8FAFC", secondary: "#94A3B8" },
    divider: colors.border,
  },
  typography: {
    fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 700,
    },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: colors.bg },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 22px",
          fontSize: "0.95rem",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
          },
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.16)",
          "&:hover": {
            borderColor: colors.primary,
            background: "rgba(124,58,237,0.08)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.03)",
            "& fieldset": { borderColor: colors.border },
            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.18)" },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(124,58,237,0.2)",
              "& fieldset": { borderColor: colors.primary },
            },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: colors.primaryLight },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(11,15,26,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
  },
});
