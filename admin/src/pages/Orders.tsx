import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import api from "../services/api";

interface Order {
  _id: string;
  orderId: string;
  user?: { name: string; email: string };
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  shipped: "badge-info",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const params: any = { limit: 100 };
      if (search) params.search = search;
      const res = await api.get("/orders", { params });
      setOrders(res.data.data || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [search]);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/orders/${id}`, { status });
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    if (selected?._id === id) setSelected({ ...selected, status });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="table-header">Order ID</th>
              <th className="table-header">Customer</th>
              <th className="table-header">Items</th>
              <th className="table-header">Total</th>
              <th className="table-header">Status</th>
              <th className="table-header">Payment</th>
              <th className="table-header">Date</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-500">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-500">No orders</td></tr>
            ) : orders.map((o) => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="table-cell font-mono text-xs">#{o.orderId || o._id.slice(-8)}</td>
                <td className="table-cell">{o.user?.name || "Guest"}</td>
                <td className="table-cell">{o.items?.length || 0} item(s)</td>
                <td className="table-cell font-medium">₹{o.totalAmount?.toFixed(2)}</td>
                <td className="table-cell">
                  <span className={statusColors[o.status] || "badge-info"}>{o.status}</span>
                </td>
                <td className="table-cell">
                  <span className={o.paymentStatus === "completed" ? "badge-success" : "badge-warning"}>
                    {o.paymentStatus || "pending"}
                  </span>
                </td>
                <td className="table-cell text-xs text-gray-500">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="table-cell text-right">
                  <button
                    onClick={() => setSelected(o)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <Eye size={15} className="text-blue-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Order #{selected.orderId || selected._id.slice(-8)}</h2>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Customer:</span> {selected.user?.name || "Guest"}</div>
              <div><span className="text-gray-500">Email:</span> {selected.user?.email || "—"}</div>
              <div><span className="text-gray-500">Total:</span> ₹{selected.totalAmount?.toFixed(2)}</div>
              <div>
                <span className="text-gray-500">Status:</span>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected._id, e.target.value)}
                  className="input-field ml-2 w-auto"
                >
                  {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-gray-500">Items:</span>
                <ul className="mt-1 space-y-1">
                  {(selected.items || []).map((item, i) => (
                    <li key={i} className="flex justify-between bg-gray-50 px-3 py-1.5 rounded">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary mt-4 w-full py-2">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
