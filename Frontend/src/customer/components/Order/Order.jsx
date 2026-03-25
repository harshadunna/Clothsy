import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderCard from "./OrderCard";
import api from "../../../config/api"; 

const orderStatus = [
  { label: "On The Way", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Returning", value: "RETURN_REQUESTED" },
  { label: "Refunded", value: "REFUND_COMPLETED" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function Order() {
  const [activeFilters, setActiveFilters] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/orders/user")
      .then((res) => {
        const sortedOrders = res.data.sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  const toggleFilter = (value) => {
    setActiveFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  // Safe mapping to prevent blank screens if orderItems is null
  const allItems = (orders || []).flatMap((order) => {
    if (!order || !Array.isArray(order.orderItems)) return [];
    return order.orderItems.map((item) => ({ item, order }));
  }).filter(({ item, order }) => {
    if (activeFilters.length === 0) return true;

    const itemIsCancelled = item.itemStatus === "CANCELLED" || order.orderStatus === "CANCELLED";
    const returnPendingStatuses = ["RETURN_REQUESTED", "RETURN_PICKED", "RETURN_RECEIVED", "REFUND_INITIATED"];
    const returnCompletedStatuses = ["REFUND_COMPLETED", "RETURNED"];

    if (activeFilters.includes("CANCELLED") && itemIsCancelled) return true;
    if (activeFilters.includes("SHIPPED") && ["PLACED", "CONFIRMED", "SHIPPED"].includes(order.orderStatus) && !itemIsCancelled) return true;
    if (activeFilters.includes("DELIVERED") && order.orderStatus === "DELIVERED" && !itemIsCancelled && !returnPendingStatuses.includes(item.itemStatus) && !returnCompletedStatuses.includes(item.itemStatus)) return true;
    if (activeFilters.includes("REFUND_COMPLETED") && (returnCompletedStatuses.includes(item.itemStatus) || returnCompletedStatuses.includes(order.orderStatus)) && !itemIsCancelled) return true;
    if (activeFilters.includes("RETURN_REQUESTED") && (returnPendingStatuses.includes(item.itemStatus) || returnPendingStatuses.includes(order.orderStatus)) && !itemIsCancelled) return true;

    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}>
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
              My Orders
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "#9e8d7a" }}>
              {allItems.length} item{allItems.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <button onClick={() => setMobileFilterOpen((p) => !p)} className="lg:hidden flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border" style={{ borderColor: "#e8ddd5", color: "#c8742a", background: "#fff" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
        </motion.div>

        <div className="flex gap-6 items-start">
          <AnimatePresence>
            {(mobileFilterOpen || true) && (
              <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="hidden lg:block w-56 shrink-0 sticky top-6">
                <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}>
                    <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
                      Filters
                    </h2>
                  </div>

                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#9e8d7a" }}>
                      Order Status
                    </p>

                    <div className="space-y-2.5">
                      {orderStatus.map((option) => {
                        const isChecked = activeFilters.includes(option.value);
                        return (
                          <label key={option.value} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter(option.value)}>
                            <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200" style={{ borderColor: isChecked ? "#c8742a" : "#d9cfc6", background: isChecked ? "#c8742a" : "#fff" }}>
                              {isChecked && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-semibold transition-colors" style={{ color: isChecked ? "#c8742a" : "#7a6a5a" }}>
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {activeFilters.length > 0 && (
                      <button onClick={() => setActiveFilters([])} className="mt-5 text-xs font-bold w-full text-center transition-colors hover:text-gray-800" style={{ color: "#b5a89a" }}>
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            {allItems.length > 0 ? (
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {allItems.map(({ item, order }) => (
                    <motion.div key={`${order.id}-${item.id}`} variants={fadeUp} layout>
                      <OrderCard item={item} order={order} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="bg-white rounded-2xl border flex flex-col items-center justify-center py-24 text-center" style={{ borderColor: "#e8ddd5" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#fdf0e6" }}>
                  <svg className="w-8 h-8" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-black mb-2" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
                  No orders found
                </h2>
                <p className="text-sm max-w-xs" style={{ color: "#9e8d7a" }}>
                  {activeFilters.length > 0 ? "No orders match your current filters. Try clearing them." : "You haven't placed any orders yet."}
                </p>
                {activeFilters.length > 0 && (
                  <button onClick={() => setActiveFilters([])} className="mt-5 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#fae6d5] transition-colors" style={{ color: "#c8742a", background: "#fdf0e6" }}>
                    Clear Filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}