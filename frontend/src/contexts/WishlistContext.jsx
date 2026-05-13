import { createContext, useContext, useEffect, useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!user) { setWishlist([]); return; }
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) setWishlist(snap.data().wishlist || []);
    });
  }, [user]);

  const toggle = async (productId) => {
    if (!user) { toast.error('Please sign in to use wishlist'); return; }
    const inList = wishlist.includes(productId);
    const ref = doc(db, 'users', user.uid);
    if (inList) {
      await updateDoc(ref, { wishlist: arrayRemove(productId) });
      setWishlist((prev) => prev.filter((id) => id !== productId));
      toast.success('Removed from wishlist');
    } else {
      await updateDoc(ref, { wishlist: arrayUnion(productId) });
      setWishlist((prev) => [...prev, productId]);
      toast.success('Added to wishlist');
    }
  };

  const isWishlisted = (id) => wishlist.includes(id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
