import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import Loader from '../components/Loader';

const fmt = (p) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(p || 0);

const fmtDate = (ts) => {
  if (!ts) return 'Just now';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' });
};

const STATUS_CONFIG = {
  pending_payment: {
    label: 'Awaiting Payment',
    icon: <Clock size={13} />,
    color: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/30',
    note: 'Please complete your MoMo payment to proceed.',
  },
  pending: {
    label: 'Awaiting Confirmation',
    icon: <Loader2 size={13} className="animate-spin" />,
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    note: 'Our atelier has received your order and is reviewing it. You will be notified once confirmed.',
  },
  confirmed: {
    label: 'Order Confirmed',
    icon: <CheckCircle size={13} />,
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    note: 'Your order has been confirmed! Our team will begin crafting your piece.',
  },
  processing: {
    label: 'Being Crafted',
    icon: <Package size={13} />,
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    note: 'Your bespoke piece is currently being crafted by our artisans.',
  },
  shipped: {
    label: 'Shipped',
    icon: <Truck size={13} />,
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    note: 'Your order is on its way to you.',
  },
  delivered: {
    label: 'Delivered',
    icon: <CheckCircle size={13} />,
    color: 'text-green-400 bg-green-400/10 border-green-400/30',
    note: 'Your order has been delivered. Enjoy your piece!',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle size={13} />,
    color: 'text-red-400 bg-red-400/10 border-red-400/30',
    note: 'This order has been cancelled. Contact us if you have questions.',
  },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q,
      (snap) => { setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      (err) => { console.error('[orders]', err); setLoading(false); }
    );
    return () => unsub();
  }, [user]);

  if (loading) return <div className="pt-20"><Loader /></div>;

  return (
    <div className="bg-[#0A0A0A] pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4973F]/70 mb-2"
            style={{ fontFamily: "'Cinzel Decorative',serif" }}>
            Your Atelier
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl text-white">My Orders</h1>
          <p className="text-white/35 text-sm mt-1">
            Track your bespoke selections in real time.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-28">
            <ShoppingBag size={52} className="text-[#C4973F]/30 mx-auto mb-5" />
            <p className="font-['Playfair_Display'] text-xl text-white">No orders yet</p>
            <p className="text-white/35 text-sm mt-2 mb-8">
              Your completed purchases will appear here.
            </p>
            <Link to="/shop" className="btn-gold px-8 py-3">Explore the Collection</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isPending = order.status === 'pending' || order.status === 'pending_payment';
              const ref = order.orderRef || ('#' + order.id.slice(-8).toUpperCase());

              return (
                <div key={order.id}
                  className={`bg-[#1A1A1A] rounded-2xl border overflow-hidden transition-colors ${
                    isPending ? 'border-amber-400/20' : 'border-[#C9A84C]/10'
                  }`}>

                  {/* Status banner for pending */}
                  {isPending && (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-400/8 border-b border-amber-400/15">
                      <AlertCircle size={13} className="text-amber-400 shrink-0" />
                      <p className="text-amber-300/80 text-[11px]">{cfg.note}</p>
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    {/* Top row: ref + status + date */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-white font-semibold font-mono tracking-wide">{ref}</p>
                        <p className="text-white/30 text-xs mt-0.5">{fmtDate(order.createdAt)}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    {/* Confirmed/non-pending note */}
                    {!isPending && order.status !== 'pending_payment' && (
                      <p className="text-white/30 text-xs mb-4 leading-relaxed">{cfg.note}</p>
                    )}

                    {/* Items */}
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">
                            {item.name}
                            {item.size && <span className="text-white/30 ml-1">({item.size})</span>}
                            <span className="text-white/30 ml-1">× {item.qty}</span>
                          </span>
                          <span className="text-[#C9A84C] font-medium">{fmt(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-white/8 pt-3 flex items-center justify-between">
                      <span className="text-white/30 text-xs tracking-wider uppercase">Total</span>
                      <span className="text-[#C9A84C] font-bold font-['Playfair_Display'] text-lg">
                        {fmt(order.total)}
                      </span>
                    </div>

                    {/* Shipping address if available */}
                    {order.shippingAddress && (
                      <p className="text-white/20 text-[11px] mt-3">
                        Shipping to: {order.shippingAddress.address}, {order.shippingAddress.city}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

