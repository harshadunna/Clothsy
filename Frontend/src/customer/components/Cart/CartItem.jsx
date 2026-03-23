import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { removeCartItem, updateCartItem } from "../../../Redux/Customers/Cart/Action";

export default function CartItem({ item, showButton }) {
  const dispatch = useDispatch();
  const [isRemoving, setIsRemoving] = useState(false);

  const imageUrl = item?.product?.imageUrl ||
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80";
  const title = item?.product?.title || "Product Title";
  const brand = item?.product?.brand || "Brand";
  const size = item?.size || "M";
  const price = item?.product?.price || 0;
  const discountedPrice = item?.product?.discountedPrice || 0;
  const discountPercent = item?.product?.discountPercent || 0;
  const quantity = item?.quantity || 1;
  const saved = (price - discountedPrice) * quantity;

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      dispatch(removeCartItem(item?.id));
    }, 200);
  };

  const handleUpdate = (delta) => {
    const newQty = quantity + delta;
    if (newQty < 1) return;
    dispatch(updateCartItem({
      cartItemId: item?.id,
      data: { quantity: newQty },
    }));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isRemoving ? 0 : 1,
        y: 0,
        scale: isRemoving ? 0.96 : 1,
      }}
      exit={{
        opacity: 0,
        y: -10,
        scale: 0.97,
        transition: { duration: 0.25, ease: "easeIn" },
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border overflow-hidden"
      style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 16px rgba(180,140,90,0.07)" }}
    >
      <div className="flex gap-0">

        {/* Image */}
        <div className="w-28 sm:w-36 shrink-0 relative overflow-hidden" style={{ background: "#f9f3ed" }}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
            style={{ minHeight: "140px" }}
          />
          {discountPercent > 0 && (
            <div
              className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: "#c8742a", color: "#fff" }}
            >
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#c8742a" }}>
                  {brand}
                </p>
                <h3 className="font-bold text-base mt-0.5 leading-snug" style={{ color: "#1a1109" }}>
                  {title}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-lg" style={{ color: "#1a1109" }}>₹{discountedPrice}</p>
                <p className="text-xs line-through mt-0.5" style={{ color: "#b5a89a" }}>₹{price}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg" style={{ background: "#f5ede4", color: "#7a5c3a" }}>
                Size: {size}
              </span>
              {saved > 0 && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg" style={{ background: "#f0faf4", color: "#16a34a" }}>
                  Save ₹{saved}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {showButton && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "#f5ede4" }}>

              {/* Qty Controls */}
              <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: "#e8ddd5" }}>
                <button
                  onClick={() => handleUpdate(-1)}
                  disabled={quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center transition-colors"
                  style={{
                    color: quantity <= 1 ? "#d9cfc6" : "#7a6a5a",
                    background: quantity <= 1 ? "transparent" : "#fdf8f4",
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                  </svg>
                </button>

                <span
                  className="w-9 h-9 flex items-center justify-center text-sm font-black border-x"
                  style={{ color: "#1a1109", borderColor: "#e8ddd5", background: "#fff" }}
                >
                  {quantity}
                </span>

                <button
                  onClick={() => handleUpdate(1)}
                  className="w-9 h-9 flex items-center justify-center transition-colors"
                  style={{ color: "#7a6a5a", background: "#fdf8f4" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Remove Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                style={{ color: "#c8742a", background: "#fdf0e6" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}