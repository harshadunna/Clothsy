import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import CartItem from "./CartItem";
import { getCart } from "../../../Redux/Customers/Cart/Action";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const STEPS = ["Cart", "Address", "Payment"];

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Read cartItems directly from top-level Redux state ──
  const { cartItems, loading } = useSelector((store) => store.cart);

  useEffect(() => {
    dispatch(getCart());
  }, []);

  const isEmpty = !cartItems || cartItems.length === 0;

  const totalPrice = (cartItems || []).reduce(
    (sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 1), 0
  );
  const totalDiscountedPrice = (cartItems || []).reduce(
    (sum, item) => sum + (item?.product?.discountedPrice || 0) * (item?.quantity || 1), 0
  );
  const discount = totalPrice - totalDiscountedPrice;
  const totalItem = (cartItems || []).reduce((sum, item) => sum + (item?.quantity || 1), 0);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
          >
            My Bag
          </h1>
          {!isEmpty && (
            <p className="mt-1.5 text-sm" style={{ color: "#9e8d7a" }}>
              {totalItem} items · Ready to checkout
            </p>
          )}
        </motion.div>

        {/* Checkout Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex items-center gap-2 mb-8"
        >
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: i === 0 ? "#c8742a" : "#e8ddd5",
                    color: i === 0 ? "#fff" : "#9e8d7a",
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: i === 0 ? "#c8742a" : "#b5a89a" }}
                >
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-10 h-px" style={{ background: "#d9cfc6" }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-white animate-pulse border"
                style={{ borderColor: "#e8ddd5" }}
              />
            ))}
          </div>
        )}

        {!loading && !isEmpty ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Items */}
            <motion.div variants={slideUp} className="lg:col-span-7 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} showButton />
                ))}
              </AnimatePresence>

              {/* Coupon Strip */}
              <motion.div
                variants={slideUp}
                className="flex items-center gap-3 bg-white rounded-2xl border px-5 py-4 mt-2"
                style={{ borderColor: "#e8ddd5" }}
              >
                <svg className="w-5 h-5 shrink-0" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                  style={{ color: "#1a1109" }}
                />
                <button
                  className="text-sm font-bold px-4 py-1.5 rounded-xl transition-colors"
                  style={{ color: "#c8742a", background: "#fdf0e6" }}
                >
                  Apply
                </button>
              </motion.div>
            </motion.div>

            {/* Right: Summary */}
            <motion.div variants={slideUp} className="lg:col-span-5 sticky top-6">
              <div
                className="bg-white rounded-3xl border overflow-hidden"
                style={{ borderColor: "#e8ddd5", boxShadow: "0 8px 40px rgba(200,116,42,0.08)" }}
              >
                <div
                  className="px-6 py-5 border-b"
                  style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}
                >
                  <h2
                    className="text-base font-black tracking-tight uppercase"
                    style={{ color: "#1a1109", letterSpacing: "0.06em", fontFamily: "'Georgia', serif" }}
                  >
                    Order Summary
                  </h2>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {[
                    { label: `Price (${totalItem} items)`, value: `₹${totalPrice}`, color: "#3d2e1e" },
                    { label: "Discount", value: `-₹${discount}`, color: "#16a34a" },
                    { label: "Delivery", value: "FREE", color: "#16a34a" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span style={{ color: "#7a6a5a" }}>{label}</span>
                      <span className="font-bold" style={{ color }}>{value}</span>
                    </div>
                  ))}

                  <div
                    className="flex justify-between items-center pt-4 mt-2 border-t"
                    style={{ borderColor: "#f0e8e0" }}
                  >
                    <span className="text-base font-black" style={{ color: "#1a1109" }}>Total</span>
                    <span className="text-2xl font-black" style={{ color: "#1a1109" }}>₹{totalDiscountedPrice}</span>
                  </div>

                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: "#f0faf4", color: "#16a34a" }}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    You're saving ₹{discount} on this order
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/checkout?step=2")}
                    className="w-full py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-white transition-all"
                    style={{
                      background: "linear-gradient(135deg, #d4832f, #c8742a)",
                      boxShadow: "0 6px 24px rgba(200,116,42,0.35)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Proceed to Checkout →
                  </motion.button>

                  <div className="mt-4 flex items-center justify-center gap-4">
                    {["UPI", "Cards", "NetBanking"].map((method) => (
                      <span
                        key={method}
                        className="text-[10px] font-semibold px-2 py-1 rounded-md"
                        style={{ background: "#f5ede4", color: "#9e7a52" }}
                      >
                        {method}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs" style={{ color: "#b5a89a" }}>
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    100% Secure · SSL Encrypted
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  {
                    label: "Easy Returns",
                    icon: (
                      <svg className="w-5 h-5 mx-auto mb-1.5" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ),
                  },
                  {
                    label: "Free Delivery",
                    icon: (
                      <svg className="w-5 h-5 mx-auto mb-1.5" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414A1 1 0 0121 11.414V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    ),
                  },
                  {
                    label: "100% Authentic",
                    icon: (
                      <svg className="w-5 h-5 mx-auto mb-1.5" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                  },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="py-3 px-2 rounded-xl text-xs font-semibold bg-white border"
                    style={{ borderColor: "#e8ddd5", color: "#7a6a5a" }}
                  >
                    {icon}
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : !loading && isEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border text-center"
            style={{ borderColor: "#e8ddd5" }}
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: "#fdf0e6" }}>
              <svg className="w-12 h-12" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
              Your bag is empty
            </h2>
            <p className="text-sm mb-8 max-w-xs" style={{ color: "#9e8d7a" }}>
              Looks like you haven't added anything yet. Let's fix that!
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)", boxShadow: "0 6px 20px rgba(200,116,42,0.3)" }}
            >
              Start Shopping
            </motion.button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}