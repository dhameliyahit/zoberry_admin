import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  Toolbar,
  IconButton,
  Avatar,
  Tooltip,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Categories", icon: <CategoryIcon />, path: "/categories" },
  { text: "Users", icon: <PeopleIcon />, path: "/users" },
];

interface SidebarProps {
  drawerOpen: boolean;
  collapsed: boolean;
  onDrawerClose: () => void;
  onToggleCollapse: () => void;
  darkMode: boolean;
}

export default function Sidebar({
  drawerOpen,
  collapsed,
  onDrawerClose,
  onToggleCollapse,
  darkMode,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    onDrawerClose();
  };

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: darkMode ? "#0a0a0a" : "#000000",
        transition: "all 0.3s ease",
      }}
    >
      {/* Logo */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 1 : 2,
          py: 1.5,
          minHeight: "64px !important",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
          <Avatar
            sx={{
              bgcolor: "#ffffff",
              color: "#000000",
              width: 36,
              height: 36,
              fontSize: "1rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Z
          </Avatar>
          {!collapsed && (
            <Box sx={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  lineHeight: 1.2,
                }}
              >
                Zoberry
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#a1a1aa", fontSize: "0.65rem" }}
              >
                Admin Panel
              </Typography>
            </Box>
          )}
        </Box>
        {!collapsed && (
          <Box
            onClick={onToggleCollapse}
            sx={{
              cursor: "pointer",
              color: "#a1a1aa",
              display: { xs: "none", md: "flex" },
              "&:hover": { color: "#ffffff" },
              transition: "color 0.2s",
            }}
          >
            <ChevronLeft fontSize="small" />
          </Box>
        )}
      </Toolbar>

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2, px: collapsed ? 1 : 1.5 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: "8px",
                    minHeight: 44,
                    justifyContent: collapsed ? "center" : "initial",
                    px: collapsed ? 1 : 2,
                    color: isActive ? "#ffffff" : "#a1a1aa",
                    background: isActive ? "#ffffff" : "transparent",
                    "&:hover": {
                      background: isActive ? "#ffffff" : "rgba(255,255,255,0.05)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "#000000" : "inherit",
                      minWidth: collapsed ? 0 : 40,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: "0.875rem",
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "#000000" : "inherit",
                          },
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Collapse/Expand toggle at bottom */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          justifyContent: collapsed ? "center" : "flex-end",
          px: collapsed ? 1 : 2,
          pb: 2,
        }}
      >
        {collapsed && (
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              onClick={onToggleCollapse}
              sx={{
                color: "#a1a1aa",
                "&:hover": { color: "#ffffff", background: "rgba(255,255,255,0.05)" },
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={onDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          transition: "width 0.3s ease",
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            border: "none",
            borderRight: darkMode ? "1px solid #262626" : "1px solid #1a1a1a",
            transition: "width 0.3s ease",
            overflowX: "hidden",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
