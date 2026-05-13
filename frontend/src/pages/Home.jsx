import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard from '../components/ProductCard';
import { ArrowRight, CheckCircle, Mail } from 'lucide-react';

const DEFAULT_COLLECTIONS = [
  { name: 'The Bridal Atelier', slug: 'bridal-gowns', img: '/images/sarfowaa-flyer.jpg' },
  { name: 'Prêt-À-Porter', slug: 'corporate-outfits', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80' },
  { name: 'The Accents', slug: 'beadings', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80' },
];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [collections, setCollections] = useState(DEFAULT_COLLECTIONS);
  const [banners, setBanners] = useState([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Fetch active hero banners
    getDocs(query(collection(db, 'banners'), where('active', '==', true)))
      .then((snap) => {
        const b = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, ba) => (a.order ?? 0) - (ba.order ?? 0));
        setBanners(b);
      })
      .catch((err) => console.error('[banners]', err));

    // Fetch products marked as New Arrival from admin
    getDocs(query(collection(db, 'products'), where('newArrival', '==', true), limit(4)))
      .then((snap) => setNewArrivals(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch((err) => console.error('[newArrivals]', err));

    // Fetch categories with images from admin (falls back to defaults if none set)
    getDocs(collection(db, 'categories'))
      .then((snap) => {
        const cats = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => c.imageUrl)
          .slice(0, 3);
        if (cats.length > 0) {
          setCollections(
            cats.map((c) => ({ name: c.name, slug: c.slug, img: c.imageUrl }))
          );
        }
      })
      .catch((err) => console.error('[categories]', err));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  const activeBanner = banners[bannerIdx];

  return (
    <div className="bg-[#F5F0E8]">

      {/* ── HERO ──────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col pt-14 overflow-hidden" style={{
        background: 'radial-gradient(ellipse 80% 60% at 72% 50%,#1a0f00 0%,transparent 60%), radial-gradient(ellipse 50% 80% at 20% 50%,#110900 0%,transparent 60%), linear-gradient(135deg,#0a0a0a 0%,#130c02 40%,#0d0800 70%,#050505 100%)'
      }}>

        {/* Dynamic hero banners — cross-fade on change */}
        {banners.map((b, i) => (
          <div key={b.id} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === bannerIdx ? 1 : 0, zIndex: 0 }}>
            <img src={b.imageUrl} alt={b.title || ''} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.42) 50%,rgba(0,0,0,0.68) 100%)'
            }} />
          </div>
        ))}

        {/* SVG gold decorations */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 760"
          preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          {/* top & bottom border lines */}
          <line x1="0" y1="1" x2="1440" y2="1" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.35"/>
          <line x1="0" y1="8" x2="1440" y2="8" stroke="#c9a84c" strokeWidth="0.25" strokeOpacity="0.18"/>
          <line x1="0" y1="759" x2="1440" y2="759" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.35"/>
          {/* side margin lines */}
          <line x1="48" y1="0" x2="48" y2="760" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.2"/>
          <line x1="1392" y1="0" x2="1392" y2="760" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.2"/>
          {/* top-left corner bracket */}
          <path d="M56 68 L160 68 M56 68 L56 172" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.5" fill="none"/>
          <circle cx="56" cy="68" r="3" fill="#c9a84c" fillOpacity="0.55"/>
          {/* top-right corner bracket */}
          <path d="M1384 68 L1280 68 M1384 68 L1384 172" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.5" fill="none"/>
          <circle cx="1384" cy="68" r="3" fill="#c9a84c" fillOpacity="0.55"/>
          {/* bottom-left corner bracket */}
          <path d="M56 692 L160 692 M56 692 L56 588" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.5" fill="none"/>
          <circle cx="56" cy="692" r="3" fill="#c9a84c" fillOpacity="0.55"/>
          {/* bottom-right corner bracket */}
          <path d="M1384 692 L1280 692 M1384 692 L1384 588" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.5" fill="none"/>
          <circle cx="1384" cy="692" r="3" fill="#c9a84c" fillOpacity="0.55"/>
          {/* large diamond outline */}
          <polygon points="720,100 1000,380 720,660 440,380" stroke="#c9a84c" strokeWidth="0.4" strokeOpacity="0.07" fill="none"/>
          {/* small accent diamonds */}
          <rect x="193" y="166" width="5" height="5" transform="rotate(45,196,169)" fill="#c9a84c" fillOpacity="0.28"/>
          <rect x="1228" y="166" width="5" height="5" transform="rotate(45,1231,169)" fill="#c9a84c" fillOpacity="0.28"/>
          <rect x="193" y="580" width="5" height="5" transform="rotate(45,196,583)" fill="#c9a84c" fillOpacity="0.28"/>
          <rect x="1228" y="580" width="5" height="5" transform="rotate(45,1231,583)" fill="#c9a84c" fillOpacity="0.28"/>
          {/* side decorative vertical lines */}
          <line x1="88" y1="250" x2="88" y2="510" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.3"/>
          <line x1="1352" y1="250" x2="1352" y2="510" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.3"/>
          {/* horizontal accent lines (flanking centre) */}
          <line x1="100" y1="120" x2="580" y2="120" stroke="#c9a84c" strokeWidth="0.3" strokeOpacity="0.22"/>
          <line x1="860" y1="120" x2="1340" y2="120" stroke="#c9a84c" strokeWidth="0.3" strokeOpacity="0.22"/>
          <line x1="100" y1="640" x2="580" y2="640" stroke="#c9a84c" strokeWidth="0.3" strokeOpacity="0.22"/>
          <line x1="860" y1="640" x2="1340" y2="640" stroke="#c9a84c" strokeWidth="0.3" strokeOpacity="0.22"/>
        </svg>

        {/* Main centred content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
          <p className="sc-eyebrow" style={{
            fontFamily:"'Cinzel Decorative',serif",
            fontSize:'clamp(7px,0.7vw,11px)',
            letterSpacing:'0.48em',
            color:'#c9a84c',
            opacity:0.85,
            textTransform:'uppercase',
            marginBottom:'clamp(10px,1.6vw,20px)'
          }}>
            Est. Ofankor &nbsp;·&nbsp; Bespoke Creations &nbsp;·&nbsp; Ghana
          </p>

          <span className="sc-main block" style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontStyle:'italic',
            fontWeight:300,
            fontSize:'clamp(52px,9vw,120px)',
            color:'#f0dca0',
            lineHeight:0.88,
            textShadow:'0 0 80px rgba(201,168,76,0.28)'
          }}>
            Sarfowaa<span style={{color:'#c9a84c',fontSize:'clamp(34px,5.5vw,80px)'}}>{'\u2019s'}</span>
          </span>

          {/* Gold divider */}
          <div className="sc-divwrap flex items-center gap-3" style={{
            margin:'clamp(8px,1.4vw,18px) 0',
            width:'clamp(180px,30vw,440px)'
          }}>
            <div style={{flex:1,height:'0.5px',background:'linear-gradient(to right,transparent,#c9a84c,transparent)'}} />
            <div style={{width:'5px',height:'5px',background:'#c9a84c',transform:'rotate(45deg)'}} />
            <div style={{width:'3px',height:'3px',background:'#c9a84c',transform:'rotate(45deg)',opacity:0.5}} />
            <div style={{width:'5px',height:'5px',background:'#c9a84c',transform:'rotate(45deg)'}} />
            <div style={{flex:1,height:'0.5px',background:'linear-gradient(to right,transparent,#c9a84c,transparent)'}} />
          </div>

          <p className="sc-couture" style={{
            fontFamily:"'Cinzel Decorative',serif",
            fontSize:'clamp(10px,1.8vw,26px)',
            letterSpacing:'0.5em',
            color:'#c9a84c',
            textTransform:'uppercase'
          }}>
            Couture
          </p>

          <p className="sc-tagline" style={{
            fontFamily:"'EB Garamond',serif",
            fontStyle:'italic',
            fontSize:'clamp(10px,1.15vw,16px)',
            color:'rgba(201,168,76,0.55)',
            letterSpacing:'0.18em',
            marginTop:'clamp(12px,1.8vw,24px)'
          }}>
            {activeBanner?.subtitle || 'Where every stitch tells your story'}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link to={activeBanner?.ctaLink || '/shop'} className="btn-gold px-8 py-3.5">
              {activeBanner?.ctaText || 'Shop Now'}
            </Link>
            <Link to="/shop" className="btn-outline-light px-8 py-3.5">View Collection</Link>
          </div>
        </div>

        {/* Banner navigation dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === bannerIdx ? 'w-6 h-1.5 bg-[#C4973F]' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                }`} />
            ))}
          </div>
        )}

        {/* Service strip at bottom */}
        <div className="sc-strip relative z-10 flex flex-wrap items-center justify-center" style={{
          borderTop:'0.5px solid rgba(201,168,76,0.22)',
          background:'rgba(0,0,0,0.45)',
          padding:'clamp(8px,1.2vw,14px) 0'
        }}>
          {['Bridal Gowns','Beadings','Custom Outfits','Corporate Wear','Kids Outfits','Luxury Wears'].map((svc, i, arr) => (
            <span key={svc} style={{
              fontFamily:"'Cinzel Decorative',serif",
              fontSize:'clamp(5px,0.65vw,9px)',
              letterSpacing:'0.32em',
              color:'rgba(201,168,76,0.65)',
              textTransform:'uppercase',
              padding:'0 clamp(10px,2.5vw,36px)',
              borderRight: i < arr.length - 1 ? '0.5px solid rgba(201,168,76,0.22)' : 'none',
              whiteSpace:'nowrap'
            }}>
              {svc}
            </span>
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ──────────────────────────── */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="font-['Playfair_Display'] text-4xl text-[#1A1A1A]">New Arrivals</h2>
              <p className="text-[#5A5A5A] text-sm mt-1">Explore the latest additions to our atelier.</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#C4973F] transition-colors font-medium">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
            {newArrivals.length > 0
              ? newArrivals.map((p) => <ProductCard key={p.id} product={p} />)
              : (
                <div className="col-span-2 lg:col-span-4 py-20 text-center">
                  <p className="font-['Playfair_Display'] text-xl text-[#1A1A1A]/40">New arrivals coming soon</p>
                  <p className="text-[#5A5A5A] text-xs mt-2">Mark products as "New Arrival" in the admin panel to feature them here.</p>
                </div>
              )
            }
          </div>
        </div>
      </section>

      {/* ── HERITAGE / CRAFTSMANSHIP ──────────────── */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="section-label mb-4">Our Heritage</p>
            <h2 className="font-['Playfair_Display'] text-4xl lg:text-5xl text-white leading-tight">
              The Art of<br />Masterful Tailoring
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mt-5 max-w-md">
              At Sarfowaa's Couture, every stitch is a promise of quality. Our atelier combines traditional
              craftsmanship with modern silhouettes, ensuring that each piece not only fits your body but also
              reflects your distinct spirit.
            </p>
            <div className="space-y-4 mt-8">
              {[
                { title: 'Ethical Sourcing', desc: 'We partner with global artisans to source only the finest sustainable fabrics.' },
                { title: 'Bespoke Fitting', desc: 'Precise measurements and hand-finishing for a silhouette that is uniquely yours.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <CheckCircle size={16} className="text-[#C4973F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote block */}
          <div className="flex items-center justify-center h-full">
            <div className="relative p-12 lg:p-16 text-center w-full max-w-md">
              {/* Corner accents */}
              <span className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#C4973F]" />
              <span className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#C4973F]" />
              <span className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#C4973F]" />
              <span className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#C4973F]" />

              <p className="font-['Cormorant_Garamond'] text-[#C4973F] text-8xl leading-none select-none mb-2">&ldquo;</p>
              <p className="font-['Playfair_Display'] text-white text-3xl lg:text-4xl italic leading-snug">
                Crafted to<br />elevate your spirit
              </p>
              <p className="font-['Cormorant_Garamond'] text-[#C4973F] text-8xl leading-none select-none mt-0 text-right">&rdquo;</p>

              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="h-px w-10 bg-[#C4973F]/50" />
                <p className="text-[#C4973F]/80 text-[10px] tracking-[0.35em] uppercase">Sarfowaa's Couture</p>
                <span className="h-px w-10 bg-[#C4973F]/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CURATED COLLECTIONS ───────────────────── */}
      <section className="py-20 bg-[#F5F0E8]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="font-['Playfair_Display'] text-4xl text-[#1A1A1A]">Curated Collections</h2>
            <p className="text-[#5A5A5A] text-sm mt-2">
              Discover pieces designed for every facet of your life, from gala evenings to boardroom excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {collections.map((col) => (
              <Link key={col.slug} to={`/shop?category=${col.slug}`}
                className="relative group overflow-hidden aspect-[3/4] max-h-[340px]">
                <img src={col.img} alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-['Playfair_Display'] text-white text-xl">{col.name}</h3>
                  <span className="text-[10px] tracking-[0.25em] uppercase text-white/70 mt-1 inline-block">Explore</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────── */}
      <section className="py-20 bg-[#F5F0E8] border-t border-black/8">
        <div className="max-w-xl mx-auto px-6 text-center">
          <Mail size={24} className="text-[#C4973F] mx-auto mb-5" />
          <h2 className="font-['Playfair_Display'] text-3xl text-[#1A1A1A]">Join The Serforwaa Circle</h2>
          <p className="text-[#5A5A5A] text-sm mt-3 leading-relaxed">
            Receive exclusive access to new collection launches, private atelier events, and sartorial inspirations.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
            className="flex mt-8 border border-black/20">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
              className="flex-1 px-4 py-3.5 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#9A9A9A]"
            />
            <button type="submit" className="btn-primary px-6 py-3.5 whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}

