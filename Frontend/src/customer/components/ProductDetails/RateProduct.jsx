import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../config/api";
import { findProductById } from "../../../Redux/Customers/Product/Action";

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`h-10 w-10 cursor-pointer transition-all duration-150 ${
      filled ? "text-yellow-400 scale-110" : "text-gray-200 hover:text-yellow-200"
    }`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ratingLabels = ["", "Terrible", "Poor", "Okay", "Good", "Excellent"];

export default function RateProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const product = useSelector((store) => store.customersProduct.product);

  useEffect(() => {
    if (productId) dispatch(findProductById(productId));
  }, [productId, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }

    setLoading(true);
    try {
      /**
       * FIX: Single API call instead of two.
       * Rating is now stored directly on the Review entity,
       * so /api/reviews/create handles everything in one request.
       * The separate /api/ratings/create call has been removed.
       */
      await api.post("/api/reviews/create", {
        productId: Number(productId),
        review: review.trim(),
        rating,
      });

      navigate(`/product/${productId}`, {
        state: { reviewSuccess: true },
      });
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="p-8 sm:p-12">
            <h1
              className="text-3xl font-black text-gray-900 mb-8"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Rate This Product
            </h1>

            {product && (
              <div className="flex items-center gap-6 mb-10 p-4 bg-gray-50 rounded-2xl">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-20 h-24 object-cover rounded-lg shadow-sm"
                />
                <div>
                  <p className="text-sm font-bold text-indigo-600 uppercase">
                    {product.brand}
                  </p>
                  <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {product.title}
                  </h2>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Star Selection */}
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Your Rating
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      filled={star <= (hoverRating || rating)}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
                <p className="mt-4 text-indigo-600 font-black text-xl h-7">
                  {hoverRating > 0
                    ? ratingLabels[hoverRating]
                    : rating > 0
                    ? `${ratingLabels[rating]} — ${rating} / 5`
                    : "Select a rating"}
                </p>
              </div>

              {/* Review Text Area */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                  Write a Review{" "}
                  <span className="text-gray-400 font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <textarea
                  rows="5"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell others what you liked or disliked about this product..."
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500 font-medium text-center">
                  {error}
                </p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all"
                >
                  {loading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}