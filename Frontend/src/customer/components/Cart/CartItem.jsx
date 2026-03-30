import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { removeCartItem, updateCartItem } from "../../../Redux/Customers/Cart/Action";

export default function CartItem({ item, showButton = true }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isRemoving, setIsRemoving] = useState(false);

  const imageUrl        = item?.product?.imageUrl        || "";
  const title           = item?.product?.title           || "Product Title";
  const brand           = item?.product?.brand           || "Brand";
  const size            = item?.size                     || "M";
  const discountedPrice = item?.product?.discountedPrice || 0;
  const quantity        = item?.quantity                 || 1;

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => dispatch(removeCartItem(item?.id)), 400);
  };

  const handleUpdate = (delta) => {
    const newQty = quantity + delta;
    if (newQty < 1) return;
    dispatch(updateCartItem({ cartItemId: item?.id, data: { quantity: newQty } }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isRemoving ? 0 : 1, y: isRemoving ? -8 : 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 md:grid-cols-6 py-10 border-b border-[#D1C4BC] items-center"
    >
      {/* Image & Details */}
      <div className="col-span-3 flex items-center space-x-6">
        <div
          className="w-32 h-40 bg-[#E8E1DE] overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={() => navigate(`/product/${item.product.id}`)}
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700 ease-out hover:scale-105"
          />
        </div>
        <div className="space-y-1">
          <h3
            className="font-headline text-2xl text-[#1A1109] italic capitalize tracking-tight cursor-pointer hover:text-[#C8742A] transition-colors"
            onClick={() => navigate(`/product/${item.product.id}`)}
          >
            {title}
          </h3>
          <p className="font-label uppercase tracking-[0.1em] text-[10px] text-[#7F756E]">
            {brand} / Size {size}
          </p>
          {showButton && (
            <button
              onClick={handleRemove}
              className="pt-4 text-[10px] font-label uppercase tracking-widest text-[#C8742A] hover:underline underline-offset-4 transition-all"
            >
              Remove Item
            </button>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="mt-6 md:mt-0 flex justify-start md:justify-center items-center">
        {showButton ? (
          <div className="flex items-center space-x-4 border border-[#D1C4BC] px-4 py-2">
            <button
              onClick={() => handleUpdate(-1)}
              disabled={quantity <= 1}
              className="text-[#1A1109]/40 hover:text-[#1A1109] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              —
            </button>
            <span className="font-label text-sm px-2 font-bold">
              {quantity.toString().padStart(2, "0")}
            </span>
            <button
              onClick={() => handleUpdate(1)}
              className="text-[#1A1109]/40 hover:text-[#1A1109] transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <span className="font-label text-sm text-[#7F756E]">
            Qty: {quantity.toString().padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Total Price */}
      <div className="mt-4 md:mt-0 md:text-right col-span-2">
        <span className="font-headline text-2xl text-[#1A1109]">
          ₹{(discountedPrice * quantity).toLocaleString("en-IN")}
        </span>
      </div>
    </motion.div>
  );
}