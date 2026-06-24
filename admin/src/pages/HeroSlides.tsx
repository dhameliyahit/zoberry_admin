import { useState, useEffect, type FormEvent } from "react";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import api from "../services/api";

interface HeroSlide {
  _id: string;
  discount: string;
  subtitle: string;
  title: string;
  description: string;
  link: string;
  image: string;
  isActive: boolean;
  order: number;
}

export default function HeroSlides() {
  const [items, setItems] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState({
    discount: "",
    subtitle: "",
    title: "",
    description: "",
    link: "",
    image: "",
    isActive: true,
    order: 0,
  });

  const fetchItems = async () => {
    try {
      const res = await api.get("/hero-slides");
      setItems(res.data.data || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({
      discount: "",
      subtitle: "",
      title: "",
      description: "",
      link: "#",
      image: "",
      isActive: true,
      order: items.length,
    });
    setShowForm(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditing(s);
    setForm({
      discount: s.discount || "",
      subtitle: s.subtitle || "",
      title: s.title || "",
      description: s.description || "",
      link: s.link || "",
      image: s.image || "",
      isActive: s.isActive,
      order: s.order ?? 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/hero-slides/${editing._id}`, form);
      } else {
        await api.post("/hero-slides", form);
      }
      setShowForm(false);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hero slide?")) return;
    await api.delete(`/hero-slides/${id}`);
    setItems((prev) => prev.filter((s) => s._id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hero Slides</h1>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Add Hero Slide
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <h3 className="font-semibold">
              {editing ? "Edit Hero Slide" : "New Hero Slide"}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Label (e.g. 30%)
                </label>
                <input
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 30%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle (e.g. Sale Off)
                </label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Sale Off"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slide Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="e.g. Premium Noise Cancelling Headphones"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input-field min-h-[80px]"
                placeholder="Brief summary text for slide..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Action Link
                </label>
                <input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="input-field"
                  placeholder="e.g. /shop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order (Sort Sequence)
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slide Image URL / Path
              </label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input-field"
                placeholder="e.g. /images/hero/hero-01.png"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="rounded"
              />
              Active
            </label>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary px-4 py-2">
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="table-header w-8"></th>
              <th className="table-header">Slide Details</th>
              <th className="table-header">Discount</th>
              <th className="table-header">Link</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  No slides available
                </td>
              </tr>
            ) : (
              items.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <GripVertical size={14} className="text-gray-300" />
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      {s.image && (
                        <img
                          src={s.image}
                          alt=""
                          className="w-14 h-10 object-contain rounded bg-gray-100"
                        />
                      )}
                      <div>
                        <p className="font-medium text-sm">{s.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[250px]">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-sm">{s.discount || "-"}</td>
                  <td className="table-cell text-sm text-gray-500">{s.link}</td>
                  <td className="table-cell">
                    <span
                      className={s.isActive ? "badge-success" : "badge-danger"}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit size={15} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                      >
                        <Trash2 size={15} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
