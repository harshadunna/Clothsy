import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

export default function HomeSectionCard({ product }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const infoRef = useRef(null);
  const badgeRef = useRef(null);
  const priceRef = useRef(null);

  const discountPercent = product?.discountPersent || product?.discountPercent;
  const hasDiscount = discountPercent > 0;

  // GSAP hover enter 
  const handleMouseEnter = () => {
    // Card lift + shadow
    gsap.to(cardRef.current, {
      y: -8,
      boxShadow: "0 20px 48px rgba(26,17,9,0.14)",
      duration: 0.4,
      ease: "power3.out",
    });

    // Image zoom
    gsap.to(imageRef.current, {
      scale: 1.07,
      duration: 0.7,
      ease: "power2.out",
    });

    // Info slight rise
    gsap.to(infoRef.current, {
      y: -4,
      duration: 0.4,
      ease: "power2.out",
    });

    // Price pop
    if (priceRef.current) {
      gsap.fromTo(
        priceRef.current,
        { scale: 1 },
        { scale: 1.05, duration: 0.25, ease: "back.out(2)", yoyo: true, repeat: 1 }
      );
    }

    // Badge pulse
    if (badgeRef.current) {
      gsap.to(badgeRef.current, {
        scale: 1.08,
        duration: 0.2,
        ease: "back.out(2)",
      });
    }
  };

  // GSAP hover leave 
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: "0 0px 0px rgba(0,0,0,0)",
      duration: 0.5,
      ease: "power3.out",
    });

    gsap.to(imageRef.current, {
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.to(infoRef.current, {
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    });

    if (badgeRef.current) {
      gsap.to(badgeRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  // GSAP click press 
  const handleMouseDown = () => {
    gsap.to(cardRef.current, {
      scale: 0.97,
      duration: 0.12,
      ease: "power2.out",
    });
  };

  const handleMouseUp = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/product/${product?.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="cursor-pointer flex flex-col bg-white overflow-hidden w-[15rem] mx-auto"
      style={{ willChange: "transform" }}
    >
      {/* Image Container */}
      <div className="relative w-full h-[22rem] bg-gray-50 overflow-hidden">
        <img
          ref={imageRef}
          src={product?.imageUrl}
          alt={product?.title || ""}
          draggable={false}
          className="w-full h-full object-cover object-top select-none"
          style={{ willChange: "transform" }}
        />

        {/* Subtle bottom vignette */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(255,255,255,0.4), transparent)",
          }}
        />

        {hasDiscount && (
          <div
            ref={badgeRef}
            className="absolute top-0 left-0 text-[10px] font-bold px-3 py-1 text-white tracking-widest uppercase bg-[#1a1109]"
            style={{ willChange: "transform" }}
          >
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Info */}
      <div
        ref={infoRef}
        className="pt-4 pb-2 space-y-1 text-center flex-grow"
        style={{ willChange: "transform" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {product?.brand}
        </p>
        <h3
          className="text-sm font-medium leading-snug truncate text-[#1a1109]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {product?.title}
        </h3>

        {product?.discountedPrice && (
          <div
            ref={priceRef}
            className="flex items-center justify-center gap-3 pt-1"
            style={{ willChange: "transform" }}
          >
            <span className="text-sm font-semibold text-[#1a1109]">
              ₹{product.discountedPrice}
            </span>
            {product?.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.price}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}