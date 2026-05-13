import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Mail, Phone } from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getDocs(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')))
      .then((snap) => {
        setInquiries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this inquiry?')) return;
    await deleteDoc(doc(db, 'inquiries', id));
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    toast.success('Deleted');
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white font-['Playfair_Display']">Inquiries ({inquiries.length})</h1>
      </div>

      {inquiries.length === 0 && <p className="text-center text-gray-500 py-12">No inquiries yet.</p>}

      <div className="space-y-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-[#1A1A1A] border border-[#C9A84C]/10 rounded-xl overflow-hidden">
            <div
              className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-[#C9A84C]/5"
              onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{inq.name}</p>
                <p className="text-gray-500 text-xs">{inq.email}</p>
              </div>
              <p className="text-gray-400 text-sm font-medium line-clamp-1 max-w-xs">{inq.subject || 'No subject'}</p>
              <p className="text-gray-600 text-xs ml-auto">
                {inq.createdAt?.toDate ? inq.createdAt.toDate().toLocaleDateString() : '—'}
              </p>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(inq.id); }}
                className="p-1.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/30">
                <Trash2 size={14} />
              </button>
            </div>

            {expanded === inq.id && (
              <div className="border-t border-[#C9A84C]/10 p-5 space-y-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail size={14} /> <span>{inq.email}</span>
                  </div>
                  {inq.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone size={14} /> <span>{inq.phone}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Message</p>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                </div>
                <a href={`mailto:${inq.email}?subject=Re: ${inq.subject || 'Your enquiry to Sarfowaa'}`}
                  className="inline-flex items-center gap-2 btn-gold text-sm px-4 py-2">
                  <Mail size={14} /> Reply via Email
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
