import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
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
        <CircularProgress sx={{ color: "#1976d2" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton
          onClick={() => navigate("/categories")}
          sx={{ color: "var(--text-secondary)", "&:hover": { background: "var(--hover-bg)" } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {isEdit ? "Edit Category" : "Add Category"}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", mt: 0.5 }}>
            {isEdit ? "Update category details" : "Create a new category"}
          </Typography>
        </Box>
      </Box>

      <Card
        sx={{
          p: 3,
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          background: "var(--card-bg)",
          boxShadow: "none",
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                color: "var(--text-primary)",
                "& fieldset": { borderColor: "var(--border-color)" },
                "&:hover fieldset": { borderColor: "#1976d2" },
                "&.Mui-focused fieldset": { borderColor: "#1976d2" },
              },
              "& .MuiInputLabel-root": { color: "var(--text-secondary)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
            }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "var(--text-primary)" }}>
              Category Image
            </Typography>
            <Box sx={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", background: "var(--card-bg)" }}>
              <Tabs
                value={tabValue}
                onChange={(_, v) => { setTabValue(v); if (imagePreview) handleRemoveImage(); }}
                sx={{
                  minHeight: 42,
                  borderBottom: "1px solid var(--border-color)",
                  "& .MuiTab-root": {
                    minHeight: 42,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    "&.Mui-selected": { color: "#1976d2" },
                  },
                  "& .MuiTabs-indicator": { background: "#1976d2", height: 2 },
                }}
              >
                <Tab icon={<ImageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Upload" />
                <Tab icon={<LinkIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="URL" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Box sx={{ px: 2, pb: 2 }}>
                  {imagePreview && tabValue === 0 ? (
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                      <CardMedia component="img" height="200" image={imagePreview} alt="Preview" sx={{ borderRadius: "8px", objectFit: "cover", width: 200 }} />
                      <IconButton size="small" onClick={handleRemoveImage} sx={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", "&:hover": { background: "rgba(0,0,0,0.7)" } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box component="label" htmlFor="image-upload" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, border: "2px dashed var(--border-color)", borderRadius: "8px", cursor: "pointer", background: "var(--hover-bg)", "&:hover": { borderColor: "#1976d2" } }}>
                      <ImageIcon sx={{ fontSize: 40, color: "var(--text-muted)", mb: 1 }} />
                      <Typography variant="body2" sx={{ color: "var(--text-secondary)", fontWeight: 500 }}>Click to upload image</Typography>
                      <Typography variant="caption" sx={{ color: "var(--text-muted)", mt: 0.5 }}>PNG, JPG, WEBP up to 5MB</Typography>
                    </Box>
                  )}
                  <input id="image-upload" type="file" accept="image/*" hidden onChange={handleFileChange} />
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ px: 2, pb: 2 }}>
                  <TextField fullWidth placeholder="https://example.com/image.jpg" value={imageUrl} onChange={handleUrlChange} size="small" sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.875rem", color: "var(--text-primary)", "& fieldset": { borderColor: "var(--border-color)" }, "&:hover fieldset": { borderColor: "#1976d2" }, "&.Mui-focused fieldset": { borderColor: "#1976d2" } } }} />
                  {imagePreview && tabValue === 1 ? (
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                      <CardMedia component="img" height="200" image={imagePreview} alt="Preview" sx={{ borderRadius: "8px", objectFit: "cover", width: 200 }} />
                      <IconButton size="small" onClick={handleRemoveImage} sx={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", "&:hover": { background: "rgba(0,0,0,0.7)" } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ) : null}
                </Box>
              </TabPanel>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button onClick={() => navigate("/categories")} disabled={loading} sx={{ textTransform: "none", fontWeight: 600, color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", px: 3, "&:hover": { background: "var(--hover-bg)" } }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: "none", fontWeight: 600, background: "#1976d2", color: "#ffffff", borderRadius: "8px", px: 3, boxShadow: "none", "&:hover": { background: "#1565c0", boxShadow: "none" } }}>
              {loading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
