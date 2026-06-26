import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import api from "../services/api";

interface Category {
  _id: string;
  name: string;
  image: string;
}

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/categories/${deleteId}`);
      setCategories((prev) => prev.filter((c) => c._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete category", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#1976d2" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/categories/add")}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            background: "#1976d2",
            color: "#ffffff",
            borderRadius: "8px",
            px: 3,
            boxShadow: "none",
            "&:hover": { background: "#1565c0", boxShadow: "none" },
          }}
        >
          Add Category
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {categories.map((category) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={category._id}>
            <Card
              sx={{
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--card-bg)",
                boxShadow: "none",
                overflow: "hidden",
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={category.image}
                alt={category.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ pb: 1, pt: 2, px: 2 }}>
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontSize: "1.1rem",
                  }}
                >
                  {category.name}
                </Typography>
              </CardContent>
              <CardActions
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  pb: 2,
                  pt: 0,
                }}
              >
                <Button
                  size="small"
                  startIcon={<EditIcon sx={{ fontSize: "16px !important" }} />}
                  onClick={() => navigate(`/categories/edit/${category._id}`)}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#1976d2",
                    background: "transparent",
                    border: "none",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": {
                      background: "transparent",
                      color: "#1565c0",
                    },
                  }}
                >
                  Edit
                </Button>
                <IconButton
                  size="small"
                  onClick={() => setDeleteId(category._id)}
                  sx={{
                    color: "#d32f2f",
                    p: 0,
                    "&:hover": { background: "transparent", color: "#b71c1c" },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={!!deleteId}
        onClose={() => !deleting && setDeleteId(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              background: "var(--card-bg)",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "var(--text-primary)" }}>
          Delete Category
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "var(--text-secondary)" }}>
            Are you sure you want to delete this category? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteId(null)}
            disabled={deleting}
            sx={{ textTransform: "none", color: "var(--text-secondary)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              textTransform: "none",
              background: "#d32f2f",
              color: "#ffffff",
              "&:hover": { background: "#c62828" },
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
