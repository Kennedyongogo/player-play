import { TablePagination, useMediaQuery, useTheme } from "@mui/material";

const responsivePaginationSx = {
  overflow: "visible",
  width: "100%",
  "& .MuiTablePagination-toolbar": {
    flexWrap: "wrap",
    rowGap: 0.5,
    columnGap: 1,
    justifyContent: "flex-end",
    minHeight: { xs: "auto", sm: 52 },
    py: { xs: 1, sm: 0 },
    px: { xs: 0.5, sm: 2 },
  },
  "& .MuiTablePagination-spacer": {
    display: "none",
  },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select":
    {
      fontSize: { xs: "0.8125rem", sm: "0.875rem" },
      my: 0,
    },
  "& .MuiTablePagination-actions": {
    flexShrink: 0,
    ml: { xs: 0, sm: 1 },
  },
};

export default function ResponsiveTablePagination({ sx, ...props }) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <TablePagination
      {...props}
      labelRowsPerPage={compact ? "Rows:" : "Rows per page:"}
      labelDisplayedRows={
        props.labelDisplayedRows ||
        (({ from, to, count }) =>
          compact
            ? `${from}–${to}/${count !== -1 ? count : to}`
            : `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`)
      }
      sx={{ ...responsivePaginationSx, ...sx }}
    />
  );
}
