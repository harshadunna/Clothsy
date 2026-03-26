import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RadioGroup } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import ProductReviewCard from "./ProductReviewCard";
import { findProductById } from "../../../Redux/Customers/Product/Action";
import { addItemToCart, getCart } from "../../../Redux/Customers/Cart/Action";

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
    {[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} filled={star <= Math.round(Number(value))} />)}
  </div>
);

const ProgressBar = ({ label, percentage, count, colorClass }) => (
  <div className="flex items-center mt-2">
    <span className="w-20 text-sm font-medium text-gray-600">{label}</span>
    <div className="w-full h-2.5 mx-4 bg-gray-200 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} whileInView={{ width: `${percentage}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} className={`h-2.5 rounded-full ${colorClass}`} />
    </div>
    <span className="w-10 text-sm text-gray-500 text-right">{count}</span>
  </div>
);

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [quantity, setQuantity] = useState(1); // ── NEW: Simple Quantity State ──

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();

  const { customersProduct, auth } = useSelector((store) => store);
  const product = customersProduct?.product;

  useEffect(() => { window.scrollTo(0, 0); }, [productId]);

  useEffect(() => {
    if (productId) dispatch(findProductById(productId));
  }, [productId, dispatch]);

  useEffect(() => { dispatch(getCart()); }, [dispatch]);

  // Set default size and reset quantity when product changes
  useEffect(() => {
    if (product?.sizes?.length > 0) {
      const firstAvailable = product.sizes.find((s) => s.quantity > 0);
      setSelectedSize(firstAvailable || product.sizes[0]);
      setQuantity(1);
    }
  }, [product]);

  // Reset quantity to 1 if user selects a different size
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  const handleAddToCart = async (shouldRedirect = false) => {
    if (!auth?.user) { navigate("/login"); return; }
    if (!selectedSize || product?.quantity <= 0) return;

    setAddingToCart(true);
    try {
      // Pass the selected quantity to the Redux action
      await dispatch(addItemToCart({ data: { productId: product.id, size: selectedSize.name, quantity: quantity } }));
      await dispatch(getCart());
      
      if (shouldRedirect) navigate("/cart");
      else {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (customersProduct?.loading || !product) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#fdf8f4]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#c8742a]" />
      </div>
    );
  }

  const reviews = product?.reviews || [];
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / totalReviews).toFixed(1) : "0.0";
  const getRatingCount = (star) => reviews.filter((r) => Math.round(Number(r.rating || 0)) === star).length;
  const images = product.images?.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const isOutOfStock = product.quantity <= 0;
  
  // Calculate max available quantity for the dropdown (cap at 10 for UI purposes)
  const maxAvailable = selectedSize ? Math.min(10, selectedSize.quantity) : 1;

  return (
    <div className="min-h-screen pb-20 relative" style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}>
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: -60, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl bg-[#1a1109] text-white">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-sm">Added to your cart!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-14">
          
          {/* Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:w-24 shrink-0">
              {images.map((src, index) => (
                <button key={index} onClick={() => setActiveImageIndex(index)} className={`relative h-24 w-20 shrink-0 rounded-xl overflow-hidden transition-all ${activeImageIndex === index ? "ring-2 ring-[#c8742a] ring-offset-2" : "border border-[#e8ddd5]"}`}>
                  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-xl shadow-orange-900/5">
              <img src={images[activeImageIndex]} alt="" className="w-full h-full object-cover object-center" />
            </div>
          </div>

          {/* Info */}
          <div className="mt-10 lg:mt-0">
            <p className="text-xs font-black uppercase tracking-widest text-[#c8742a]">{product.brand}</p>
            <h1 className="mt-2 text-3xl font-black text-[#1a1109]" style={{ fontFamily: "'Georgia', serif" }}>{product.title}</h1>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-end gap-3">
                <p className="text-4xl font-black text-[#1a1109]">₹{product.discountedPrice}</p>
                <p className="text-lg line-through text-[#b5a89a] pb-1">₹{product.price}</p>
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-green-50 text-green-600">{product.discountPercent}% OFF</span>
              </div>
              <div className="flex items-center gap-2">
                <CustomRating value={averageRating} />
                <span className="text-sm font-bold text-[#9e7a52]">{totalReviews} Ratings</span>
              </div>
            </div>

            <div className="mt-10 border-t border-[#e8ddd5] pt-8">
              <p className="text-xs font-black uppercase tracking-widest mb-4 text-[#7a6a5a]">Select Size</p>
              <RadioGroup value={selectedSize} onChange={setSelectedSize} className="flex flex-wrap gap-3 mb-8">
                {product.sizes?.map((size) => (
                  <RadioGroup.Option key={size.name} value={size} disabled={size.quantity <= 0 || isOutOfStock} className={({ checked }) => classNames("relative flex items-center justify-center rounded-2xl py-3 px-6 text-sm font-bold uppercase transition-all", checked ? "bg-[#c8742a] text-white shadow-lg shadow-orange-200" : "bg-white text-[#3d2e1e] border border-[#e8ddd5]", (size.quantity <= 0 || isOutOfStock) ? "opacity-30 cursor-not-allowed" : "cursor-pointer")}>
                    {size.name}
                  </RadioGroup.Option>
                ))}
              </RadioGroup>

              {/* ── SIMPLE AMAZON-STYLE LAYOUT ── */}
              <div>
                {isOutOfStock ? (
                  <div className="w-full py-4 text-center rounded-full bg-gray-200 text-gray-500 font-bold">Currently Unavailable</div>
                ) : (
                  <div className="flex flex-col max-w-sm space-y-3">
                    
                    {/* Quantity Dropdown */}
                    <div className="relative w-fit bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer">
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="appearance-none bg-transparent py-2 pl-4 pr-10 text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
                      >
                        {[...Array(maxAvailable).keys()].map((n) => (
                          <option key={n + 1} value={n + 1}>
                            Quantity: {n + 1}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                      </div>
                    </div>

                    {/* Add to Cart Button (Yellow) */}
                    <button 
                      onClick={() => handleAddToCart(false)} 
                      disabled={addingToCart}
                      className="w-full py-3.5 rounded-full text-sm font-bold text-black transition-colors shadow-sm disabled:opacity-70"
                      style={{ backgroundColor: "#FFD814" }} // Amazon Yellow
                    >
                      {addingToCart ? "Adding to cart..." : "Add to cart"}
                    </button>

                    {/* Buy Now Button (Orange) */}
                    <button 
                      onClick={() => handleAddToCart(true)} 
                      disabled={addingToCart}
                      className="w-full py-3.5 rounded-full text-sm font-bold text-black transition-colors shadow-sm disabled:opacity-70"
                      style={{ backgroundColor: "#FFA41C" }} // Amazon Orange
                    >
                      Buy Now
                    </button>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-24 border-t border-[#e8ddd5] pt-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-[#1a1109]" style={{ fontFamily: "'Georgia', serif" }}>Customer Reviews</h2>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate(`/product/${productId}/rate`)} className="px-6 py-3 rounded-xl bg-[#1a1109] text-white text-sm font-bold shadow-xl">Write a Review</motion.button>
          </div>
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-5 mb-8">
                <div className="text-6xl font-black text-[#1a1109]">{averageRating}</div>
                <div><CustomRating value={averageRating} /><p className="text-sm font-bold text-[#9e8d7a] mt-1">{totalReviews} Reviews</p></div>
              </div>
              {[5, 4, 3, 2, 1].map((s) => (
                <ProgressBar key={s} label={`${s} Star`} percentage={totalReviews ? (getRatingCount(s) / totalReviews) * 100 : 0} count={getRatingCount(s)} colorClass={s > 3 ? "bg-green-500" : s === 3 ? "bg-yellow-400" : "bg-red-400"} />
              ))}
            </div>
            <div className="lg:col-span-8 space-y-6">
              {reviews.length === 0 ? <div className="text-center py-20 text-[#b5a89a] font-bold">No reviews yet. Be the first!</div> : reviews.map((r) => <ProductReviewCard key={r.id} item={r} />)}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}