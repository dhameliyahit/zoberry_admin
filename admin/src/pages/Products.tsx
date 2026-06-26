import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
}

const mockProducts: Product[] = [
  { id: "1", name: "Smartphone X", category: "Electronics", categoryId: "1", price: 699, stock: 45, status: "active" },
  { id: "2", name: "Laptop Pro", category: "Electronics", categoryId: "1", price: 1299, stock: 12, status: "active" },
  { id: "3", name: "Wireless Headphones", category: "Electronics", categoryId: "1", price: 149, stock: 78, status: "active" },
  { id: "4", name: "Cotton T-Shirt", category: "Clothing", categoryId: "2", price: 29, stock: 150, status: "active" },
  { id: "5", name: "Denim Jeans", category: "Clothing", categoryId: "2", price: 79, stock: 0, status: "inactive" },
  { id: "6", name: "Garden Chair", category: "Home & Garden", categoryId: "3", price: 89, stock: 23, status: "active" },
  { id: "7", name: "Running Shoes", category: "Sports", categoryId: "4", price: 119, stock: 34, status: "active" },
  { id: "8", name: "Fiction Novel", category: "Books", categoryId: "5", price: 14, stock: 200, status: "active" },
];

const categoryNames: Record<string, string> = {
  "1": "Electronics",
  "2": "Clothing",
  "3": "Home & Garden",
  "4": "Sports",
  "5": "Books",
  "6": "Toys",
};

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      setProducts(mockProducts.filter((p) => p.categoryId === categoryId));
    } else {
      setProducts(mockProducts);
    }
  }, [categoryId]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteId) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        {categoryId && (
          <IconButton
            onClick={() => navigate("/categories")}
            sx={{
              color: "var(--text-secondary)",
              "&:hover": { background: "var(--hover-bg)" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {categoryId ? `${categoryNames[categoryId] || "Category"} Products` : "Products"}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", mt: 0.5 }}>
            {categoryId ? "Products in this category" : "Manage your products"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: "#000000",
            color: "#ffffff",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": { background: "#262626", boxShadow: "none" },
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "var(--text-secondary)", fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            background: "var(--card-bg)",
            "& fieldset": { borderColor: "var(--border-color)" },
            "&:hover fieldset": { borderColor: "#000000" },
            "&.Mui-focused fieldset": { borderColor: "#000000" },
          },
        }}
      />

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "none",
          background: "var(--card-bg)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                Product
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                Price
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                Stock
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id} sx={{ "&:last-child td": { border: 0 } }}>
                <TableCell sx={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {product.name}
                </TableCell>
                <TableCell sx={{ color: "var(--text-secondary)" }}>
                  {product.category}
                </TableCell>
                <TableCell sx={{ color: "var(--text-primary)" }}>
                  ${product.price}
                </TableCell>
                <TableCell sx={{ color: "var(--text-primary)" }}>
                  {product.stock}
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.status}
                    size="small"
                    sx={{
                      fontSize: "0.7rem",
                      height: "22px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      background: product.status === "active" ? "#f0fdf4" : "#fef2f2",
                      color: product.status === "active" ? "#16a34a" : "#dc2626",
                      border: `1px solid ${product.status === "active" ? "#bbf7d0" : "#fecaca"}`,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    sx={{
                      color: "var(--text-secondary)",
                      "&:hover": { background: "var(--hover-bg)" },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteId(product.id)}
                    sx={{
                      color: "var(--text-secondary)",
                      "&:hover": { color: "#ef4444", background: "rgba(239,68,68,0.08)" },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "var(--text-secondary)" }}>
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        slotProps={{
          paper: {
            sx: { borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--card-bg)" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "var(--text-primary)" }}>Delete Product</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "var(--text-secondary)" }}>
            Are you sure you want to delete this product?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: "none", color: "var(--text-secondary)" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            sx={{ textTransform: "none", background: "#ef4444", color: "#ffffff", "&:hover": { background: "#dc2626" } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
