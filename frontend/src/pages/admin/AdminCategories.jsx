import { useEffect, useState, useRef } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const DEFAULT_CATS = [
  { name: 'Bridal Gowns', slug: 'bridal-gowns', description: 'Exquisite bridal creations for your special day' },
  { name: 'Beadings', slug: 'beadings', description: 'Intricate beaded designs that celebrate African heritage' },
  { name: 'Corporate Outfits', slug: 'corporate-outfits', description: 'Sophisticated attire for the professional woman' },
  { name: 'Custom Outfits', slug: 'custom-outfits', description: 'Bespoke creations tailored to your vision' },
  { name: 'Luxury Wears', slug: 'luxury-wears', description: 'Premium everyday luxury for the discerning woman' },
];

const EMPTY = { name: '', slug: '', description: '', imageUrl: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    const snap = await getDocs(collection(db, 'categories'));
    setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const seedDefaults = async () => {
    if (!confirm('This will add the 5 default Sarfowaa categories. Continue?')) return;
    for (const cat of DEFAULT_CATS) {
      await addDoc(collection(db, 'categories'), { ...cat, createdAt: serverTimestamp() });
    }
    toast.success('Default categories added');
    load();
  };

  const handleFile = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'categories');
      setForm((prev) => ({ ...prev, imageUrl: url }));
      toast.success('Image uploaded');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-');
      const data = { ...form, slug, updatedAt: serverTimestamp() };
      if (editing) {
        await updateDoc(doc(db, 'categories', editing), data);
        toast.success('Category updated');
      } else {
        await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() });
        toast.success('Category added');
      }
      setShowForm(false); setEditing(null); load();
    } catch (err) { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    await deleteDoc(doc(db, 'categories', cat.id));
    toast.success('Deleted');
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white font-['Playfair_Display']">Categories ({categories.length})</h1>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <button onClick={seedDefaults} className="btn-outline-gold text-sm px-4 py-2">Seed Defaults</button>
          )}
          <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="btn-gold">
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 && (
          <p className="text-gray-500 text-sm col-span-3 text-center py-10">
            No categories yet. Click "Seed Defaults" to add the 5 Sarfowaa service categories.
          </p>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="bg-[#1A1A1A] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
            {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-full h-32 object-cover" />}
            {!cat.imageUrl && <div className="w-full h-32 bg-[#242424] flex items-center justify-center text-gray-600 text-sm">No image</div>}
            <div className="p-4">
              <h3 className="text-white font-semibold">{cat.name}</h3>
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{cat.description}</p>
              <p className="text-[#C9A84C]/60 text-xs mt-1 font-mono">{cat.slug}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setEditing(cat.id); setForm({ ...EMPTY, ...cat }); setShowForm(true); }}
                  className="flex-1 p-1.5 rounded bg-blue-500/15 text-blue-400 hover:bg-blue-500/30 flex items-center justify-center gap-1 text-xs">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(cat)}
                  className="flex-1 p-1.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/30 flex items-center justify-center gap-1 text-xs">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="bg-[#1A1A1A] border border-[#C9A84C]/15 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#C9A84C]/10 flex-shrink-0">
              <h2 className="text-white font-bold">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Category Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Slug (auto-generated if blank)</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. bridal-gowns"
                  className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60 resize-none" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Category Image</label>
                {form.imageUrl && <img src={form.imageUrl} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />}
                <button type="button" onClick={() => fileRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[#C9A84C]/30 text-gray-500 hover:border-[#C9A84C]/60 hover:text-[#C9A84C] text-sm transition-colors w-full justify-center">
                  {uploading ? <div className="w-4 h-4 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" /> : <Upload size={14} />}
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center py-2.5">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Category'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
