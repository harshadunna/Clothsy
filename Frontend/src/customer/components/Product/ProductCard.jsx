import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ProductCard = ({ product }) => {
  const {
    title,
    brand,
    imageUrl,
    price,
    discountedPrice,
    color,
    discountPercent,
    id,
  } = product;

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/product/${id}`);
  };

  return (
    <motion.div
      onClick={handleNavigate}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full h-full flex flex-col rounded-2xl border border-gray-100 bg-white cursor-pointer overflow-hidden group"
    >
      <div className="w-full aspect-[4/5] overflow-hidden relative">
        <motion.img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover object-top"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {brand}
        </p>
        <p className="text-sm font-medium text-gray-800 line-clamp-2">{title}</p>
        <p className="text-xs text-gray-400">{color}</p>

        <div className="flex items-center gap-2 pt-2 mt-auto">
          <p className="text-base font-bold text-gray-900">₹{discountedPrice}</p>
          <p className="text-sm text-gray-400 line-through">₹{price}</p>
          {discountPercent > 0 && (
            <p className="text-xs font-semibold text-green-500">
              {discountPercent}% off
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;