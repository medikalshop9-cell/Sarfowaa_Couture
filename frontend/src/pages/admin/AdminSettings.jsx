import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Save } from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const EMPTY = {
  storeName: 'Sarfowaa',
  tagline: 'Luxury African Fashion Atelier',
  phone: '',
  email: '',
  address: '',
  city: 'Accra',
  facebook: '',
  instagram: '',
  twitter: '',
  whatsapp: '',
  tiktok: '',
  metaDescription: '',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'site')).then((d) => {
      if (d.exists()) setSettings({ ...EMPTY, ...d.data() });
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), { ...settings, updatedAt: serverTimestamp() });
      toast.success('Settings saved');
    } catch (err) { toast.error('Failed to save'); console.error(err); }
    finally { setSaving(false); }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div key={key}>
      <label className="block text-gray-400 text-sm mb-1.5">{label}</label>
      <input type={type} value={settings[key] || ''} placeholder={placeholder}
        onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
        className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60" />
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white font-['Playfair_Display'] mb-6">Site Settings</h1>
      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* Brand */}
        <Section title="Brand Identity">
          {field('Store Name', 'storeName', 'text', 'Sarfowaa')}
          {field('Tagline', 'tagline', 'text', 'Luxury African Fashion Atelier')}
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Meta Description (SEO)</label>
            <textarea rows={2} value={settings.metaDescription || ''} placeholder="Brief description for search engines"
              onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
              className="w-full bg-[#242424] border border-[#C9A84C]/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A84C]/60 resize-none" />
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact Information">
          {field('Phone Number', 'phone', 'tel', '+233 XX XXX XXXX')}
          {field('Email Address', 'email', 'email', 'hello@sarfowaa.com')}
          {field('Street Address', 'address', 'text', 'e.g. 12 Liberation Road')}
          {field('City', 'city', 'text', 'Accra')}
        </Section>

        {/* Social */}
        <Section title="Social Media Links">
          {field('Instagram URL', 'instagram', 'url', 'https://instagram.com/sarfowaa')}
          {field('Facebook URL', 'facebook', 'url', 'https://facebook.com/sarfowaa')}
          {field('TikTok URL', 'tiktok', 'url', 'https://tiktok.com/@sarfowaa')}
          {field('Twitter / X URL', 'twitter', 'url', 'https://x.com/sarfowaa')}
          {field('WhatsApp Number', 'whatsapp', 'tel', '+233XXXXXXXXX')}
        </Section>

        <button type="submit" disabled={saving} className="btn-gold px-8 py-3 text-base">
          <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#1A1A1A] border border-[#C9A84C]/10 rounded-xl p-5 space-y-4">
      <h2 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}
