import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(n || 0);

const STATUS_COLORS = {
  pending_payment: 'bg-yellow-500/15 text-yellow-300 border border-yellow-400/25',
  pending:         'bg-amber-500/15 text-amber-300 border border-amber-400/25',
  processing:      'bg-blue-500/15 text-blue-300 border border-blue-400/25',
  shipped:         'bg-purple-500/15 text-purple-300 border border-purple-400/25',
  delivered:       'bg-green-500/15 text-green-300 border border-green-400/25',
  cancelled:       'bg-red-500/15 text-red-300 border border-red-400/25',
};

const STATUS_LABEL = {
  pending_payment: 'Awaiting Payment',
  pending:         'Pending',
  processing:      'Processing',
  shipped:         'Shipped',
  delivered:       'Delivered',
  cancelled:       'Cancelled',
};

export default function AdminDashboard() {
  const [orders, setOrders]       = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);

  // Real-time listeners — auto-update on any Firestore change
  useEffect(() => {
    let ordersReady = false;
    let prodsReady  = false;
    const checkDone = () => { if (ordersReady && prodsReady) setLoading(false); };

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      ordersReady = true;
      checkDone();
    }, () => { ordersReady = true; checkDone(); });

    const unsubProds = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      prodsReady = true;
      checkDone();
    }, () => { prodsReady = true; checkDone(); });

    return () => { unsubOrders(); unsubProds(); };
  }, []);

  // Derived stats
  const revenue      = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  const awaitingPayment = orders.filter(o => o.status === 'pending_payment').length;

  const recentOrders = [...orders]
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
    .slice(0, 5);

  const topProducts = [...products]
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 5);

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">Overview</p>
        <h1 className="font-['Playfair_Display'] text-3xl text-white mt-1">Atelier Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Revenue',   value: fmt(revenue),       icon: DollarSign, delta: 'Lifetime (excl. cancelled)' },
          { label: 'Active Orders',   value: activeOrders,       icon: ShoppingBag, delta: awaitingPayment > 0 ? `${awaitingPayment} awaiting payment` : 'All up to date' },
          { label: 'Total Products',  value: products.length,    icon: Package,    delta: 'In catalog' },
        ].map(({ label, value, icon: Icon, delta }) => (
          <div key={label} className="bg-white/5 border border-white/8 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">{label}</p>
                <p className="font-['Playfair_Display'] text-3xl text-white mt-2">{value}</p>
                <p className="text-[11px] text-[#C4973F] mt-1">{delta}</p>
              </div>
              <div className="w-10 h-10 bg-[#C4973F]/10 flex items-center justify-center">
                <Icon size={18} className="text-[#C4973F]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Recent Orders */}
        <div className="bg-white/5 border border-white/8 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-['Playfair_Display'] text-xl text-white">Recent Orders</h2>
            <TrendingUp size={16} className="text-[#C4973F]" />
          </div>
          {loading ? (
            <p className="text-sm text-white/40">Loading…</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-white/40">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Order ID', 'Customer', 'Total', 'Status'].map(h => (
                      <th key={h} className="text-left pb-3 text-[9px] tracking-[0.2em] uppercase text-white/40 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 text-white/50 font-mono text-xs">{o.orderRef || `#${o.id.slice(0, 8)}`}</td>
                      <td className="py-3 text-white">{o.customer?.name || o.customer?.email?.split('@')[0] || '—'}</td>
                      <td className="py-3 text-[#C4973F] font-semibold">{fmt(o.total)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-[9px] tracking-wider uppercase rounded-sm ${
                          STATUS_COLORS[o.status] || 'bg-white/10 text-white/60'
                        }`}>
                          {STATUS_LABEL[o.status] || o.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Collections */}
        <div className="bg-white/5 border border-white/8 p-6">
          <h2 className="font-['Playfair_Display'] text-xl text-white mb-1">Top Collections</h2>
          <p className="text-[10px] text-white/40 tracking-wide mb-5">Highest-priced pieces in catalog</p>
          {loading ? (
            <p className="text-sm text-white/40">Loading…</p>
          ) : topProducts.length === 0 ? (
            <p className="text-sm text-white/40">No products yet.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#C4973F]/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-[#C4973F] font-semibold">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  {(p.imageUrl || p.images?.[0]) && (
                    <img src={p.imageUrl || p.images[0]} alt={p.name}
                      className="w-8 h-10 object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-white/40 capitalize">{p.category?.replace(/-/g, ' ')}</p>
                  </div>
                  <p className="text-xs text-[#C4973F] font-semibold shrink-0">{fmt(p.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

