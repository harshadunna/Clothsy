import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import OrderTracker from "./OrderTracker";
import AddressCard from "../Address/AddressCard";
import api from "../../../config/api";

const getStepIndex = (status) => {
  switch (status) {
    case "PLACED": return 1;
    case "CONFIRMED": return 2;
    case "SHIPPED": return 3;
    case "OUT_FOR_DELIVERY": return 4;
    case "DELIVERED": return 5;
    default: return 0;
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedItemsToCancel, setSelectedItemsToCancel] = useState([]);
  const [cancelLoading, setCancelLoading] = useState(false);

  // FETCH SINGLE ORDER
  const fetchOrder = () => {
    setLoading(true);
    api.get(`/api/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching order details:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Handle Checkbox Toggle
  const toggleItemForCancellation = (itemId) => {
    setSelectedItemsToCancel((prev) => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Submit Partial/Full Cancellation
  const handleCancelSubmit = async () => {
    if (selectedItemsToCancel.length === 0) return;
    
    setCancelLoading(true);
    try {
      // Call the new backend endpoint we just created
      await api.put(`/api/orders/${orderId}/cancel-items`, selectedItemsToCancel);
      
      // Close modal, reset selections, and refresh the order data
      setIsCancelModalOpen(false);
      setSelectedItemsToCancel([]);
      fetchOrder(); 
    } catch (error) {
      console.error("Error cancelling items:", error);
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}>
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }}></div>
      </div>
    );
  }

  const activeStep = getStepIndex(order?.orderStatus);
  const isDelivered = order?.orderStatus === "DELIVERED";
  const isFullyCancelled = order?.orderStatus === "CANCELLED";

  // Filter items that haven't been cancelled yet for the modal
  const eligibleItemsForCancellation = order?.orderItems?.filter(item => item.itemStatus !== "CANCELLED") || [];

  return (
    <div className="min-h-screen pb-24 relative" style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}>
      
      {/* ── CANCELLATION MODAL ── */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Cancel Items</h3>
                <p className="text-sm text-gray-500 mt-1">Select the specific items you wish to cancel.</p>
              </div>
              
              <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4">
                {eligibleItemsForCancellation.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No eligible items to cancel.</p>
                ) : (
                  eligibleItemsForCancellation.map((item) => (
                    <label key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-[#c8742a] focus:ring-[#c8742a]"
                        checked={selectedItemsToCancel.includes(item.id)}
                        onChange={() => toggleItemForCancellation(item.id)}
                      />
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                        <img src={item.product?.imageUrl} alt={item.product?.title} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.product?.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} | ₹{item.discountedPrice || item.price}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                <button 
                  onClick={() => { setIsCancelModalOpen(false); setSelectedItemsToCancel([]); }}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Keep Order
                </button>
                <button 
                  onClick={handleCancelSubmit}
                  disabled={selectedItemsToCancel.length === 0 || cancelLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 flex justify-center items-center"
                >
                  {cancelLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : "Confirm Cancellation"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">

        {/* ── Page Header ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate("/account/orders")}
              className="flex items-center gap-1.5 text-sm font-bold transition-colors"
              style={{ color: "#c8742a" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              My Orders
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
            Order #{order?.id}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "#9e8d7a" }}>
            {order?.orderItems?.length} item{order?.orderItems?.length !== 1 ? "s" : ""} · Status:{" "}
            <span className="font-semibold" style={{ color: isFullyCancelled ? "#dc2626" : "#c8742a" }}>
              {order?.orderStatus?.replace(/_/g, " ")}
            </span>
          </p>
        </motion.div>

        {/* ── Delivery Address ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}>
            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>Delivery Address</h2>
          </div>
          <div className="p-5">
            {order?.shippingAddress && <AddressCard address={order.shippingAddress} compact />}
          </div>
        </motion.div>

        {/* ── Order Tracker + Action ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}>
          <div className="px-5 py-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}>
            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>Order Status</h2>
            
            {/* Show cancel button if order is not fully cancelled, returned, or delivered */}
            {!isFullyCancelled && order?.orderStatus !== "RETURNED" && !isDelivered && (
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setIsCancelModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200"
              >
                Cancel Items
              </motion.button>
            )}
            
            {/* Show return button if delivered */}
            {isDelivered && (
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors text-red-600 bg-red-50 border border-red-200"
              >
                Return Order
              </motion.button>
            )}
          </div>

          <div className="px-6 py-8 overflow-x-auto">
            <OrderTracker activeStep={activeStep} />
          </div>
        </motion.div>

        {/* ── Order Items ── */}
        <div className="space-y-4">
          {order?.orderItems?.map((item, i) => {
            const isItemCancelled = item.itemStatus === "CANCELLED";
            
            return (
              <motion.div
                key={item.id || i}
                variants={fadeUp} initial="hidden" animate="show" custom={3 + i}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${isItemCancelled ? 'opacity-70 grayscale-[30%]' : ''}`}
                style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 16px rgba(180,140,90,0.07)" }}
              >
                <div className="flex flex-col sm:flex-row relative">
                  {/* Cancelled Overlay Banner */}
                  {isItemCancelled && (
                    <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Cancelled
                    </div>
                  )}

                  <div className="w-full sm:w-36 h-44 sm:h-auto shrink-0 overflow-hidden" style={{ background: "#f9f3ed" }}>
                    <img src={item?.product?.imageUrl} alt={item?.product?.title} className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#c8742a" }}>{item?.product?.brand}</p>
                      <h3 className={`font-bold text-base leading-snug ${isItemCancelled ? 'text-gray-500 line-through' : 'text-[#1a1109]'}`}>{item?.product?.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg" style={{ background: "#f5ede4", color: "#7a5c3a" }}>Size: {item?.size} | Qty: {item?.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <p className={`font-black text-lg ${isItemCancelled ? 'text-gray-400 line-through' : 'text-[#1a1109]'}`}>₹{item?.discountedPrice || item?.price}</p>
                        {isItemCancelled && <span className="text-sm font-bold text-red-500">Refund Initiated</span>}
                      </div>
                    </div>
                    {isDelivered && !isItemCancelled && (
                      <div className="flex items-start sm:items-end sm:justify-end">
                        <motion.button onClick={() => navigate(`/account/rate/${item?.product?.id}`)} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl" style={{ color: "#c8742a", background: "#fdf0e6" }}>
                          Rate & Review
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}