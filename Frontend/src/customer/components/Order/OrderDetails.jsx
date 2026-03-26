import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import OrderTracker from "./OrderTracker";
import api from "../../../config/api";

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

const getReturnBadgeConfig = (status) => {
  switch (status) {
    case "RETURN_REQUESTED": return "Return Requested";
    case "RETURN_PICKED": return "Picked Up";
    case "RETURN_RECEIVED": return "Warehouse Received";
    case "REFUND_INITIATED": return "Refund Initiated";
    case "REFUND_COMPLETED": return "Refund Completed";
    case "RETURNED": return "Returned";
    default: return null;
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedItemsToCancel, setSelectedItemsToCancel] = useState([]);
  const [cancelLoading, setCancelLoading] = useState(false);

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

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/api/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_Order_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice:", error);
    } finally {
      setDownloading(false);
    }
  };

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
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-12 h-12 border-2 border-t-transparent border-primary animate-spin rounded-full"></div>
      </div>
    );
  }

  const isDelivered = order?.orderStatus === "DELIVERED";
  const isFullyCancelled = order?.orderStatus === "CANCELLED";

  const eligibleItemsForCancellation = order?.orderItems?.filter(item => item.itemStatus !== "CANCELLED" && item.itemStatus !== "DELIVERED") || [];
  
  const eligibleItemsForReturn = order?.orderItems?.filter(item => {
    if (item.itemStatus !== "DELIVERED") return false;
    const { isEligible } = checkReturnEligibility(item.deliveryDate || order.deliveryDate);
    return isEligible;
  }) || [];

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-32 pb-24 px-6 md:px-12">
      
      {/* ── Cancel Items Modal ── */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-surface border border-outline-variant/30 shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-8 border-b border-outline-variant/30">
                <h3 className="text-3xl font-headline italic tracking-tighter text-on-surface">Cancel Silhouette</h3>
                <p className="font-label text-[10px] uppercase tracking-widest text-outline mt-2">Select pieces to remove from order.</p>
              </div>
              <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4">
                {eligibleItemsForCancellation.length === 0 ? (
                  <p className="text-center font-label text-[10px] uppercase tracking-widest text-outline py-4">No eligible pieces to cancel.</p>
                ) : (
                  eligibleItemsForCancellation.map((item) => (
                    <label key={item.id} className="flex items-center gap-6 p-4 border border-outline-variant/30 hover:border-primary transition-colors cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 border-outline text-primary focus:ring-0 rounded-none cursor-pointer" checked={selectedItemsToCancel.includes(item.id)} onChange={() => setSelectedItemsToCancel(p => p.includes(item.id) ? p.filter(id => id !== item.id) : [...p, item.id])} />
                      <img src={item.product?.imageUrl} alt={item.product?.title} className="w-12 h-16 object-cover bg-surface-container grayscale-[20%]" />
                      <div className="flex-1"><p className="text-sm font-bold text-on-surface truncate font-headline italic">{item.product?.title}</p></div>
                    </label>
                  ))
                )}
              </div>
              <div className="p-8 border-t border-outline-variant/30 flex gap-4 bg-surface-container-low">
                <button onClick={() => { setIsCancelModalOpen(false); setSelectedItemsToCancel([]); }} className="flex-1 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface border border-outline-variant hover:bg-surface-container transition-colors">Abort</button>
                <button onClick={handleCancelSubmit} disabled={selectedItemsToCancel.length === 0 || cancelLoading} className="flex-1 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-surface bg-error hover:bg-error/80 disabled:opacity-50 transition-colors">
                  {cancelLoading ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Return Items Modal ── */}
      <AnimatePresence>
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-surface border border-outline-variant/30 shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-8 border-b border-outline-variant/30">
                <h3 className="text-3xl font-headline italic tracking-tighter text-on-surface">Return Silhouette</h3>
                <p className="font-label text-[10px] uppercase tracking-widest text-outline mt-2">Items can be returned within 7 days of delivery.</p>
              </div>
              <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4">
                {eligibleItemsForReturn.length === 0 ? (
                  <p className="text-center font-label text-[10px] uppercase tracking-widest text-outline py-4">Return window has closed for these items.</p>
                ) : (
                  eligibleItemsForReturn.map((item) => (
                    <label key={item.id} className="flex items-center gap-6 p-4 border border-outline-variant/30 hover:border-primary transition-colors cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 border-outline text-primary focus:ring-0 rounded-none cursor-pointer" checked={selectedItemsToReturn.includes(item.id)} onChange={() => setSelectedItemsToReturn(p => p.includes(item.id) ? p.filter(id => id !== item.id) : [...p, item.id])} />
                      <img src={item.product?.imageUrl} alt={item.product?.title} className="w-12 h-16 object-cover bg-surface-container grayscale-[20%]" />
                      <div className="flex-1"><p className="text-sm font-bold text-on-surface truncate font-headline italic">{item.product?.title}</p></div>
                    </label>
                  ))
                )}
              </div>
              <div className="p-8 border-t border-outline-variant/30 flex gap-4 bg-surface-container-low">
                <button onClick={() => { setIsReturnModalOpen(false); setSelectedItemsToReturn([]); }} className="flex-1 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface border border-outline-variant hover:bg-surface-container transition-colors">Abort</button>
                <button onClick={handleReturnSubmit} disabled={selectedItemsToReturn.length === 0 || returnLoading} className="flex-1 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-surface bg-on-surface hover:bg-primary disabled:opacity-50 transition-colors">
                  {returnLoading ? "Processing..." : "Confirm Return"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* ── HEADER & INVOICE BUTTON ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-outline-variant/30 pb-8">
          <div>
            <button onClick={() => navigate("/account/orders")} className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors mb-6">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Archive Orders
            </button>
            <h1 className="text-5xl md:text-6xl font-headline italic tracking-tight text-on-surface">Order #{order?.id}</h1>
          </div>

          <button 
            onClick={handleDownloadInvoice} 
            disabled={downloading || isFullyCancelled}
            className="flex items-center justify-center gap-3 px-8 py-4 font-label text-[10px] uppercase tracking-widest font-bold text-on-surface border border-on-surface hover:bg-on-surface hover:text-surface transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-on-surface"
          >
            {downloading ? (
              <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            )}
            {downloading ? "GENERATING..." : "DOWNLOAD INVOICE"}
          </button>
        </motion.div>

        {/* ── DELIVERY ADDRESS (Rendered Directly, No Edit/Delete Buttons) ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="bg-surface-container-low border border-outline-variant/30">
          <div className="px-8 py-6 border-b border-outline-variant/30">
            <h2 className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface">Delivery Destination</h2>
          </div>
          <div className="p-8">
            {order?.shippingAddress ? (
              <div className="font-body text-sm space-y-2 text-on-surface-variant">
                 <p className="font-headline italic text-2xl text-on-surface mb-4">
                   {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                 </p>
                 <p>{order.shippingAddress.streetAddress}</p>
                 <p className="uppercase tracking-wider text-xs mt-1">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                 <p className="pt-4 font-label text-xs">Phone: {order.shippingAddress.mobile}</p>
              </div>
            ) : (
              <p className="font-label text-[10px] uppercase tracking-widest text-outline">Destination unavailable.</p>
            )}
          </div>
        </motion.div>

        {/* ── ORDER STATUS & TRACKER ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="bg-surface border border-outline-variant/30">
          <div className="px-8 py-6 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface">Logistics Status</h2>
            
            <div className="flex gap-4">
              {!isFullyCancelled && !isDelivered && (
                <button onClick={() => setIsCancelModalOpen(true)} className="font-label text-[10px] uppercase tracking-widest text-error border-b border-error pb-0.5 hover:opacity-70 transition-opacity">
                  Cancel Pieces
                </button>
              )}
              {isDelivered && eligibleItemsForReturn.length > 0 && (
                <button onClick={() => setIsReturnModalOpen(true)} className="font-label text-[10px] uppercase tracking-widest text-primary border-b border-primary pb-0.5 hover:opacity-70 transition-opacity">
                  Request Return
                </button>
              )}
            </div>
          </div>
          <div className="px-8 py-12 overflow-x-auto">
             {/* Assuming OrderTracker can handle transparent backgrounds natively. If it looks weird, we'll style it later */}
            <OrderTracker status={order?.orderStatus} />
          </div>
        </motion.div>

        {/* ── ORDER ITEMS ── */}
        <div className="space-y-8">
          <h2 className="font-headline text-3xl italic text-on-surface border-b border-outline-variant/30 pb-4">Secured Pieces</h2>
          {order?.orderItems?.map((item, i) => {
            const isItemCancelled = item.itemStatus === "CANCELLED";
            const returnBadgeText = getReturnBadgeConfig(item.itemStatus);
            const { isEligible, daysLeft } = checkReturnEligibility(item.deliveryDate || order?.deliveryDate);
            
            return (
              <motion.div key={item.id || i} variants={fadeUp} initial="hidden" animate="show" custom={3 + i} className={`bg-surface border border-outline-variant/30 flex flex-col sm:flex-row relative ${isItemCancelled ? 'opacity-70' : ''}`}>
                
                {/* Status Badges Overlaid on Image Area */}
                {isItemCancelled && <div className="absolute top-4 left-4 z-10 bg-error text-surface text-[9px] font-label uppercase tracking-widest px-3 py-1 border border-error/50">Cancelled</div>}
                {returnBadgeText && <div className="absolute top-4 left-4 z-10 bg-primary text-on-primary text-[9px] font-label uppercase tracking-widest px-3 py-1">{returnBadgeText}</div>}

                <div 
                  onClick={() => navigate(`/product/${item?.product?.id}`)} 
                  className={`w-full sm:w-40 aspect-[3/4] sm:aspect-auto shrink-0 overflow-hidden cursor-pointer bg-surface-container ${isItemCancelled ? 'grayscale-[80%]' : 'grayscale-[10%] hover:grayscale-0 transition-all duration-700'}`} 
                >
                  <img src={item?.product?.imageUrl} alt={item?.product?.title} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" />
                </div>
                
                <div className="flex-1 p-8 flex flex-col sm:flex-row justify-between gap-6">
                  <div className="space-y-2">
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-outline">{item?.product?.brand}</p>
                    <h3 
                      onClick={() => navigate(`/product/${item?.product?.id}`)} 
                      className={`font-headline text-2xl italic cursor-pointer hover:text-primary transition-colors ${isItemCancelled ? 'text-outline line-through' : 'text-on-surface'}`}
                    >
                      {item?.product?.title}
                    </h3>
                    <div className="pt-2 flex flex-col gap-2">
                      <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Size {item?.size} · Qty {item?.quantity}</span>
                      <span className={`font-body text-xl font-bold ${isItemCancelled ? 'text-outline line-through' : 'text-on-surface'}`}>₹{item?.discountedPrice || item?.price}</span>
                    </div>
                    
                    {item.itemStatus === "DELIVERED" && (
                      <p className={`font-label text-[10px] uppercase tracking-widest pt-4 ${isEligible ? 'text-primary' : 'text-outline'}`}>
                        {isEligible ? `Return window open (${daysLeft} days left)` : "Return window closed"}
                      </p>
                    )}
                  </div>

                  {item.itemStatus === "DELIVERED" && (
                    <div className="flex flex-col items-start sm:items-end justify-end">
                      <button onClick={() => navigate(`/product/${item?.product?.id}/rate`)} className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface border-b border-on-surface pb-1 hover:text-primary hover:border-primary transition-colors">
                        Leave a Narrative
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}