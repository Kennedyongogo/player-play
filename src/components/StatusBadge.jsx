import { Chip } from "@mui/material";
import { STATUS_COLORS } from "../constants";

export default function StatusBadge({ status }) {
  const label = String(status || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const color = STATUS_COLORS[status] || "#94A3B8";

  return (
    <Chip
      size="small"
      label={label}
      sx={{
        bgcolor: `${color}22`,
        color,
        border: `1px solid ${color}55`,
        fontWeight: 700,
        height: 26,
      }}
    />
  );
}
