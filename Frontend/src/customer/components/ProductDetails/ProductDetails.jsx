import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

import ProductReviewCard from "./ProductReviewCard";
import NotFound from "../../pages/NotFound";

import { findProductById, getProductRecommendations } from "../../../Redux/Customers/Product/Action";
import { addItemToCart, getCart } from "../../../Redux/Customers/Cart/Action";
import { getWishlist, toggleWishlistItem } from "../../../Redux/Customers/Wishlist/Action";
import api from "../../../config/api";

const Accordion = ({ title, content, isOpen, onClick }) => (
  <div className="border-b border-[#D1C4BC] first:border-t">
    <button
      onClick={onClick}
      className="w-full py-5 flex justify-between items-center text-left group"
    >
      <span className="font-label text-[0.75rem] font-medium tracking-[0.1em] text-[#1A1109] uppercase transition-colors group-hover:text-[#C8742A]">
        {title}
      </span>
      <span className="text-2xl font-light text-[#1A1109] group-hover:text-[#C8742A] transition-colors">
        {isOpen ? "−" : "+"}
      </span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pb-6 font-body text-[0.85rem] leading-relaxed text-[#4A433E] whitespace-pre-line">
            {content}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const LookCard = ({ item, index }) => {
  const navigate = useNavigate();
  const image = item.images?.[0] || item.imageUrl;

  const categoryLabel =
    typeof item.category === "string"
      ? item.category
      : item.category?.name || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: "easeOut", delay: index * 0.1 }}
      viewport={{ once: true, margin: "-60px" }}
      className="group cursor-pointer flex flex-col"
      onClick={() => navigate(`/product/${item.id}`)}
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-[#E8E1DE] mb-5">
        <img
          src={image}
          alt={item.title}
          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
        {categoryLabel && (
          <span className="absolute top-3 left-3 bg-[#FFF8F5]/90 backdrop-blur-sm text-[#1A1109] font-label text-[0.55rem] font-black tracking-[0.25em] uppercase px-2.5 py-1.5">
            {categoryLabel}
          </span>
        )}
        {item.discountPercent > 0 && (
          <span className="absolute top-3 right-3 bg-[#C8742A] text-[#FFF8F5] font-label text-[0.55rem] font-black tracking-widest px-2 py-1 uppercase">
            −{item.discountPercent}%
          </span>
        )}
        <div className="absolute inset-0 bg-[#1A1109]/0 group-hover:bg-[#1A1109]/10 transition-colors duration-500 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
          <span className="font-label text-[0.6rem] font-black uppercase tracking-[0.25em] text-[#FFF8F5] bg-[#1A1109] px-4 py-2">
            View Piece →
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-label text-[0.5rem] font-black uppercase tracking-[0.35em] text-[#C8742A]">
          {item.brand || "CLOTHSY"}
        </p>
        <h3 className="font-headline italic text-lg leading-tight text-[#1A1109] group-hover:text-[#C8742A] transition-colors duration-300 line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-headline font-bold text-[#1A1109]">
            ₹{item.discountedPrice}
          </span>
          {item.discountPercent > 0 && (
            <span className="font-body text-sm text-[#7F756E] line-through">
              ₹{item.price}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const LookCardSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="aspect-[3/4] bg-[#E8E1DE] animate-pulse" />
    <div className="h-2 w-16 bg-[#E8E1DE] animate-pulse" />
    <div className="h-5 w-3/4 bg-[#E8E1DE] animate-pulse" />
    <div className="h-4 w-1/3 bg-[#E8E1DE] animate-pulse" />
  </div>
);

const SimilarProductCard = ({ item }) => {
  const navigate = useNavigate();
  const image = item.images?.[0] || item.imageUrl;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-60px" }}
      className="group cursor-pointer flex flex-col"
      onClick={() => navigate(`/product/${item.id}`)}
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-[#E8E1DE] mb-4">
        <img
          src={image}
          alt={item.title}
          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
        {item.discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#C8742A] text-[#FFF8F5] font-label text-[0.6rem] font-black tracking-widest px-2 py-1 uppercase">
            −{item.discountPercent}%
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-label text-[0.55rem] font-black uppercase tracking-[0.3em] text-[#C8742A]">
          {item.brand || "CLOTHSY"}
        </p>
        <h3 className="font-headline italic text-lg leading-tight text-[#1A1109] group-hover:text-[#C8742A] transition-colors line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-headline font-bold text-[#1A1109]">
            ₹{item.discountedPrice}
          </span>
          {item.discountPercent > 0 && (
            <span className="font-body text-sm text-[#7F756E] line-through">
              ₹{item.price}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SimilarProducts = ({ category, currentProductId }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!category || hasFetched.current) return;
    hasFetched.current = true;
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/products", {
          params: { category, pageNumber: 0, pageSize: 10 },
        });
        const list = Array.isArray(data) ? data : data?.content || [];
        const filtered = list.filter((p) => p.id !== currentProductId).slice(0, 4);
        setItems(filtered);
      } catch (err) {
        console.error("Similar products fetch failed:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilar();
  }, [category, currentProductId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-[#E8E1DE] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
        {items.map((item) => (
          <SimilarProductCard key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-12 flex justify-center md:hidden">
        <button
          onClick={() => navigate(`/products?category=${category}`)}
          className="font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#1A1109] border-b border-[#1A1109] pb-0.5 hover:text-[#C8742A] hover:border-[#C8742A] transition-colors"
        >
          View All in Category →
        </button>
      </div>
    </>
  );
};

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const navigate = useNavigate();
  const location = useLocation(); 
  const dispatch = useDispatch();
  const { productId } = useParams();

  const customersProduct = useSelector((store) => store.customersProduct);
  const auth = useSelector((store) => store.auth);
  const product = customersProduct?.product;
  const wishlistState = useSelector((store) => store.wishlist);
  const isWishlisted =
    wishlistState?.wishlist?.products?.some((p) => p.id === product?.id) || false;

  useEffect(() => { window.scrollTo(0, 0); }, [productId]);

  useEffect(() => {
    if (productId) dispatch(findProductById(productId));
  }, [productId, dispatch]);

  useEffect(() => {
    if (location.state?.reviewSuccess) {
      triggerToast("Perspective published successfully.", "wishlist", "added");
      dispatch(findProductById(productId));
      // Clear the router state so it doesn't loop on manual refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, dispatch, productId, navigate]);

  useEffect(() => {
    dispatch(getCart());
    if (auth?.user) dispatch(getWishlist());
  }, [dispatch, auth?.user]);

  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    const fetchRecs = async () => {
      setLoadingRecs(true);
      setRecommendations([]);
      try {
        const data = await getProductRecommendations(product.id);
        if (!cancelled) setRecommendations(data || []);
      } catch {
        if (!cancelled) setRecommendations([]);
      } finally {
        if (!cancelled) setLoadingRecs(false);
      }
    };
    fetchRecs();
    return () => { cancelled = true; };
  }, [product?.id]);

  useEffect(() => {
    if (product?.sizes?.length > 0) {
      const firstAvailable = product.sizes.find((s) => s.quantity > 0);
      setSelectedSize(firstAvailable || product.sizes[0]);
    }
  }, [product]);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const triggerToast = (msg, type, action = null) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), message: msg, type, action });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  const handleToggleWishlist = () => {
    if (!auth?.user) { navigate("/login"); return; }
    if (product?.id) {
      const action = isWishlisted ? "removed" : "added";
      dispatch(toggleWishlistItem(product.id));
      const msg = action === "added" ? "Piece archived in wishlist." : "Piece removed from archive.";
      triggerToast(msg, "wishlist", action);
    }
  };

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  if (customersProduct?.loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FFF8F5]">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#1A1109] animate-spin rounded-none" />
      </div>
    );
  }

  if (!product || !product.id) {
    return <NotFound productImage={product?.imageUrl || product?.images?.[0]} />;
  }

  const trueStock = product.quantity > 0
    ? product.quantity
    : (product.sizes?.reduce((total, size) => total + (size.quantity || 0), 0) || 0);

  const isOutOfStock = trueStock <= 0;

  const handleAddToCart = async () => {
    if (!selectedSize || isOutOfStock) return;
    setAddingToCart(true);
    try {
      await dispatch(addItemToCart({
        data: { productId: product.id, size: selectedSize.name, quantity: 1 },
        product: product
      }));
      await dispatch(getCart());
      triggerToast("Piece secured in bag.", "cart");
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Safely extract the native reviews payload from the backend
  const reviews = product?.reviews || [];
  const images = product.images?.length > 0
    ? product.images
    : product.imageUrl ? [product.imageUrl] : [];

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || product.topLevelCategory || null;

  const showCompleteTheLook = !loadingRecs && recommendations.length > 0;
  const showLoadingSkeleton = loadingRecs;
  const showFallback = !loadingRecs && recommendations.length === 0 && categoryName;

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] font-body antialiased min-h-screen selection:bg-[#C8742A] selection:text-[#FFF8F5]">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed top-28 right-8 md:right-12 z-[100] bg-[#1A1109] text-[#FFF8F5] p-6 font-label text-[0.7rem] font-black uppercase tracking-widest border-l-4 border-[#C8742A] shadow-2xl flex items-center gap-4"
          >
            {toast.type === "wishlist" && (
              <span className="shrink-0">
                {toast.action === "added"
                  ? <HeartSolid className="w-5 h-5 text-[#C8742A]" />
                  : <HeartOutline className="w-5 h-5 text-[#7F756E]" />}
              </span>
            )}
            <span>{toast.message}</span>
            {toast.type === "cart" && (
              <button onClick={() => navigate("/cart")} className="ml-2 border-b border-[#C8742A] text-[#C8742A] hover:text-[#FFF8F5] hover:border-[#FFF8F5] transition-colors whitespace-nowrap">
                View Selection →
              </button>
            )}
            {toast.type === "wishlist" && toast.action === "added" && (
              <button onClick={() => navigate("/wishlist")} className="ml-2 border-b border-[#C8742A] text-[#C8742A] hover:text-[#FFF8F5] hover:border-[#FFF8F5] transition-colors whitespace-nowrap">
                View Archive →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex flex-col lg:flex-row min-h-screen pt-24 lg:pt-28">
        {/* Gallery */}
        <section className="w-full lg:w-[60%] p-4 md:p-8 lg:px-12 lg:pb-12 space-y-4 lg:space-y-8">
          {images.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-full aspect-[3/4] bg-[#E8E1DE] overflow-hidden"
            >
              <img
                src={src}
                alt={`${product.title} - Detail ${idx + 1}`}
                className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-1000"
              />
            </motion.div>
          ))}
        </section>

        {/* Sidebar */}
        <aside className="w-full lg:w-[40%] lg:h-[calc(100vh-7rem)] lg:sticky lg:top-28 p-8 md:p-12 lg:px-16 lg:py-4 flex flex-col justify-start border-l border-[#D1C4BC] bg-[#FFF8F5] overflow-y-auto hide-scrollbar">
          <div className="mb-12 mt-4 lg:mt-8">
            <p className="font-label text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#C8742A] mb-4">
              {product?.brand || "CLOTHSY Atelier"}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline italic leading-tight tracking-tighter mb-8 text-[#1A1109]">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-3xl lg:text-4xl font-headline font-bold text-[#1A1109] tracking-tight">
                ₹{product.discountedPrice}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-xl font-headline text-[#7F756E] line-through decoration-[#BA1A1A]">
                  ₹{product.price}
                </span>
              )}
            </div>
          </div>

          <div className="mb-12">
            <Accordion
              title="DESCRIPTION & FIT"
              content={product.description && product.fit
                ? `${product.description}\n\nFit Profile:\n${product.fit}`
                : product.description}
              isOpen={openAccordion === "description"}
              onClick={() => toggleAccordion("description")}
            />
            <Accordion
              title="MATERIALS"
              content={product.materials || "Premium constructed silhouette. Crafted from heavily structured materials intended to drape according to strict architectural principles."}
              isOpen={openAccordion === "materials"}
              onClick={() => toggleAccordion("materials")}
            />
            <Accordion
              title="DELIVERY, PAYMENT AND RETURNS"
              content="Complimentary global express shipping on all atelier acquisitions."
              isOpen={openAccordion === "delivery"}
              onClick={() => toggleAccordion("delivery")}
            />
          </div>

          <div className="mb-12">
            <label className="font-label text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#7F756E] block mb-6">
              Size Selection
            </label>
            <div className="grid grid-cols-4 gap-3">
              {product.sizes?.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  disabled={size.quantity <= 0}
                  className={`py-4 font-label text-[0.7rem] font-black transition-all border ${selectedSize?.name === size.name
                      ? "bg-[#1A1109] text-[#FFF8F5] border-[#1A1109]"
                      : "bg-transparent border-[#D1C4BC] text-[#7F756E] hover:border-[#1A1109] hover:text-[#1A1109]"
                    } ${size.quantity <= 0 ? "opacity-20 cursor-not-allowed line-through" : ""}`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mb-12">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || isOutOfStock}
              className="flex-1 py-6 bg-[#1A1109] text-[#FFF8F5] font-label text-[0.8rem] font-black tracking-[0.3em] uppercase hover:bg-[#C8742A] transition-colors disabled:opacity-30"
            >
              {addingToCart ? "Processing..." : isOutOfStock ? "Archive Depleted" : "Add to Selection"}
            </button>
            <button
              onClick={handleToggleWishlist}
              className="w-20 flex justify-center items-center border border-[#1A1109] bg-transparent text-[#1A1109] hover:bg-[#1A1109] hover:text-[#FFF8F5] transition-all group"
              aria-label="Toggle Wishlist"
            >
              {isWishlisted
                ? <HeartSolid className="w-6 h-6 text-[#C8742A] group-hover:text-[#FFF8F5] transition-colors" />
                : <HeartOutline className="w-6 h-6 transition-colors" />}
            </button>
          </div>
        </aside>
      </main>

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-[#D1C4BC]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="font-headline italic text-4xl md:text-5xl text-[#1A1109] tracking-tighter leading-none mb-3">
              Client Perspectives
            </h2>
            <p className="font-label text-[0.65rem] font-black uppercase tracking-[0.3em] text-[#C8742A]">
              {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
            </p>
          </div>
          <button
            onClick={() => navigate(`/account/rate/${product.id}`)}
            className="px-8 py-4 border border-[#1A1109] text-[#1A1109] bg-transparent font-label text-[0.7rem] font-bold uppercase tracking-[0.2em] hover:bg-[#1A1109] hover:text-[#FFF8F5] transition-colors"
          >
            Draft a Review
          </button>
        </div>
        {reviews.length === 0 ? (
          <div className="py-12 border-t border-[#D1C4BC]">
            <p className="font-body text-[#7F756E] italic text-lg">
              No perspectives have been recorded for this piece yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {reviews.map((review, index) => (
              <ProductReviewCard key={review.id || index} item={review} />
            ))}
          </div>
        )}
      </section>

      {/* Complete the Look / Fallback */}
      <section className="border-t border-[#D1C4BC] px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              {showCompleteTheLook ? (
                <>
                  <p className="font-label text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#C8742A] mb-3">
                    Editorial Styling
                  </p>
                  <h2 className="font-headline italic text-4xl md:text-5xl text-[#1A1109] tracking-tighter leading-none">
                    Complete the Look
                  </h2>
                </>
              ) : showFallback ? (
                <>
                  <p className="font-label text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#C8742A] mb-3">
                    You May Also Covet
                  </p>
                  <h2 className="font-headline italic text-4xl md:text-5xl text-[#1A1109] tracking-tighter leading-none">
                    Similar Pieces
                  </h2>
                </>
              ) : showLoadingSkeleton ? (
                <>
                  <div className="h-3 w-24 bg-[#E8E1DE] animate-pulse mb-4" />
                  <div className="h-10 w-64 bg-[#E8E1DE] animate-pulse" />
                </>
              ) : null}
            </div>

            {showFallback && (
              <button
                onClick={() => navigate(`/products?category=${categoryName}`)}
                className="hidden md:block font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#1A1109] border-b border-[#1A1109] pb-0.5 hover:text-[#C8742A] hover:border-[#C8742A] transition-colors whitespace-nowrap"
              >
                View All →
              </button>
            )}
          </div>

          {showLoadingSkeleton && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {[...Array(4)].map((_, i) => <LookCardSkeleton key={i} />)}
            </div>
          )}

          {showCompleteTheLook && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {recommendations.map((item, i) => (
                <LookCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}

          {showFallback && (
            <SimilarProducts category={categoryName} currentProductId={product.id} />
          )}

        </div>
      </section>

    </div>
  );
}