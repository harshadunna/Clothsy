import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const getStatusConfig = (status, dateString) => {
  const dateObj = dateString ? new Date(dateString) : new Date();
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const configs = {
    DELIVERED: {
      label: "Delivered",
      sublabel: "Your item has been delivered",
      date: formattedDate,
      dotColor: "#16a34a",
      bgColor: "#f0faf4",
      textColor: "#16a34a",
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    CANCELLED: {
      label: "Cancelled",
      sublabel: "This item was cancelled",
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
    RETURN_REQUESTED: {
      label: "Return Requested",
      sublabel: "Awaiting pickup",
      date: null,
      dotColor: "#d97706", 
      bgColor: "#fffbeb",
      textColor: "#d97706",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    RETURN_PICKED: {
      label: "Picked Up",
      sublabel: "Heading to warehouse",
      date: null,
      dotColor: "#4f46e5", 
      bgColor: "#e0e7ff",
      textColor: "#4f46e5",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    RETURN_RECEIVED: {
      label: "Received",
      sublabel: "Arrived at warehouse",
      date: null,
      dotColor: "#0d9488", 
      bgColor: "#ccfbf1",
      textColor: "#0d9488",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    REFUND_INITIATED: {
      label: "Refund Initiated",
      sublabel: "Processing your refund",
      date: null,
      dotColor: "#db2777", 
      bgColor: "#fce7f3",
      textColor: "#db2777",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
      ),
    },
    REFUND_COMPLETED: {
      label: "Refund Completed",
      sublabel: "Refund sent to original payment",
      date: null,
      dotColor: "#059669",
      bgColor: "#d1fae5",
      textColor: "#059669",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    DEFAULT: {
      label: "On The Way",
      sublabel: `Status: ${status?.replace(/_/g, " ") || "PROCESSING"}`,
      date: formattedDate,
      dotColor: "#c8742a",
      bgColor: "#fdf0e6",
      textColor: "#c8742a",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414A1 1 0 0121 11.414V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    }
  };

  return configs[status] || configs.DEFAULT;
};

export default function OrderCard({ item, order }) {
  const navigate = useNavigate();
  
  const returnStatuses = ["RETURN_REQUESTED", "RETURN_PICKED", "RETURN_RECEIVED", "REFUND_INITIATED", "REFUND_COMPLETED", "RETURNED"];
  
  const effectiveStatus = 
    item?.itemStatus === "CANCELLED" ? "CANCELLED" : 
    returnStatuses.includes(item?.itemStatus) ? item?.itemStatus :
    order?.orderStatus;
  
  const status = getStatusConfig(effectiveStatus, order?.createdAt);
  const isDelivered = effectiveStatus === "DELIVERED";
  const isCancelled = effectiveStatus === "CANCELLED";

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(200,116,42,0.12)" }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-white rounded-2xl border overflow-hidden cursor-pointer ${isCancelled ? 'opacity-80' : ''}`}
      style={{
        borderColor: "#e8ddd5",
        boxShadow: "0 2px 12px rgba(180,140,90,0.07)",
      }}
      onClick={() => navigate(`/account/order/${order?.id}`)}
    >
      <div className="flex flex-col sm:flex-row">
        <div
          className={`w-full sm:w-32 h-40 sm:h-auto shrink-0 overflow-hidden ${isCancelled ? 'grayscale-[40%]' : ''}`}
          style={{ background: "#f9f3ed" }}
        >
          <img
            src={item?.product?.imageUrl}
            alt={item?.product?.title}
            className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#c8742a" }}>
              {item?.product?.brand}
            </p>
            <h3 className={`font-bold text-base leading-snug line-clamp-2 ${isCancelled ? 'text-gray-500 line-through' : 'text-[#1a1109]'}`}>
              {item?.product?.title}
            </h3>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg" style={{ background: "#f5ede4", color: "#7a5c3a" }}>
                Size: {item?.size} | Qty: {item?.quantity}
              </span>
              <span className={`text-sm font-black ${isCancelled ? 'text-gray-400 line-through' : 'text-[#1a1109]'}`}>
                ₹{item?.discountedPrice || item?.price}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between items-start sm:items-end gap-4 shrink-0">
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

            {isDelivered && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/product/${item?.product?.id}/rate`);
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