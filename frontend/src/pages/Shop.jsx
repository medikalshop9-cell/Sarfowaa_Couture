import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { SlidersHorizontal, ChevronDown, Mail, Search, X } from 'lucide-react';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Bridal Gowns', value: 'bridal-gowns' },
  { label: 'Beadings', value: 'beadings' },
  { label: 'Corporate Outfits', value: 'corporate-outfits' },
  { label: 'Custom Outfits', value: 'custom-outfits' },
  { label: 'Luxury Wears', value: 'luxury-wears' },
  { label: 'Kids Outfits', value: 'kids-outfits' },
];
const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'New Arrivals', value: 'new' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];
const PAGE_SIZE = 9;
const MAX_PRICE = 50000;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [search, setSearch] = useState('');

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'featured';
  const [filterOpen, setFilterOpen] = useState(false);
  const [emailSub, setEmailSub] = useState('');

  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    getDocs(q).then((snap) => {
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (category) items = items.filter((p) => p.category === category);
      if (sort === 'price-asc') items.sort((a, b) => a.price - b.price);
      if (sort === 'price-desc') items.sort((a, b) => b.price - a.price);
      if (sort === 'featured') items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      setProducts(items);
      setPage(1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [category, sort]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const filtered = products
    .filter((p) => (p.price ?? 0) <= priceMax)
    .filter((p) => !search.trim() || p.name?.toLowerCase().includes(search.trim().toLowerCase()));

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <div className="bg-[#F5F0E8] pt-14">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#5A5A5A] mb-2">
          <Link to="/" className="hover:text-[#C4973F]">Home</Link> / Shop
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl lg:text-5xl text-[#1A1A1A]">The Atelier Collection</h1>
        <p className="text-[#5A5A5A] text-sm mt-3 max-w-lg leading-relaxed">
          Discover our curated selection of bespoke couture. Each piece is handcrafted with the finest
          materials to embody elegance and timeless sophistication.
        </p>
      </div>

      {/* Filter bar */}
      <div className="sticky top-14 z-30 bg-[#F5F0E8] border-t border-b border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-3 flex flex-wrap items-center gap-3">
          {/* Filters button */}
          <button onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 border border-black/20 px-3 py-2 text-[11px] tracking-[0.15em] uppercase text-[#1A1A1A] hover:bg-black hover:text-white transition-colors">
            <SlidersHorizontal size={13} /> Filters
          </button>

          {/* Category */}
          <FilterDropdown label="Category" options={CATEGORIES.map(c => c.label)}
            value={CATEGORIES.find(c => c.value === category)?.label || 'All'}
            onChange={(label) => {
              const found = CATEGORIES.find(c => c.label === label);
              setParam('category', found?.value || '');
            }} />

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#5A5A5A]">Sort By:</span>
            <FilterDropdown label="Sort"
              options={SORT_OPTIONS.map(s => s.label)}
              value={SORT_OPTIONS.find(s => s.value === sort)?.label || 'Featured'}
              onChange={(label) => {
                const found = SORT_OPTIONS.find(s => s.label === label);
                setParam('sort', found?.value || '');
              }} />
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="bg-[#0A0A0A] border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-white/80 text-xs font-medium tracking-widest uppercase">Price Range</p>
                {priceMax < MAX_PRICE && (
                  <button onClick={() => setPriceMax(MAX_PRICE)}
                    className="text-[10px] tracking-[0.15em] uppercase text-[#C4973F] hover:text-[#C4973F]/70 transition-colors flex items-center gap-1">
                    <X size={10} /> Reset
                  </button>
                )}
              </div>
              <p className="text-white/35 text-[10px] mb-3">
                Set your budget range (GH₵0 – GH₵{priceMax.toLocaleString('en-GH')}).
              </p>
              <input
                type="range" min="0" max={MAX_PRICE} step="50" value={priceMax}
                onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }}
                style={{ accentColor: '#C4973F' }}
                className="w-full h-1 cursor-pointer appearance-auto"
              />
              <div className="flex justify-between mt-2">
                <span className="text-white/30 text-[10px]">GH₵0</span>
                <span className="text-[#C4973F] text-[10px] font-medium">GH₵{priceMax.toLocaleString('en-GH')}</span>
                <span className="text-white/30 text-[10px]">GH₵{MAX_PRICE.toLocaleString('en-GH')}</span>
              </div>
            </div>

            {/* Search */}
            <div>
              <p className="text-white/80 text-xs font-medium tracking-widest uppercase mb-1">Search</p>
              <p className="text-white/35 text-[10px] mb-3">Filter by product name.</p>
              <div className="flex items-center bg-[#1A1A1A] border border-white/10 px-3 py-3 gap-2 rounded">
                <Search size={14} className="text-white/30 flex-shrink-0" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                />
                <span className="text-white/30 text-xs whitespace-nowrap">{filtered.length} results</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-['Playfair_Display'] text-2xl text-[#1A1A1A]">No pieces found</p>
            <p className="text-[#5A5A5A] text-sm mt-2">Try a different category or check back soon.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {visible.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {/* Pagination */}
            <div className="mt-16 flex flex-col items-center gap-4">
              {hasMore && (
                <button onClick={() => setPage(page + 1)}
                  className="btn-outline px-12 py-3.5">
                  Load More
                </button>
              )}
              {filtered.length > PAGE_SIZE && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(filtered.length / PAGE_SIZE) }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 text-xs font-medium transition-colors ${
                        n === page ? 'bg-[#C4973F] text-white' : 'text-[#5A5A5A] hover:text-[#1A1A1A]'
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Newsletter dark section */}
      <section className="bg-[#0A0A0A] py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-['Playfair_Display'] text-4xl text-white leading-tight">
              Elevate Your Wardrobe.
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mt-4 max-w-sm">
              Join our inner circle for exclusive access to limited collection launches,
              private atelier events, and personal styling sessions.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex mt-8 border border-white/20 max-w-sm">
              <input
                type="email"
                value={emailSub}
                onChange={(e) => setEmailSub(e.target.value)}
                placeholder="Your Email Addr"
                className="flex-1 px-4 py-3 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
              <button type="submit" className="btn-gold px-6 py-3 whitespace-nowrap">Subscribe</button>
            </form>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80"
              alt="Atelier" className="w-full h-72 object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-[#1A1A1A] hover:text-[#C4973F] transition-colors py-2 px-1">
        {value} <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-black/10 shadow-lg z-40 py-1 min-w-[160px]">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className={`block w-full text-left px-4 py-2.5 text-xs tracking-wider uppercase transition-colors ${
                opt === value ? 'text-[#C4973F] font-medium' : 'text-[#1A1A1A] hover:bg-[#F5F0E8]'
              }`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

