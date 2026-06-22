import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../services/api";

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    author: "",
    image: "",
    isActive: true,
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/blogs/${id}`).then((res) => {
        const b = res.data.data;
        setForm({
          title: b.title,
          slug: b.slug || "",
          excerpt: b.excerpt || "",
          content: b.content || "",
          category: b.category || "",
          tags: Array.isArray(b.tags) ? b.tags.join(", ") : b.tags || "",
          author: b.author || "",
          image: b.image || "",
          isActive: b.isActive ?? true,
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await api.put(`/blogs/${id}`, payload);
      } else {
        await api.post("/blogs", payload);
      }
      navigate("/blogs");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div>
      <button onClick={() => navigate("/blogs")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Blogs
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? "Edit Post" : "New Post"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Post Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input-field min-h-[60px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field min-h-[200px] font-mono text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="tech, business" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
          Published
        </label>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
          </button>
          <button type="button" onClick={() => navigate("/blogs")} className="btn-secondary px-6 py-2.5">Cancel</button>
        </div>
      </form>
    </div>
  );
}
