import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  TrendingUp as RevenueIcon,
  ShoppingBag as OrdersIcon,
  HourglassEmpty as PendingIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import api from "../services/api";

interface Metrics {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
}

export default function Home() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/orders/metrics");
        if (res.data && res.data.data) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress sx={{ color: theme.palette.text.primary }} />
      </Box>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${metrics?.totalRevenue?.toLocaleString("en-IN") || 0}`,
      icon: <RevenueIcon sx={{ fontSize: 32, color: "#10b981" }} />,
      bgColor: isDark ? alpha("#10b981", 0.1) : "#ecfdf5",
      borderColor: isDark ? alpha("#10b981", 0.3) : alpha("#10b981", 0.1),
    },
    {
      title: "Total Orders",
      value: metrics?.totalOrders || 0,
      icon: <OrdersIcon sx={{ fontSize: 32, color: "#3b82f6" }} />,
      bgColor: isDark ? alpha("#3b82f6", 0.1) : "#eff6ff",
      borderColor: isDark ? alpha("#3b82f6", 0.3) : alpha("#3b82f6", 0.1),
    },
    {
      title: "Pending Orders",
      value: metrics?.pendingOrders || 0,
      icon: <PendingIcon sx={{ fontSize: 32, color: "#f59e0b" }} />,
      bgColor: isDark ? alpha("#f59e0b", 0.1) : "#fffbeb",
      borderColor: isDark ? alpha("#f59e0b", 0.3) : alpha("#f59e0b", 0.1),
    },
    {
      title: "Delivered Orders",
      value: metrics?.deliveredOrders || 0,
      icon: <ShippingIcon sx={{ fontSize: 32, color: "#8b5cf6" }} />,
      bgColor: isDark ? alpha("#8b5cf6", 0.1) : "#f5f3ff",
      borderColor: isDark ? alpha("#8b5cf6", 0.3) : alpha("#8b5cf6", 0.1),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--text-primary)", mb: 1 }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" sx={{ color: "var(--text-secondary)" }}>
          Welcome back! Here's the latest update on sales performance and order lifecycle tracking.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card
              sx={{
                borderRadius: "16px",
                background: "var(--bg-paper)",
                boxShadow: isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 20px rgba(0, 0, 0, 0.05)",
                border: `1px solid ${isDark ? "#222" : "#f1f1f1"}`,
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: isDark ? "0 6px 24px rgba(0, 0, 0, 0.6)" : "0 6px 24px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: "var(--text-secondary)", fontWeight: 600, mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 750, color: "var(--text-primary)" }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      background: card.bgColor,
                      border: `1.5px solid ${card.borderColor}`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
