import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const statusConfig = {
  DELIVERED: {
    label: "Delivered",
    sublabel: "Your item has been delivered",
    date: "Mar 03",
    dotColor: "#16a34a",
    bgColor: "#f0faf4",
    textColor: "#16a34a",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  ON_THE_WAY: {
    label: "On The Way",
    sublabel: "Your item is on the way",
    date: "Mar 07",
    dotColor: "#c8742a",
    bgColor: "#fdf0e6",
    textColor: "#c8742a",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414A1 1 0 0121 11.414V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  CANCELLED: {
    label: "Cancelled",
    sublabel: "This order was cancelled",
    date: null,
    dotColor: "#dc2626",
    bgColor: "#fef2f2",
    textColor: "#dc2626",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  RETURNED: {
    label: "Returned",
    sublabel: "This order has been returned",
    date: null,
    dotColor: "#7c3aed",
    bgColor: "#f5f3ff",
    textColor: "#7c3aed",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
};

export default function OrderCard({ item, order }) {
  const navigate = useNavigate();
  const status = statusConfig[order?.orderStatus] || statusConfig["ON_THE_WAY"];
  const isDelivered = order?.orderStatus === "DELIVERED";

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(200,116,42,0.12)" }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl border overflow-hidden cursor-pointer"
      style={{
        borderColor: "#e8ddd5",
        boxShadow: "0 2px 12px rgba(180,140,90,0.07)",
      }}
      onClick={() => navigate(`/account/order/${order?.id}`)}
    >
      <div className="flex flex-col sm:flex-row">

        {/* ── Product Image ── */}
        <div
          className="w-full sm:w-32 h-40 sm:h-auto shrink-0 overflow-hidden"
          style={{ background: "#f9f3ed" }}
        >
          <img
            src={item?.product?.imageUrl}
            alt={item?.product?.title}
            className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* ── Details ── */}
        <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4 justify-between">

          {/* Product Info */}
          <div className="flex-1 space-y-1.5">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "#c8742a" }}
            >
              {item?.product?.brand}
            </p>
            <h3
              className="font-bold text-base leading-snug"
              style={{ color: "#1a1109" }}
            >
              {item?.product?.title}
            </h3>
            <div className="flex items-center gap-2 pt-0.5">
              <span
                className="px-2.5 py-1 text-xs font-bold rounded-lg"
                style={{ background: "#f5ede4", color: "#7a5c3a" }}
              >
                Size: {item?.size}
              </span>
              <span
                className="text-sm font-black"
                style={{ color: "#1a1109" }}
              >
                ₹{item?.price}
              </span>
            </div>
          </div>

          {/* Status + Actions */}
          <div className="flex flex-col justify-between items-start sm:items-end gap-4 shrink-0">

            {/* Status Badge */}
            <div className="space-y-1.5">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: status.bgColor, color: status.textColor }}
              >
                <span style={{ color: status.dotColor }}>{status.icon}</span>
                {status.label}
                {status.date && (
                  <span className="font-semibold opacity-75">· {status.date}</span>
                )}
              </div>
              <p className="text-xs text-right" style={{ color: "#9e8d7a" }}>
                {status.sublabel}
              </p>
            </div>

            {/* Rate & Review — only for delivered */}
            {isDelivered && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/account/rate/${item?.product?.id}`);
                }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                style={{ color: "#c8742a", background: "#fdf0e6" }}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Rate & Review
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}