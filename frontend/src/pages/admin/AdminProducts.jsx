import { useEffect, useState, useRef } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const CATEGORIES = ['bridal-gowns', 'beadings', 'corporate-outfits', 'custom-outfits', 'luxury-wears'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Custom'];

const EMPTY = {
  name: '', category: '', price: '', oldPrice: '', description: '',
  featured: false, newArrival: false, badge: '', sizes: [], stock: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setImages([]); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({ ...EMPTY, ...p, price: p.price?.toString(), oldPrice: p.oldPrice?.toString() || '', stock: p.stock?.toString() || '' });
    setImages(p.images || (p.imageUrl ? [p.imageUrl] : []));
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setImages([]); };

  const handleFiles = async (files) => {
    setUploading(true);
    const urls = [];
    try {
      for (const file of files) {
        const url = await uploadToCloudinary(file, 'products');
        urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => setImages((prev) => prev.filter((u) => u !== url));

  const handleToggleSize = (s) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes?.includes(s) ? prev.sizes.filter((x) => x !== s) : [...(prev.sizes || []), s],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
        stock: form.stock ? parseInt(form.stock) : null,
        images,
        imageUrl: images[0] || '',
        updatedAt: serverTimestamp(),
      };
      if (editing) {
        await updateDoc(doc(db, 'products', editing), data);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
        toast.success('Product added');
      }
      closeForm();
      load();
    } catch (err) { toast.error('Save failed'); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    await deleteDoc(doc(db, 'products', product.id));
    toast.success('Deleted');
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  if (loading && !showForm) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white font-['Playfair_Display']">Products ({products.length})</h1>
        <button onClick={openNew} className="btn-gold"><Plus size={16} /> Add Product</button>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#C9A84C]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-[#C9A84C]/10 uppercase tracking-wider">
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Price</th>
                <th className="text-left px-5 py-3">Featured</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[#C9A84C]/5 hover:bg-[#C9A84C]/5">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl || p.images?.[0] || '/placeholder-product.jpg'} alt={p.name}
                        className="w-10 h-12 object-cover rounded" />
                      <span className="text-white line-clamp-2 max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 capitalize">{p.category?.replace(/-/g, ' ')}</td>
                  <td className="px-5 py-3 text-[#C9A84C] font-semibold">
                    GHS {p.price?.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.featured ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-gray-800 text-gray-500'}`}>
                      {p.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded bg-blue-500/15 text-blue-400 hover:bg-blue-500/30"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p)} className="p-1.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/30"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center text-gray-500 text-sm py-10">No products yet.</p>}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-6 px-4">
          <div className="bg-[#1A1A1A] border border-[#C9A84C]/15 rounded-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#C9A84C]/10">
              <h2 className="text-white font-bold text-lg">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Images */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Product Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {images.map((url) => (
                    <div key={url} className="relative w-20 h-24">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(url)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileRef.current.click()}
                    className="w-20 h-24 rounded-lg border-2 border-dashed border-[#C9A84C]/30 flex flex-col items-center justify-center text-gray-500 hover:border-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors">
                    {uploading ? <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" /> : <><Upload size={18} /><span className="text-xs mt-1">Upload</span></>}
                  </button>
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={(e) => handleFiles(Array.from(e.target.files))} />
              </div>

              {/* Name */}
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Product Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Category *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60">
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>)}
                </select>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">Price (GHS) *</label>
                  <input type="number" required min="0" step="0.01" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">Old Price (GHS)</label>
                  <input type="number" min="0" step="0.01" value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60"
                    placeholder="Leave blank if no sale" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60 resize-none" />
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <button type="button" key={s} onClick={() => handleToggleSize(s)}
                      className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                        form.sizes?.includes(s) ? 'bg-[#C9A84C] border-[#C9A84C] text-black font-semibold' : 'border-[#C9A84C]/30 text-gray-400 hover:border-[#C9A84C]/60'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge + Toggles */}
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Badge (e.g. "New", "Hot")</label>
                <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60"
                  placeholder="Optional" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-3">
                  <div className={`w-11 h-6 rounded-full transition-colors ${form.featured ? 'bg-[#C9A84C]' : 'bg-gray-700'} relative shrink-0`}
                    onClick={() => setForm({ ...form, featured: !form.featured })}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="text-white text-sm">Featured</p>
                    <p className="text-gray-500 text-xs">Homepage spotlight</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-3">
                  <div className={`w-11 h-6 rounded-full transition-colors ${form.newArrival ? 'bg-[#C9A84C]' : 'bg-gray-700'} relative shrink-0`}
                    onClick={() => setForm({ ...form, newArrival: !form.newArrival })}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.newArrival ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="text-white text-sm">New Arrival</p>
                    <p className="text-gray-500 text-xs">Shows on homepage</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || uploading} className="btn-gold flex-1 justify-center py-2.5">
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" onClick={closeForm} className="btn-outline-gold px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
