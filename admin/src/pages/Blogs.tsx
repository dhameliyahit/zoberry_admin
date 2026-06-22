import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import api from "../services/api";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  author?: string;
  views: number;
  isActive: boolean;
  createdAt: string;
  image?: string;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBlogs = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      const res = await api.get("/blogs", { params });
      setBlogs(res.data.data || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    await api.delete(`/blogs/${id}`);
    setBlogs((prev) => prev.filter((b) => b._id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
        <Link to="/blogs/new" className="btn-primary">
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search blog posts..."
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
              <th className="table-header">Title</th>
              <th className="table-header">Category</th>
              <th className="table-header">Author</th>
              <th className="table-header">Views</th>
              <th className="table-header">Date</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading...</td></tr>
            ) : blogs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No blog posts</td></tr>
            ) : blogs.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    {b.image && <img src={b.image} alt="" className="w-10 h-10 rounded object-cover" />}
                    <span className="font-medium truncate max-w-[250px]">{b.title}</span>
                  </div>
                </td>
                <td className="table-cell text-gray-500">{b.category || "—"}</td>
                <td className="table-cell text-gray-500">{b.author || "—"}</td>
                <td className="table-cell">{b.views ?? 0}</td>
                <td className="table-cell text-sm text-gray-500">
                  {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="table-cell text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/blogs/${b._id}`} className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Edit size={15} className="text-blue-600" />
                    </Link>
                    <button onClick={() => handleDelete(b._id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
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
