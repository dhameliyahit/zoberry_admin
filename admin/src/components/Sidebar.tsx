import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  ChevronRight,
  OndemandVideo as VideoIcon,
} from "@mui/icons-material";

// Fluid dynamic widths based on your 10% design parameters
export const SIDEBAR_EXPANDED_WIDTH = "max(10vw, 220px)"; 
export const SIDEBAR_COLLAPSED_WIDTH = "72px";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Categories", icon: <CategoryIcon />, path: "/categories" },
  { text: "Products", icon: <InventoryIcon />, path: "/products" },
  { text: "Hero Videos", icon: <VideoIcon />, path: "/hero-videos" },
  { text: "Users", icon: <PeopleIcon />, path: "/users" },
  { text: "Orders", icon: <ReceiptIcon />, path: "/orders" },
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

  const bgColor = darkMode ? "#000000" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const subTextColor = darkMode ? "#aaaaaa" : "#666666";
  const activeBgColor = darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)";
  const hoverBgColor = darkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)";
  const borderColor = darkMode ? "#222222" : "#e0e0e0";
  const accentColor = darkMode ? "#ffffff" : "#000000";

  const currentWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

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
        background: bgColor,
        backdropFilter: "blur(10px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        pt: 1,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            const buttonContent = (
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 0,
                  minHeight: 48,
                  justifyContent: collapsed ? "center" : "initial",
                  px: collapsed ? 1.5 : 2.5,
                  color: isActive ? textColor : subTextColor,
                  background: isActive ? activeBgColor : "transparent",
                  position: "relative",
                  "&:hover": {
                    background: isActive ? activeBgColor : hoverBgColor,
                    color: textColor,
                    "& .MuiListItemIcon-root": { color: textColor },
                  },
                  transition: "all 0.15s ease",
                  "&::before": isActive && !collapsed ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    backgroundColor: accentColor,
                  } : {},
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? textColor : "inherit",
                    minWidth: collapsed ? 0 : 36,
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
                          fontSize: "0.9rem",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? textColor : "inherit",
                          marginLeft: 0.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      },
                    }}
                  />
                )}
              </ListItemButton>
            );

            return (
              <ListItem key={item.text} disablePadding>
                {collapsed ? (
                  <Tooltip title={item.text} placement="right" arrow>
                    {buttonContent}
                  </Tooltip>
                ) : (
                  buttonContent
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {collapsed && (
        <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", pb: 3 }}>
          <Tooltip title="Expand sidebar" placement="right" arrow>
            <IconButton
              onClick={onToggleCollapse}
              sx={{
                color: subTextColor,
                background: hoverBgColor,
                "&:hover": { color: textColor, background: activeBgColor },
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={onDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 260,
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: currentWidth,
          flexShrink: 0,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: currentWidth,
            border: "none",
            borderRight: `1px solid ${borderColor}`,
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflowX: "hidden",
            background: "transparent",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}