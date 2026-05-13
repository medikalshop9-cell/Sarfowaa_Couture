import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShieldCheck, Gift, ArrowLeft, X } from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(n || 0);

export default function Cart() {
  const { items, removeFromCart, updateQty, total: cartTotal } = useCart();
  const navigate = useNavigate();

  const VAT_RATE = 0.125;
  const subtotal = cartTotal;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  return (
    <div className="bg-[#F5F0E8] pt-14 min-h-screen">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 pb-6">
        <h1 className="font-['Playfair_Display'] text-4xl lg:text-5xl text-[#1A1A1A]">Your Atelier Selection</h1>
        <p className="text-[#5A5A5A] text-sm mt-2">Refining your bespoke choices for the season.</p>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-['Playfair_Display'] text-2xl text-[#1A1A1A]">Your selection is empty</p>
            <p className="text-[#5A5A5A] text-sm mt-2 mb-8">Discover pieces crafted for your distinction.</p>
            <Link to="/shop" className="btn-primary px-10 py-3.5">Explore the Collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
            {/* ── Cart table ── */}
            <div>
              {/* Column headers */}
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 pb-4 border-b border-black/15">
                {['Product Details', 'Quantity', 'Price', 'Total'].map((h) => (
                  <p key={h} className="text-[10px] tracking-[0.2em] uppercase text-[#8A8A8A]">{h}</p>
                ))}
              </div>

              {/* Items */}
              <div className="divide-y divide-black/10">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`}
                    className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center py-6">
                    {/* Product */}
                    <div className="flex gap-4 items-start">
                      <div className="w-14 h-18 shrink-0 overflow-hidden bg-[#E8E3DA]">
                        <img src={item.imageUrl || item.images?.[0]}
                          alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A] text-sm">{item.name}</p>
                        {item.selectedSize && (
                          <p className="text-[11px] text-[#5A5A5A] mt-1">Size: {item.selectedSize}</p>
                        )}
                        <button onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase text-[#8A8A8A] hover:text-red-500 transition-colors mt-2">
                          <X size={11} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Qty stepper */}
                    <div className="flex items-center border border-black/20 w-fit h-9">
                      <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        className="w-9 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-black/5">−</button>
                      <span className="w-8 text-center text-sm text-[#1A1A1A]">
                        {String(item.qty).padStart(2, '0')}
                      </span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-9 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-black/5">+</button>
                    </div>

                    {/* Unit price */}
                    <p className="text-sm text-[#1A1A1A]">{fmt(item.price)}</p>

                    {/* Line total */}
                    <p className="text-sm text-[#C4973F] font-semibold">{fmt(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>

              <Link to="/shop"
                className="inline-flex items-center gap-2 mt-6 text-[10px] tracking-[0.2em] uppercase text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors">
                <ArrowLeft size={12} /> Continue Shopping
              </Link>
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:sticky lg:top-20 h-fit">
              <div className="bg-white border border-black/10 p-6">
                <h2 className="font-['Playfair_Display'] text-xl text-[#1A1A1A] mb-6">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5A5A5A]">Subtotal</span>
                    <span className="text-[#1A1A1A]">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5A5A5A]">Shipping</span>
                    <span className="text-[#8A8A8A] text-xs">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5A5A5A]">VAT (12.5%)</span>
                    <span className="text-[#1A1A1A]">{fmt(vat)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mt-5 pt-5 border-t border-black/10">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] font-semibold">Total</span>
                  <span className="font-['Playfair_Display'] text-2xl text-[#C4973F]">{fmt(total)}</span>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <button onClick={() => navigate('/checkout')} className="btn-gold w-full justify-center py-4 text-xs tracking-[0.25em]">
                    Proceed to Checkout
                  </button>
                  <button className="btn-outline w-full justify-center py-3.5 text-xs tracking-[0.2em]">
                    <Gift size={14} className="mr-2" /> Gift Wrap Selection
                  </button>
                </div>

                {/* Secure */}
                <div className="flex items-center justify-center gap-2 mt-5 text-[10px] tracking-[0.15em] uppercase text-[#8A8A8A]">
                  <ShieldCheck size={14} className="text-[#C4973F]" />
                  Guaranteed Secure Payment
                </div>

                <p className="text-[10px] text-[#8A8A8A] leading-relaxed text-center mt-4 border-t border-black/8 pt-4">
                  Every Serforwaa purchase includes our signature white-glove delivery and bespoke sizing guarantee.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

