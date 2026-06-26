import { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  LinearProgress,
  Paper,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
} from "@mui/icons-material";
import api from "../services/api";

const BulkDeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
  </svg>
);

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const getAvatarColor = (name: string) => {
  const colors = ["#1976d2", "#388e3c", "#f57c00", "#d32f2f", "#7b1fa2", "#00796b"];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function Users() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredRows = useMemo(() => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
    );
  }, [users, search]);

  const handleAction = (action: string) => {
    console.log(action, selectedUser);
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleBulkDelete = () => {
    console.log("Bulk delete items:", Array.from(rowSelectionModel.ids));
  };

  const columns: GridColDef[] = [
    {
      field: "identity",
      headerName: "User",
      width: 280,
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%" }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: getAvatarColor(params.row.name),
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {getInitials(params.row.name)}
          </Avatar>
          <Box sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              {params.row.name}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: theme.palette.text.secondary }}
            >
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {params.row.phone || "\u2014"}
        </Typography>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params) => {
        const isAdmin = params.row.role?.toLowerCase() === "admin";
        return (
          <Chip
            label={params.row.role}
            size="small"
            sx={{
              fontSize: "0.75rem",
              height: "24px",
              fontWeight: 600,
              textTransform: "capitalize",
              borderRadius: "6px",
              background: isAdmin
                ? alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08)
                : alpha(theme.palette.text.secondary, 0.08),
              color: isAdmin ? theme.palette.primary.main : theme.palette.text.secondary,
              border: `1px solid ${isAdmin ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.divider, 0.1)}`,
            }}
          />
        );
      },
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const active = params.row.isActive;
        return (
          <Chip
            icon={active ? <ActiveIcon sx={{ fontSize: "14px !important" }} /> : <BlockIcon sx={{ fontSize: "14px !important" }} />}
            label={active ? "Active" : "Inactive"}
            size="small"
            sx={{
              fontSize: "0.75rem",
              height: "24px",
              fontWeight: 600,
              borderRadius: "6px",
              background: active
                ? alpha(theme.palette.success.main, isDark ? 0.15 : 0.08)
                : alpha(theme.palette.error.main, isDark ? 0.15 : 0.08),
              color: active ? theme.palette.success.main : theme.palette.error.main,
              border: `1px solid ${active ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`,
              "& .MuiChip-icon": { color: "inherit" },
            }}
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Joined",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {new Date(params.row.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "right",
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
            setSelectedUser(params.row._id);
          }}
          sx={{ color: theme.palette.text.secondary }}
        >
          <MoreIcon sx={{ fontSize: 20 }} />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          p: rowSelectionModel.ids.size > 0 ? 2 : 0,
          borderRadius: "8px",
          bgcolor: rowSelectionModel.ids.size > 0 ? alpha(theme.palette.primary.main, 0.04) : "transparent",
          transition: "all 0.2s ease-in-out",
        }}
      >
        {rowSelectionModel.ids.size > 0 ? (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              {rowSelectionModel.ids.size} row{rowSelectionModel.ids.size > 1 ? "s" : ""} selected
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<BulkDeleteIcon />}
              onClick={handleBulkDelete}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: "6px" }}
            >
              Delete Selected
            </Button>
          </>
        ) : (
          <>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
                Users
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
                {filteredRows.length} total users managed
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: 280,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  backgroundColor: theme.palette.background.paper,
                  transition: "box-shadow 0.15s ease",
                  "& fieldset": { borderColor: theme.palette.divider },
                  "&:hover fieldset": { borderColor: alpha(theme.palette.text.primary, 0.25) },
                  "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main, borderWidth: "1px" },
                  "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` },
                },
              }}
            />
          </>
        )}
      </Box>

      {/* Table */}
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          borderRadius: "10px",
          overflow: "hidden",
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper,
          position: "relative",
        }}
      >
        {loading && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 10 }} />}

        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => {
            setRowSelectionModel(newSelection);
          }}
          rowSelectionModel={rowSelectionModel}
          rowHeight={64}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: isDark ? alpha(theme.palette.background.default, 0.4) : "#f8f9fa",
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-columnHeader": {
              "&:focus, &:focus-within": { outline: "none" },
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: theme.palette.text.secondary,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${theme.palette.divider}`,
              alignItems: "center",
              display: "flex",
              "&:focus, &:focus-within": { outline: "none" },
            },
            "& .MuiDataGrid-row": {
              transition: "background-color 0.15s ease",
              "&:hover": {
                backgroundColor: isDark ? alpha("#ffffff", 0.02) : "#fdfdfd",
              },
              "&.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.07) },
              },
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiTablePagination-root": {
              color: theme.palette.text.secondary,
            },
            "& .MuiTablePagination-selectLabel": {
              color: theme.palette.text.secondary,
            },
            "& .MuiTablePagination-displayedRows": {
              color: theme.palette.text.secondary,
            },
            "& .MuiTablePagination-actions": {
              color: theme.palette.text.secondary,
            },
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => { setAnchorEl(null); setSelectedUser(null); }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "8px",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
              border: `1px solid ${theme.palette.divider}`,
              mt: 0.5,
              minWidth: 160,
            },
          },
        }}
      >
        <MenuItem onClick={() => handleAction("edit")} sx={{ fontSize: "0.875rem", py: 1 }}>
          <ListItemIcon><EditIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} /></ListItemIcon>
          <ListItemText>Edit details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction("toggle")} sx={{ fontSize: "0.875rem", py: 1 }}>
          <ListItemIcon><BlockIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} /></ListItemIcon>
          <ListItemText>Toggle visibility</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction("delete")} sx={{ fontSize: "0.875rem", py: 1, color: theme.palette.error.main }}>
          <ListItemIcon><DeleteIcon sx={{ fontSize: 18, color: theme.palette.error.main }} /></ListItemIcon>
          <ListItemText>Remove user</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
