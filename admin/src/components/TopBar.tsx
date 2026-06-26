import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

interface TopBarProps {
  onMenuClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  sidebarWidth: string; // Enforced string type for fluid css math compatibility
}

export default function TopBar({
  onMenuClick,
  darkMode,
  onToggleDarkMode,
  sidebarWidth,
}: TopBarProps) {
  const bgColor = darkMode ? "rgba(18, 18, 18, 0.85)" : "rgba(255, 255, 255, 0.85)";
  const textColor = darkMode ? "#e2e8f0" : "#1e293b"; 
  const subTextColor = darkMode ? "#94a3b8" : "#64748b";
  const hoverBgColor = darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)";
  const borderColor = darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        // Uses standard css calc function to compensate for fluid 10% sidebar sizing
        width: { md: `calc(100% - ${sidebarWidth})` },
        ml: { md: sidebarWidth },
        background: bgColor,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${borderColor}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Toolbar sx={{ minHeight: "72px !important", px: { xs: 2, md: 3 } }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" }, color: textColor }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          sx={{
            fontWeight: 700,
            fontSize: "1.05rem",
            color: textColor,
            letterSpacing: "-0.01em",
          }}
        >
          Zoberry Enterprise
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Tooltip title="Notifications" arrow>
            <IconButton sx={{ color: subTextColor, "&:hover": { color: textColor, background: hoverBgColor } }}>
              <NotificationsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={darkMode ? "Light mode" : "Dark mode"} arrow>
            <IconButton onClick={onToggleDarkMode} sx={{ color: subTextColor, "&:hover": { color: textColor, background: hoverBgColor } }}>
              {darkMode ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 32,
              height: 32,
              ml: 1,
              bgcolor: textColor,
              color: darkMode ? "#121212" : "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            A
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}