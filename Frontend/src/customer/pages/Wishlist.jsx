import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getWishlist, toggleWishlistItem } from "../../Redux/Customers/Wishlist/Action";
import { addItemToCart } from "../../Redux/Customers/Cart/Action";

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wishlist, loading } = useSelector((store) => store.wishlist);

  useEffect(() => {
    dispatch(getWishlist());
  }, [dispatch]);

  const products = wishlist?.products || [];
  const isEmpty = products.length === 0;

  const handleRemove = (productId) => {
    dispatch(toggleWishlistItem(productId)); 
  };

  const handleMoveToBag = (product) => {
    const data = { productId: product.id, size: product.sizes[0]?.name || "M", quantity: 1 };
    dispatch(addItemToCart(data));
    dispatch(toggleWishlistItem(product.id)); 
  };

  return (
    <div className="bg-white text-[#1A1109] font-body min-h-screen pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto">

        {/* ── Header Section ── */}
        <header className="mb-16">
          <motion.h1
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="font-headline font-bold text-6xl md:text-7xl lg:text-8xl tracking-tighter uppercase mb-4"
          >
            The Selection
          </motion.h1>
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-stone-500">
              <span className="text-[#C8742A]">{products.length} Pieces</span> Saved
            </span>
            <div className="h-[1px] w-24 bg-stone-200"></div>
          </div>
        </header>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-stone-100 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : isEmpty ? (
          /* ── Quiet Collection Empty State ── */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[80px] text-stone-200 mb-8" style={{ fontVariationSettings: "'wght' 100" }}>favorite</span>
            <h2 className="font-headline italic text-4xl text-stone-400">A Quiet Collection.</h2>
            <button onClick={() => navigate('/products')} className="mt-8 font-label text-[11px] font-bold uppercase tracking-[0.2em] border-b border-stone-900 pb-1">Discover Pieces</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <SelectionCard
                  key={product.id}
                  product={product}
                  onRemove={() => handleRemove(product.id)}
                  onMove={() => handleMoveToBag(product)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Internal Component: The Editorial Selection Card ── */
const SelectionCard = ({ product, onRemove, onMove }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex flex-col"
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-stone-100 mb-6">
        {/* Grayscale Image with Color Hover */}
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover grayscale-[100%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
        />

        {/* Remove Icon */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-4 right-4 z-20 text-black/40 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined !text-lg" style={{ fontVariationSettings: "'wght' 400" }}>close</span>
        </button>

        {/* Move to Bag Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onMove(); }}
            className="w-full bg-[#1A1109] text-white font-label font-bold text-[11px] tracking-[0.2em] py-5 uppercase hover:bg-stone-800 transition-colors"
          >
            Move to Bag
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <h3 className="font-headline text-xl font-medium tracking-tight text-[#1A1109]">{product.title}</h3>
        <p className="font-body text-sm tracking-widest text-stone-500">₹{product.discountedPrice || product.price}</p>
      </div>
    </motion.div>
  );
};