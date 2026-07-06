import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Info as InfoIcon,
  AttachMoney as PriceIcon,
  Image as ImageIcon,
  Inventory as InventoryIcon,
  Style as VariantIcon,
  Search as SeoIcon,
  LocalShipping as ShippingIcon,
  List as SpecIcon,
  PlayCircleOutlined as VideoIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import api from "../services/api";
import ProductPreview from "../components/ProductPreview";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ pt: 2.5 }}>{children}</Box> : null;
}

interface ImageItem {
  file?: File;
  url: string;
  preview: string;
  alt: string;
  isFeatured: boolean;
}

interface VariantOption {
  name: string;
  values: string[];
}

interface Variant {
  title: string;
  sku: string;
  price: number | string;
  stock: number | string;
  option1: string;
  option2: string;
  option3: string;
  isActive: boolean;
}

interface Specification {
  key: string;
  value: string;
}

interface VideoItem {
  url: string;
  title: string;
}

interface ProductForm {
  title: string;
  description: string;
  brand: string;
  productType: string;
  price: number | string;
  compareAtPrice: number | string;
  costPrice: number | string;
  category: string;
  tags: string[];
  status: string;
  isFeatured: boolean;
  sku: string;
  barcode: string;
  stock: number | string;
  trackQuantity: boolean;
  continueSelling: boolean;
  hasVariants: boolean;
  variantOptions: VariantOption[];
  variants: Variant[];
  seoMetaTitle: string;
  seoMetaDescription: string;
  weight: number | string;
  width: number | string;
  height: number | string;
  length: number | string;
  specifications: Specification[];
  videos: VideoItem[];
}

const initialForm: ProductForm = {
  title: "",
  description: "",
  brand: "",
  productType: "",
  price: "",
  compareAtPrice: "",
  costPrice: "",
  category: "",
  tags: [],
  status: "active",
  isFeatured: false,
  sku: "",
  barcode: "",
  stock: 0,
  trackQuantity: true,
  continueSelling: false,
  hasVariants: false,
  variantOptions: [],
  variants: [],
  seoMetaTitle: "",
  seoMetaDescription: "",
  weight: "",
  width: "",
  height: "",
  length: "",
  specifications: [],
  videos: [],
};

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !src) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isDark ? alpha("#ffffff", 0.03) : alpha("#000000", 0.02),
        }}
      >
        <ImageIcon sx={{ fontSize: 28, color: theme.palette.text.disabled }} />
      </Box>
    );
  }

  return (
    <>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isDark ? alpha("#ffffff", 0.03) : alpha("#000000", 0.02),
          }}
        >
          <CircularProgress size={20} sx={{ color: theme.palette.text.disabled }} />
        </Box>
      )}
      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: loading ? "none" : "block",
        }}
      />
    </>
  );
}

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductForm>(initialForm);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValues, setNewOptionValues] = useState<Record<number, string>>({});
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");

  const updateField = (field: keyof ProductForm, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        try {
          setFetching(true);
          const res = await api.get(`/products/${id}`);
          const p = res.data.data;
          setForm({
            title: p.title || "",
            description: p.description || "",
            brand: p.brand || "",
            productType: p.productType || "",
            price: p.price ?? "",
            compareAtPrice: p.compareAtPrice ?? "",
            costPrice: p.costPrice ?? "",
            category: p.category?._id || p.category || "",
            tags: p.tags || [],
            status: p.status || "active",
            isFeatured: p.isFeatured || false,
            sku: p.sku || "",
            barcode: p.barcode || "",
            stock: p.stock ?? 0,
            trackQuantity: p.trackQuantity ?? true,
            continueSelling: p.continueSelling ?? false,
            hasVariants: p.hasVariants || false,
            variantOptions: p.variantOptions || [],
            variants: p.variants || [],
            seoMetaTitle: p.seo?.metaTitle || "",
            seoMetaDescription: p.seo?.metaDescription || "",
            weight: p.weight ?? "",
            width: p.width ?? "",
            height: p.height ?? "",
            length: p.length ?? "",
            specifications: p.specifications || [],
            videos: p.videos || [],
          });
          if (p.images?.length) {
            setImages(
              p.images.map((img: { url: string; alt?: string; isFeatured?: boolean }) => ({
                url: img.url,
                preview: img.url,
                alt: img.alt || "",
                isFeatured: img.isFeatured || false,
              }))
            );
          }
        } catch (err) {
          console.error("Failed to fetch product", err);
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const isFirst = images.length === 0;
    const newImages: ImageItem[] = [];
    Array.from(files).forEach((file, i) => {
      const preview = URL.createObjectURL(file);
      newImages.push({ file, url: "", preview, alt: "", isFeatured: isFirst && i === 0 });
    });
    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageUrlAdd = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setImages((prev) => [
        ...prev,
        { file: undefined, url, preview: url, alt: "", isFeatured: prev.length === 0 },
      ]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index].isFeatured && updated.length > 0) {
        updated[0].isFeatured = true;
      }
      return updated;
    });
  };

  const handleSetFeatured = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isFeatured: i === index }))
    );
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      updateField("tags", [...form.tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateField("tags", form.tags.filter((t) => t !== tag));
  };

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      updateField("specifications", [...form.specifications, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const handleRemoveSpec = (index: number) => {
    updateField("specifications", form.specifications.filter((_, i) => i !== index));
  };

  const handleAddVariantOption = () => {
    if (newOptionName.trim()) {
      updateField("variantOptions", [
        ...form.variantOptions,
        { name: newOptionName.trim(), values: [] },
      ]);
      setNewOptionName("");
    }
  };

  const handleAddOptionValue = (optIndex: number) => {
    const val = newOptionValues[optIndex] || "";
    if (val.trim()) {
      const updated = [...form.variantOptions];
      updated[optIndex] = {
        ...updated[optIndex],
        values: [...updated[optIndex].values, val.trim()],
      };
      updateField("variantOptions", updated);
      setNewOptionValues((prev) => ({ ...prev, [optIndex]: "" }));
    }
  };

  const handleRemoveOptionValue = (optIndex: number, valIndex: number) => {
    const updated = [...form.variantOptions];
    updated[optIndex] = {
      ...updated[optIndex],
      values: updated[optIndex].values.filter((_, i) => i !== valIndex),
    };
    updateField("variantOptions", updated);
  };

  const handleRemoveVariantOption = (optIndex: number) => {
    updateField("variantOptions", form.variantOptions.filter((_, i) => i !== optIndex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("brand", form.brand);
      formData.append("productType", form.productType);
      formData.append("price", String(form.price));
      if (form.compareAtPrice) formData.append("compareAtPrice", String(form.compareAtPrice));
      if (form.costPrice) formData.append("costPrice", String(form.costPrice));
      formData.append("category", form.category);
      formData.append("status", form.status);
      formData.append("isFeatured", String(form.isFeatured));
      formData.append("sku", form.sku);
      formData.append("barcode", form.barcode);
      formData.append("stock", String(form.stock));
      formData.append("trackQuantity", String(form.trackQuantity));
      formData.append("continueSelling", String(form.continueSelling));

      if (form.tags.length > 0) {
        formData.append("tags", JSON.stringify(form.tags));
      }

      if (form.seoMetaTitle || form.seoMetaDescription) {
        formData.append("seo", JSON.stringify({ metaTitle: form.seoMetaTitle, metaDescription: form.seoMetaDescription }));
      }

      if (form.specifications.length > 0) {
        formData.append("specifications", JSON.stringify(form.specifications));
      }

      if (form.videos.length > 0) {
        formData.append("videos", JSON.stringify(form.videos));
      }

      if (form.weight) formData.append("weight", String(form.weight));
      if (form.width) formData.append("width", String(form.width));
      if (form.height) formData.append("height", String(form.height));
      if (form.length) formData.append("length", String(form.length));

      formData.append("hasVariants", String(form.hasVariants));
      if (form.hasVariants && form.variantOptions.length > 0) {
        formData.append("variantOptions", JSON.stringify(form.variantOptions));
      }

      const existingImages = images
        .filter((img) => !img.file)
        .map((img) => ({ url: img.url, alt: img.alt, isFeatured: img.isFeatured }));
      if (existingImages.length > 0) {
        formData.append("images", JSON.stringify(existingImages));
      }

      const newFiles = images.filter((img) => img.file);
      newFiles.forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });

      const headers = { "Content-Type": "multipart/form-data" };

      if (isEdit && id) {
        await api.put(`/products/${id}`, formData, { headers });
      } else {
        await api.post("/products", formData, { headers });
      }
      navigate("/products");
    } catch (err) {
      console.error("Failed to save product", err);
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

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      fontSize: "0.875rem",
      backgroundColor: isDark ? alpha("#ffffff", 0.03) : alpha("#000000", 0.02),
      "& fieldset": { borderColor: theme.palette.divider },
      "&:hover fieldset": { borderColor: alpha(theme.palette.text.primary, 0.3) },
      "&.Mui-focused fieldset": { borderColor: theme.palette.text.primary, borderWidth: "1px" },
    },
  };

  const labelSx = {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    fontSize: "0.7rem",
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton
          onClick={() => navigate("/products")}
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": { background: alpha(theme.palette.text.primary, 0.05) },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
            {isEdit ? "Edit Product" : "New Product"}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
            {isEdit ? "Update product information" : "Add a new product to your store"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        {/* Form */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            borderRadius: "10px",
            borderColor: theme.palette.divider,
            bgcolor: theme.palette.background.paper,
            overflow: "hidden",
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            {/* Tabs */}
            <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 1 }}>
              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 44,
                  "& .MuiTab-root": {
                    minHeight: 44,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: theme.palette.text.secondary,
                    "&.Mui-selected": { color: theme.palette.text.primary },
                  },
                  "& .MuiTabs-indicator": { background: theme.palette.text.primary, height: 2 },
                }}
              >
                <Tab icon={<InfoIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Basic" />
                <Tab icon={<PriceIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Pricing" />
                <Tab icon={<ImageIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Images" />
                <Tab icon={<VideoIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Videos" />
                <Tab icon={<InventoryIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Inventory" />
                <Tab icon={<VariantIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Variants" />
                <Tab icon={<SeoIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="SEO" />
                <Tab icon={<ShippingIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Shipping" />
                <Tab icon={<SpecIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Specs" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {/* Tab 0: Basic Info */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box>
                    <Typography variant="caption" sx={labelSx}>Product Title *</Typography>
                    <TextField
                      fullWidth
                      placeholder="e.g. Wireless Bluetooth Headphones"
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      required
                      autoFocus
                      sx={{ mt: 0.75, ...inputSx }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={labelSx}>Description</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Describe your product..."
                      value={form.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      sx={{ mt: 0.75, ...inputSx }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>Brand</Typography>
                      <TextField
                        fullWidth
                        placeholder="e.g. Samsung, Nike"
                        value={form.brand}
                        onChange={(e) => updateField("brand", e.target.value)}
                        sx={{ mt: 0.75, ...inputSx }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>Product Type</Typography>
                      <TextField
                        fullWidth
                        placeholder="e.g. Electronics, Apparel"
                        value={form.productType}
                        onChange={(e) => updateField("productType", e.target.value)}
                        sx={{ mt: 0.75, ...inputSx }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={labelSx}>Category *</Typography>
                    <FormControl fullWidth sx={{ mt: 0.75 }}>
                      <Select
                        value={form.category}
                        onChange={(e) => updateField("category", e.target.value)}
                        displayEmpty
                        required
                        sx={{ borderRadius: "8px", fontSize: "0.875rem" }}
                      >
                        <MenuItem value="" disabled>Select category</MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>Status</Typography>
                      <FormControl fullWidth sx={{ mt: 0.75 }}>
                        <Select
                          value={form.status}
                          onChange={(e) => updateField("status", e.target.value)}
                          sx={{ borderRadius: "8px", fontSize: "0.875rem" }}
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="draft">Draft</MenuItem>
                          <MenuItem value="archived">Archived</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", pt: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={form.isFeatured}
                            onChange={(e) => updateField("isFeatured", e.target.checked)}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2" sx={{ fontSize: "0.875rem" }}>Featured Product</Typography>}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={labelSx}>Tags</Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.75, alignItems: "center" }}>
                      <TextField
                        size="small"
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                        sx={{ flex: 1, ...inputSx }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim()}
                        sx={{ textTransform: "none", minWidth: 40, px: 1 }}
                      >
                        <AddIcon sx={{ fontSize: 18 }} />
                      </Button>
                    </Box>
                    {form.tags.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                        {form.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onDelete={() => handleRemoveTag(tag)}
                            sx={{
                              fontSize: "0.75rem",
                              height: "24px",
                              bgcolor: isDark ? alpha("#ffffff", 0.05) : alpha("#000000", 0.04),
                              "& .MuiChip-deleteIcon": { fontSize: 16 },
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </TabPanel>

              {/* Tab 1: Pricing */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box>
                    <Typography variant="caption" sx={labelSx}>Price *</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                      required
                      slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                      sx={{ mt: 0.75, ...inputSx }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>Compare at Price</Typography>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="0.00"
                        value={form.compareAtPrice}
                        onChange={(e) => updateField("compareAtPrice", e.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                        helperText="Original price before discount"
                        sx={{ mt: 0.75, ...inputSx }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>Cost Price</Typography>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="0.00"
                        value={form.costPrice}
                        onChange={(e) => updateField("costPrice", e.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                        helperText="Your cost for margin calculation"
                        sx={{ mt: 0.75, ...inputSx }}
                      />
                    </Box>
                  </Box>
                  {form.price && form.costPrice && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "8px",
                        bgcolor: isDark ? alpha("#22c55e", 0.1) : alpha("#16a34a", 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                        Margin: {Math.round(((Number(form.price) - Number(form.costPrice)) / Number(form.price)) * 100)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* Tab 2: Images */}
              <TabPanel value={tabValue} index={2}>
                <Box>
                  <Typography variant="caption" sx={labelSx}>Product Images</Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1.5, mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<UploadIcon sx={{ fontSize: 16 }} />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ textTransform: "none", fontSize: "0.8rem" }}
                    >
                      Upload Files
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleImageUrlAdd}
                      sx={{ textTransform: "none", fontSize: "0.8rem" }}
                    >
                      Add URL
                    </Button>
                  </Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageUpload}
                  />

                  {images.length > 0 ? (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1.5 }}>
                      {images.map((img, index) => (
                        <Box
                          key={`${img.url || img.preview}-${index}`}
                          sx={{
                            position: "relative",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: `2px solid ${img.isFeatured ? theme.palette.primary.main : theme.palette.divider}`,
                            aspectRatio: "1",
                            bgcolor: isDark ? alpha("#ffffff", 0.03) : alpha("#000000", 0.02),
                          }}
                        >
                          <ImagePreview src={img.preview} alt={img.alt || `Product ${index + 1}`} />
                          <Box sx={{ position: "absolute", top: 4, left: 4, display: "flex", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleSetFeatured(index)}
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: img.isFeatured ? theme.palette.warning.main : alpha("#000000", 0.5),
                                color: "#fff",
                                "&:hover": { bgcolor: img.isFeatured ? theme.palette.warning.dark : alpha("#000000", 0.7) },
                              }}
                            >
                              {img.isFeatured ? <StarIcon sx={{ fontSize: 14 }} /> : <StarBorderIcon sx={{ fontSize: 14 }} />}
                            </IconButton>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImage(index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              width: 24,
                              height: 24,
                              bgcolor: alpha(theme.palette.error.main, 0.9),
                              color: "#fff",
                              "&:hover": { bgcolor: theme.palette.error.main },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 160,
                        border: `2px dashed ${theme.palette.divider}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        bgcolor: isDark ? alpha("#ffffff", 0.02) : alpha("#000000", 0.01),
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: theme.palette.text.secondary,
                          bgcolor: isDark ? alpha("#ffffff", 0.04) : alpha("#000000", 0.03),
                        },
                      }}
                    >
                      <UploadIcon sx={{ fontSize: 32, color: theme.palette.text.disabled, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, fontSize: "0.85rem" }}>
                        Click to upload images
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.disabled, mt: 0.5 }}>
                        PNG, JPG, WEBP up to 10 files
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* Tab 3: Videos */}
              <TabPanel value={tabValue} index={3}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="caption" sx={labelSx}>Product Videos (YouTube, Instagram Reels, etc.)</Typography>

                  {form.videos.map((video, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: "8px",
                        bgcolor: isDark ? alpha("#ffffff", 0.02) : alpha("#000000", 0.01),
                      }}
                    >
                      <VideoIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                      <Box sx={{ flex: 1, overflow: "hidden" }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500, color: theme.palette.text.primary, fontSize: "0.85rem" }}>
                          {video.title || "Untitled Video"}
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary, fontSize: "0.75rem" }}>
                          {video.url}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const updated = form.videos.filter((_, i) => i !== index);
                          updateField("videos", updated);
                        }}
                        sx={{ color: theme.palette.error.main, "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  ))}

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Video title (optional)"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      sx={{ ...inputSx }}
                    />
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <TextField
                        size="small"
                        placeholder="Paste YouTube or Reels URL"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newVideoUrl.trim()) {
                              updateField("videos", [...form.videos, { url: newVideoUrl.trim(), title: newVideoTitle.trim() }]);
                              setNewVideoUrl("");
                              setNewVideoTitle("");
                            }
                          }
                        }}
                        sx={{ flex: 1, ...inputSx }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          if (newVideoUrl.trim()) {
                            updateField("videos", [...form.videos, { url: newVideoUrl.trim(), title: newVideoTitle.trim() }]);
                            setNewVideoUrl("");
                            setNewVideoTitle("");
                          }
                        }}
                        disabled={!newVideoUrl.trim()}
                        sx={{ textTransform: "none" }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                      Supports YouTube, YouTube Shorts, Instagram Reels, TikTok, and other video URLs
                    </Typography>
                  </Box>
                </Box>
              </TabPanel>

              {/* Tab 4: Inventory */}
              <TabPanel value={tabValue} index={4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>SKU</Typography>
                      <TextField
                        fullWidth
                        placeholder="e.g. WBH-001"
                        value={form.sku}
                        onChange={(e) => updateField("sku", e.target.value)}
                        sx={{ mt: 0.75, ...inputSx }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>Barcode</Typography>
                      <TextField
                        fullWidth
                        placeholder="e.g. 123456789"
                        value={form.barcode}
                        onChange={(e) => updateField("barcode", e.target.value)}
                        sx={{ mt: 0.75, ...inputSx }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={labelSx}>Stock Quantity</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) => updateField("stock", e.target.value)}
                      slotProps={{ htmlInput: { min: 0 } }}
                      sx={{ mt: 0.75, ...inputSx }}
                    />
                  </Box>
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.trackQuantity}
                        onChange={(e) => updateField("trackQuantity", e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>Track quantity</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Automatically track inventory levels</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.continueSelling}
                        onChange={(e) => updateField("continueSelling", e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>Continue selling when out of stock</Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Allow orders even when stock reaches zero</Typography>
                      </Box>
                    }
                  />
                </Box>
              </TabPanel>

              {/* Tab 5: Variants */}
              <TabPanel value={tabValue} index={5}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.hasVariants}
                        onChange={(e) => updateField("hasVariants", e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        This product has multiple options (size, color, etc.)
                      </Typography>
                    }
                  />

                  {form.hasVariants && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="caption" sx={labelSx}>Variant Options</Typography>
                        {form.variantOptions.map((opt, optIndex) => (
                          <Box key={optIndex} sx={{ mt: 1.5, p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: "8px" }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{opt.name}</Typography>
                              <IconButton size="small" onClick={() => handleRemoveVariantOption(optIndex)} sx={{ color: theme.palette.error.main }}>
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                              {opt.values.map((val, valIndex) => (
                                <Chip
                                  key={valIndex}
                                  label={val}
                                  size="small"
                                  onDelete={() => handleRemoveOptionValue(optIndex, valIndex)}
                                  sx={{ fontSize: "0.75rem", height: "24px" }}
                                />
                              ))}
                            </Box>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                              <TextField
                                size="small"
                                placeholder="Add value"
                                value={newOptionValues[optIndex] || ""}
                                onChange={(e) => setNewOptionValues((prev) => ({ ...prev, [optIndex]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOptionValue(optIndex); } }}
                                sx={{ flex: 1, ...inputSx }}
                              />
                              <Button
                                size="small"
                                onClick={() => handleAddOptionValue(optIndex)}
                                disabled={!(newOptionValues[optIndex] || "").trim()}
                                sx={{ textTransform: "none", minWidth: 40, px: 1 }}
                              >
                                <AddIcon sx={{ fontSize: 16 }} />
                              </Button>
                            </Box>
                          </Box>
                        ))}

                        <Box sx={{ display: "flex", gap: 1, mt: 1.5, alignItems: "center" }}>
                          <TextField
                            size="small"
                            placeholder="Option name (e.g. Size)"
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddVariantOption(); } }}
                            sx={{ flex: 1, ...inputSx }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleAddVariantOption}
                            disabled={!newOptionName.trim()}
                            sx={{ textTransform: "none" }}
                          >
                            Add Option
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              </TabPanel>

              {/* Tab 6: SEO */}
              <TabPanel value={tabValue} index={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box>
                    <Typography variant="caption" sx={labelSx}>Meta Title</Typography>
                    <TextField
                      fullWidth
                      placeholder="SEO page title"
                      value={form.seoMetaTitle}
                      onChange={(e) => updateField("seoMetaTitle", e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 60 } }}
                      helperText={`${form.seoMetaTitle.length}/60 characters`}
                      sx={{ mt: 0.75, ...inputSx }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={labelSx}>Meta Description</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="SEO page description"
                      value={form.seoMetaDescription}
                      onChange={(e) => updateField("seoMetaDescription", e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 160 } }}
                      helperText={`${form.seoMetaDescription.length}/160 characters`}
                      sx={{ mt: 0.75, ...inputSx }}
                    />
                  </Box>
                </Box>
              </TabPanel>

              {/* Tab 7: Shipping */}
              <TabPanel value={tabValue} index={7}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box>
                    <Typography variant="caption" sx={labelSx}>Weight (kg)</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      placeholder="0.00"
                      value={form.weight}
                      onChange={(e) => updateField("weight", e.target.value)}
                      slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                      sx={{ mt: 0.75, ...inputSx }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>Width (cm)</Typography>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="0"
                        value={form.width}
                        onChange={(e) => updateField("width", e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={{ mt: 0.75, ...inputSx }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>Height (cm)</Typography>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="0"
                        value={form.height}
                        onChange={(e) => updateField("height", e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={{ mt: 0.75, ...inputSx }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={labelSx}>Length (cm)</Typography>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="0"
                        value={form.length}
                        onChange={(e) => updateField("length", e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={{ mt: 0.75, ...inputSx }}
                      />
                    </Box>
                  </Box>
                </Box>
              </TabPanel>

              {/* Tab 8: Specifications */}
              <TabPanel value={tabValue} index={8}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="caption" sx={labelSx}>Product Specifications</Typography>

                  {form.specifications.map((spec, index) => (
                    <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <TextField
                        size="small"
                        placeholder="Key (e.g. Material)"
                        value={spec.key}
                        onChange={(e) => {
                          const updated = [...form.specifications];
                          updated[index] = { ...updated[index], key: e.target.value };
                          updateField("specifications", updated);
                        }}
                        sx={{ flex: 1, ...inputSx }}
                      />
                      <TextField
                        size="small"
                        placeholder="Value (e.g. Cotton)"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...form.specifications];
                          updated[index] = { ...updated[index], value: e.target.value };
                          updateField("specifications", updated);
                        }}
                        sx={{ flex: 1, ...inputSx }}
                      />
                      <IconButton size="small" onClick={() => handleRemoveSpec(index)} sx={{ color: theme.palette.error.main }}>
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  ))}

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      size="small"
                      placeholder="Key"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      sx={{ flex: 1, ...inputSx }}
                    />
                    <TextField
                      size="small"
                      placeholder="Value"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSpec(); } }}
                      sx={{ flex: 1, ...inputSx }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleAddSpec}
                      disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                      sx={{ textTransform: "none" }}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
            </Box>

            {/* Actions */}
            <Divider />
            <Box sx={{ p: 3, display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
              <Button
                onClick={() => navigate("/products")}
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
                disabled={loading || !form.title.trim() || !form.category}
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
                ) : isEdit ? "Update Product" : "Create Product"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Preview Sidebar */}
        <Box sx={{ width: 280, flexShrink: 0, display: { xs: "none", lg: "block" } }}>
          <ProductPreview
            title={form.title}
            description={form.description}
            price={form.price}
            compareAtPrice={form.compareAtPrice}
            stock={form.stock}
            status={form.status}
            category={categories.find((c) => c._id === form.category)?.name || ""}
            tags={form.tags}
            images={images}
            videos={form.videos}
            isFeatured={form.isFeatured}
          />
        </Box>
      </Box>
    </Box>
  );
}
