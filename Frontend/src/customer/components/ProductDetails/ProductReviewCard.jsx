import React from "react";
import { motion } from "framer-motion";

const StarIcon = ({ filled }) => (
  <svg
    className={`h-4 w-4 ${filled ? "text-[#8F4A00]" : "text-stone-200"}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CustomRating = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <StarIcon key={star} filled={star <= Math.round(Number(value))} />
    ))}
  </div>
);

const ProductReviewCard = ({ item }) => {
  const authorName = item?.user?.firstName || "Customer";
  
  const date = item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recent Archive";

  const ratingValue = Number(item?.rating || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 border-t border-outline-variant/30 bg-transparent"
    >
      <div className="flex flex-col sm:flex-row gap-6 lg:gap-12">
        {/* Left: Meta Data */}
        <div className="sm:w-1/3 shrink-0 space-y-3">
          <h4 className="font-label uppercase tracking-widest text-[0.6875rem] font-bold text-on-surface">
            {authorName}
          </h4>
          <p className="font-body text-xs text-on-surface-variant uppercase tracking-wider">
            {date}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <CustomRating value={ratingValue} />
          </div>
        </div>

        {/* Right: Review Narrative */}
        <div className="sm:w-2/3">
          {item?.review ? (
            <p className="font-editorial leading-relaxed tracking-[0.05em] text-on-background text-[0.9375rem]">
              "{item.review}"
            </p>
          ) : (
            <p className="text-on-surface-variant text-sm italic tracking-widest">
              Verified Purchase.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductReviewCard;