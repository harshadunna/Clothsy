import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RadioGroup } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import ProductReviewCard from "./ProductReviewCard";
import { findProductById } from "../../../Redux/Customers/Product/Action";
import { addItemToCart } from "../../../Redux/Customers/Cart/Action";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const StarIcon = ({ filled }) => (
  <svg className={`h-5 w-5 ${filled ? "text-yellow-400" : "text-gray-200"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CustomRating = ({ value }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <StarIcon key={star} filled={star <= value} />
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
    <span className="w-10 text-sm text-gray-500 text-right">{count}k</span>
  </div>
);

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();

  const { customersProduct, auth } = useSelector((store) => store);
  const product = customersProduct?.product;

  // Fetch product when productId changes
  useEffect(() => {
    if (productId) dispatch(findProductById(productId));
  }, [productId]);

  // Clear product from state when leaving the page
  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_PRODUCT" });
    };
  }, []);

  // Set default selected size once product loads
  useEffect(() => {
    if (product?.sizes?.length > 0) {
      const firstAvailable = product.sizes.find((s) => s.quantity > 0);
      setSelectedSize(firstAvailable || product.sizes[0]);
    }
  }, [product]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!auth.user) {
      navigate("/login");
      return;
    }
    if (!selectedSize) return;
    dispatch(addItemToCart({
      data: {
        productId: product.id,
        size: selectedSize.name,
        quantity: 1,
      },
    }));
    navigate("/cart");
  };

  // Loading state
  if (customersProduct?.loading || !product) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 animate-pulse">
            <div className="aspect-[4/5] rounded-2xl bg-gray-200" />
            <div className="mt-10 lg:mt-0 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded w-2/3" />
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Breadcrumbs */}
        <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex text-sm text-gray-500 mb-8">
          <ol className="flex items-center space-x-2">
            <li>
              <span onClick={() => navigate("/")} className="hover:text-indigo-600 transition-colors cursor-pointer">
                Home
              </span>
            </li>
            <li><span className="mx-2 text-gray-300">/</span></li>
            <li
              className="capitalize cursor-pointer hover:text-indigo-600"
              onClick={() => navigate(-1)}
            >
              {product?.category?.name?.replace(/_/g, " ") || "Products"}
            </li>
            <li><span className="mx-2 text-gray-300">/</span></li>
            <li className="text-gray-900 font-medium line-clamp-1">{product?.title}</li>
          </ol>
        </motion.nav>

        {/* Main Product Layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">

          {/* Image Gallery */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 w-full lg:w-24 shrink-0">
              {images.map((src, index) => (
                <motion.button
                  variants={fadeUp}
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-24 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 transition-all ${
                    activeImageIndex === index
                      ? "ring-2 ring-indigo-600 ring-offset-2"
                      : "hover:opacity-80"
                  }`}
                >
                  <img src={src} alt={`View ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>

            <motion.div variants={fadeUp} className="w-full aspect-[4/5] lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[activeImageIndex]}
                  alt={product?.title}
                  className="w-full h-full object-cover object-center"
                />
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Product Info */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-10 lg:mt-0 px-2 lg:px-0">
            <motion.div variants={fadeUp}>
              <h2 className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">
                {product?.brand}
              </h2>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
                {product?.title}
              </h1>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-900">₹{product?.discountedPrice}</p>
                <p className="text-lg text-gray-400 line-through mb-1">₹{product?.price}</p>
                {product?.discountPercent > 0 && (
                  <p className="text-sm font-semibold text-green-600 mb-1.5 bg-green-50 px-2 py-0.5 rounded-md">
                    {product?.discountPercent}% OFF
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <CustomRating value={product?.numRatings || 0} />
                <span className="text-sm text-indigo-600 font-medium">
                  {product?.numRatings || 0} Reviews
                </span>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8">
              <p className="text-base text-gray-600 leading-relaxed">
                {product?.description}
              </p>
            </motion.div>

            {/* Size Selector + Add to Cart */}
            <motion.form variants={fadeUp} className="mt-10 border-t border-gray-200 pt-8" onSubmit={handleAddToCart}>
              {product?.sizes?.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                    <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                      Size guide
                    </span>
                  </div>
                  <RadioGroup value={selectedSize} onChange={setSelectedSize}>
                    <div className="grid grid-cols-5 gap-3">
                      {product.sizes.map((size) => {
                        const inStock = size.quantity > 0;
                        return (
                          <RadioGroup.Option
                            key={size.name}
                            value={size}
                            disabled={!inStock}
                            className={({ checked }) => classNames(
                              inStock
                                ? "cursor-pointer bg-white text-gray-900 shadow-sm hover:bg-gray-50"
                                : "cursor-not-allowed bg-gray-50 text-gray-300",
                              checked
                                ? "ring-2 ring-indigo-600 ring-offset-1 bg-indigo-50/50"
                                : "ring-1 ring-gray-200",
                              "group relative flex items-center justify-center rounded-xl py-3 text-sm font-semibold uppercase transition-all outline-none"
                            )}
                          >
                            <RadioGroup.Label as="span">{size.name}</RadioGroup.Label>
                            {!inStock && (
                              <svg className="absolute inset-0 h-full w-full stroke-2 text-gray-200" viewBox="0 0 100 100" preserveAspectRatio="none" stroke="currentColor">
                                <line x1={0} y1={100} x2={100} y2={0} vectorEffect="non-scaling-stroke" />
                              </svg>
                            )}
                          </RadioGroup.Option>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="mt-8 flex w-full items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-8 py-4 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md shadow-indigo-600/20"
              >
                Add to Cart
              </motion.button>
            </motion.form>
          </motion.div>
        </div>

        {/* Reviews Section */}
        {product?.reviews?.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mt-24 border-t border-gray-200 pt-16"
          >
            <motion.h2 variants={fadeUp} className="text-2xl font-bold text-gray-900 tracking-tight">
              Customer Reviews
            </motion.h2>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
              <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-extrabold text-gray-900">
                    {product?.numRatings || 0}
                  </div>
                  <div>
                    <CustomRating value={product?.numRatings || 0} />
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {product?.reviews?.length || 0} reviews
                    </p>
                  </div>
                </div>
                <ProgressBar label="Excellent" percentage={70} count="30" colorClass="bg-green-500" />
                <ProgressBar label="Very Good" percentage={15} count="6.4" colorClass="bg-green-400" />
                <ProgressBar label="Good" percentage={8} count="3.4" colorClass="bg-yellow-400" />
                <ProgressBar label="Average" percentage={5} count="2.1" colorClass="bg-orange-400" />
                <ProgressBar label="Poor" percentage={2} count="0.9" colorClass="bg-red-500" />
              </motion.div>

              <motion.div variants={fadeUp} className="lg:col-span-8 space-y-6">
                {product.reviews.map((review) => (
                  <ProductReviewCard key={review.id} item={review} />
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}