import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Heart, Share2, Scissors, Globe, Leaf } from 'lucide-react';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const formatPrice = (p) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(p || 0);

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    getDoc(doc(db, 'products', id)).then((d) => {
      if (d.exists()) {
        const p = { id: d.id, ...d.data() };
        setProduct(p);
        setActiveImg(0);
        setSelectedSize('');
        // fetch related
        getDocs(query(collection(db, 'products'), where('category', '==', p.category), limit(4)))
          .then((snap) => setRelated(snap.docs.map((x) => ({ id: x.id, ...x.data() })).filter((x) => x.id !== id)));
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="pt-14 bg-[#F5F0E8] min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!product) return <div className="pt-14 bg-[#F5F0E8] min-h-screen flex items-center justify-center"><p>Product not found</p></div>;

  const images = product.images?.length ? product.images : [product.imageUrl || 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80'];
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) { toast.error('Please select a size'); return; }
    addToCart({ ...product, selectedSize, quantity: qty });
    toast.success('Added to cart');
  };

  return (
    <div className="bg-[#F5F0E8] pt-14">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-8 pb-2">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#8A8A8A]">
          <Link to="/shop" className="hover:text-[#C4973F]">Shop</Link>
          {' / '}
          <span className="capitalize">{product.category?.replace(/-/g, ' ')}</span>
          {' / '}
          <span className="text-[#1A1A1A]">{product.name}</span>
        </p>
      </div>

      {/* Main grid */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* LEFT — Images */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="hidden sm:flex flex-col gap-3 w-20 shrink-0">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`aspect-[3/4] overflow-hidden border-2 transition-colors ${
                    activeImg === i ? 'border-[#1A1A1A]' : 'border-transparent'
                  }`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {/* Main image */}
          <div className="flex-1 relative">
            {product.badge && (
              <span className={`absolute top-4 left-4 z-10 text-[9px] tracking-[0.2em] uppercase font-semibold px-3 py-1.5 ${
                product.badge.toLowerCase().includes('limited') ? 'bg-[#C4973F] text-white' : 'bg-[#0A0A0A] text-white'
              }`}>
                {product.badge}
              </span>
            )}
            <div className="aspect-[3/4] overflow-hidden bg-[#E8E3DA]">
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="flex flex-col">
          <h1 className="font-['Playfair_Display'] text-4xl lg:text-5xl text-[#1A1A1A] leading-tight">
            {product.name}
          </h1>
          <p className="text-[#C4973F] text-2xl font-medium mt-4">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="text-[#5A5A5A] text-sm leading-relaxed mt-5 max-w-md">{product.description}</p>
          )}

          {/* Size selector */}
          {product.sizes?.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] font-semibold">Select Size</p>
                <button className="text-[10px] tracking-[0.15em] uppercase text-[#5A5A5A] underline underline-offset-2">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 text-xs tracking-wider uppercase border transition-colors ${
                      selectedSize === s
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'border-black/25 text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] font-semibold mb-3">Quantity</p>
            <div className="flex items-center border border-black/20 w-fit">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-black/5 transition-colors">−</button>
              <span className="w-10 text-center text-sm text-[#1A1A1A]">{String(qty).padStart(2, '0')}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-black/5 transition-colors">+</button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 mt-8">
            <button onClick={handleAddToCart} className="btn-primary w-full justify-center py-4 text-xs tracking-[0.25em]">
              Add to Cart
            </button>
            <button className="btn-outline w-full justify-center py-4 text-xs tracking-[0.25em]">
              Book a Fitting
            </button>
          </div>

          {/* Wishlist & Share */}
          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-black/10">
            <button onClick={() => toggle(product.id)}
              className={`flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-colors ${
                wishlisted ? 'text-red-500' : 'text-[#5A5A5A] hover:text-[#1A1A1A]'
              }`}>
              <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} /> Wishlist
            </button>
            <button className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors">
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* ── CRAFTSMANSHIP & CARE ─── */}
      <section className="bg-[#0A0A0A] py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

          {/* Heading */}
          <div className="text-center mb-12">
            <p style={{
              fontFamily:"'Cinzel Decorative',serif",
              fontSize:'9px',
              letterSpacing:'0.4em',
              color:'#C4973F',
              opacity:0.75,
              textTransform:'uppercase',
              marginBottom:'12px'
            }}>The Atelier Promise</p>
            <h2 className="font-['Playfair_Display'] text-3xl lg:text-4xl text-white">
              Craftsmanship &amp; Care
            </h2>
            {/* Gold divider */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div style={{width:'56px',height:'0.5px',background:'linear-gradient(to right,transparent,#C4973F)'}} />
              <div style={{width:'5px',height:'5px',background:'#C4973F',transform:'rotate(45deg)'}} />
              <div style={{width:'3px',height:'3px',background:'#C4973F',transform:'rotate(45deg)',opacity:0.45}} />
              <div style={{width:'5px',height:'5px',background:'#C4973F',transform:'rotate(45deg)'}} />
              <div style={{width:'56px',height:'0.5px',background:'linear-gradient(to left,transparent,#C4973F)'}} />
            </div>
          </div>

          {/* Three cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#C4973F]/12">
            {[
              { icon: <Scissors size={20} />, title: 'Heritage Craft', desc: 'Each piece is hand-finished in our Accra atelier using traditional techniques passed down through generations, combined with modern structural tailoring.' },
              { icon: <Globe size={20} />, title: 'Premium Materials', desc: 'We source the finest silks and locally produced textiles, ensuring every thread meets our rigorous standards for durability and luxury feel.' },
              { icon: <Leaf size={20} />, title: 'Sustainable Care', desc: 'Dry clean only. To preserve the gold embroidery, store in the provided breathable garment bag away from direct sunlight.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center px-10 py-10 group hover:bg-white/[0.02] transition-colors">
                <span className="block w-8 h-px bg-[#C4973F] mb-6" />
                <div className="text-[#C4973F] mb-4">{item.icon}</div>
                <p className="text-white text-[11px] font-semibold tracking-[0.22em] uppercase mb-3">{item.title}</p>
                <p className="text-white/40 text-xs leading-relaxed max-w-[220px]">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── YOU MAY ALSO LIKE ─── */}
      {related.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 border-t border-black/8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label text-[#C4973F] mb-1">Curated for You</p>
              <h2 className="font-['Playfair_Display'] text-3xl text-[#1A1A1A]">You May Also Like</h2>
            </div>
            <Link to="/shop" className="text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#C4973F] font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {related.slice(0, 3).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

