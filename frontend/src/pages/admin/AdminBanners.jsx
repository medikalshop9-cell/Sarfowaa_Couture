import { useEffect, useState, useRef } from 'react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Plus, Pencil, Trash2, X, Upload, GripVertical } from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const EMPTY = { title: '', subtitle: '', cta: '', ctaLink: '/shop', imageUrl: '', order: 0, active: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    const snap = await getDocs(query(collection(db, 'banners'), orderBy('order')));
    setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (b) => { setEditing(b.id); setForm({ ...EMPTY, ...b }); setShowForm(true); };
  const close = () => { setShowForm(false); setEditing(null); };

  const handleFile = async (file) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'banners');
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
    if (!form.imageUrl) { toast.error('Please upload a banner image'); return; }
    setSaving(true);
    try {
      const data = { ...form, order: parseInt(form.order) || 0, updatedAt: serverTimestamp() };
      if (editing) {
        await updateDoc(doc(db, 'banners', editing), data);
        toast.success('Banner updated');
      } else {
        await addDoc(collection(db, 'banners'), { ...data, createdAt: serverTimestamp() });
        toast.success('Banner added');
      }
      close(); load();
    } catch (err) { toast.error('Save failed'); console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (b) => {
    if (!confirm('Delete this banner?')) return;
    await deleteDoc(doc(db, 'banners', b.id));
    toast.success('Deleted');
    setBanners((prev) => prev.filter((x) => x.id !== b.id));
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white font-['Playfair_Display']">Hero Banners ({banners.length})</h1>
        <button onClick={openNew} className="btn-gold"><Plus size={16} /> Add Banner</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {banners.length === 0 && <p className="text-gray-500 text-sm col-span-2 text-center py-10">No banners yet. Add one to show on the homepage.</p>}
        {banners.map((b) => (
          <div key={b.id} className="bg-[#1A1A1A] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
            <div className="relative h-40">
              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4">
                <p className="text-white font-bold text-lg line-clamp-1">{b.title}</p>
                <p className="text-gray-300 text-sm line-clamp-1">{b.subtitle}</p>
              </div>
              <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-semibold ${b.active ? 'bg-green-500/80 text-white' : 'bg-gray-600 text-gray-300'}`}>
                {b.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-gray-500 text-xs">Order: {b.order}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(b)} className="p-1.5 rounded bg-blue-500/15 text-blue-400 hover:bg-blue-500/30"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(b)} className="p-1.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/30"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center px-4 py-6">
          <div className="bg-[#1A1A1A] border border-[#C9A84C]/15 rounded-2xl w-full max-w-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[#C9A84C]/10 bg-[#1A1A1A] rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={close} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Banner Image *</label>
                {form.imageUrl && <img src={form.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />}
                <button type="button" onClick={() => fileRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#C9A84C]/30 text-gray-500 hover:border-[#C9A84C]/60 hover:text-[#C9A84C] text-sm transition-colors w-full justify-center">
                  {uploading ? <div className="w-4 h-4 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'Uploading...' : form.imageUrl ? 'Replace Image' : 'Upload Image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
              </div>

              {[
                { label: 'Title', key: 'title', placeholder: 'e.g. Embrace Elegance' },
                { label: 'Subtitle', key: 'subtitle', placeholder: 'e.g. Handcrafted luxury for the modern Ghanaian woman' },
                { label: 'CTA Button Text', key: 'cta', placeholder: 'e.g. Explore Collection' },
                { label: 'CTA Link', key: 'ctaLink', placeholder: '/shop' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-gray-400 text-sm mb-1.5">{label}</label>
                  <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">Display Order</label>
                  <input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60" />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-[#C9A84C]' : 'bg-gray-700'} relative`}
                      onClick={() => setForm({ ...form, active: !form.active })}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-gray-400 text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || uploading} className="btn-gold flex-1 justify-center py-2.5">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Banner'}
                </button>
                <button type="button" onClick={close} className="btn-outline-gold px-6">Cancel</button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
