import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
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
  CircularProgress,
  Tooltip,
  Paper,
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
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getAvatarColor = (name: string) => {
  const colors = ["#1976d2", "#388e3c", "#f57c00", "#d32f2f", "#7b1fa2", "#00796b"];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

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

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  const handleAction = (action: string) => {
    console.log(action, selectedUser);
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: getAvatarColor(params.row.name),
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {getInitials(params.row.name)}
        </Avatar>
      ),
    },
    { field: "name", headerName: "Name", width: 200, flex: 1 },
    { field: "email", headerName: "Email", width: 240, flex: 1 },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      renderCell: (params) => params.row.phone || "-",
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.role}
          size="small"
          sx={{
            fontSize: "0.7rem",
            height: "24px",
            fontWeight: 600,
            textTransform: "capitalize",
            background: params.row.role === "admin" ? "#e3f2fd" : "#f5f5f5",
            color: params.row.role === "admin" ? "#1565c0" : "var(--text-secondary)",
            border: `1px solid ${params.row.role === "admin" ? "#bbdefb" : "var(--border-color)"}`,
          }}
        />
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 110,
      renderCell: (params) => (
        <Chip
          icon={params.row.isActive ? <ActiveIcon sx={{ fontSize: "14px !important" }} /> : <BlockIcon sx={{ fontSize: "14px !important" }} />}
          label={params.row.isActive ? "Active" : "Inactive"}
          size="small"
          sx={{
            fontSize: "0.7rem",
            height: "24px",
            fontWeight: 600,
            background: params.row.isActive ? "#e8f5e9" : "#fbe9e7",
            color: params.row.isActive ? "#2e7d32" : "#d84315",
            border: `1px solid ${params.row.isActive ? "#c8e6c9" : "#ffccbc"}`,
            "& .MuiChip-icon": { color: "inherit" },
          }}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Joined",
      width: 140,
      valueGetter: (value) =>
        new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
            setSelectedUser(params.row._id);
          }}
          sx={{ color: "var(--text-secondary)" }}
        >
          <MoreIcon sx={{ fontSize: 20 }} />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#1976d2" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>
            Users
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", mt: 0.5 }}>
            {filtered.length} total users
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
                  <SearchIcon sx={{ fontSize: 20, color: "var(--text-secondary)" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: 260,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: "0.875rem",
              background: "var(--card-bg)",
              "& fieldset": { borderColor: "var(--border-color)" },
              "&:hover fieldset": { borderColor: "#1976d2" },
              "&.Mui-focused fieldset": { borderColor: "#1976d2" },
            },
          }}
        />
      </Box>

      {/* DataGrid */}
      <Paper
        sx={{
          height: "calc(100vh - 220px)",
          width: "100%",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
          background: "var(--card-bg)",
        }}
      >
        <DataGrid
          rows={filtered}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            background: "var(--card-bg)",
            color: "var(--text-primary)",
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              py: "10px",
            },
            "& .MuiDataGrid-columnHeaders": {
              background: "var(--hover-bg)",
              borderBottom: "1px solid var(--border-color)",
            },
            "& .MuiDataGrid-columnHeader": {
              background: "var(--hover-bg)",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-secondary)",
            },
            "& .MuiDataGrid-row": {
              background: "var(--card-bg)",
              "&:hover": { background: "var(--hover-bg) !important" },
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid var(--border-color)",
              background: "var(--card-bg)",
            },
            "& .MuiTablePagination-root": {
              color: "var(--text-secondary)",
            },
            "& .MuiDataGrid-overlay": {
              background: "var(--card-bg)",
            },
            "& .MuiDataGrid-toolbar": {
              background: "var(--card-bg)",
              color: "var(--text-primary)",
            },
            "& .MuiDataGrid-menuIcon": {
              color: "var(--text-secondary)",
            },
            "& .MuiDataGrid-sortIcon": {
              color: "var(--text-secondary)",
            },
            "& .MuiDataGrid-menuOpen .MuiPaper-root": {
              background: "var(--card-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
            },
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => { setAnchorEl(null); setSelectedUser(null); }}
        slotProps={{ paper: { sx: { borderRadius: "8px", border: "1px solid var(--border-color)", mt: 1, minWidth: 160 } } }}
      >
        <MenuItem onClick={() => handleAction("edit")} sx={{ fontSize: "0.875rem" }}>
          <ListItemIcon><EditIcon sx={{ fontSize: 18, color: "var(--text-secondary)" }} /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction("toggle")} sx={{ fontSize: "0.875rem" }}>
          <ListItemIcon><BlockIcon sx={{ fontSize: 18, color: "var(--text-secondary)" }} /></ListItemIcon>
          <ListItemText>Toggle Active</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction("delete")} sx={{ fontSize: "0.875rem", color: "#d32f2f" }}>
          <ListItemIcon><DeleteIcon sx={{ fontSize: 18, color: "#d32f2f" }} /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
