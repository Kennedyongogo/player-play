import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

/**
 * Battlegrounds HQ wordmark / mark.
 * variant: "full" | "mark" | "nav"
 */
export default function BrandLogo({
  variant = "nav",
  to = "/",
  height,
  sx = {},
  link = true,
}) {
  const heights = {
    mark: height || 40,
    nav: height || 44,
    full: height || 56,
  };
  const h = heights[variant] || 44;
  const src = variant === "mark" ? "/favicon-mark.png" : "/logo.png";

  const img = (
    <Box
      component="img"
      src={src}
      alt="Battlegrounds HQ"
      sx={{
        height: h,
        width: "auto",
        maxWidth: variant === "full" ? 280 : variant === "nav" ? 200 : h,
        objectFit: "contain",
        display: "block",
        ...sx,
      }}
    />
  );

  if (!link) return img;

  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 0,
        color: "inherit",
      }}
    >
      {img}
    </Box>
  );
}
