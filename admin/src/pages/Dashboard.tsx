import { useState, useEffect } from "react";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import api from "../services/api";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  revenue: number;
  pendingOrders: number;
  lowStock: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0, totalOrders: 0, totalUsers: 0,
    revenue: 0, pendingOrders: 0, lowStock: 0,
  });

  useEffect(() => {
    Promise.all([
      api.get("/products"),
      api.get("/orders?limit=1000"),
      api.get("/users?limit=1000"),
    ]).then(([products, orders, users]) => {
      const orderList = orders.data.data || [];
      const revenue = orderList
        .filter((o: any) => o.status === "delivered" || o.paymentStatus === "completed")
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

      setStats({
        totalProducts: products.data.pagination?.total || products.data.data?.length || 0,
        totalOrders: orders.data.pagination?.total || orderList.length,
        totalUsers: users.data.pagination?.total || users.data.data?.length || 0,
        revenue,
        pendingOrders: orderList.filter((o: any) => o.status === "pending" || o.status === "processing").length,
        lowStock: (products.data.data || []).filter((p: any) => (p.stock ?? p.countInStock ?? 0) < 10).length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-blue-500" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-green-500" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-purple-500" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "bg-amber-500" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: TrendingUp, color: "bg-orange-500" },
    { label: "Low Stock Items", value: stats.lowStock, icon: TrendingDown, color: "bg-red-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
              <Icon className="text-white" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
