import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import api from "../services/api";

interface Product {
  _id: string;
  title: string;
  price: number;
}

interface HeroVideo {
  _id: string;
  title: string;
  url: string;
  product: Product | string;
  isActive: boolean;
  order: number;
}

export default function HeroVideos() {
  const theme = useTheme();

  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<HeroVideo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [productId, setProductId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);

  // Snackbar notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/hero-videos");
      setVideos(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch hero videos", err);
      setSnackbar({ open: true, message: "Failed to load videos", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products?limit=200");
      // Check if products are nested inside data.products
      const items = res.data?.data?.products || res.data?.data || [];
      setProducts(items);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchProducts();
  }, [fetchVideos]);

  const handleOpenForm = (video: HeroVideo | null = null) => {
    if (video) {
      setEditingVideo(video);
      setTitle(video.title);
      setUrl(video.url);
      setProductId(typeof video.product === "object" ? video.product._id : video.product);
      setIsActive(video.isActive);
      setOrder(video.order);
    } else {
      setEditingVideo(null);
      setTitle("");
      setUrl("");
      setProductId("");
      setIsActive(true);
      setOrder(videos.length);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingVideo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !productId) {
      setSnackbar({ open: true, message: "Please fill in all required fields", severity: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const payload = { title, url, product: productId, isActive, order };

      if (editingVideo) {
        const res = await api.put(`/hero-videos/${editingVideo._id}`, payload);
        setVideos((prev) =>
          prev.map((v) => (v._id === editingVideo._id ? res.data.data : v))
        );
        setSnackbar({ open: true, message: "Video updated successfully", severity: "success" });
      } else {
        const res = await api.post("/hero-videos", payload);
        setVideos((prev) => [...prev, res.data.data].sort((a, b) => a.order - b.order));
        setSnackbar({ open: true, message: "Video added successfully", severity: "success" });
      }
      handleCloseForm();
    } catch (err) {
      console.error("Failed to save video", err);
      setSnackbar({ open: true, message: "Failed to save video", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      await api.delete(`/hero-videos/${deleteId}`);
      setVideos((prev) => prev.filter((v) => v._id !== deleteId));
      setDeleteId(null);
      setSnackbar({ open: true, message: "Video deleted successfully", severity: "success" });
    } catch (err) {
      console.error("Failed to delete video", err);
      setSnackbar({ open: true, message: "Failed to delete video", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: theme.palette.text.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Manage Hero Videos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            background: theme.palette.text.primary,
            color: theme.palette.background.paper,
            borderRadius: "8px",
            px: 3,
            "&:hover": { background: theme.palette.text.primary, opacity: 0.9 },
          }}
        >
          Add Hero Video
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "none", border: `1px solid ${theme.palette.divider}` }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 650 }}>Order</TableCell>
              <TableCell sx={{ fontWeight: 650 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 650 }}>Video URL</TableCell>
              <TableCell sx={{ fontWeight: 650 }}>Linked Product</TableCell>
              <TableCell sx={{ fontWeight: 650 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 650 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: theme.palette.text.secondary }}>
                  No hero videos found. Click 'Add Hero Video' to create one.
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video._id}>
                  <TableCell>{video.order}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{video.title}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {video.url}
                  </TableCell>
                  <TableCell>
                    {typeof video.product === "object" ? video.product.title : "Unknown Product"}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: video.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(107, 114, 128, 0.1)",
                        color: video.isActive ? "#10b981" : "#6b7280",
                      }}
                    >
                      {video.isActive ? "Active" : "Inactive"}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(video)} size="small" sx={{ mr: 1, color: theme.palette.text.secondary }}>
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton onClick={() => setDeleteId(video._id)} size="small" sx={{ color: theme.palette.error.main }}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
            },
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingVideo ? "Edit Hero Video" : "Add Hero Video"}
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <TextField
              label="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              variant="outlined"
              placeholder="e.g. Smart Kitchen Organizer Demo"
            />
            <TextField
              label="Video URL (YouTube Shorts, Reels, MP4)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
              required
              variant="outlined"
              placeholder="e.g. https://www.youtube.com/shorts/..."
            />
            <FormControl fullWidth required>
              <InputLabel id="product-label">Linked Product</InputLabel>
              <Select
                labelId="product-label"
                value={productId}
                label="Linked Product"
                onChange={(e) => setProductId(e.target.value)}
              >
                {products.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.title} (₹{p.price})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Display Order"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              fullWidth
              variant="outlined"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Active (visible on storefront)"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={handleCloseForm} disabled={submitting} sx={{ textTransform: "none", color: theme.palette.text.secondary }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                textTransform: "none",
                background: theme.palette.text.primary,
                color: theme.palette.background.paper,
                "&:hover": { background: theme.palette.text.primary, opacity: 0.9 },
              }}
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => !submitting && setDeleteId(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Video</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete this hero video? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} disabled={submitting} sx={{ textTransform: "none", color: theme.palette.text.secondary }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={submitting}
            sx={{
              textTransform: "none",
              background: theme.palette.error.main,
              color: "#ffffff",
              "&:hover": { background: theme.palette.error.dark },
            }}
          >
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
