import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TablePagination,
  CircularProgress,
  useTheme,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ContentCopy as DuplicateIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import api from "../services/api";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: "active" | "draft" | "archived";
  isFeatured: boolean;
  category: { _id: string; name: string; slug: string };
  images: { url: string; alt: string; isFeatured: boolean }[];
  videos?: { url: string; title: string }[];
  sku?: string;
}

interface StatusCounts {
  active: number;
  draft: number;
  archived: number;
}

export default function Products() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusTab, setStatusTab] = useState(searchParams.get("status") || "all");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 0);
  const [rowsPerPage, setRowsPerPage] = useState(Number(searchParams.get("limit")) || 20);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ active: 0, draft: 0, archived: 0 });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  const updateSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusTab !== "all") params.set("status", statusTab);
    if (categoryFilter) params.set("category", categoryFilter);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 0) params.set("page", String(page + 1));
    if (rowsPerPage !== 20) params.set("limit", String(rowsPerPage));
    setSearchParams(params, { replace: true });
  }, [search, statusTab, categoryFilter, sort, page, rowsPerPage, setSearchParams]);

  useEffect(() => {
    updateSearchParams();
  }, [updateSearchParams]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusTab !== "all") params.set("status", statusTab);
      if (categoryFilter) params.set("category", categoryFilter);
      if (sort) params.set("sort", sort);
      params.set("page", String(page + 1));
      params.set("limit", String(rowsPerPage));

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
      setTotal(res.data.pagination.total);
      setStatusCounts(res.data.meta.statusCounts);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusTab, categoryFilter, sort, page, rowsPerPage]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/products/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      setDeleteId(null);
      setTotal((prev) => prev - 1);
      setSnackbar({ open: true, message: "Product deleted", severity: "success" });
    } catch (err) {
      console.error("Failed to delete product", err);
      setSnackbar({ open: true, message: "Failed to delete product", severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/products/${id}/duplicate`);
      fetchProducts();
      setSnackbar({ open: true, message: "Product duplicated", severity: "success" });
    } catch (err) {
      console.error("Failed to duplicate product", err);
      setSnackbar({ open: true, message: "Failed to duplicate product", severity: "error" });
    }
  };

  const handleCopyLink = (product: Product) => {
    const url = `${window.location.origin}/product/${product.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setSnackbar({ open: true, message: "Link copied to clipboard", severity: "success" });
    }).catch(() => {
      setSnackbar({ open: true, message: "Failed to copy link", severity: "error" });
    });
  };

  const handleStatusTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setStatusTab(newValue);
    setPage(0);
  };

  const getFeaturedImage = (product: Product) => {
    const featured = product.images?.find((img) => img.isFeatured);
    return featured?.url || product.images?.[0]?.url || "";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);
  };

  const getStockColor = (stock: number, status: string) => {
    if (status === "draft" || status === "archived") return "default";
    if (stock === 0) return "error";
    if (stock <= 10) return "warning";
    return "success";
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
            Products
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
            {total} total products
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/products/add")}
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
          Add Product
        </Button>
      </Box>

      {/* Status Tabs */}
      <Tabs
        value={statusTab}
        onChange={handleStatusTabChange}
        sx={{
          mb: 2,
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
        <Tab label={`All (${total})`} value="all" />
        <Tab label={`Active (${statusCounts.active})`} value="active" />
        <Tab label={`Draft (${statusCounts.draft})`} value="draft" />
        <Tab label={`Archived (${statusCounts.archived})`} value="archived" />
      </Tabs>

      {/* Filters Row */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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
            flex: 1,
            maxWidth: 320,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: "0.875rem",
              backgroundColor: theme.palette.background.paper,
              "& fieldset": { borderColor: theme.palette.divider },
              "&:hover fieldset": { borderColor: alpha(theme.palette.text.primary, 0.25) },
              "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main, borderWidth: "1px" },
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ fontSize: "0.875rem" }}>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            sx={{
              borderRadius: "8px",
              fontSize: "0.875rem",
              backgroundColor: theme.palette.background.paper,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
            }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ fontSize: "0.875rem" }}>Sort</InputLabel>
          <Select
            value={sort}
            label="Sort"
            onChange={(e) => setSort(e.target.value)}
            sx={{
              borderRadius: "8px",
              fontSize: "0.875rem",
              backgroundColor: theme.palette.background.paper,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
            }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="name_asc">Name A-Z</MenuItem>
            <MenuItem value="name_desc">Name Z-A</MenuItem>
            <MenuItem value="price_asc">Price Low-High</MenuItem>
            <MenuItem value="price_desc">Price High-Low</MenuItem>
            <MenuItem value="stock_asc">Stock Low-High</MenuItem>
            <MenuItem value="stock_desc">Stock High-Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: "10px",
          overflow: "hidden",
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper,
          position: "relative",
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: theme.palette.text.primary }} />
          </Box>
        )}

        {!loading && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : "#f8f9fa" }}>
                  {["Product", "Category", "Price", "Stock", "Status", ""].map((head) => (
                    <TableCell
                      key={head}
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: theme.palette.text.secondary,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => {
                  const imageUrl = getFeaturedImage(product);
                  return (
                    <TableRow
                      key={product._id}
                      sx={{
                        "&:hover": { bgcolor: isDark ? alpha("#ffffff", 0.02) : "#fdfdfd" },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          {imageUrl ? (
                            <Box
                              component="img"
                              src={imageUrl}
                              alt={product.title}
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.style.display = "none";
                                const next = e.currentTarget.nextElementSibling as HTMLElement;
                                if (next) next.style.display = "flex";
                              }}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "6px",
                                objectFit: "cover",
                                border: `1px solid ${theme.palette.divider}`,
                              }}
                            />
                          ) : null}
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "6px",
                              bgcolor: isDark ? alpha("#ffffff", 0.05) : alpha("#000000", 0.04),
                              display: imageUrl ? "none" : "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: "0.65rem" }}>
                              No img
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ fontWeight: 600, color: theme.palette.text.primary, maxWidth: 220 }}
                            >
                              {product.title}
                            </Typography>
                            {product.sku && (
                              <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                                SKU: {product.sku}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary, fontSize: "0.875rem", borderBottom: `1px solid ${theme.palette.divider}` }}>
                        {product.category?.name || "\u2014"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: "0.875rem" }}>
                            {formatPrice(product.price)}
                          </Typography>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <Typography variant="caption" sx={{ color: theme.palette.text.disabled, textDecoration: "line-through" }}>
                              {formatPrice(product.compareAtPrice)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Chip
                          label={product.stock}
                          size="small"
                          color={getStockColor(product.stock, product.status)}
                          sx={{
                            fontSize: "0.7rem",
                            height: "22px",
                            fontWeight: 600,
                            minWidth: 36,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Chip
                          label={product.status}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            height: "22px",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            background: product.status === "active"
                              ? alpha(theme.palette.success.main, isDark ? 0.15 : 0.08)
                              : product.status === "draft"
                              ? alpha(theme.palette.warning.main, isDark ? 0.15 : 0.08)
                              : alpha(theme.palette.text.secondary, 0.08),
                            color: product.status === "active"
                              ? theme.palette.success.main
                              : product.status === "draft"
                              ? theme.palette.warning.main
                              : theme.palette.text.secondary,
                            border: `1px solid ${
                              product.status === "active"
                                ? alpha(theme.palette.success.main, 0.2)
                                : product.status === "draft"
                                ? alpha(theme.palette.warning.main, 0.2)
                                : alpha(theme.palette.divider, 0.3)
                            }`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyLink(product)}
                          sx={{ color: theme.palette.text.secondary, "&:hover": { color: theme.palette.text.primary } }}
                          title="Copy product link"
                        >
                          <LinkIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/products/edit/${product._id}`)}
                          sx={{ color: theme.palette.text.secondary, "&:hover": { color: theme.palette.text.primary } }}
                          title="Edit product"
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDuplicate(product._id)}
                          sx={{ color: theme.palette.text.secondary, "&:hover": { color: theme.palette.text.primary } }}
                          title="Duplicate product"
                        >
                          <DuplicateIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteId(product._id)}
                          sx={{ color: theme.palette.text.secondary, "&:hover": { color: theme.palette.error.main } }}
                          title="Delete product"
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!loading && products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8, color: theme.palette.text.secondary }}>
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && total > 0 && (
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              "& .MuiTablePagination-toolbar": { minHeight: 52 },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                color: theme.palette.text.secondary,
                fontSize: "0.875rem",
              },
            }}
          />
        )}
      </Paper>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => !deleting && setDeleteId(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "10px",
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          Delete Product
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete this product? This action cannot be undone.
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
