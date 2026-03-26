import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import ProductReviewCard from "./ProductReviewCard";
import NotFound from "../../pages/NotFound";

import { findProductById } from "../../../Redux/Customers/Product/Action";
import { addItemToCart, getCart } from "../../../Redux/Customers/Cart/Action";

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  if (customersProduct?.loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin rounded-none h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  if (!product || product.quantity <= 0) {
    return (
      <NotFound
        productImage={product?.imageUrl || product?.images?.[0]}
      />
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
    <div className="bg-background text-on-background font-body antialiased min-h-screen">

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-28 right-8 z-[120] bg-stone-900 text-stone-50 px-8 py-4 font-label uppercase tracking-widest text-[0.6875rem] font-bold shadow-2xl"
          >
            Piece added to bag.
            <button
              onClick={() => navigate("/cart")}
              className="ml-4 text-primary underline"
            >
              View Bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="pt-32 pb-24 max-w-7xl mx-auto flex flex-col md:flex-row">

        {/* Images */}
        <section className="w-full md:w-3/5 lg:w-2/3 flex flex-row px-6 md:px-12 pb-12">
          <div className="hidden md:flex flex-col space-y-4 sticky top-32 h-fit pr-6">
            {images.map((src, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const element = document.getElementById(`image-${idx}`);
                  element?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="w-20 aspect-[3/4] bg-surface-container overflow-hidden opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <img src={src} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="flex-1 space-y-12">
            {images.map((src, idx) => (
              <motion.div
                key={idx}
                id={`image-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="aspect-[3/4] w-full bg-surface-container overflow-hidden"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Product Info */}
        <aside className="w-full md:w-2/5 lg:w-1/3 px-6 md:pr-12">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          <p className="text-lg mb-2">₹{product.discountedPrice}</p>

          <p className="text-sm text-gray-600 mb-6">{product.description}</p>

          {/* Sizes */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {product.sizes?.map((size) => (
              <button
                key={size.name}
                onClick={() => setSelectedSize(size)}
                disabled={size.quantity <= 0}
                className={`border p-2 ${
                  selectedSize?.name === size.name
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || isOutOfStock}
            className="bg-black text-white px-6 py-3 w-full"
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </aside>
      </main>

      {/* Reviews */}
      <section className="p-10">
        <h2 className="text-2xl mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews</p>
        ) : (
          reviews.map((r) => <ProductReviewCard key={r.id} item={r} />)
        )}
      </section>
    </div>
  );
}