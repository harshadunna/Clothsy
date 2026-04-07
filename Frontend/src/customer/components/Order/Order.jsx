import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../../config/api"; 

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// 1. MAIN ORDER LIST COMPONENT
export default function Order() {
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
    window.scrollTo(0, 0);
  }, []);

  const allItems = (orders || []).flatMap((order) => {
    if (!order || !Array.isArray(order.orderItems)) return [];
    return (order.orderItems || []).map((item) => ({ item, order }));
  });

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center bg-[#FFF8F5]">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-[#1A1109]"></div>
      </div>
    );
  }

  return (
    <section className="mb-32 bg-[#FFF8F5] pt-12">
      <h2 className="font-headline text-4xl md:text-5xl italic mb-12 border-b border-[#D1C4BC] pb-6 text-[#1A1109] tracking-tighter">
        Order Archive
      </h2>
      
      {!allItems?.length ? (
        <div className="py-12 border-t border-[#D1C4BC]">
          <p className="font-label uppercase tracking-[0.2em] text-[10px] text-[#7F756E] font-bold">No order history found in the archive.</p>
        </div>
      ) : (
        <div className="relative pl-8 border-l border-[#D1C4BC]">
          <AnimatePresence>
            {(allItems || []).map(({ item, order }, idx) => (
              <motion.div key={`${order.id}-${item.id}`} variants={fadeUp} initial="hidden" animate="show" exit="hidden" transition={{ delay: idx * 0.1 }}>
                <OrderCard item={item} order={order} /> 
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

// 2. INDIVIDUAL ORDER CARD COMPONENT 
export function OrderCard({ item, order }) {
  const navigate = useNavigate();
  
  const returnStatuses = ["RETURN_REQUESTED", "RETURN_PICKED", "RETURN_RECEIVED", "REFUND_INITIATED", "REFUND_COMPLETED", "RETURNED"];
  
  const effectiveStatus = 
    item?.itemStatus === "CANCELLED" ? "CANCELLED" : 
    returnStatuses.includes(item?.itemStatus) ? item?.itemStatus :
    order?.orderStatus;
  
  const isDelivered = effectiveStatus === "DELIVERED";
  const isCancelled = effectiveStatus === "CANCELLED";

  return (
    <div className="mb-16 relative group">
      {/* Timeline Dot */}
      <div className={`absolute -left-[41px] top-0 w-4 h-4 ${isDelivered ? 'bg-[#1A1109]' : isCancelled ? 'bg-red-800' : 'bg-[#D1C4BC]'}`}></div>
      
      {/* Card Content */}
      <div className="flex flex-col md:flex-row gap-8 bg-[#FFF8F5] p-8 border border-[#D1C4BC] hover:border-[#1A1109] transition-colors duration-300">
        
        {/* Image (Clickable to Product Page) */}
        <div 
          onClick={() => navigate(`/product/${item?.product?.id}`)}
          className={`w-32 h-40 bg-[#E8E1DE] flex-shrink-0 overflow-hidden cursor-pointer ${isCancelled ? 'grayscale opacity-60' : 'grayscale-[15%] group-hover:grayscale-0 transition-all duration-500'}`}
        >
          <img
            src={item?.product?.imageUrl}
            alt={item?.product?.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-[1.5s]"
          />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
            <div>
              <p className="font-label text-[10px] tracking-[0.2em] text-[#7F756E] uppercase mb-2 font-bold">
                Order #{order?.id || "CLS-000"}
              </p>
              {/* Title (Clickable to Product Page) */}
              <h3 
                onClick={() => navigate(`/product/${item?.product?.id}`)}
                className={`font-headline text-2xl md:text-3xl italic cursor-pointer hover:text-[#C8742A] transition-colors tracking-tight ${isCancelled ? 'line-through text-[#7F756E]' : 'text-[#1A1109]'}`}
              >
                {item?.product?.title}
              </h3>
              <p className="font-label text-xs mt-2 text-[#7F756E] tracking-widest uppercase font-bold">
                Size: {item?.size} • Qty: {item?.quantity}
              </p>
            </div>
            
            {/* Minimalist Status Badge */}
            <span className={`font-label text-[9px] px-3 py-1.5 font-black tracking-widest uppercase border ${
              isDelivered ? 'bg-[#E8E1DE] text-[#1A1109] border-[#1A1109]' : 
              isCancelled ? 'bg-red-50 text-red-800 border-red-200' : 
              'bg-[#FFF8F5] text-[#7F756E] border-[#D1C4BC]'
            }`}>
              {effectiveStatus?.replace(/_/g, " ") || "PROCESSING"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-8 gap-6">
            <p className={`font-label font-bold text-sm tracking-widest ${isCancelled ? 'line-through text-[#7F756E]' : 'text-[#1A1109]'}`}>
              ₹{item?.discountedPrice?.toLocaleString("en-IN") || item?.price?.toLocaleString("en-IN")}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              {isDelivered && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/account/order/${order?.id}/return`); // ── FIXED: Routes to initiation page
                    }}
                    className="font-label text-[9px] font-black tracking-widest border-b border-[#1A1109] text-[#1A1109] pb-1 uppercase hover:text-[#C8742A] hover:border-[#C8742A] transition-colors"
                  >
                    Request Return
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${item?.product?.id}/rate`);
                    }}
                    className="font-label text-[9px] font-black tracking-widest border-b border-[#1A1109] text-[#1A1109] pb-1 uppercase hover:text-[#C8742A] hover:border-[#C8742A] transition-colors"
                  >
                    Leave a Narrative
                  </button>
                </>
              )}
              
              {/* Always show View Details */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/account/order/${order?.id}`);
                }}
                className="font-label text-[9px] font-black tracking-widest border-b border-[#1A1109] text-[#1A1109] pb-1 uppercase hover:text-[#C8742A] hover:border-[#C8742A] transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}