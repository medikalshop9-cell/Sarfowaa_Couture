import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Check, Copy, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';

const MOMO_NUMBER = '0202819377';
const MOMO_NAME   = 'Jemima Akomeah';
const WA_NUMBER   = '233202819377';

const fmt = (n) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(n || 0);

const VAT_RATE = 0.125;

function genOrderRef() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `SC-${d}-${rand}`;
}

/* ─── Step 1: Form ─── */
function StepForm({ items, total, onSubmit }) {
  const { user } = useAuth();
  const subtotal = total;
  const vat = subtotal * VAT_RATE;
  const grandTotal = subtotal + vat;

  const [form, setForm] = useState({
    firstName: '', lastName: '',
    email: user?.email || '',
    phone: '', address: '', city: '', region: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form, grandTotal);
  };

  const fields = [
    { name: 'firstName', label: 'First Name',       type: 'text',  required: true, half: true },
    { name: 'lastName',  label: 'Last Name',         type: 'text',  required: true, half: true },
    { name: 'email',     label: 'Email Address',     type: 'email', required: true },
    { name: 'phone',     label: 'Phone / WhatsApp',  type: 'tel',   required: true },
    { name: 'address',   label: 'Delivery Address',  type: 'text',  required: true },
    { name: 'city',      label: 'City',              type: 'text',  required: true, half: true },
    { name: 'region',    label: 'Region',            type: 'text',  required: true, half: true },
  ];

  return (
    <div className="bg-[#F5F0E8] pt-14 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-12 pb-20">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#5A5A5A] mb-8">
          <Link to="/cart" className="hover:text-[#C4973F]">Cart</Link> / Checkout
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl lg:text-5xl text-[#1A1A1A] mb-10">Complete Your Order</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          <div className="space-y-6">
            <div className="bg-white border border-black/10 p-8">
              <h2 className="font-['Playfair_Display'] text-xl text-[#1A1A1A] mb-6">Delivery Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.name} className={f.half ? '' : 'col-span-2'}>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-[#5A5A5A] mb-1.5">
                      {f.label}{f.required && <span className="text-[#C4973F] ml-0.5">*</span>}
                    </label>
                    <input type={f.type} name={f.name} value={form[f.name]} onChange={set} required={f.required}
                      className="w-full border border-black/15 px-4 py-3 text-sm text-[#1A1A1A] bg-[#FAFAF8] focus:outline-none focus:border-[#C4973F] transition-colors" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-[11px] tracking-[0.15em] uppercase text-[#5A5A5A] mb-1.5">
                    Order Notes <span className="normal-case text-[#8A8A8A]">(optional)</span>
                  </label>
                  <textarea name="notes" value={form.notes} onChange={set} rows={3}
                    placeholder="Fabric preferences, measurements, special requests…"
                    className="w-full border border-black/15 px-4 py-3 text-sm text-[#1A1A1A] bg-[#FAFAF8] focus:outline-none focus:border-[#C4973F] transition-colors resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-black/10 p-8">
              <h2 className="font-['Playfair_Display'] text-xl text-[#1A1A1A] mb-3">Payment</h2>
              <p className="text-sm text-[#5A5A5A] leading-relaxed">
                We accept <span className="text-[#C4973F] font-medium">MTN Mobile Money</span>.
                After placing your order you will be shown the MoMo details to complete payment.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="bg-white border border-black/10 p-6">
              <h2 className="font-['Playfair_Display'] text-xl text-[#1A1A1A] mb-5">Order Summary</h2>
              <div className="space-y-4 mb-5 max-h-60 overflow-y-auto pr-1">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    {(item.imageUrl || item.images?.[0]) && (
                      <img src={item.imageUrl || item.images[0]} alt={item.name}
                        className="w-14 h-16 object-cover shrink-0 bg-[#E8E3DA]" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1A1A1A] text-xs font-medium line-clamp-2">{item.name}</p>
                      {item.selectedSize && <p className="text-[#8A8A8A] text-[11px] mt-0.5">Size: {item.selectedSize}</p>}
                      <div className="flex justify-between mt-1">
                        <span className="text-[#8A8A8A] text-xs">×{item.qty}</span>
                        <span className="text-[#C4973F] text-xs font-semibold">{fmt(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-black/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#5A5A5A]">
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5A5A5A]">
                  <span>VAT (12.5%)</span><span>{fmt(vat)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 mt-3 border-t border-black/10">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] font-semibold">Total</span>
                  <span className="font-['Playfair_Display'] text-2xl text-[#C4973F]">{fmt(grandTotal)}</span>
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="btn-gold w-full justify-center py-4 mt-6 text-xs tracking-[0.25em] disabled:opacity-60">
                {submitting ? 'Placing order…' : 'Place Order →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Step 2: Processing ─── */
function StepProcessing() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center z-50">
      <div className="text-center px-8 max-w-sm">
        <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mx-auto mb-8">
          <Loader2 size={28} className="text-white animate-spin" />
        </div>
        <h2 className="text-white font-['Playfair_Display'] text-2xl mb-3">Processing your request</h2>
        <p className="text-white/40 text-sm leading-relaxed">
          Please wait while we process your request. Do not refresh the page.
        </p>
      </div>
    </div>
  );
}

/* ─── Step 3: MoMo Payment ─── */
function StepMoMo({ orderRef, grandTotal, onPaid }) {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#FFCC00] flex items-center justify-center">
            <span className="font-black text-[#0A0A0A] text-xs">MTN</span>
          </div>
          <div>
            <p className="text-white font-semibold">MTN Mobile Money</p>
            <p className="text-white/40 text-xs">Send payment to complete your order</p>
          </div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
          <div className="bg-[#C4973F]/10 border-b border-[#C4973F]/20 px-6 py-5 text-center">
            <p className="text-[#C4973F]/70 text-[10px] tracking-[0.2em] uppercase mb-1">Amount Due</p>
            <p className="font-['Playfair_Display'] text-4xl text-[#C4973F]">{fmt(grandTotal)}</p>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase mb-0.5">Send to Number</p>
                <p className="text-white text-xl font-semibold tracking-widest">{MOMO_NUMBER}</p>
              </div>
              <button onClick={() => copy(MOMO_NUMBER)}
                className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-[10px] tracking-[0.1em] uppercase transition-colors rounded">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div>
              <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase mb-0.5">Account Name</p>
              <p className="text-white text-sm">{MOMO_NAME}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-4 py-3">
              <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase mb-0.5">Your Order Reference</p>
              <p className="text-[#C4973F] text-sm font-mono font-semibold">{orderRef}</p>
              <p className="text-white/30 text-[10px] mt-1">Use this as your payment reference / note</p>
            </div>
          </div>

          <div className="px-6 pb-5">
            <ol className="space-y-2">
              {[
                'Dial *170# on your MTN number',
                `Send ${fmt(grandTotal)} to ${MOMO_NUMBER} (${MOMO_NAME})`,
                `Use your order reference as the payment note: ${orderRef}`,
                'Take a screenshot of your MoMo confirmation',
                'Click the button below and send your receipt on WhatsApp',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-xs text-white/50 leading-relaxed">
                  <span className="text-[#C4973F] font-bold shrink-0">{i + 1}.</span>{step}
                </li>
              ))}
            </ol>
          </div>

          <div className="px-6 pb-6">
            <button onClick={onPaid}
              className="w-full bg-[#C4973F] hover:bg-[#B8882E] text-white text-xs tracking-[0.25em] uppercase py-4 font-semibold transition-colors">
              I've Made Payment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 4: Confirmed ─── */
function StepConfirmed({ orderRef, grandTotal }) {
  const waMessage = encodeURIComponent(
    `Hi Sarfowaa's Couture!\n\nI've made payment for my order.\n\nOrder Reference: ${orderRef}\nAmount Paid: ${fmt(grandTotal)}\n\n[Please attach your MoMo payment screenshot]`
  );
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;

  return (
    <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-[#C4973F]/15 border border-[#C4973F]/30 flex items-center justify-center mx-auto mb-8">
          <Check size={36} className="text-[#C4973F]" strokeWidth={2.5} />
        </div>
        <h2 className="font-['Playfair_Display'] text-3xl text-white mb-3">Order Received!</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          Thank you for your order. Please send your payment receipt on WhatsApp to confirm.
        </p>

        <div className="bg-[#111] border border-white/10 rounded-2xl px-6 py-5 mb-8 text-left">
          <div className="flex justify-between items-center mb-3">
            <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase">Order Reference</p>
            <p className="text-[#C4973F] font-mono font-semibold text-sm">{orderRef}</p>
          </div>
          <div className="flex justify-between items-center border-t border-white/5 pt-3">
            <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase">Amount Paid</p>
            <p className="text-white font-semibold text-sm">{fmt(grandTotal)}</p>
          </div>
        </div>

        <a href={waLink} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1EB957] text-white text-xs tracking-[0.2em] uppercase py-4 font-semibold transition-colors rounded mb-4">
          <MessageCircle size={18} /> Send Receipt on WhatsApp
        </a>

        <p className="text-white/30 text-xs leading-relaxed mb-8">
          Tap above to open WhatsApp. Attach your MoMo screenshot to the message before sending.
        </p>

        <Link to="/shop"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft size={12} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep]           = useState('form');
  const [orderRef, setOrderRef]   = useState('');
  const [grandTotal, setGrandTotal] = useState(0);

  const handleFormSubmit = async (formData, computedTotal) => {
    setGrandTotal(computedTotal);

    try {
      const result = await api.post('/api/orders', {
        userId: user?.uid || null,
        customer: formData,
        items: items.map((i) => ({
          id: i.id, name: i.name, price: i.price, qty: i.qty,
          size: i.selectedSize || '',
          imageUrl: i.imageUrl || i.images?.[0] || '',
        })),
        total: computedTotal,
      });
      setOrderRef(result.orderRef);
    } catch (err) {
      console.error('Order save error:', err);
      // Still proceed to MoMo screen even if backend failed
      setOrderRef(genOrderRef());
    }

    setStep('processing');
    setTimeout(() => setStep('momo'), 3000);
  };

  const handlePaid = () => {
    clearCart();
    setStep('confirmed');
  };

  if (step === 'processing') return <StepProcessing />;
  if (step === 'momo')       return <StepMoMo orderRef={orderRef} grandTotal={grandTotal} onPaid={handlePaid} />;
  if (step === 'confirmed')  return <StepConfirmed orderRef={orderRef} grandTotal={grandTotal} />;

  return <StepForm items={items} total={total} onSubmit={handleFormSubmit} />;
}
