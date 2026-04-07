import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import CartItem from "./CartItem";
import { getCart } from "../../../Redux/Customers/Cart/Action";
import { findProducts } from "../../../Redux/Customers/Product/Action";

export default function Cart() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const stableOrderRef = useRef([]); 

  const { cartItems: rawCartItems, loading } = useSelector((store) => store.cart);
  const { customersProduct } = useSelector((store) => store);

  const cartItems = (() => {
    if (!rawCartItems || rawCartItems.length === 0) return [];

    rawCartItems.forEach((item) => {
      if (!stableOrderRef.current.includes(item.id)) {
        stableOrderRef.current.push(item.id);
      }
    });

    stableOrderRef.current = stableOrderRef.current.filter((id) =>
      rawCartItems.some((item) => item.id === id)
    );
    return stableOrderRef.current
      .map((id) => rawCartItems.find((item) => item.id === id))
      .filter(Boolean);
  })();

  useEffect(() => {
    dispatch(getCart());
    window.scrollTo(0, 0);
    dispatch(
      findProducts({
        category:    "",
        colors:      "",
        sizes:       "",
        minPrice:    0,
        maxPrice:    100000,
        minDiscount: 0,
        stock:       "",
        sort:        "newest",
        pageNumber:  0,
        pageSize:    20, 
      })
    );
  }, [dispatch]);
  
  const crossSellItems = useMemo(() => {
    const allProducts = customersProduct?.products?.content;
    if (!allProducts || allProducts.length === 0) return [];

    const seenCategories = new Set();
    const categoryPicks  = [];
    const extras         = [];

    for (const product of allProducts) {
      const catKey = product?.category?.name || product?.category?.id;
      if (catKey && !seenCategories.has(catKey)) {
        seenCategories.add(catKey);
        categoryPicks.push(product);
      } else {
        extras.push(product);
      }
    }

    const result = [...categoryPicks];
    for (const product of extras) {
      if (result.length >= 4) break;
      result.push(product);
    }

    return result.slice(0, 4);
  }, [customersProduct?.products?.content]);

  // Checkout Handler with Guest Redirect Memory
  const handleCheckout = () => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      // If logged in, go straight to checkout
      navigate("/checkout?step=2");
    } else {
      // If guest, save their destination and send to login!
      localStorage.setItem("postLoginRedirect", "/checkout?step=2");
      navigate("/login");
    }
  };

  const isEmpty             = cartItems.length === 0;
  const totalPrice          = cartItems.reduce((sum, item) => sum + (item?.product?.price           || 0) * (item?.quantity || 1), 0);
  const totalDiscountedPrice= cartItems.reduce((sum, item) => sum + (item?.product?.discountedPrice || 0) * (item?.quantity || 1), 0);
  const discount            = totalPrice - totalDiscountedPrice;

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] font-body min-h-screen pt-32 pb-24 px-6 md:px-12 relative overflow-hidden selection:bg-[#C8742A] selection:text-[#FFF8F5]">
      <div className="max-w-[1440px] mx-auto">

        {/* Editorial Header */}
        <header className="mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-headline italic text-5xl md:text-7xl tracking-tighter text-[#1A1109]"
          >
            Your Bag
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="font-label uppercase tracking-[0.2em] text-[11px] mt-4 text-[#7F756E] font-bold"
          >
            Selection & Editorial Archive / {new Date().getFullYear()}
          </motion.p>
        </header>

        {loading ? (
          <div className="w-full flex justify-center py-24">
            <div className="animate-spin h-8 w-8 border-t-2 border-[#1A1109] rounded-full" />
          </div>
        ) : isEmpty ? (

          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center py-32 w-full text-center border-t border-[#D1C4BC]"
          >
            <div className="mb-10">
              <span className="material-symbols-outlined text-[60px] text-[#1A1109]/20">shopping_bag</span>
            </div>
            <div className="space-y-6">
              <h2 className="font-headline italic text-4xl md:text-5xl tracking-tighter text-[#1A1109]">
                A Quiet Collection.
              </h2>
              <p className="max-w-md mx-auto text-[#7F756E] font-body text-sm tracking-wide leading-relaxed">
                Your bag is currently empty. Seek inspiration in our curated silhouettes and artisanal fabrics.
              </p>
              <div className="pt-8">
                <button
                  onClick={() => navigate("/products")}
                  className="bg-[#1A1109] text-[#FFF8F5] px-12 py-5 font-label font-black text-[0.65rem] tracking-[0.2em] uppercase hover:bg-[#C8742A] transition-colors duration-500"
                >
                  Discover Pieces
                </button>
              </div>
            </div>
          </motion.div>

        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Left: Cart Items */}
            <section className="lg:col-span-8">
              <div className="flex flex-col">

                {/* Table Header */}
                <div className="hidden md:grid grid-cols-6 pb-4 border-b border-[#D1C4BC] font-label uppercase tracking-[0.2em] font-bold text-[9px] text-[#7F756E]">
                  <div className="col-span-3">Product Detail</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-right col-span-2">Total Price</div>
                </div>

                <AnimatePresence mode="sync" initial={false}>
                  {(cartItems || []).map((item) => (
                    <CartItem key={item.id} item={item} showButton />
                  ))}
                </AnimatePresence>

              </div>

              {/* Bottom Actions */}
              <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
                <button onClick={() => navigate("/products")} className="flex items-center space-x-3 group">
                  <span className="material-symbols-outlined text-[#1A1109] group-hover:-translate-x-1 transition-transform text-sm">arrow_back</span>
                  <span className="font-label uppercase tracking-[0.2em] text-[10px] font-black text-[#1A1109] group-hover:text-[#C8742A] transition-colors border-b border-[#1A1109] group-hover:border-[#C8742A] pb-1">
                    Return to Archive
                  </span>
                </button>
                <div className="w-full md:w-1/2">
                  <p className="font-label uppercase tracking-[0.2em] font-bold text-[9px] mb-3 text-[#7F756E]">Add a note to your order</p>
                  <textarea
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#D1C4BC] focus:border-[#C8742A] focus:ring-0 resize-none font-label text-xs uppercase tracking-widest py-3 px-0 outline-none placeholder:text-[#D1C4BC] transition-colors"
                    rows="1"
                    placeholder="ENTER INSTRUCTIONS HERE..."
                  />
                </div>
              </div>
            </section>

            {/* Right: Sticky Order Summary */}
            <aside className="lg:col-span-4 lg:sticky lg:top-32">
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-[#E8E1DE] p-8 md:p-10"
              >
                <h2 className="font-headline text-3xl mb-8 italic tracking-tighter text-[#1A1109]">Order Summary</h2>

                <div className="space-y-5 mb-10">
                  <div className="flex justify-between items-center pb-5 border-b border-[#D1C4BC]">
                    <span className="font-label uppercase tracking-[0.2em] font-bold text-[9px] text-[#7F756E]">Subtotal</span>
                    <span className="font-label font-bold text-xs tracking-widest text-[#1A1109]">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center pb-5 border-b border-[#D1C4BC]">
                      <span className="font-label uppercase tracking-[0.2em] font-bold text-[9px] text-[#7F756E]">Discount</span>
                      <span className="font-label font-bold text-xs tracking-widest text-[#C8742A]">-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-5 border-b border-[#D1C4BC]">
                    <span className="font-label uppercase tracking-[0.2em] font-bold text-[9px] text-[#7F756E]">Shipping</span>
                    <span className="font-label font-bold text-[9px] uppercase tracking-[0.1em] text-[#1A1109]">Calculated Next</span>
                  </div>

                  <div className="flex justify-between items-end pt-4">
                    <span className="font-label uppercase tracking-[0.2em] font-black text-[10px] text-[#1A1109]">Estimated Total</span>
                    <span className="font-headline italic text-4xl text-[#1A1109] leading-none">₹{totalDiscountedPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout} 
                  className="w-full py-5 bg-[#1A1109] text-[#FFF8F5] font-label uppercase tracking-[0.2em] text-[10px] font-black hover:bg-[#C8742A] transition-colors duration-300"
                >
                  Checkout Securely
                </button>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start space-x-4 text-[#7F756E]">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <p className="text-[9px] font-label uppercase tracking-widest font-bold leading-relaxed">Encrypted Transaction Security Protocol V.2.1</p>
                  </div>
                  <div className="flex items-start space-x-4 text-[#7F756E]">
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                    <p className="text-[9px] font-label uppercase tracking-widest font-bold leading-relaxed">Complimentary Architectural Packaging on premium orders.</p>
                  </div>
                </div>
              </motion.div>
            </aside>

          </div>
        )}

        {/* Cross-sell: Seasonless Objects */}
        {!loading && crossSellItems?.length > 0 && (
          <section className={`mt-32 pt-20 ${isEmpty ? "" : "border-t border-[#D1C4BC]"}`}>
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="font-label text-[0.65rem] font-bold tracking-[0.3em] text-[#7F756E] uppercase">Essentials</span>
                <h2 className="font-headline italic text-4xl md:text-5xl tracking-tighter mt-3 text-[#1A1109]">Seasonless Objects</h2>
              </div>
              <button
                onClick={() => navigate("/products")}
                className="font-label text-[0.65rem] font-black tracking-[0.2em] uppercase border-b border-[#1A1109] hover:text-[#C8742A] hover:border-[#C8742A] transition-colors pb-1"
              >
                View Archive
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {(crossSellItems || []).map((item, i) => (
                <div
                  key={item.id}
                  className={`space-y-5 cursor-pointer group ${i % 2 !== 0 && isEmpty ? "md:translate-y-12" : ""}`}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="aspect-[3/4] bg-[#E8E1DE] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover object-top grayscale-[15%] group-hover:grayscale-0 transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-label uppercase tracking-[0.2em] text-[9px] font-bold text-[#7F756E] truncate">{item.title}</p>
                    <p className="font-label font-bold text-xs tracking-widest text-[#1A1109]">
                      ₹{(item.discountedPrice ?? item.price)?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}