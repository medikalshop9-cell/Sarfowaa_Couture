import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import toast from 'react-hot-toast';

const formatPrice = (p) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(p || 0);

export default function ProductCard({ product, showAddToCart = true }) {
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success('Added to cart');
  };
  const handleWishlist = (e) => {
    e.preventDefault();
    toggle(product.id);
  };

  const img = product.imageUrl || product.images?.[0] || 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80';

  return (
    <Link to={`/product/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden bg-[#E8E3DA] aspect-[3/4] max-h-[280px]">
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Badges */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[9px] tracking-[0.2em] uppercase font-semibold px-2 py-1 ${
            product.badge.toLowerCase().includes('limited') || product.badge.toLowerCase().includes('edition')
              ? 'bg-[#C4973F] text-white'
              : 'bg-[#0A0A0A] text-white'
          }`}>
            {product.badge}
          </span>
        )}
        {/* Wishlist */}
        <button onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white transition-colors ${wishlisted ? 'text-red-500' : 'text-[#1A1A1A]'}`}>
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        {/* Add to cart overlay */}
        {showAddToCart && (
          <button onClick={handleAdd}
            className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] text-white text-[10px] tracking-[0.2em] uppercase font-medium py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2">
            <ShoppingBag size={13} /> Add to Cart
          </button>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        <p className="text-[#1A1A1A] text-sm font-medium leading-snug">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#C4973F] text-sm font-medium">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-[#9A9A9A] text-xs line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
        {/* Color dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {product.colors.slice(0, 4).map((c, i) => (
              <span key={i} className="w-3 h-3 rounded-full border border-black/15"
                style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

