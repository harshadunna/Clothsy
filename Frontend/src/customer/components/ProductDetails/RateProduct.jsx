import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../config/api";
import { findProductById } from "../../../Redux/Customers/Product/Action";

const ratingLabels = ["", "Terrible", "Poor", "Fair", "Good", "Exceptional"];

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
      setError("Please select a quality score before submitting.");
      return;
    }

    setLoading(true);
    try {
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
        err?.response?.data?.message || "An error occurred in the archive. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-24 px-6 relative overflow-hidden">
      
      {/* Subtle Background Texture */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex justify-center items-center">
        <span className="font-headline italic font-bold text-[30rem] md:text-[40rem] text-surface-container-highest select-none leading-none">
          {rating > 0 ? `0${rating}` : "R"}
        </span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 bg-surface-container-lowest w-full max-w-4xl border border-outline-variant/30 rounded-none overflow-hidden shadow-[0_20px_80px_rgba(35,26,17,0.06)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Visual/Brand Side */}
          <div className="hidden md:block relative bg-surface-container">
            {product?.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="w-full h-full object-cover grayscale-[20%]"
              />
            ) : (
              <div className="w-full h-full bg-outline-variant/20 animate-pulse"></div>
            )}
            <div className="absolute inset-0 flex flex-col justify-end p-10 bg-gradient-to-t from-on-background/60 via-on-background/20 to-transparent">
              <p className="font-label text-[10px] uppercase tracking-widest text-surface/80 mb-2 font-bold">
                {product?.brand || "Editorial Archive"}
              </p>
              <h2 className="font-headline italic text-3xl text-surface leading-tight">
                Your perspective shapes our craftsmanship.
              </h2>
            </div>
          </div>

          {/* Right: Interaction Side */}
          <div className="p-8 md:p-12 flex flex-col bg-surface">
            
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="font-headline italic text-3xl tracking-tight leading-none mb-2 text-on-surface">
                  Editorial Feedback
                </h2>
                <p className="uppercase tracking-widest text-[0.6rem] font-bold text-outline">
                  {product?.title ? `Reviewing: ${product.title}` : "Product Rating & Review"}
                </p>
              </div>
              <button 
                onClick={() => navigate(-1)} 
                className="text-outline hover:text-primary transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
              
              {/* Rating Logic: Copper Dots */}
              <div className="mb-12">
                <p className="uppercase tracking-widest text-[0.6875rem] font-bold mb-6 text-on-surface">
                  Select Quality Score
                </p>
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`w-4 h-4 rounded-full transition-transform hover:scale-125 focus:ring-2 focus:ring-offset-4 focus:ring-primary outline-none ${
                          isFilled ? "bg-primary" : "bg-outline-variant/50"
                        }`}
                        title={`${star} Stars`}
                      ></button>
                    );
                  })}
                  
                  {/* Dynamic Rating Label */}
                  <span className="ml-4 font-headline italic text-primary text-xl">
                    {hoverRating > 0 ? ratingLabels[hoverRating] : rating > 0 ? ratingLabels[rating] : ""}
                  </span>
                </div>
              </div>

              {/* Text Area: Sharp, 1px Border */}
              <div className="mb-12 flex-grow">
                <label htmlFor="review" className="block uppercase tracking-widest text-[0.6875rem] font-bold mb-4 text-on-surface">
                  Written Narrative <span className="text-outline font-normal lowercase tracking-normal ml-1">(optional)</span>
                </label>
                <textarea
                  id="review"
                  rows="5"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Describe the fit, texture, and silhouette..."
                  className="w-full bg-transparent border border-outline-variant/40 rounded-none px-4 py-4 text-on-surface font-body text-sm focus:border-primary focus:ring-0 placeholder:text-outline/50 transition-colors duration-300 resize-none"
                ></textarea>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-error font-label text-[10px] uppercase tracking-widest font-bold mb-6">
                  {error}
                </p>
              )}

              {/* CTA: Sharp Black Rectangle */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-on-surface text-surface rounded-none py-5 uppercase tracking-[0.2em] text-[0.75rem] font-bold hover:bg-primary transition-all duration-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting Archive..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}