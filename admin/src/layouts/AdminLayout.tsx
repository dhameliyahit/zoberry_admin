import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

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

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: darkMode ? "#0a0a0a" : "#f9fafb" }}>
      {/* Sidebar */}
      <Sidebar
        drawerOpen={mobileOpen}
        collapsed={collapsed}
        onDrawerClose={handleDrawerToggle}
        onToggleCollapse={handleToggleCollapse}
        darkMode={darkMode}
      />

      {/* Main Content */}
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
        {/* Top Bar */}
        <TopBar
          onMenuClick={handleDrawerToggle}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          sidebarWidth={sidebarWidth}
        />

        {/* Spacer for fixed AppBar */}
        <Toolbar sx={{ minHeight: "64px !important" }} />

        {/* Page Content */}
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
  );
}
