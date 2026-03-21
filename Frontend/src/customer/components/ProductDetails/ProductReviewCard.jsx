import React from "react";
import { motion } from "framer-motion";

// Custom Tailwind Star Icon
const StarIcon = ({ filled }) => (
  <svg 
    className={`h-4 w-4 sm:h-5 sm:w-5 ${filled ? 'text-yellow-400' : 'text-gray-200'}`} 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Read-only Rating Component
const CustomRating = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <StarIcon key={star} filled={star <= Math.round(value)} />
    ))}
  </div>
);

const ProductReviewCard = ({ item }) => {
  // Smart fallbacks to handle both your Redux backend data and the Dummy data seamlessly
  const authorName = item?.user?.firstName || item?.author || "Anonymous";
  const initial = authorName.charAt(0).toUpperCase();
  const date = item?.date || "April 5, 2023";
  const rating = item?.rating || 4.5;
  const reviewText = item?.review || item?.comment || "No review text provided.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-5 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        
        {/* Avatar Setup */}
        <div className="shrink-0 flex items-start">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            {initial}
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 space-y-3">
          
          {/* Header: Name, Date, and Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
                {authorName}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                {date}
              </p>
            </div>
            
            {/* Stars align to the left on mobile, right on desktop */}
            <div className="self-start sm:self-center">
              <CustomRating value={rating} />
            </div>
          </div>
          
          {/* The Actual Review Text */}
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {reviewText}
          </p>
          
        </div>
      </div>
    </motion.div>
  );
};

export default ProductReviewCard;