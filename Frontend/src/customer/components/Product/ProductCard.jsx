import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlistItem } from "../../../Redux/Customers/Wishlist/Action";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    title = "Archival Silhouette", 
    brand = "CLOTHSY Atelier", 
    imageUrl = "https://via.placeholder.com/400x600?text=Archive",
    price = 0, 
    discountedPrice = 0, 
    color = "Signature Palette", 
    discountPercent = 0, 
    id 
  } = product || {};
  
  const wishlistState = useSelector((store) => store.wishlist);
  const isWishlisted = wishlistState?.wishlist?.products?.some((p) => p.id === id) || false;

  const handleNavigate = () => {
    if (id) navigate(`/product/${id}`);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    if (id) dispatch(toggleWishlistItem(id));
  };

  if (!product || !id) return null;

  return (
    <div 
      onClick={handleNavigate}
      className="group cursor-pointer w-full flex flex-col bg-transparent"
    >
      {/* IMAGE CONTAINER */}
      <div className="aspect-[3/4] overflow-hidden bg-[#E8E1DE] mb-6 relative border border-transparent group-hover:border-[#D1C4BC] transition-colors duration-500">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
          onError={(e) => {
            // If the image link is dead, swap it to a fallback image so the UI doesn't look broken
            e.target.src = "https://via.placeholder.com/400x600?text=Image+Unavailable";
          }}
        />
        
        {/* Badges */}
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 bg-[#1A1109] text-[#FFF8F5] text-[0.55rem] px-3 py-1 font-label font-black uppercase tracking-[0.2em] z-10">
            Archive -{discountPercent}%
          </div>
        )}

        {/* Minimalist Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className="absolute top-4 right-4 p-2 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        >
          {isWishlisted ? (
            <HeartSolid className="w-5 h-5 text-[#C8742A]" />
          ) : (
            <HeartOutline className="w-5 h-5 text-[#1A1109] hover:text-[#C8742A] transition-colors" />
          )}
        </button>
      </div>

      {/* EDITORIAL TYPOGRAPHY */}
      <div className="flex flex-col gap-1 pr-4">
        <p className="font-label text-[0.55rem] font-black uppercase tracking-[0.3em] text-[#C8742A]">
          {brand}
        </p>
        
        <h2 className="font-headline text-2xl md:text-3xl italic text-[#1A1109] group-hover:text-[#C8742A] transition-colors duration-300 truncate mt-1">
          {title}
        </h2>
        
        <p className="font-label text-[0.6rem] uppercase tracking-[0.15em] text-[#7F756E] truncate mt-1">
          {color}
        </p>
        
        <div className="flex items-baseline gap-3 mt-3">
          <span className="font-headline text-lg font-bold text-[#1A1109]">
            ₹{discountedPrice}
          </span>
          {discountPercent > 0 && (
            <span className="font-headline text-sm text-[#7F756E] line-through decoration-[#BA1A1A] opacity-60">
              ₹{price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;