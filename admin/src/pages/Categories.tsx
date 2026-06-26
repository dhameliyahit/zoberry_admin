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
  useTheme,
  alpha,
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
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
        <CircularProgress sx={{ color: theme.palette.text.primary }} />
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
            background: theme.palette.text.primary,
            color: theme.palette.background.paper,
            borderRadius: "8px",
            px: 3,
            boxShadow: "none",
            "&:hover": { background: theme.palette.text.primary, boxShadow: "none", opacity: 0.9 },
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
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper,
                boxShadow: "none",
                overflow: "hidden",
                transition: "border-color 0.15s ease",
                "&:hover": {
                  borderColor: theme.palette.text.secondary,
                },
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
                    color: theme.palette.text.primary,
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
                    color: theme.palette.text.primary,
                    background: "transparent",
                    border: "none",
                    p: 0,
                    minWidth: "auto",
                    "&:hover": {
                      background: "transparent",
                      opacity: 0.7,
                    },
                  }}
                >
                  Edit
                </Button>
                <IconButton
                  size="small"
                  onClick={() => setDeleteId(category._id)}
                  sx={{
                    color: theme.palette.error.main,
                    p: 0,
                    "&:hover": { background: "transparent", opacity: 0.7 },
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
              borderRadius: "10px",
              border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          Delete Category
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete this category? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteId(null)}
            disabled={deleting}
            sx={{ textTransform: "none", color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              textTransform: "none",
              background: theme.palette.error.main,
              color: "#ffffff",
              "&:hover": { background: theme.palette.error.dark },
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
