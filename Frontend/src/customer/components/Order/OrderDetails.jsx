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

// Helper function to calculate 7-day return window
const checkReturnEligibility = (deliveryDateString) => {
  if (!deliveryDateString) return { isEligible: true, daysLeft: 7 };
  const deliveryDate = new Date(deliveryDateString);
  const today = new Date();
  const diffTime = today - deliveryDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysLeft = 7 - diffDays;
  return {
    isEligible: daysLeft >= 0,
    daysLeft: daysLeft < 0 ? 0 : daysLeft,
  };
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

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedItemsToCancel, setSelectedItemsToCancel] = useState([]);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedItemsToReturn, setSelectedItemsToReturn] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);

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

  const handleCancelSubmit = async () => {
    if (selectedItemsToCancel.length === 0) return;
    setCancelLoading(true);
    try {
      await api.put(`/api/orders/${orderId}/cancel-items`, selectedItemsToCancel);
      setIsCancelModalOpen(false);
      setSelectedItemsToCancel([]);
      fetchOrder();
    } catch (error) {
      console.error("Error cancelling items:", error);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReturnSubmit = async () => {
    if (selectedItemsToReturn.length === 0) return;
    setReturnLoading(true);
    try {
      await api.put(`/api/orders/${orderId}/return-items`, selectedItemsToReturn);
      setIsReturnModalOpen(false);
      setSelectedItemsToReturn([]);
      fetchOrder();
    } catch (error) {
      console.error("Error returning items:", error);
    } finally {
      setReturnLoading(false);
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

  const eligibleItemsForCancellation = order?.orderItems?.filter(item => item.itemStatus !== "CANCELLED" && item.itemStatus !== "DELIVERED") || [];
  
  // Filter for items that are delivered, not already returned, and within 7 days
  const eligibleItemsForReturn = order?.orderItems?.filter(item => {
    if (item.itemStatus !== "DELIVERED") return false;
    const { isEligible } = checkReturnEligibility(item.deliveryDate || order.deliveryDate);
    return isEligible;
  }) || [];

  return (
    <div className="min-h-screen pb-24 relative" style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}>
      
      {/* ── CANCELLATION MODAL ── */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Cancel Items</h3>
              </div>
              <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4">
                {eligibleItemsForCancellation.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No eligible items to cancel.</p>
                ) : (
                  eligibleItemsForCancellation.map((item) => (
                    <label key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#c8742a]" checked={selectedItemsToCancel.includes(item.id)} onChange={() => setSelectedItemsToCancel(p => p.includes(item.id) ? p.filter(id => id !== item.id) : [...p, item.id])} />
                      <img src={item.product?.imageUrl} alt={item.product?.title} className="w-12 h-12 object-cover rounded bg-gray-100" />
                      <div className="flex-1"><p className="text-sm font-bold text-gray-900 truncate">{item.product?.title}</p></div>
                    </label>
                  ))
                )}
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                <button onClick={() => { setIsCancelModalOpen(false); setSelectedItemsToCancel([]); }} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50">Keep Order</button>
                <button onClick={handleCancelSubmit} disabled={selectedItemsToCancel.length === 0 || cancelLoading} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                  {cancelLoading ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── RETURN MODAL ── */}
      <AnimatePresence>
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>Return Items</h3>
                <p className="text-sm text-gray-500 mt-1">Items can be returned within 7 days of delivery.</p>
              </div>
              <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4">
                {eligibleItemsForReturn.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No eligible items to return. Return window may have closed.</p>
                ) : (
                  eligibleItemsForReturn.map((item) => (
                    <label key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600" checked={selectedItemsToReturn.includes(item.id)} onChange={() => setSelectedItemsToReturn(p => p.includes(item.id) ? p.filter(id => id !== item.id) : [...p, item.id])} />
                      <img src={item.product?.imageUrl} alt={item.product?.title} className="w-12 h-12 object-cover rounded bg-gray-100" />
                      <div className="flex-1"><p className="text-sm font-bold text-gray-900 truncate">{item.product?.title}</p></div>
                    </label>
                  ))
                )}
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                <button onClick={() => { setIsReturnModalOpen(false); setSelectedItemsToReturn([]); }} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50">Cancel</button>
                <button onClick={handleReturnSubmit} disabled={selectedItemsToReturn.length === 0 || returnLoading} className="flex-1 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
                  {returnLoading ? "Processing..." : "Confirm Return"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate("/account/orders")} className="flex items-center gap-1.5 text-sm font-bold transition-colors" style={{ color: "#c8742a" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              My Orders
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>Order #{order?.id}</h1>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}>
            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>Delivery Address</h2>
          </div>
          <div className="p-5">{order?.shippingAddress && <AddressCard address={order.shippingAddress} compact />}</div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}>
          <div className="px-5 py-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}>
            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>Order Status</h2>
            
            {!isFullyCancelled && !isDelivered && (
              <button onClick={() => setIsCancelModalOpen(true)} className="text-xs font-bold px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-600">Cancel Items</button>
            )}
            
            {isDelivered && eligibleItemsForReturn.length > 0 && (
              <button onClick={() => setIsReturnModalOpen(true)} className="text-xs font-bold px-4 py-2 rounded-xl text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100">Request Return</button>
            )}
          </div>
          <div className="px-6 py-8 overflow-x-auto"><OrderTracker activeStep={activeStep} /></div>
        </motion.div>

        <div className="space-y-4">
          {order?.orderItems?.map((item, i) => {
            const isItemCancelled = item.itemStatus === "CANCELLED";
            const isReturnRequested = item.itemStatus === "RETURN_REQUESTED";
            const { isEligible, daysLeft } = checkReturnEligibility(item.deliveryDate || order?.deliveryDate);
            
            return (
              <motion.div key={item.id || i} variants={fadeUp} initial="hidden" animate="show" custom={3 + i} className={`bg-white rounded-2xl border overflow-hidden ${isItemCancelled ? 'opacity-70 grayscale-[30%]' : ''}`} style={{ borderColor: "#e8ddd5" }}>
                <div className="flex flex-col sm:flex-row relative">
                  {isItemCancelled && <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">Cancelled</div>}
                  {isReturnRequested && <div className="absolute top-4 left-4 z-10 bg-purple-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">Return Requested</div>}

                  <div className="w-full sm:w-36 h-44 sm:h-auto shrink-0 overflow-hidden" style={{ background: "#f9f3ed" }}>
                    <img src={item?.product?.imageUrl} alt={item?.product?.title} className="w-full h-full object-cover object-top hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#c8742a" }}>{item?.product?.brand}</p>
                      <h3 className={`font-bold text-base leading-snug ${isItemCancelled ? 'text-gray-500 line-through' : 'text-[#1a1109]'}`}>{item?.product?.title}</h3>
                      <div className="flex items-center gap-3 pt-1">
                        <p className={`font-black text-lg ${isItemCancelled ? 'text-gray-400 line-through' : 'text-[#1a1109]'}`}>₹{item?.discountedPrice || item?.price}</p>
                      </div>
                      
                      {/* Dynamic Delivery / Return Status text */}
                      {item.itemStatus === "DELIVERED" && (
                        <p className={`text-xs font-bold ${isEligible ? 'text-green-600' : 'text-gray-400'}`}>
                          {isEligible ? `Return eligible for ${daysLeft} more days` : "Return window closed"}
                        </p>
                      )}
                    </div>

                    {item.itemStatus === "DELIVERED" && (
                      <div className="flex flex-col items-start sm:items-end justify-end gap-2">
                        <button onClick={() => navigate(`/product/${item?.product?.id}/rate`)} className="text-xs font-bold px-4 py-2.5 rounded-xl w-full sm:w-auto text-center" style={{ color: "#c8742a", background: "#fdf0e6" }}>Rate & Review</button>
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