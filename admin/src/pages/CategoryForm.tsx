import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CardMedia,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import api from "../services/api";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      const fetchCategory = async () => {
        try {
          setFetching(true);
          const res = await api.get(`/categories/${id}`);
          const cat = res.data.data;
          setName(cat.name);
          setImagePreview(cat.image);
          if (cat.image.startsWith("http")) {
            setImageUrl(cat.image);
            setTabValue(1);
          }
        } catch (err) {
          console.error("Failed to fetch category", err);
        } finally {
          setFetching(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl("");
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null);
    setImagePreview(url);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("image", imageFile);
        if (isEdit && id) {
          await api.put(`/categories/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await api.post("/categories", formData, { headers: { "Content-Type": "multipart/form-data" } });
        }
      } else {
        const payload = { name, image: imageUrl };
        if (isEdit && id) {
          await api.put(`/categories/${id}`, payload);
        } else {
          await api.post("/categories", payload);
        }
      }
      navigate("/categories");
    } catch (err) {
      console.error("Failed to save category", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: theme.palette.text.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton
          onClick={() => navigate("/categories")}
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": { background: alpha(theme.palette.text.primary, 0.05) },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
            {isEdit ? "Edit Category" : "New Category"}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
            {isEdit ? "Update category information" : "Add a new category to your store"}
          </Typography>
        </Box>
      </Box>

      {/* Form Card */}
      <Paper
        variant="outlined"
        sx={{
          p: 0,
          borderRadius: "10px",
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper,
          overflow: "hidden",
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          {/* Name Field */}
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}>
              Category Name
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g. Electronics, Clothing, Home..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              sx={{
                mt: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  backgroundColor: isDark ? alpha("#ffffff", 0.03) : alpha("#000000", 0.02),
                  "& fieldset": { borderColor: theme.palette.divider },
                  "&:hover fieldset": { borderColor: alpha(theme.palette.text.primary, 0.3) },
                  "&.Mui-focused fieldset": { borderColor: theme.palette.text.primary, borderWidth: "1px" },
                },
              }}
            />
          </Box>

          {/* Divider */}
          <Box sx={{ mx: 3, borderBottom: `1px solid ${theme.palette.divider}` }} />

          {/* Image Section */}
          <Box sx={{ p: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.secondary, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}>
              Category Image
            </Typography>

            <Tabs
              value={tabValue}
              onChange={(_, v) => { setTabValue(v); if (imagePreview) handleRemoveImage(); }}
              sx={{
                mt: 1.5,
                minHeight: 36,
                "& .MuiTab-root": {
                  minHeight: 36,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  color: theme.palette.text.secondary,
                  "&.Mui-selected": { color: theme.palette.text.primary },
                },
                "& .MuiTabs-indicator": { background: theme.palette.text.primary, height: 2 },
              }}
            >
              <Tab icon={<UploadIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Upload" />
              <Tab icon={<LinkIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="URL" />
            </Tabs>

            {/* Upload Tab */}
            <TabPanel value={tabValue} index={0}>
              <Fade in timeout={200}>
                <Box>
                  {imagePreview && tabValue === 0 ? (
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={imagePreview}
                        alt="Preview"
                        sx={{
                          borderRadius: "8px",
                          objectFit: "cover",
                          width: 200,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={handleRemoveImage}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: alpha(theme.palette.error.main, 0.9),
                          color: "#ffffff",
                          "&:hover": { background: theme.palette.error.main },
                          width: 28,
                          height: 28,
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      component="label"
                      htmlFor="image-upload"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 160,
                        border: `2px dashed ${theme.palette.divider}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: isDark ? alpha("#ffffff", 0.02) : alpha("#000000", 0.01),
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: theme.palette.text.secondary,
                          background: isDark ? alpha("#ffffff", 0.04) : alpha("#000000", 0.03),
                        },
                      }}
                    >
                      <UploadIcon sx={{ fontSize: 32, color: theme.palette.text.disabled, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, fontSize: "0.85rem" }}>
                        Click to upload
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.disabled, mt: 0.5 }}>
                        PNG, JPG, WEBP up to 5MB
                      </Typography>
                    </Box>
                  )}
                  <input id="image-upload" type="file" accept="image/*" hidden onChange={handleFileChange} />
                </Box>
              </Fade>
            </TabPanel>

            {/* URL Tab */}
            <TabPanel value={tabValue} index={1}>
              <Fade in timeout={200}>
                <Box>
                  <TextField
                    fullWidth
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    size="small"
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        backgroundColor: isDark ? alpha("#ffffff", 0.03) : alpha("#000000", 0.02),
                        "& fieldset": { borderColor: theme.palette.divider },
                        "&:hover fieldset": { borderColor: alpha(theme.palette.text.primary, 0.3) },
                        "&.Mui-focused fieldset": { borderColor: theme.palette.text.primary, borderWidth: "1px" },
                      },
                    }}
                  />
                  {imagePreview && tabValue === 1 && (
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={imagePreview}
                        alt="Preview"
                        sx={{
                          borderRadius: "8px",
                          objectFit: "cover",
                          width: 200,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={handleRemoveImage}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: alpha(theme.palette.error.main, 0.9),
                          color: "#ffffff",
                          "&:hover": { background: theme.palette.error.main },
                          width: 28,
                          height: 28,
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Fade>
            </TabPanel>
          </Box>

          {/* Divider */}
          <Box sx={{ mx: 3, borderBottom: `1px solid ${theme.palette.divider}` }} />

          {/* Actions */}
          <Box sx={{ p: 3, display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate("/categories")}
              disabled={loading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: theme.palette.text.secondary,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": {
                  background: isDark ? alpha("#ffffff", 0.05) : alpha("#000000", 0.04),
                  borderColor: theme.palette.text.secondary,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !name.trim()}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                background: theme.palette.text.primary,
                color: theme.palette.background.paper,
                borderRadius: "8px",
                px: 3,
                py: 1,
                boxShadow: "none",
                "&:hover": { background: theme.palette.text.primary, boxShadow: "none", opacity: 0.9 },
                "&.Mui-disabled": {
                  background: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                  Saving...
                </Box>
              ) : isEdit ? "Update Category" : "Create Category"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
