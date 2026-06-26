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
  sidebarWidth: number;
}

export default function TopBar({
  onMenuClick,
  darkMode,
  onToggleDarkMode,
  sidebarWidth,
}: TopBarProps) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
        background: darkMode ? "#0a0a0a" : "#ffffff",
        borderBottom: darkMode ? "1px solid #262626" : "1px solid #e5e5e5",
        transition: "all 0.3s ease",
      }}
    >
      <Toolbar sx={{ minHeight: "64px !important", px: { xs: 2, md: 3 } }}>
        {/* Mobile Menu Button */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{
            mr: 2,
            display: { md: "none" },
            color: darkMode ? "#fafafa" : "#111111",
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography
          variant="h6"
          noWrap
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: darkMode ? "#fafafa" : "#111111",
            letterSpacing: "-0.01em",
          }}
        >
          Zoberry Enterprise
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* Right Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              sx={{
                color: darkMode ? "#a1a1aa" : "#6b7280",
                "&:hover": { background: darkMode ? "#1a1a1a" : "#f3f4f6" },
              }}
            >
              <NotificationsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
            <IconButton
              onClick={onToggleDarkMode}
              sx={{
                color: darkMode ? "#a1a1aa" : "#6b7280",
                "&:hover": { background: darkMode ? "#1a1a1a" : "#f3f4f6" },
              }}
            >
              {darkMode ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Tooltip title="Account">
            <IconButton
              sx={{
                ml: 0.5,
                "&:hover": { background: darkMode ? "#1a1a1a" : "#f3f4f6" },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: darkMode ? "#fafafa" : "#111111",
                  color: darkMode ? "#0a0a0a" : "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                A
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
