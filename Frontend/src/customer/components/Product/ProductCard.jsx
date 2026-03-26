import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlistItem } from "../../../Redux/Customers/Wishlist/Action";
// Using Material Symbols to match the new Stitch aesthetic
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const ProductCard = ({ product }) => {
  const { title, brand, imageUrl, price, discountedPrice, color, discountPercent, id } = product;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { wishlist } = useSelector((store) => store.wishlist);
  const isWishlisted = wishlist?.products?.some((p) => p.id === id);

  const handleNavigate = () => navigate(`/product/${id}`);

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    dispatch(toggleWishlistItem(id));
  };

  return (
    <div 
      onClick={handleNavigate}
      className="product-card group cursor-pointer w-full flex flex-col"
    >
      {/* Image Container - Strict 3:4 Ratio, No Borders */}
      <div className="aspect-[3/4] overflow-hidden bg-surface-container mb-6 relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Badges & Actions */}
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 bg-on-surface text-surface text-[0.6rem] px-3 py-1 font-label uppercase tracking-widest z-10">
            {discountPercent}% OFF
          </div>
        )}

        {/* Minimalist Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className="absolute top-4 right-4 p-2 bg-transparent hover:bg-surface/50 transition-colors duration-300 z-10"
        >
          {isWishlisted ? (
            <HeartSolid className="w-5 h-5 text-primary" />
          ) : (
            <HeartOutline className="w-5 h-5 text-on-surface hover:text-primary transition-colors" />
          )}
        </button>
      </div>

      {/* Product Information - Editorial Typography */}
      <div className="flex flex-col gap-1 pr-4">
        <h2 className="font-headline text-2xl italic text-on-surface group-hover:text-primary transition-colors duration-300 truncate">
          {title}
        </h2>
        
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.15em] text-on-surface-variant truncate mt-1">
          {color || "Signature"} / {brand || "Clothsy"}
        </p>
        
        <div className="flex items-baseline gap-3 mt-2">
          <span className="font-body text-sm font-bold text-on-surface">
            ₹{discountedPrice}
          </span>
          {discountPercent > 0 && (
            <span className="font-body text-xs text-on-surface-variant line-through">
              ₹{price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;