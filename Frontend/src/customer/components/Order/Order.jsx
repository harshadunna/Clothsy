import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderCard from "./OrderCard";

const orderStatus = [
  { label: "On The Way", value: "onTheWay" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned", value: "returned" },
];

const dummyOrders = [
  {
    id: 1,
    orderStatus: "DELIVERED",
    orderItems: [
      { id: 1, size: "M", price: 996, product: { id: 101, title: "Women Floral Gown", brand: "DressBerry", imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80" } },
    ],
  },
  {
    id: 2,
    orderStatus: "ON_THE_WAY",
    orderItems: [
      { id: 2, size: "S", price: 1500, product: { id: 102, title: "Yellow Anarkali Suit", brand: "Biba", imageUrl: "https://images.unsplash.com/photo-1619533394727-57d522857f89?auto=format&fit=crop&w=400&q=80" } },
    ],
  },
  {
    id: 3,
    orderStatus: "CANCELLED",
    orderItems: [
      { id: 3, size: "L", price: 2200, product: { id: 103, title: "Embroidered Kurta Set", brand: "W", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80" } },
    ],
  },
];

const statusValueMap = {
  onTheWay: "ON_THE_WAY",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  returned: "RETURNED",
};

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

  const orders = dummyOrders; // replace with Redux: useSelector(store => store.order.orders)

  const toggleFilter = (value) => {
    setActiveFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (activeFilters.length === 0) return true;
    return activeFilters.some((f) => statusValueMap[f] === o.orderStatus);
  });

  const allItems = filteredOrders.flatMap((order) =>
    order.orderItems.map((item) => ({ item, order }))
  );

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight"
              style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
            >
              My Orders
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "#9e8d7a" }}>
              {allItems.length} order{allItems.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen((p) => !p)}
            className="lg:hidden flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border"
            style={{ borderColor: "#e8ddd5", color: "#c8742a", background: "#fff" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
        </motion.div>

        <div className="flex gap-6 items-start">

          {/* ── Sidebar Filter ── */}
          <AnimatePresence>
            {(mobileFilterOpen || true) && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:block w-56 shrink-0 sticky top-6"
              >
                <div
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
                      Filters
                    </h2>
                  </div>

                  <div className="p-5">
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-3"
                      style={{ color: "#9e8d7a" }}
                    >
                      Order Status
                    </p>

                    <div className="space-y-2.5">
                      {orderStatus.map((option) => {
                        const isChecked = activeFilters.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => toggleFilter(option.value)}
                          >
                            {/* Custom checkbox */}
                            <div
                              className="w-4.5 h-4.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                              style={{
                                borderColor: isChecked ? "#c8742a" : "#d9cfc6",
                                background: isChecked ? "#c8742a" : "#fff",
                              }}
                            >
                              {isChecked && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span
                              className="text-sm font-semibold transition-colors"
                              style={{ color: isChecked ? "#c8742a" : "#7a6a5a" }}
                            >
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {activeFilters.length > 0 && (
                      <button
                        onClick={() => setActiveFilters([])}
                        className="mt-5 text-xs font-bold w-full text-center transition-colors"
                        style={{ color: "#b5a89a" }}
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ── Order List ── */}
          <div className="flex-1 min-w-0">
            {allItems.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {allItems.map(({ item, order }) => (
                    <motion.div key={`${order.id}-${item.id}`} variants={fadeUp} layout>
                      <OrderCard item={item} order={order} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl border flex flex-col items-center justify-center py-24 text-center"
                style={{ borderColor: "#e8ddd5" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "#fdf0e6" }}
                >
                  <svg className="w-8 h-8" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2
                  className="text-xl font-black mb-2"
                  style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
                >
                  No orders found
                </h2>
                <p className="text-sm max-w-xs" style={{ color: "#9e8d7a" }}>
                  {activeFilters.length > 0
                    ? "No orders match your current filters. Try clearing them."
                    : "You haven't placed any orders yet."}
                </p>
                {activeFilters.length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="mt-5 text-sm font-bold px-5 py-2.5 rounded-xl"
                    style={{ color: "#c8742a", background: "#fdf0e6" }}
                  >
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