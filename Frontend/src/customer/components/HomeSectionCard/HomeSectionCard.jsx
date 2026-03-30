import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeSectionCard({ product }) {
  const navigate = useNavigate();
  const cardRef  = useRef(null);

  const discountPercent = product?.discountPersent || product?.discountPercent;
  const hasDiscount     = discountPercent > 0;

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/product/${product?.id}`)}
      className="group cursor-pointer flex-shrink-0"
      style={{ width: "180px" }}
    >
      <div
        className="relative overflow-hidden bg-[#E8E8E8]"
        style={{ width: "180px", height: "240px" }}
      >
        <img
          src={product?.imageUrl || product?.images?.[0]}
          alt={product?.title || "Product Image"}
          draggable={false}
          className="w-full h-full object-cover object-top select-none grayscale-[15%] transition-all duration-[800ms] group-hover:scale-105 group-hover:grayscale-0"
        />
        {hasDiscount && (
          <div className="absolute top-0 left-0 text-[8px] font-bold px-2 py-1 text-[#FFF8F5] tracking-widest uppercase bg-[#1A1109]">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="pt-2.5 pb-2">
        <div className="flex justify-between items-start gap-1.5">
          <h4
            className="text-[10px] uppercase tracking-widest font-bold text-[#1A1109] leading-tight"
            style={{ maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {product?.title}
          </h4>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] font-bold text-[#1A1109] whitespace-nowrap">
              ₹{product?.discountedPrice || product?.price}
            </span>
            {hasDiscount && (
              <span className="text-[8px] text-[#7F756E] line-through mt-0.5 whitespace-nowrap">
                ₹{product?.price}
              </span>
            )}
          </div>
        </div>
        <p className="text-[8px] text-[#7F756E] mt-1 uppercase tracking-[0.2em] truncate">
          {product?.brand || "CLOTHSY ATELIER"}
        </p>
      </div>
    </div>
  );
}