import { Box } from "@mui/material";

/** Full-width page wrapper — stretches edge-to-edge with small gutters only */
export default function PageShell({ children }) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
        pt: { xs: 2, sm: 2.5 },
        pb: { xs: 4, sm: 3 },
        minHeight: "min-content",
      }}
    >
      {children}
    </Box>
  );
}
