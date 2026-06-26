import { Box, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--text-primary)", mb: 1 }}>
        Dashboard
      </Typography>
      <Typography variant="body1" sx={{ color: "var(--text-secondary)" }}>
        Welcome back! Here's an overview of your admin panel.
      </Typography>
    </Box>
  );
}
