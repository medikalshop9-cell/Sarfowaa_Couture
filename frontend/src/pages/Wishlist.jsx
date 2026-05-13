import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Wishlist() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wishlist.length) { setProducts([]); return; }
    setLoading(true);
    // Fetch in chunks of 10 (Firestore 'in' limit)
    const chunks = [];
    for (let i = 0; i < wishlist.length; i += 10) chunks.push(wishlist.slice(i, i + 10));
    Promise.all(
      chunks.map((chunk) =>
        getDocs(query(collection(db, 'products'), where('__name__', 'in', chunk)))
          .then((snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      )
    ).then((results) => setProducts(results.flat())).finally(() => setLoading(false));
  }, [wishlist]);

  if (!user) {
    return (
      <div className="bg-[#0A0A0A] pt-28 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <Heart size={56} className="text-[#C4973F]/40 mb-6" />
        <h2 className="font-['Playfair_Display'] text-2xl text-white mb-2">Sign in to view your wishlist</h2>
        <p className="text-white/40 text-sm mb-6">Save pieces you love for later.</p>
        <Link to="/login" className="btn-gold mt-4 px-8 py-3">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-['Playfair_Display'] text-3xl text-white mb-2">My Wishlist ({wishlist.length})</h1>
        <p className="text-white/40 text-sm mb-8">Pieces you've saved for your consideration.</p>
        {loading ? <Loader /> : (
          products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-24">
              <Heart size={56} className="text-[#C4973F]/40 mx-auto mb-5" />
              <p className="font-['Playfair_Display'] text-xl text-white mb-2">Your wishlist is empty</p>
              <p className="text-white/40 text-sm mb-6">Discover pieces crafted for your distinction.</p>
              <Link to="/shop" className="btn-gold mt-2 px-8 py-3">Explore Collection</Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
