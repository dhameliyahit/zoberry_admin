import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar, ThemeProvider, CssBaseline } from "@mui/material";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import getTheme from "../theme";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleToggleCollapse = () => setCollapsed(!collapsed);
  const handleToggleDarkMode = () => setDarkMode(!darkMode);

  const theme = getTheme(darkMode);
  const sidebarWidth = `${collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px`;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", background: "var(--bg-secondary)" }}>
        <Sidebar
          drawerOpen={mobileOpen}
          collapsed={collapsed}
          onDrawerClose={handleDrawerToggle}
          onToggleCollapse={handleToggleCollapse}
          darkMode={darkMode}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${sidebarWidth}px)` },
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease",
          }}
        >
          <TopBar
            onMenuClick={handleDrawerToggle}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            sidebarWidth={sidebarWidth}
          />

          <Toolbar sx={{ minHeight: "64px !important" }} />

          <Box
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3 },
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
