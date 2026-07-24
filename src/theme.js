import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#F5C518", light: "#FFE566", dark: "#C9A000" },
    secondary: { main: "#10F0A0", light: "#5CFFD0", dark: "#00C484" },
    background: { default: "#050508", paper: "#0E0E16" },
    text: { primary: "#FAFAFA", secondary: "#8B8FA3" },
    error: { main: "#FF4D6A" },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.04em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 800, letterSpacing: "-0.03em" },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
  breakpoints: {
    values: { xs: 0, sm: 480, md: 768, lg: 1024, xl: 1280 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 14, padding: "13px 28px", fontSize: "0.95rem" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.03)",
            transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
            "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.18)" },
            "&.Mui-focused": {
              backgroundColor: "rgba(255,255,255,0.05)",
              boxShadow: "0 0 0 3px rgba(245,197,24,0.15)",
              "& fieldset": { borderColor: "#F5C518" },
            },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: "#F5C518" },
          "& .MuiFormHelperText-root": { mx: 0.5 },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, border: "1px solid rgba(255,77,106,0.25)" },
      },
    },
  },
});
