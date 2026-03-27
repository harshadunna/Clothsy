import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import ProductReviewCard from "./ProductReviewCard";
import NotFound from "../../pages/NotFound";

import { findProductById } from "../../../Redux/Customers/Product/Action";
import { addItemToCart, getCart } from "../../../Redux/Customers/Cart/Action";

// ── Minimalist Accordion Component ──
const Accordion = ({ title, content, isOpen, onClick }) => {
  return (
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
};

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const [openAccordion, setOpenAccordion] = useState(null); 

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();

  const { customersProduct, auth } = useSelector((store) => store);
  const product = customersProduct?.product;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  useEffect(() => {
    if (productId) dispatch(findProductById(productId));
  }, [productId, dispatch]);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // Auto-select first available size
  useEffect(() => {
    if (product?.sizes?.length > 0) {
      const firstAvailable = product.sizes.find((s) => s.quantity > 0);
      setSelectedSize(firstAvailable || product.sizes[0]);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!auth?.user) {
      navigate("/login");
      return;
    }
    if (!selectedSize || product?.quantity <= 0) return;

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

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setAddingToCart(false);
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

  if (!product || product.quantity <= 0) {
    return (
      <NotFound productImage={product?.imageUrl || product?.images?.[0]} />
    );
  }

  const reviews = product?.reviews || [];
  const images =
    product.images?.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [];
  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] font-body antialiased min-h-screen selection:bg-[#C8742A] selection:text-[#FFF8F5]">

      {/* ── Editorial Toast ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-28 right-8 md:right-12 z-[100] bg-[#1A1109] text-[#FFF8F5] p-6 font-label text-[0.7rem] font-black uppercase tracking-widest border-l-4 border-[#C8742A] shadow-2xl"
          >
            Piece secured in bag. 
            <button
              onClick={() => navigate("/cart")}
              className="ml-4 border-b border-[#C8742A] text-[#C8742A] hover:text-[#FFF8F5] hover:border-[#FFF8F5] transition-colors"
            >
              View Selection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN LAYOUT ── */}
      {/* ADDED pt-24 and lg:pt-28 to push the whole section below your header */}
      <main className="flex flex-col lg:flex-row min-h-screen pt-24 lg:pt-28">

        {/* ── LEFT: THE GALLERY STACK ── */}
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

        {/* ── RIGHT: ARCHITECTURAL DATA (Sticky) ── */}
        {/* CHANGED top-0 to top-28, added height calc, and changed justify-center to justify-start */}
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

          {/* ── THE ACCORDION SECTION ── */}
          <div className="mb-12">
            <Accordion 
              title="DESCRIPTION & FIT" 
              content={product.description && product.fit ? `${product.description}\n\nFit Profile:\n${product.fit}` : product.description} 
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
              content="Complimentary global express shipping on all atelier acquisitions. Returns are accepted within 2 - 7 days of delivery, provided the structural integrity of the garment remains uncompromised." 
              isOpen={openAccordion === "delivery"}
              onClick={() => toggleAccordion("delivery")}
            />
          </div>

          <div className="mb-12">
            <label className="font-label text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#7F756E] block mb-6">Size Selection</label>
            <div className="grid grid-cols-4 gap-3">
              {product.sizes?.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  disabled={size.quantity <= 0}
                  className={`py-4 font-label text-[0.7rem] font-black transition-all border ${
                    selectedSize?.name === size.name
                      ? "bg-[#1A1109] text-[#FFF8F5] border-[#1A1109]"
                      : "bg-transparent border-[#D1C4BC] text-[#7F756E] hover:border-[#1A1109] hover:text-[#1A1109]"
                  } ${size.quantity <= 0 ? "opacity-20 cursor-not-allowed line-through" : ""}`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart || isOutOfStock}
            className="w-full py-6 mb-12 bg-[#1A1109] text-[#FFF8F5] font-label text-[0.8rem] font-black tracking-[0.3em] uppercase hover:bg-[#C8742A] transition-colors disabled:opacity-30"
          >
            {addingToCart ? "Processing..." : isOutOfStock ? "Archive Depleted" : "Add to Selection"}
          </button>

        </aside>
      </main>

      {/* ── REVIEWS: CLIENT OBSERVATIONS ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-[#D1C4BC]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-headline italic tracking-tighter text-[#1A1109]">
              Client Observations
            </h2>
            <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#C8742A] mt-4">
              Archive Feedback & Testimonials
            </p>
          </div>
          
          <div className="text-left md:text-right">
            <p className="font-label text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#7F756E] mb-2">Collection Average</p>
            <p className="text-4xl md:text-5xl font-headline font-bold italic text-[#1A1109]">4.8<span className="text-xl opacity-30">/5</span></p>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="py-20 text-center border-t border-b border-dashed border-[#D1C4BC]">
              <p className="font-label text-[0.7rem] uppercase tracking-widest text-[#7F756E]">
                No recorded observations for this piece yet.
              </p>
            </div>
          ) : (
            reviews.map((r) => <ProductReviewCard key={r.id} item={r} />)
          )}
        </div>
      </section>
    </div>
  );
}