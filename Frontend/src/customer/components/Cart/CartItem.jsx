import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { removeCartItem, updateCartItem } from "../../../Redux/Customers/Cart/Action";

export default function CartItem({ item, showButton = true }) {
  const dispatch = useDispatch();
  const [isRemoving, setIsRemoving] = useState(false);

  const imageUrl = item?.product?.imageUrl || "";
  const title = item?.product?.title || "Product Title";
  const brand = item?.product?.brand || "Brand";
  const size = item?.size || "M";
  const discountedPrice = item?.product?.discountedPrice || 0;
  const quantity = item?.quantity || 1;

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      dispatch(removeCartItem(item?.id));
    }, 300);
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
      animate={{ opacity: isRemoving ? 0 : 1, y: isRemoving ? -10 : 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 md:grid-cols-6 py-10 border-b border-outline-variant/30 items-center"
    >
      {/* Left: Image & Details */}
      <div className="col-span-3 flex items-center space-x-6">
        <div className="w-32 h-40 bg-surface-container overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700 ease-out hover:scale-105"
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-headline text-2xl text-on-surface italic capitalize tracking-tight">
            {title}
          </h3>
          <p className="font-label uppercase tracking-[0.1em] text-[10px] text-on-surface/60">
            {brand} / Size {size}
          </p>
          
          {showButton && (
            <button 
              onClick={handleRemove}
              className="pt-4 text-[10px] font-label uppercase tracking-widest text-primary hover:underline underline-offset-4 transition-all"
            >
              Remove Item
            </button>
          )}
        </div>
      </div>

      {/* Center: Quantity */}
      <div className="mt-6 md:mt-0 flex justify-start md:justify-center items-center">
        {showButton ? (
          <div className="flex items-center space-x-4 border border-outline-variant/20 px-4 py-2">
            <button 
              onClick={() => handleUpdate(-1)}
              disabled={quantity <= 1}
              className="text-on-surface/40 hover:text-on-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              —
            </button>
            <span className="font-label text-sm px-2 font-bold">{quantity.toString().padStart(2, '0')}</span>
            <button 
              onClick={() => handleUpdate(1)}
              className="text-on-surface/40 hover:text-on-surface transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <span className="font-label text-sm text-on-surface/60">Qty: {quantity.toString().padStart(2, '0')}</span>
        )}
      </div>

      {/* Right: Total Price */}
      <div className="mt-4 md:mt-0 md:text-right col-span-2">
        <span className="font-headline text-2xl text-on-surface">
          ₹{discountedPrice * quantity}
        </span>
      </div>
    </motion.div>
  );
}