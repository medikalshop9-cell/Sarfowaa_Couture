import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, MessageSquare } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const EXPLORE = [
  ['Shop', '/shop'],
  ['Collections', '/shop'],
  ['Bespoke', '/contact'],
  ['Care Instructions', '/care-instructions'],
];
const SERVICE = [
  ['Shipping & Returns', '/terms-of-service'],
  ['Privacy Policy', '/privacy-policy'],
  ['Terms of Service', '/terms-of-service'],
  ['Contact', '/contact'],
];

export default function Footer() {
  const [s, setS] = useState({});

  useEffect(() => {
    getDoc(doc(db, 'settings', 'site'))
      .then((snap) => { if (snap.exists()) setS(snap.data()); })
      .catch(() => {});
  }, []);

  const phone    = s.phone    || '+233 34 000 0006';
  const email    = s.email    || 'hello@sarfowaa.com';
  const address  = s.address  || 'Devi, Accra, Ghana';
  const igUrl    = s.instagram || null;
  const fbUrl    = s.facebook  || null;
  const waNum    = s.whatsapp  ? s.whatsapp.replace(/\D/g, '') : null;

  return (
    <footer className="bg-[#0A0A0A]">
      {/* Tagline bar */}
      <div className="border-t border-[#C4973F]/30 py-3 text-center">
        <p className="text-[#C4973F] text-[10px] tracking-[0.3em] uppercase font-medium">
          Confidence. Class. Couture — That's Sarfowaa's.
        </p>
      </div>

      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-[#C4973F] font-['Playfair_Display'] text-2xl font-bold mb-1 leading-tight">
            SARFOWAA'S<br />COUTURE
          </h2>
          <p className="text-white/40 text-xs leading-relaxed mt-3 max-w-[200px]">
            Exquisite craftsmanship. Timeless elegance. Bespoke experiences tailored for the discerning individual.
          </p>
          <div className="flex gap-4 mt-5">
            {igUrl && (
              <a href={igUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C4973F] transition-colors"><Globe size={16} /></a>
            )}
            <a href={`mailto:${email}`} className="text-white/40 hover:text-[#C4973F] transition-colors"><Mail size={16} /></a>
            {waNum && (
              <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C4973F] transition-colors"><MessageSquare size={16} /></a>
            )}
            {fbUrl && (
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#C4973F] transition-colors"><Globe size={16} /></a>
            )}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-white text-[10px] tracking-[0.25em] uppercase font-semibold mb-5">Explore</h3>
          <ul className="space-y-3">
            {EXPLORE.map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="text-white/40 text-xs tracking-wider uppercase hover:text-[#C4973F] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Service */}
        <div>
          <h3 className="text-white text-[10px] tracking-[0.25em] uppercase font-semibold mb-5">Service</h3>
          <ul className="space-y-3">
            {SERVICE.map(([label, to]) => (
              <li key={label}>
                <Link to={to} className="text-white/40 text-xs tracking-wider uppercase hover:text-[#C4973F] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Visit */}
        <div>
          <h3 className="text-white text-[10px] tracking-[0.25em] uppercase font-semibold mb-5">Visit Our Atelier</h3>
          <p className="text-white/40 text-xs leading-relaxed">
            {address}<br />
            Appointment Only
          </p>
          <a href={`tel:${phone.replace(/\s/g, '')}`}
            className="text-white/40 text-xs mt-3 block hover:text-[#C4973F] transition-colors">
            {phone}
          </a>
          <a href={`mailto:${email}`}
            className="text-white/40 text-xs mt-1 block hover:text-[#C4973F] transition-colors">
            {email}
          </a>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/5 py-4 px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-white/25 text-[10px] tracking-widest uppercase">
          © 2024 Sarfowaa's Couture. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

