import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import api from "../services/api";

interface Product {
  _id: string;
  name: string;
  category?: { name: string } | string;
  price: number;
  discountedPrice?: number;
  stock: number;
  isActive: boolean;
  images: string[];
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      const params = search ? { search } : {};
      const res = await api.get("/products", { params });
      setProducts(res.data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const getCategoryName = (cat: any) => {
    if (!cat) return "—";
    return typeof cat === "string" ? cat : cat.name;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <Link to="/products/new" className="btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="table-header">Product</th>
                <th className="table-header">Category</th>
                <th className="table-header">Price</th>
                <th className="table-header">Stock</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No products found</td></tr>
              ) : products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || "https://placehold.co/40x40"}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <span className="font-medium text-gray-800 truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">{getCategoryName(p.category)}</td>
                  <td className="table-cell">
                    {p.discountedPrice ? (
                      <>
                          <span className="font-medium">₹{p.discountedPrice}</span>
                          <span className="text-gray-400 line-through ml-1 text-xs">₹{p.price}</span>
                      </>
                    ) : (
                      <span className="font-medium">₹{p.price}</span>
                    )}
                  </td>
                  <td className="table-cell">{p.stock ?? "—"}</td>
                  <td className="table-cell">
                    <span className={p.isActive ? "badge-success" : "badge-danger"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/products/${p._id}`} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Edit size={15} className="text-blue-600" />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Trash2 size={15} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
