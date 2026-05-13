import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?sort=new', label: 'New Arrivals' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="shrink-0">
          <span className="text-white font-['Inter'] font-semibold text-sm tracking-[0.2em] uppercase">
            Sarfowaa's Couture
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `text-[11px] tracking-[0.18em] uppercase font-medium transition-colors pb-0.5 ${
                  isActive
                    ? 'text-[#C4973F] border-b border-[#C4973F]'
                    : 'text-white/70 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          {/* User dropdown */}
          <div className="relative hidden sm:block">
            <button onClick={() => setUserOpen(!userOpen)} className="text-white/70 hover:text-white transition-colors">
              <User size={17} />
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-white shadow-xl z-50 py-1"
                onMouseLeave={() => setUserOpen(false)}>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserOpen(false)}
                        className="block px-4 py-2.5 text-xs tracking-widest uppercase text-[#C4973F] hover:bg-[#F5F0E8] font-medium">
                        Admin Panel
                      </Link>
                    )}
                    <Link to="/orders" onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-xs tracking-widest uppercase text-[#1A1A1A] hover:bg-[#F5F0E8]">
                      My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-xs tracking-widest uppercase text-[#1A1A1A] hover:bg-[#F5F0E8]">
                      Wishlist
                    </Link>
                    <hr className="my-1 border-black/10" />
                    <button onClick={() => { logout(); setUserOpen(false); }}
                      className="block w-full text-left px-4 py-2.5 text-xs tracking-widest uppercase text-red-500 hover:bg-[#F5F0E8]">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-xs tracking-widest uppercase text-[#1A1A1A] hover:bg-[#F5F0E8]">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setUserOpen(false)}
                      className="block px-4 py-2.5 text-xs tracking-widest uppercase text-[#1A1A1A] hover:bg-[#F5F0E8]">
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="relative text-white/70 hover:text-white transition-colors">
            <ShoppingBag size={17} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#C4973F] text-white text-[9px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile menu button */}
          <button className="lg:hidden text-white/70 hover:text-white ml-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0A0A0A] border-t border-white/5 px-6 pb-6 pt-2">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block py-3 text-xs tracking-[0.18em] uppercase border-b border-white/5 ${
                  isActive ? 'text-[#C4973F]' : 'text-white/70'
                }`
              }>
              {link.label}
            </NavLink>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-xs tracking-widest uppercase text-[#C4973F]">Admin Panel</Link>}
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="text-xs tracking-widest uppercase text-white/70">My Orders</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left text-xs tracking-widest uppercase text-red-400">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-xs tracking-widest uppercase text-white/70">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="text-xs tracking-widest uppercase text-white/70">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

