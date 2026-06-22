import { useState, useEffect, useRef, type FormEvent } from "react";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import api from "../services/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image: "" });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", image: "" });
    setFile(null);
    setFilePreview("");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", image: cat.image || "" });
    setFile(null);
    setFilePreview("");
    setShowForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setFilePreview(URL.createObjectURL(f));
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (file) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("slug", form.slug);
        if (form.description) fd.append("description", form.description);
        fd.append("image", file);
        if (editing) {
          await api.put(`/categories/${editing._id}`, fd);
        } else {
          await api.post("/categories", fd);
        }
      } else {
        if (editing) {
          await api.put(`/categories/${editing._id}`, form);
        } else {
          await api.post("/categories", form);
        }
      }
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c._id !== id));
  };

  const previewUrl = filePreview || form.image;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <h3 className="font-semibold">{editing ? "Edit Category" : "New Category"}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={form.image}
                  onChange={(e) => { setForm({ ...form, image: e.target.value }); setFile(null); setFilePreview(""); }}
                  className="input-field"
                  placeholder="Paste image URL..."
                />
                <span className="text-gray-400 text-sm self-center">or</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary shrink-0"
                >
                  <Upload size={16} /> Browse
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt=""
                  className="w-24 h-24 rounded-lg object-cover border"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary px-4 py-2">
                {editing ? "Update" : "Create"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2">
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
              <th className="table-header">Name</th>
              <th className="table-header">Slug</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-500">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-500">No categories</td></tr>
            ) : categories.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    {c.image && <img src={c.image} alt="" className="w-8 h-8 rounded object-cover" />}
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="table-cell text-gray-500">{c.slug}</td>
                <td className="table-cell">
                  <span className={c.isActive !== false ? "badge-success" : "badge-danger"}>
                    {c.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="table-cell text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Edit size={15} className="text-blue-600" />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
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
