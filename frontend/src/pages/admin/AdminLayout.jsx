import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  LayoutDashboard, Package, Layers, ShoppingBag, Users, MessageSquare,
  Settings, LogOut, HelpCircle, Plus, Bell, Store, Image, X, ShoppingCart
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',    to: '/admin',            icon: LayoutDashboard, end: true },
  { label: 'Inventory',    to: '/admin/products',   icon: Package },
  { label: 'Collections',  to: '/admin/categories', icon: Layers },
  { label: 'Hero Banners', to: '/admin/banners',    icon: Image },
  { label: 'Orders',       to: '/admin/orders',     icon: ShoppingBag },
  { label: 'Inquiries',    to: '/admin/inquiries',  icon: MessageSquare },
  { label: 'Settings',     to: '/admin/settings',   icon: Settings },
];

const fmt = (n) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(n || 0);

const fmtTime = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const SEEN_KEY = 'admin_seen_notifs';
const getSeen = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY)) || []); } catch { return new Set(); }
};
const addSeen = (ids) => {
  const s = getSeen();
  ids.forEach((id) => s.add(id));
  localStorage.setItem(SEEN_KEY, JSON.stringify([...s]));
};

export default function AdminLayout() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [notifs, setNotifs]         = useState([]);
  const [seenIds, setSeenIds]       = useState(getSeen);
  const notifRef = useRef();

  // Real-time: listen for pending_payment orders → notifications
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'orders'), where('status', '==', 'pending_payment'), orderBy('createdAt', 'desc')),
      (snap) => {
        setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      () => {}
    );
    return () => unsub();
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifs.filter((n) => !seenIds.has(n.id)).length;

  const markAllSeen = () => {
    const ids = notifs.map((n) => n.id);
    addSeen(ids);
    setSeenIds(getSeen());
  };

  const markOneSeen = (id) => {
    addSeen([id]);
    setSeenIds(getSeen());
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* ── Sidebar ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-white/8">
          <p className="font-['Playfair_Display'] text-[#C4973F] text-lg tracking-wide">SARFOWAA'S</p>
          <p className="font-['Playfair_Display'] text-[#C4973F] text-lg tracking-wide">COUTURE</p>
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mt-1">Management Suite</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={label} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.18em] uppercase font-medium transition-colors ${
                  isActive
                    ? 'text-[#C4973F] bg-white/5'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }>
              <Icon size={15} /> {label}
            </NavLink>
          ))}
        </nav>

        {/* New Collection CTA */}
        <div className="px-4 py-4 border-t border-white/8">
          <Link to="/admin/products"
            className="flex items-center justify-center gap-2 btn-gold w-full py-3 text-[10px] tracking-[0.2em] uppercase">
            <Plus size={13} /> New Collection
          </Link>
        </div>

        {/* Bottom actions */}
        <div className="px-3 pb-6 pt-2 space-y-0.5 border-t border-white/8">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 text-[11px] tracking-[0.18em] uppercase text-white/40 hover:text-white/70 transition-colors">
            <HelpCircle size={15} /> Help Center
          </button>
          <Link to="/"
            className="flex items-center gap-3 w-full px-3 py-2.5 text-[11px] tracking-[0.18em] uppercase text-white/40 hover:text-[#C4973F] transition-colors">
            <Store size={15} /> Back to Store
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-[11px] tracking-[0.18em] uppercase text-white/40 hover:text-red-400 transition-colors">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/8 px-6 lg:px-8 h-14 flex items-center gap-4">
          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1">
            <div className="w-5 h-px bg-white/60 mb-1.5" />
            <div className="w-5 h-px bg-white/60 mb-1.5" />
            <div className="w-5 h-px bg-white/60" />
          </button>

          <p className="text-[11px] tracking-[0.3em] uppercase text-white/60 font-semibold">Atelier Admin</p>

          <div className="ml-auto flex items-center gap-4">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) markAllSeen(); }}
                className="relative p-1"
              >
                <Bell size={18} className="text-white/40 hover:text-white transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#C4973F] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#0A0A0A] border border-[#C4973F]/20 shadow-2xl z-50 rounded-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                    <p className="text-[11px] tracking-[0.2em] uppercase text-white/60 font-medium">Notifications</p>
                    <button onClick={() => setNotifOpen(false)}>
                      <X size={14} className="text-white/40 hover:text-white" />
                    </button>
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <div className="text-center py-10">
                        <Bell size={24} className="text-white/10 mx-auto mb-2" />
                        <p className="text-white/30 text-xs">No notifications</p>
                      </div>
                    ) : (
                      notifs.map((n) => (
                        <Link
                          key={n.id}
                          to="/admin/orders"
                          onClick={() => { markOneSeen(n.id); setNotifOpen(false); }}
                          className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!seenIds.has(n.id) ? 'bg-[#C4973F]/5' : ''}`}
                        >
                          <div className="w-8 h-8 bg-[#C4973F]/15 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <ShoppingCart size={13} className="text-[#C4973F]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium">New Order — {n.orderRef || `#${n.id.slice(0,8)}`}</p>
                            <p className="text-white/50 text-[11px] mt-0.5">{n.customer?.name || 'Customer'} · {fmt(n.total)}</p>
                            <p className="text-white/25 text-[10px] mt-0.5">{fmtTime(n.createdAt)}</p>
                          </div>
                          {!seenIds.has(n.id) && (
                            <span className="w-1.5 h-1.5 bg-[#C4973F] rounded-full shrink-0 mt-1.5" />
                          )}
                        </Link>
                      ))
                    )}
                  </div>

                  {notifs.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-white/8">
                      <Link to="/admin/orders" onClick={() => setNotifOpen(false)}
                        className="text-[10px] tracking-[0.15em] uppercase text-[#C4973F] hover:text-[#C4973F]/80 transition-colors">
                        View all orders →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/admin/settings">
              <Settings size={18} className="text-white/40 hover:text-white transition-colors" />
            </Link>
            {/* Avatar */}
            <div className="w-8 h-8 bg-[#C4973F] flex items-center justify-center text-white text-xs font-semibold">
              {currentUser?.email?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

