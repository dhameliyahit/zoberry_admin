import { useState, useEffect, type FormEvent } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import api from "../services/api";

interface Testimonial {
  _id: string;
  review: string;
  authorName: string;
  authorRole?: string;
  authorImg?: string;
  rating: number;
  isActive: boolean;
  order: number;
}

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ review: "", authorName: "", authorRole: "", authorImg: "", rating: 5, isActive: true, order: 0 });

  const fetchItems = async () => {
    try {
      const res = await api.get("/testimonials");
      setItems(res.data.data || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ review: "", authorName: "", authorRole: "", authorImg: "", rating: 5, isActive: true, order: items.length });
    setShowForm(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      review: t.review,
      authorName: t.authorName,
      authorRole: t.authorRole || "",
      authorImg: t.authorImg || "",
      rating: t.rating || 5,
      isActive: t.isActive,
      order: t.order ?? 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/testimonials/${editing._id}`, form);
      } else {
        await api.post("/testimonials", form);
      }
      setShowForm(false);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await api.delete(`/testimonials/${id}`);
    setItems((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <h3 className="font-semibold">{editing ? "Edit Testimonial" : "New Testimonial"}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
              <textarea value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} className="input-field min-h-[80px]" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Role</label>
                <input value={form.authorRole} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author Image URL</label>
              <input value={form.authorImg} onChange={(e) => setForm({ ...form, authorImg: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="input-field" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              Active
            </label>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary px-4 py-2">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="table-header w-8"></th>
              <th className="table-header">Author</th>
              <th className="table-header">Review</th>
              <th className="table-header">Rating</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No testimonials</td></tr>
            ) : items.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="table-cell"><GripVertical size={14} className="text-gray-300" /></td>
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    {t.authorImg && <img src={t.authorImg} alt="" className="w-8 h-8 rounded-full object-cover" />}
                    <div>
                      <p className="font-medium">{t.authorName}</p>
                      {t.authorRole && <p className="text-xs text-gray-500">{t.authorRole}</p>}
                    </div>
                  </div>
                </td>
                <td className="table-cell max-w-[300px] truncate text-gray-500">{t.review}</td>
                <td className="table-cell">{"★".repeat(t.rating || 5)}</td>
                <td className="table-cell">
                  <span className={t.isActive ? "badge-success" : "badge-danger"}>
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="table-cell text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Edit size={15} className="text-blue-600" />
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
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
  );
}
