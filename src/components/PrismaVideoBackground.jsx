import { useRef, useState } from "react";
import { Box } from "@mui/material";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

export default function PrismaVideoBackground({ sx }) {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        bgcolor: "#050508",
        ...sx,
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setLoaded(true)}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
        src={VIDEO_SRC}
      />

      <Box
        className="prisma-noise-overlay"
        sx={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          opacity: 0.7,
          mixBlendMode: "overlay",
        }}
      />

      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 45%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(245,197,24,0.06) 0%, transparent 55%),
            linear-gradient(180deg, rgba(5,5,8,0.15) 0%, rgba(5,5,8,0.35) 100%)
          `,
        }}
      />
    </Box>
  );
}
