import { useState } from 'react';
import api from '../lib/api';
import { Phone, Mail, MapPin, Send, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/inquiries', form);
      setSent(true);
      toast.success('Message sent! We\'ll be in touch shortly.');
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A] pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#C4973F] mb-4">Get In Touch</p>
          <h1 className="font-['Playfair_Display'] text-5xl text-white mb-4">Contact Us</h1>
          <div className="w-12 h-px bg-[#C4973F] mx-auto mb-4" />
          <p className="text-white/40 text-sm">Book a consultation or enquire about custom orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info */}
          <div className="space-y-4">
            {[
              { icon: <MapPin size={18} />, title: 'Location', lines: ['Devi, Accra, Ghana', 'Appointment Only'] },
              { icon: <Phone size={18} />, title: 'Phone / WhatsApp', lines: ['+233 020 281 9377'] },
              { icon: <Mail size={18} />, title: 'Email', lines: ['hello@sarfowaa.com'] },
            ].map((c) => (
              <div key={c.title} className="flex gap-4 p-5 border border-[#C4973F]/15 bg-white/[0.02]">
                <div className="text-[#C4973F] shrink-0 mt-0.5">{c.icon}</div>
                <div>
                  <p className="text-white text-sm font-medium mb-1">{c.title}</p>
                  {c.lines.map((l) => <p key={l} className="text-white/40 text-sm">{l}</p>)}
                </div>
              </div>
            ))}

            {/* Business Hours */}
            <div className="p-5 border border-[#C4973F]/20 bg-[#C4973F]/5">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C4973F] mb-3">Business Hours</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Tue – Sat</span>
                  <span className="text-white">9am – 6pm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Sunday</span>
                  <span className="text-white">By appointment</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Monday</span>
                  <span className="text-white/30">Closed</span>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/233202819377" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3.5 border border-[#25D366]/30 bg-[#25D366]/5 text-[#25D366] text-[11px] tracking-[0.2em] uppercase hover:bg-[#25D366]/10 transition-colors">
              <Phone size={14} /> Chat on WhatsApp
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 border border-[#C4973F]/15">
                <div className="w-16 h-16 border border-[#C4973F]/40 flex items-center justify-center mb-5">
                  <Check size={24} className="text-[#C4973F]" />
                </div>
                <p className="font-['Playfair_Display'] text-2xl text-white mb-2">Message Received</p>
                <p className="text-white/40 text-sm mb-8">We'll respond within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', service: '', message: '' }); }}
                  className="text-[10px] tracking-[0.25em] uppercase text-[#C4973F] border border-[#C4973F]/30 px-8 py-3 hover:bg-[#C4973F]/5 transition-colors">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-[#C4973F]/15 p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Full Name</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C4973F]/50 placeholder:text-white/20"
                      placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C4973F]/50 placeholder:text-white/20"
                      placeholder="+233..." />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C4973F]/50 placeholder:text-white/20"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Service</label>
                  <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C4973F]/50">
                    <option value="" className="bg-[#0A0A0A]">Select a service</option>
                    <option className="bg-[#0A0A0A]">Bridal Gown</option>
                    <option className="bg-[#0A0A0A]">Beadings</option>
                    <option className="bg-[#0A0A0A]">Corporate Outfit</option>
                    <option className="bg-[#0A0A0A]">Custom Outfit</option>
                    <option className="bg-[#0A0A0A]">Luxury Wear</option>
                    <option className="bg-[#0A0A0A]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">Message</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C4973F]/50 resize-none placeholder:text-white/20"
                    placeholder="Tell us about your vision..." />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-gold w-full justify-center py-4 text-[11px] tracking-[0.25em]">
                  <Send size={14} /> {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
