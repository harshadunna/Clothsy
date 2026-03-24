import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RadioGroup } from "@headlessui/react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import ProductReviewCard from "./ProductReviewCard";
import { findProductById } from "../../../Redux/Customers/Product/Action";
import { addItemToCart, getCart } from "../../../Redux/Customers/Cart/Action";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const StarIcon = ({ filled }) => (
  <svg
    className={`h-5 w-5 ${filled ? "text-yellow-400" : "text-gray-200"}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CustomRating = ({ value }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <StarIcon key={star} filled={star <= Math.round(value)} />
    ))}
  </div>
);

const ProgressBar = ({ label, percentage, count, colorClass }) => (
  <div className="flex items-center mt-2">
    <span className="w-20 text-sm font-medium text-gray-600">{label}</span>
    <div className="w-full h-2.5 mx-4 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${percentage}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-2.5 rounded-full ${colorClass}`}
      />
    </div>
    <span className="w-10 text-sm text-gray-500 text-right">{count}</span>
  </div>
);

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();

  const customersProduct = useSelector((store) => store.customersProduct);
  const auth = useSelector((store) => store.auth);
  const product = customersProduct?.product;

  useEffect(() => {
    if (productId) dispatch(findProductById(productId));
  }, [productId, dispatch]);

  useEffect(() => {
    if (product?.sizes?.length > 0) {
      const firstAvailable = product.sizes.find((s) => s.quantity > 0);
      setSelectedSize(firstAvailable || product.sizes[0]);
    }
  }, [product]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!auth.user) {
      navigate("/login");
      return;
    }
    if (!selectedSize) return;
    setAddingToCart(true);
    try {
      await dispatch(
        addItemToCart({
          data: {
            productId: product.id,
            size: selectedSize.name,
            quantity: 1,
          },
        })
      );
      await dispatch(getCart());
      navigate("/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Rating Metrics
  // FIX: reviews now carry a 'rating' field, so we derive all metrics from
  // product.reviews instead of maintaining two separate arrays (ratings/reviews).
  // Safe null checks prevent "undefined Reviews" flashing on first render.
  // ---------------------------------------------------------------------------
  const reviews = product?.reviews || [];
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews
        ).toFixed(1)
      : 0;

  /**
   * FIX: Previously used product?.ratings (a separate entity list) for the
   * progress bars. Now we read from product?.reviews since each review carries
   * its own rating. This eliminates the mismatch between rating count and
   * review count.
   */
  const getRatingCount = (star) =>
    reviews.filter((r) => Math.round(r.rating) === star).length;

  if (customersProduct?.loading || !product) {
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 w-full lg:w-24 shrink-0">
              {images.map((src, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-24 w-20 shrink-0 rounded-xl overflow-hidden transition-all ${
                    activeImageIndex === index ? "ring-2 ring-indigo-600" : ""
                  }`}
                >
                  <img
                    src={src}
                    alt="thumbnail"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm">
              <img
                src={images[activeImageIndex]}
                alt="main"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 lg:mt-0 px-2 lg:px-0">
            <h2 className="text-sm font-semibold text-indigo-600 uppercase">
              {product?.brand}
            </h2>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
              {product?.title}
            </h1>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{product?.discountedPrice}
                </p>
                <p className="text-lg text-gray-400 line-through">
                  ₹{product?.price}
                </p>
                <p className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                  {product?.discountPercent}% OFF
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CustomRating value={averageRating} />
                {/* FIX: Use totalReviews (safe) instead of product?.ratings?.length */}
                <span className="text-sm text-indigo-600 font-medium">
                  {totalReviews} {totalReviews === 1 ? "Rating" : "Ratings"}
                </span>
              </div>
            </div>

            <form
              className="mt-10 border-t border-gray-200 pt-8"
              onSubmit={handleAddToCart}
            >
              <RadioGroup value={selectedSize} onChange={setSelectedSize}>
                <div className="grid grid-cols-5 gap-3">
                  {product.sizes.map((size) => (
                    <RadioGroup.Option
                      key={size.name}
                      value={size}
                      disabled={size.quantity <= 0}
                      className={({ checked }) =>
                        classNames(
                          size.quantity > 0
                            ? "cursor-pointer bg-white"
                            : "cursor-not-allowed bg-gray-50 text-gray-300",
                          checked
                            ? "ring-2 ring-indigo-600"
                            : "ring-1 ring-gray-200",
                          "relative flex items-center justify-center rounded-xl py-3 text-sm font-semibold uppercase"
                        )
                      }
                    >
                      <span>{size.name}</span>
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>

              <button
                type="submit"
                disabled={addingToCart}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-white font-bold hover:bg-indigo-700 disabled:opacity-70"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </form>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-24 border-t border-gray-200 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>
            <button
              onClick={() => navigate(`/product/${productId}/rate`)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all"
            >
              Write a Review
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Summary Panel */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-extrabold text-gray-900">
                  {averageRating}
                </div>
                <div>
                  <CustomRating value={averageRating} />
                  {/* FIX: product?.reviews?.length replaced with totalReviews — safe, no flash */}
                  <p className="text-sm text-gray-500 mt-1">
                    {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
                  </p>
                </div>
              </div>

              <ProgressBar
                label="5 Star"
                percentage={totalReviews ? (getRatingCount(5) / totalReviews) * 100 : 0}
                count={getRatingCount(5)}
                colorClass="bg-green-500"
              />
              <ProgressBar
                label="4 Star"
                percentage={totalReviews ? (getRatingCount(4) / totalReviews) * 100 : 0}
                count={getRatingCount(4)}
                colorClass="bg-green-400"
              />
              <ProgressBar
                label="3 Star"
                percentage={totalReviews ? (getRatingCount(3) / totalReviews) * 100 : 0}
                count={getRatingCount(3)}
                colorClass="bg-yellow-400"
              />
              <ProgressBar
                label="2 Star"
                percentage={totalReviews ? (getRatingCount(2) / totalReviews) * 100 : 0}
                count={getRatingCount(2)}
                colorClass="bg-orange-400"
              />
              <ProgressBar
                label="1 Star"
                percentage={totalReviews ? (getRatingCount(1) / totalReviews) * 100 : 0}
                count={getRatingCount(1)}
                colorClass="bg-red-500"
              />
            </div>

            {/* Review Cards */}
            <div className="lg:col-span-8 space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-lg font-medium">No reviews yet.</p>
                  <p className="text-sm mt-1">Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <ProductReviewCard key={review.id} item={review} />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}