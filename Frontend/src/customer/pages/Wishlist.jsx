import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getWishlist, toggleWishlistItem } from "../../Redux/Customers/Wishlist/Action";
import { addItemToCart, getCart } from "../../Redux/Customers/Cart/Action";

// Size Selector Modal
const SizeSelectorModal = ({ product, onConfirm, onClose }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false);

  // Pre-select first available size
  useEffect(() => {
    const first = product.sizes?.find((s) => s.quantity > 0);
    setSelectedSize(first || null);
  }, [product]);

  const handleConfirm = async () => {
    if (!selectedSize) return;
    setAdding(true);
    await onConfirm(selectedSize);
    setAdding(false);
  };

  return (
    // Backdrop
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full sm:max-w-sm bg-[#FFF8F5] p-8 border-t-4 border-[#C8742A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="font-label text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#C8742A] mb-1">
              Select Size
            </p>
            <h3 className="font-headline italic text-2xl text-[#1A1109] leading-tight">
              {product.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#7F756E] hover:text-[#1A1109] transition-colors mt-1"
          >
            <span
              className="material-symbols-outlined !text-xl"
              style={{ fontVariationSettings: "'wght' 300" }}
            >
              close
            </span>
          </button>
        </div>

        {/* Size Grid */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {product.sizes?.map((size) => {
            const unavailable = size.quantity <= 0;
            const isSelected = selectedSize?.name === size.name;
            return (
              <button
                key={size.name}
                onClick={() => !unavailable && setSelectedSize(size)}
                disabled={unavailable}
                className={`py-4 font-label text-[0.7rem] font-black tracking-wider border transition-all
                  ${
                    isSelected
                      ? "bg-[#1A1109] text-[#FFF8F5] border-[#1A1109]"
                      : unavailable
                      ? "opacity-25 cursor-not-allowed line-through border-[#D1C4BC] text-[#7F756E]"
                      : "border-[#D1C4BC] text-[#7F756E] hover:border-[#1A1109] hover:text-[#1A1109]"
                  }`}
              >
                {size.name}
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedSize || adding}
          className="w-full py-5 bg-[#1A1109] text-[#FFF8F5] font-label text-[0.75rem] font-black tracking-[0.3em] uppercase hover:bg-[#C8742A] transition-colors disabled:opacity-30"
        >
          {adding ? "Moving to Bag..." : "Confirm & Move to Bag"}
        </button>
      </motion.div>
    </motion.div>
  );
};

// Main Wishlist Page
export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wishlist, loading } = useSelector((store) => store.wishlist);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Which product's size modal is open
  const [sizeModalProduct, setSizeModalProduct] = useState(null);

  useEffect(() => {
    dispatch(getWishlist());
  }, [dispatch]);

  const products = wishlist?.products || [];
  const isEmpty = products.length === 0;

  const triggerToast = (msg, type = "default") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), message: msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  const handleRemove = (productId) => {
    dispatch(toggleWishlistItem(productId));
    triggerToast("Piece removed from archive.", "remove");
  };

  // Opens the size modal
  const handleOpenSizeModal = (product) => {
    setSizeModalProduct(product);
  };

  // Called when user picks a size and confirms inside the modal
  const handleConfirmSize = async (selectedSize) => {
    if (!sizeModalProduct) return;
    try {
      await dispatch(
        addItemToCart({
          data: {
            productId: sizeModalProduct.id,
            size: selectedSize.name,
            quantity: 1,
          },
        })
      );
      await dispatch(getCart());
      dispatch(toggleWishlistItem(sizeModalProduct.id));
      setSizeModalProduct(null);
      triggerToast("Piece moved to bag.", "cart");
    } catch (err) {
      console.error("Move to bag failed:", err);
      setSizeModalProduct(null);
      triggerToast("Something went wrong. Try again.", "error");
    }
  };

  return (
    <div className="bg-white text-[#1A1109] font-body min-h-screen pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed top-28 right-8 md:right-12 z-[300] bg-[#1A1109] text-[#FFF8F5] px-6 py-5 font-label text-[0.7rem] font-black uppercase tracking-widest border-l-4 shadow-2xl flex items-center gap-4"
            style={{
              borderColor:
                toast.type === "error"
                  ? "#BA1A1A"
                  : toast.type === "remove"
                  ? "#7F756E"
                  : "#C8742A",
            }}
          >
            <span>{toast.message}</span>
            {toast.type === "cart" && (
              <button
                onClick={() => navigate("/cart")}
                className="border-b border-[#C8742A] text-[#C8742A] hover:text-[#FFF8F5] hover:border-[#FFF8F5] transition-colors whitespace-nowrap"
              >
                View Bag →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Selector Modal */}
      <AnimatePresence>
        {sizeModalProduct && (
          <SizeSelectorModal
            product={sizeModalProduct}
            onConfirm={handleConfirmSize}
            onClose={() => setSizeModalProduct(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto">

        {/* Header */}
        <header className="mb-16">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-headline font-bold text-6xl md:text-7xl lg:text-8xl tracking-tighter uppercase mb-4"
          >
            The Selection
          </motion.h1>
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-stone-500">
              <span className="text-[#C8742A]">{products.length} Pieces</span> Saved
            </span>
            <div className="h-[1px] w-24 bg-stone-200" />
          </div>
        </header>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-stone-100 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : isEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <span
              className="material-symbols-outlined text-[80px] text-stone-200 mb-8"
              style={{ fontVariationSettings: "'wght' 100" }}
            >
              favorite
            </span>
            <h2 className="font-headline italic text-4xl text-stone-400">
              A Quiet Collection.
            </h2>
            <button
              onClick={() => navigate("/products")}
              className="mt-8 font-label text-[11px] font-bold uppercase tracking-[0.2em] border-b border-stone-900 pb-1"
            >
              Discover Pieces
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <SelectionCard
                  key={product.id}
                  product={product}
                  onRemove={() => handleRemove(product.id)}
                  onMove={() => handleOpenSizeModal(product)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Selection Card
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
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover grayscale-[100%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
        />

        {/* Remove */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-4 right-4 z-20 text-black/40 hover:text-black transition-colors"
        >
          <span
            className="material-symbols-outlined !text-lg"
            style={{ fontVariationSettings: "'wght' 400" }}
          >
            close
          </span>
        </button>

        {/* Move to Bag — just opens modal */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onMove(); }}
            className="w-full bg-[#1A1109] text-white font-label font-bold text-[11px] tracking-[0.2em] py-5 uppercase hover:bg-[#C8742A] transition-colors"
          >
            Move to Bag
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <h3 className="font-headline text-xl font-medium tracking-tight text-[#1A1109]">
          {product.title}
        </h3>
        <p className="font-body text-sm tracking-widest text-stone-500">
          ₹{product.discountedPrice || product.price}
        </p>
      </div>
    </motion.div>
  );
};