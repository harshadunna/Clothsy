import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import CartItem from "../Cart/CartItem";
import AddressCard from "../Address/AddressCard";
import { getOrderById } from "../../../Redux/Customers/Order/Action";

export default function OrderSummary({ handleNext }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { order: orderState } = useSelector((store) => store);

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [orderId, dispatch]);

  const order = orderState?.order;

  const discount = order?.discount ?? order?.discounte ?? 0;

  const shippingAddress = (
    order?.shippingAddress?.firstName
      ? order.shippingAddress
      : order?.user?.addresses?.find(a => a.id === order?.shippingAddress?.id)
  ) ?? order?.shippingAddress;

  const handleCreatePayment = () => {
    handleNext();
  };

  if (orderState?.loading || !order) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#e8ddd5", borderTopColor: "#c8742a" }}
          />
          <p className="text-sm font-bold" style={{ color: "#9e8d7a" }}>
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  if (orderState?.error) {
    return (
      <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: "#e8ddd5" }}>
        <p className="text-sm font-bold text-red-500">
          Failed to load order: {orderState.error}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ── Left: Address + Items ── */}
      <div className="lg:col-span-7 space-y-4">

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}
        >
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}
          >
            <h2
              className="text-sm font-black uppercase tracking-widest"
              style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
            >
              Delivering To
            </h2>
          </div>
          <div className="p-5">
            {/* properly uses the fallback shippingAddress variable! */}
            {shippingAddress?.firstName ? (
              <AddressCard
                address={shippingAddress}
                showActions={false}
              />
            ) : (
              <p className="text-sm" style={{ color: "#9e8d7a" }}>
                Address details not available.
              </p>
            )}
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <p className="text-xs font-black uppercase tracking-widest px-1" style={{ color: "#9e8d7a" }}>
            {order.totalItem} Items in this order
          </p>
          {order.orderItems?.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <CartItem item={item} showButton={false} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Right: Price Summary ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="lg:col-span-5 sticky top-6"
      >
        <div
          className="bg-white rounded-3xl border overflow-hidden"
          style={{ borderColor: "#e8ddd5", boxShadow: "0 8px 40px rgba(200,116,42,0.08)" }}
        >
          <div
            className="px-6 py-5 border-b"
            style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}
          >
            <h2
              className="text-base font-black tracking-widest uppercase"
              style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
            >
              Price Details
            </h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            {[
              { label: `Price (${order.totalItem} items)`, value: `₹${order.totalPrice}`, color: "#3d2e1e" },
              { label: "Discount", value: `-₹${discount}`, color: "#16a34a" },
              { label: "Delivery", value: "FREE", color: "#16a34a" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span style={{ color: "#7a6a5a" }}>{label}</span>
                <span className="font-bold" style={{ color }}>{value}</span>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: "#f0e8e0" }}>
              <span className="text-base font-black" style={{ color: "#1a1109" }}>Total</span>
              <span className="text-2xl font-black" style={{ color: "#1a1109" }}>
                ₹{order.totalDiscountedPrice}
              </span>
            </div>

            {discount > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: "#f0faf4", color: "#16a34a" }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                You're saving ₹{discount} on this order
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreatePayment}
              className="w-full py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-white"
              style={{
                background: "linear-gradient(135deg, #d4832f, #c8742a)",
                boxShadow: "0 6px 24px rgba(200,116,42,0.35)",
                letterSpacing: "0.08em",
              }}
            >
              Proceed to Payment →
            </motion.button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs" style={{ color: "#b5a89a" }}>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              100% Secure · SSL Encrypted
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div
          className="mt-4 bg-white rounded-2xl border px-5 py-4 flex items-center gap-4"
          style={{ borderColor: "#e8ddd5" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#fdf0e6" }}
          >
            <svg className="w-4 h-4" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414A1 1 0 0121 11.414V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: "#1a1109" }}>
              Estimated Delivery
            </p>
            <p className="text-sm font-bold mt-0.5" style={{ color: "#c8742a" }}>
              3 – 5 Business Days · Free
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}