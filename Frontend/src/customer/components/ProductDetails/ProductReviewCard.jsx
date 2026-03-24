import React from "react";
import { motion } from "framer-motion";

const StarIcon = ({ filled }) => (
  <svg
    className={`h-4 w-4 sm:h-5 sm:w-5 ${filled ? "text-yellow-400" : "text-gray-200"}`}
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
      <StarIcon key={star} filled={star <= Math.round(value)} />
    ))}
  </div>
);

const ProductReviewCard = ({ item }) => {
  const authorName = item?.user?.firstName || "Customer";
  const initial = authorName.charAt(0).toUpperCase();

  const date = item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recent";

  /**
   * FIX: Use item.rating directly from the Review entity.
   * Previously this was hardcoded to 5, which was wrong for every review
   * that wasn't actually 5 stars. Now that the Review entity has a 'rating'
   * field, we read it here. Falls back to 0 if somehow missing.
   */
  const ratingValue = item?.rating || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {initial}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h4 className="font-bold text-gray-900">{authorName}</h4>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <CustomRating value={ratingValue} />
              {ratingValue > 0 && (
                <span className="text-xs text-gray-400">{ratingValue} / 5</span>
              )}
            </div>
          </div>

          {item?.review ? (
            <p className="text-gray-600 text-sm leading-relaxed">{item.review}</p>
          ) : (
            <p className="text-gray-400 text-sm italic">No written review.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductReviewCard;