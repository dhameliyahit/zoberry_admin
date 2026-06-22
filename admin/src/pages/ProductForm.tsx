import { useState, useEffect, useRef, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Upload } from "lucide-react";
import api from "../services/api";

interface VariantOption {
  label: string;
  price: string;
  discountedPrice: string;
  sku: string;
  stock: string;
}

interface Variant {
  name: string;
  options: VariantOption[];
}

interface Spec {
  key: string;
  value: string;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    discountedPrice: "",
    category: "",
    stock: "",
    sku: "",
    isActive: true,
    hasVariants: false,
  });

  const [specs, setSpecs] = useState<Spec[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data || []));
    if (isEdit) {
      setLoading(true);
      api.get(`/products/${id}`).then((res) => {
        const p = res.data.data;
        setForm({
          name: p.name,
          slug: p.slug || "",
          description: p.description || "",
          price: String(p.price || ""),
          discountedPrice: String(p.discountedPrice || ""),
          category: p.category?._id || p.category || "",
          stock: String(p.stock ?? ""),
          sku: p.sku || "",
          isActive: p.isActive ?? true,
          hasVariants: p.hasVariants ?? false,
        });
        setSpecs(p.specifications || []);
        setVariants(p.variants || []);
        setImages(p.images || []);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: keyof Spec, val: string) => {
    const copy = [...specs];
    copy[i] = { ...copy[i], [field]: val };
    setSpecs(copy);
  };

  const addVariant = () =>
    setVariants([...variants, { name: "", options: [{ label: "", price: "", discountedPrice: "", sku: "", stock: "" }] }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, val: string) => {
    const copy = [...variants];
    copy[i] = { ...copy[i], name: val };
    setVariants(copy);
  };

  const addOption = (vi: number) => {
    const copy = [...variants];
    copy[vi].options.push({ label: "", price: "", discountedPrice: "", sku: "", stock: "" });
    setVariants(copy);
  };
  const removeOption = (vi: number, oi: number) => {
    const copy = [...variants];
    copy[vi].options = copy[vi].options.filter((_, idx) => idx !== oi);
    setVariants(copy);
  };
  const updateOption = (vi: number, oi: number, field: keyof VariantOption, val: string) => {
    const copy = [...variants];
    copy[vi].options[oi] = { ...copy[vi].options[oi], [field]: val };
    setVariants(copy);
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl("");
    }
  };
  const removeImage = (i: number) => setImages(images.filter((_, idx) => idx !== i));
  const removeFile = (i: number) => {
    setFiles(files.filter((_, idx) => idx !== i));
    setFilePreviews(filePreviews.filter((_, idx) => idx !== i));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    const previews = selected.map((f) => URL.createObjectURL(f));
    setFilePreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const body = new FormData();
      body.append("name", form.name);
      if (form.slug) body.append("slug", form.slug);
      if (form.description) body.append("description", form.description);
      if (form.price) body.append("price", form.price);
      if (form.discountedPrice) body.append("discountedPrice", form.discountedPrice);
      if (form.category) body.append("category", form.category);
      if (form.stock) body.append("stock", form.stock);
      if (form.sku) body.append("sku", form.sku);
      body.append("isActive", String(form.isActive));
      body.append("hasVariants", String(form.hasVariants));

      const validSpecs = specs.filter((s) => s.key && s.value);
      if (validSpecs.length > 0) {
        body.append("specifications", JSON.stringify(validSpecs));
      }

      if (form.hasVariants) {
        const validVariants = variants
          .filter((v) => v.name)
          .map((v) => ({
            ...v,
            options: v.options.filter((o) => o.label),
          }));
        if (validVariants.length > 0) {
          body.append("variants", JSON.stringify(validVariants));
        }
      }

      if (images.length > 0) {
        body.append("images", JSON.stringify(images));
      }

      files.forEach((f) => body.append("images", f));

      const headers: Record<string, string> = {};

      if (isEdit) {
        await api.put(`/products/${id}`, body, { headers });
      } else {
        await api.post("/products", body, { headers });
      }
      navigate("/products");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> Back to Products
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? "Edit Product" : "New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Pricing & Inventory</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
              <input
                type="number"
                step="0.01"
                value={form.discountedPrice}
                onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Images</h2>

          {/* URL paste */}
          <div className="flex gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="Paste image URL..."
            />
            <button type="button" onClick={addImage} className="btn-primary shrink-0">
              <Plus size={16} /> Add
            </button>
          </div>

          {/* File upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary w-full py-3 border-dashed gap-2"
            >
              <Upload size={18} /> Click to upload images from your computer
            </button>
          </div>

          {/* Preview grid */}
          {(images.length > 0 || filePreviews.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={`url-${i}`} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover border" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {filePreviews.map((preview, i) => (
                <div key={`file-${i}`} className="relative group">
                  <img src={preview} alt="" className="w-20 h-20 rounded-lg object-cover border ring-2 ring-blue-300" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-blue-500 text-white px-1 rounded">new</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Specifications</h2>
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-3 items-start">
              <input
                value={spec.key}
                onChange={(e) => updateSpec(i, "key", e.target.value)}
                className="input-field"
                placeholder="Key (e.g. Brand)"
              />
              <input
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                className="input-field"
                placeholder="Value (e.g. Apple)"
              />
              <button type="button" onClick={() => removeSpec(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <X size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addSpec} className="text-sm text-blue-600 hover:text-blue-700">
            + Add specification
          </button>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Variants</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.hasVariants}
                onChange={(e) => setForm({ ...form, hasVariants: e.target.checked })}
                className="rounded"
              />
              Enable Variants
            </label>
          </div>

          {form.hasVariants && variants.map((v, vi) => (
            <div key={vi} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  value={v.name}
                  onChange={(e) => updateVariant(vi, e.target.value)}
                  className="input-field"
                  placeholder="Variant type (e.g. Color)"
                />
                <button type="button" onClick={() => removeVariant(vi)} className="text-red-500 p-1">
                  <X size={16} />
                </button>
              </div>
              {v.options.map((o, oi) => (
                <div key={oi} className="flex gap-2 items-start">
                  <input value={o.label} onChange={(e) => updateOption(vi, oi, "label", e.target.value)} className="input-field w-32" placeholder="Label" />
                  <input type="number" step="0.01" value={o.price} onChange={(e) => updateOption(vi, oi, "price", e.target.value)} className="input-field w-24" placeholder="Price" />
                  <input type="number" step="0.01" value={o.discountedPrice} onChange={(e) => updateOption(vi, oi, "discountedPrice", e.target.value)} className="input-field w-24" placeholder="Disc." />
                  <input value={o.sku} onChange={(e) => updateOption(vi, oi, "sku", e.target.value)} className="input-field w-28" placeholder="SKU" />
                  <input type="number" value={o.stock} onChange={(e) => updateOption(vi, oi, "stock", e.target.value)} className="input-field w-20" placeholder="Stock" />
                  <button type="button" onClick={() => removeOption(vi, oi)} className="text-red-500 p-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addOption(vi)} className="text-sm text-blue-600 hover:text-blue-700">
                + Add option
              </button>
            </div>
          ))}
          {form.hasVariants && (
            <button type="button" onClick={addVariant} className="text-sm text-blue-600 hover:text-blue-700">
              + Add variant type
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            Active
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/products")} className="btn-secondary px-6 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
