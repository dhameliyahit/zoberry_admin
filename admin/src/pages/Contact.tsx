import { useState, useEffect } from "react";
import { Eye, Mail, CheckCircle } from "lucide-react";
import api from "../services/api";

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Contact() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Enquiry | null>(null);

  const fetchItems = async () => {
    try {
      const res = await api.get("/contact");
      setItems(res.data.data || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const markRead = async (id: string) => {
    await api.put(`/contact/${id}`, { isRead: true });
    setItems((prev) => prev.map((c) => (c._id === id ? { ...c, isRead: true } : c)));
    if (selected?._id === id) setSelected({ ...selected, isRead: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    await api.delete(`/contact/${id}`);
    setItems((prev) => prev.filter((c) => c._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Enquiries</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">No enquiries</div>
          ) : items.map((c) => (
            <button
              key={c._id}
              onClick={() => { setSelected(c); if (!c.isRead) markRead(c._id); }}
              className={`w-full text-left card p-4 transition-colors ${!c.isRead ? "border-blue-400 bg-blue-50/50" : ""} ${selected?._id === c._id ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.subject || "No subject"}</p>
                </div>
                {!c.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
              </p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Mail size={14} />{selected.email}</span>
                    {selected.phone && <span>{selected.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected.isRead && <CheckCircle size={16} className="text-green-500" />}
                  <button onClick={() => handleDelete(selected._id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
                </div>
              </div>
              {selected.subject && (
                <div className="mb-3 text-sm">
                  <span className="text-gray-500">Subject:</span> {selected.subject}
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                {selected.message}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Received: {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ""}
              </p>
            </div>
          ) : (
            <div className="card flex items-center justify-center h-48 text-gray-400">
              Select an enquiry to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
