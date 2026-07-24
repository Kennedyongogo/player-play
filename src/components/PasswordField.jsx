import { useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

/** Password TextField with eye icon to show / hide value. */
export default function PasswordField({
  label = "Password",
  value,
  onChange,
  required,
  fullWidth = true,
  autoComplete,
  size,
  ...rest
}) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      required={required}
      fullWidth={fullWidth}
      size={size}
      autoComplete={autoComplete}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShow((s) => !s)}
              onMouseDown={(e) => e.preventDefault()}
              edge="end"
              size="small"
              aria-label={show ? "Hide password" : "Show password"}
              sx={{ color: "text.secondary" }}
            >
              {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...rest}
    />
  );
}
