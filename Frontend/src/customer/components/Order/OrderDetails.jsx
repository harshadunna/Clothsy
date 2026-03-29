import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 }
  }
};

const nodeVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
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

  if (loading && !order) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-12 h-12 border-2 border-t-transparent border-primary animate-spin rounded-full"></div>
      </div>
    );
  }

  // Determine Overall States
  const isFullyCancelled = order?.orderStatus === "CANCELLED";
  const orderStatusStr = String(order?.orderStatus || "");
  const isDeliveredOrReturned = orderStatusStr === "DELIVERED" || orderStatusStr.includes("RETURN") || orderStatusStr.includes("REFUND");

  const eligibleItemsForCancellation = order?.orderItems?.filter(item => item.itemStatus !== "CANCELLED" && item.itemStatus !== "DELIVERED" && !String(item.itemStatus).includes("RETURN")) || [];
  
  const eligibleItemsForReturn = order?.orderItems?.filter(item => {
    if (item.itemStatus !== "DELIVERED") return false;
    const { isEligible } = checkReturnEligibility(item.deliveryDate || order.deliveryDate);
    return isEligible;
  }) || [];

  const timelineSteps = ["PLACED", "CONFIRMED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const displayLabels = ["Confirmed", "Tailored", "Dispatched", "In Transit", "Delivered"];
  
  let currentStepIndex = 0;
  if (isDeliveredOrReturned) {
    currentStepIndex = 4; 
  } else {
    const foundIndex = timelineSteps.indexOf(order?.orderStatus);
    currentStepIndex = foundIndex >= 0 ? foundIndex : 0;
  }

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col items-center">
      
      {/* Cancel Items Modal */}
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

      {/* 1. Hero Branding */}
      <section className="max-w-4xl w-full text-center mb-16 relative">
        <button onClick={() => navigate("/account/orders")} className="absolute left-0 top-0 flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Archive
        </button>
        <h1 className="text-5xl md:text-7xl font-headline italic tracking-tight text-on-surface mb-6 mt-8 md:mt-0">
          Where is your Clothsy?
        </h1>
        <p className="font-body text-sm uppercase tracking-[0.2em] text-on-surface-variant opacity-60">
          Order #{order?.id}
        </p>
      </section>

      <div className="max-w-4xl w-full space-y-24">
        
        {/* 2. Interactive Tracker (Horizontal Timeline) */}
        <section className="w-full overflow-hidden px-4">
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            className="relative flex justify-between items-start pt-8"
          >
            {/* Background Line */}
            <div className="absolute top-[41px] left-0 w-full h-[1px] bg-outline-variant/30 -z-10"></div>
            
            {/* Progress Line */}
            {!isFullyCancelled && (
              <motion.div 
                initial={{ scaleX: 0 }} 
                animate={{ scaleX: currentStepIndex / (timelineSteps.length - 1) }} 
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-[41px] left-0 w-full h-[1px] bg-on-surface -z-10 origin-left"
              />
            )}

            {isFullyCancelled ? (
              <div className="w-full text-center py-8">
                <span className="font-headline italic text-3xl text-error">This order has been cancelled.</span>
              </div>
            ) : (
              displayLabels.map((label, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <motion.div key={label} variants={nodeVariants} className="flex flex-col items-center text-center">
                    <div className={`w-6 h-6 mb-4 flex items-center justify-center transition-colors duration-500
                      ${isActive ? 'bg-[#C8742A]' : 'border border-on-surface bg-transparent'}`}
                    >
                      {isCurrent && <div className="w-1.5 h-1.5 bg-white"></div>}
                    </div>
                    <span className={`text-[0.625rem] uppercase tracking-widest font-bold ${isActive ? 'text-[#C8742A]' : 'text-outline'}`}>
                      {label}
                    </span>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </section>

        {/* 3. Shipment Contents (Horizontal Scroll) */}
        <section className="border-t border-outline-variant/30 pt-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-label text-[0.6875rem] uppercase tracking-[0.2em] font-bold text-primary">Shipment Contents</h2>
            
            {/* Top Right Request Return Button (Optional quick access) */}
            {eligibleItemsForReturn.length > 0 && (
              <button 
                onClick={() => navigate(`/account/order/${orderId}/return`)} 
                className="font-label text-[10px] uppercase tracking-widest text-primary border-b border-primary pb-0.5 hover:opacity-70 transition-opacity"
              >
                Request Return
              </button>
            )}
          </div>
          
          <div className="flex gap-12 overflow-x-auto pb-8 snap-x" style={{ scrollbarWidth: 'none' }}>
            {order?.orderItems?.map((item, index) => {
              const isItemCancelled = item.itemStatus === "CANCELLED";
              const returnBadgeText = getReturnBadgeConfig(item.itemStatus);
              
              return (
                <div key={item.id || index} className={`flex items-center gap-6 flex-shrink-0 snap-start w-80 ${isItemCancelled ? 'opacity-50' : ''}`}>
                  <div 
                    onClick={() => navigate(`/product/${item?.product?.id}`)}
                    className="w-24 h-32 bg-surface-container overflow-hidden cursor-pointer relative"
                  >
                    {isItemCancelled && <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10"><span className="text-[8px] font-bold uppercase tracking-widest text-error">Cancelled</span></div>}
                    {returnBadgeText && <div className="absolute top-0 left-0 bg-primary text-surface px-1 py-0.5 z-10"><span className="text-[7px] font-bold uppercase tracking-widest">{returnBadgeText}</span></div>}
                    <img 
                      src={item.product?.imageUrl} 
                      alt={item.product?.title} 
                      className="w-full h-full object-cover grayscale-[20%] hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-label text-[0.625rem] uppercase tracking-[0.2em] text-outline">{item.product?.brand}</p>
                    <h4 
                      onClick={() => navigate(`/product/${item?.product?.id}`)}
                      className="font-headline italic text-xl cursor-pointer hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.product?.title}
                    </h4>
                    <p className="font-label text-[0.625rem] uppercase tracking-widest opacity-60 mt-2">Size: {item.size} / Qty: {item.quantity}</p>
                    
                    {/* Rate product link if delivered */}
                    {(item.itemStatus === "DELIVERED" || String(item.itemStatus).includes("RETURN")) && (
                      <button onClick={() => navigate(`/product/${item?.product?.id}/rate`)} className="mt-4 font-label text-[9px] uppercase tracking-widest text-primary border-b border-primary pb-0.5">
                        Leave Narrative
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Document & Post-Delivery Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          <button 
            onClick={handleDownloadInvoice} 
            disabled={downloading || isFullyCancelled}
            className="w-full border border-on-surface text-on-surface py-6 font-label text-[0.7rem] uppercase tracking-[0.25em] font-bold hover:bg-on-surface hover:text-surface transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {downloading ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : <span className="material-symbols-outlined text-[16px]">receipt_long</span>}
            Invoice
          </button>

          {!isFullyCancelled && !isDeliveredOrReturned && eligibleItemsForCancellation.length > 0 && (
            <button 
              onClick={() => setIsCancelModalOpen(true)}
              className="w-full border border-error text-error py-6 font-label text-[0.7rem] uppercase tracking-[0.25em] font-bold hover:bg-error hover:text-surface transition-all duration-300"
            >
              Cancel Pieces
            </button>
          )}

          {/* RETURN BUTTON LINKED HERE */}
          {eligibleItemsForReturn.length > 0 && (
            <button 
              onClick={() => navigate(`/account/order/${orderId}/return`)}
              className="w-full bg-[#C8742A] text-white py-6 font-label text-[0.7rem] uppercase tracking-[0.25em] font-bold hover:opacity-90 transition-all duration-300"
            >
              Request Return
            </button>
          )}
        </section>

      </div>

      {/* 5. Editorial Accent Image */}
      <div className="mt-32 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-outline-variant/30 pt-16">
        <div className="aspect-[4/5] overflow-hidden bg-surface-container">
          <img 
            src="https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=800&q=80" 
            alt="Close-up of luxury fabric" 
            className="w-full h-full object-cover grayscale-[20%] transition-transform duration-700 hover:scale-105" 
          />
        </div>
        <div className="space-y-6">
          <span className="font-label text-[0.6875rem] uppercase tracking-[0.3em] text-primary block">Atelier Craftsmanship</span>
          <p className="font-headline text-3xl leading-relaxed italic text-on-surface">
            "Every garment is tracked not just by numbers, but by the hands that touched it."
          </p>
          <div className="h-px w-24 bg-primary opacity-30"></div>
          <p className="font-body text-sm text-on-surface-variant leading-loose">
            At Clothsy, our logistical process mirrors our design philosophy: precise, intentional, and transparent. From our atelier to your door, every step is a commitment to quality.
          </p>
        </div>
      </div>
    </div>
  );
}