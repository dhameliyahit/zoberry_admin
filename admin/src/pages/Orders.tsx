import { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  CheckCircle as ActiveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import api from "../services/api";

interface OrderItem {
  product: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  notes: string;
  createdAt: string;
  upiVpa?: string;
  utr?: string;
  utrStatus?: "" | "submitted" | "verified" | "rejected";
}

export default function Orders() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingUtr, setPendingUtr] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifyingId, setVerifyingId] = useState("");

  // Detailed modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      if (res.data && res.data.data) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUtr = async () => {
    try {
      const res = await api.get("/orders?utrStatus=submitted");
      if (res.data && res.data.data) {
        setPendingUtr(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch pending UTR orders", err);
    }
  };

  const handleVerifyUtr = async (orderId: string, action: "verify" | "reject") => {
    try {
      setVerifyingId(orderId);
      const res = await api.post(`/orders/${orderId}/verify-utr`, { action });
      if (res.data && res.data.data) {
        const updated = res.data.data;
        setPendingUtr((prev) => prev.filter((o) => o._id !== orderId));
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o))
        );
      }
    } catch (err) {
      console.error("Failed to verify UTR", err);
    } finally {
      setVerifyingId("");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPendingUtr();
  }, []);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async (statusType: "status" | "paymentStatus", value: string) => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      const payload = { [statusType]: value };
      const res = await api.put(`/orders/${selectedOrder._id}`, payload);
      if (res.data && res.data.data) {
        const updated = res.data.data;
        // Update local order details
        setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : null));
        // Update in lists
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? { ...o, ...updated } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filters and search logic
  const filteredRows = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o._id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const columns: GridColDef[] = [
    {
      field: "orderNumber",
      headerName: "Order No",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--text-primary)" }}>
          {params.value || `ZOB-${params.row._id.slice(-5).toUpperCase()}`}
        </Typography>
      ),
    },
    {
      field: "customerName",
      headerName: "Customer",
      width: 180,
      valueGetter: (_, row) => row.customer?.name || "N/A",
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
          {new Date(params.value).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Order Status",
      width: 150,
      renderCell: (params) => {
        const status = params.value;
        let color: "warning" | "success" | "error" | "info" | "default" = "default";
        if (status === "delivered") color = "success";
        else if (status === "cancelled") color = "error";
        else if (status === "pending") color = "warning";
        else if (status === "confirmed" || status === "processing" || status === "shipped") color = "info";

        return (
          <Chip
            label={status}
            color={color}
            size="small"
            sx={{ textTransform: "capitalize", fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: "paymentStatus",
      headerName: "Payment",
      width: 130,
      renderCell: (params) => {
        const payStatus = params.value;
        const isPaid = payStatus === "paid";
        return (
          <Chip
            icon={isPaid ? <ActiveIcon /> : <CancelIcon />}
            label={payStatus}
            color={isPaid ? "success" : "default"}
            variant={isPaid ? "filled" : "outlined"}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    },
    {
      field: "total",
      headerName: "Total",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₹{params.value}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={() => handleOpenDetails(params.row as Order)} color="primary">
          <ViewIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ py: 1 }}>
      {/* Header and filters */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>
          Manage Orders
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search Order No / Name..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: "100%", sm: 240 },
              background: "var(--bg-paper)",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                borderRadius: "8px",
                background: "var(--bg-paper)",
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Pending Direct UPI verification */}
      {pendingUtr.length > 0 && (
        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "warning.main",
            background: "var(--bg-paper)",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Pending UPI Verification ({pendingUtr.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {pendingUtr.map((o) => (
              <Box
                key={o._id}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  borderRadius: "8px",
                  background: "var(--bg-secondary)",
                }}
              >
                <Box sx={{ minWidth: 160 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {o.orderNumber || o._id.slice(-8).toUpperCase()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {o.customer?.name || "N/A"} · ₹{o.total}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 180 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                    UTR
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                    {o.utr || "—"}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 150 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                    Paid To (VPA)
                  </Typography>
                  <Typography variant="body2">{o.upiVpa || "—"}</Typography>
                </Box>
                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={verifyingId === o._id}
                    onClick={() => handleVerifyUtr(o._id, "verify")}
                  >
                    Verify &amp; Confirm
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={verifyingId === o._id}
                    onClick={() => handleVerifyUtr(o._id, "reject")}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1.5 }}>
            Confirm the credit in your bank/UPI app, then Verify to mark the order Paid.
          </Typography>
        </Paper>
      )}

      {/* Grid Table */}
      <Paper
        sx={{
          width: "100%",
          borderRadius: "12px",
          background: "var(--bg-paper)",
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: theme.palette.text.primary }} />
          </Box>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row._id}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeader": {
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontWeight: 700,
              },
              "& .MuiDataGrid-row:hover": {
                background: "var(--bg-secondary)",
              },
              "& .MuiDataGrid-cell": {
                borderColor: isDark ? "#222222" : "#eeeeee",
              },
              "& .MuiDataGrid-footerContainer": {
                borderColor: isDark ? "#222222" : "#eeeeee",
              },
            }}
          />
        )}
      </Paper>

      {/* Single Order Details Dialog */}
      {selectedOrder && (
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: "16px",
                background: "var(--bg-paper)",
                color: "var(--text-primary)",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border-color, #eeeeee)",
              pb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Order Details - {selectedOrder.orderNumber || selectedOrder._id.slice(-8).toUpperCase()}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <IconButton onClick={() => setDetailsOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ py: 3, "@media print": { p: 0 } }} className="print-section">
            <Grid container spacing={3}>
              {/* Left Column: Order details & Products */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Items Ordered
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    borderColor: isDark ? "#222222" : "#eeeeee",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--bg-secondary)", textAlign: "left" }}>
                        <th style={{ padding: "10px", fontSize: "0.8rem", fontWeight: 700 }}>Product</th>
                        <th style={{ padding: "10px", fontSize: "0.8rem", fontWeight: 700, textAlign: "center" }}>Price</th>
                        <th style={{ padding: "10px", fontSize: "0.8rem", fontWeight: 700, textAlign: "center" }}>Qty</th>
                        <th style={{ padding: "10px", fontSize: "0.8rem", fontWeight: 700, textAlign: "right" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} style={{ borderTop: "1px solid var(--border-color, #eeeeee)" }}>
                          <td style={{ padding: "12px 10px", display: "flex", alignItems: "center", gap: "10px" }}>
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "4px" }}
                              />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.title}
                            </Typography>
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "center" }}>
                            <Typography variant="body2">₹{item.price}</Typography>
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "center" }}>
                            <Typography variant="body2">{item.quantity}</Typography>
                          </td>
                          <td style={{ padding: "12px 10px", textAlign: "right" }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ₹{item.price * item.quantity}
                            </Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Paper>

                {/* Price Breakdown */}
                <Box sx={{ mt: 2.5, px: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", justifyBox: "space-between" }}>
                    <Typography variant="body2" color="textSecondary">Subtotal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{selectedOrder.subtotal}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyBox: "space-between" }}>
                    <Typography variant="body2" color="textSecondary">Shipping Cost</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{selectedOrder.shippingCost}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyBox: "space-between" }}>
                    <Typography variant="body2" color="textSecondary">Tax (5%)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{selectedOrder.tax}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyBox: "space-between" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total Paid</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      ₹{selectedOrder.total}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column: Customer Info, Address and Updates */}
              <Grid size={{ xs: 12, md: 5 }}>
                {/* Status Modifiers (Admin Only controls) */}
                <Card
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderRadius: "8px",
                    borderColor: isDark ? "#222222" : "#eeeeee",
                    background: "var(--bg-secondary)",
                    "@media print": { display: "none" },
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Manage Lifecycle & Payment
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Order Status</InputLabel>
                        <Select
                          value={selectedOrder.status}
                          label="Order Status"
                          disabled={updating}
                          onChange={(e) => handleUpdateStatus("status", e.target.value)}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="confirmed">Confirmed</MenuItem>
                          <MenuItem value="processing">Processing</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel>Payment Status</InputLabel>
                        <Select
                          value={selectedOrder.paymentStatus}
                          label="Payment Status"
                          disabled={updating}
                          onChange={(e) => handleUpdateStatus("paymentStatus", e.target.value)}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="paid">Paid</MenuItem>
                          <MenuItem value="failed">Failed</MenuItem>
                          <MenuItem value="refunded">Refunded</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>

                {/* Customer card */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Customer Details
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: "8px",
                    borderColor: isDark ? "#222222" : "#eeeeee",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedOrder.customer?.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                    Email: {selectedOrder.customer?.email}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
                    Phone: {selectedOrder.customer?.phone || "N/A"}
                  </Typography>
                </Paper>

                {/* Shipping address card */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Shipping Address
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: "8px",
                    borderColor: isDark ? "#222222" : "#eeeeee",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedOrder.shippingAddress?.fullName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedOrder.shippingAddress?.street}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                    {selectedOrder.shippingAddress?.zip}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedOrder.shippingAddress?.country}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {selectedOrder.notes && (
              <Box sx={{ mt: 3, p: 2, borderRadius: "8px", background: "rgba(0,0,0,0.02)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Customer Notes
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  &ldquo;{selectedOrder.notes}&rdquo;
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, borderTop: "1px solid var(--border-color, #eeeeee)", pt: 2, "@media print": { display: "none" } }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              Print Invoice
            </Button>
            <Button
              variant="contained"
              onClick={() => setDetailsOpen(false)}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                background: theme.palette.text.primary,
                color: theme.palette.background.paper,
                "&:hover": { background: theme.palette.text.primary, opacity: 0.9 },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Printable CSS formatting styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Box>
  );
}
