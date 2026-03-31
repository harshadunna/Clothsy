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
    window.scrollTo(0, 0);
  }, [orderId]);

  // Set an interval to auto-refresh the order every 10 seconds while it is active in transit
  useEffect(() => {
    if (order && (order.orderStatus === "SHIPPED" || order.orderStatus === "OUT_FOR_DELIVERY")) {
      const interval = setInterval(() => {
        fetchOrder();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [order?.orderStatus]);

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
      <div className="min-h-screen flex justify-center items-center bg-[#FFF8F5]">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#1A1109] animate-spin rounded-full"></div>
      </div>
    );
  }

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
    <div className="bg-[#FFF8F5] text-[#1A1109] font-body min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col items-center selection:bg-[#C8742A] selection:text-[#FFF8F5]">

      {/* Cancel Items Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1109]/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-[#FFF8F5] border border-[#D1C4BC] shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-8 border-b border-[#D1C4BC]">
                <h3 className="text-3xl font-headline italic tracking-tighter text-[#1A1109]">Cancel Silhouette</h3>
                <p className="font-label text-[10px] uppercase tracking-widest text-[#7F756E] mt-2">Select pieces to remove from order.</p>
              </div>
              <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4">
                {eligibleItemsForCancellation.length === 0 ? (
                  <p className="text-center font-label text-[10px] uppercase tracking-widest text-[#7F756E] py-4">No eligible pieces to cancel.</p>
                ) : (
                  eligibleItemsForCancellation.map((item) => (
                    <label key={item.id} className="flex items-center gap-6 p-4 border border-[#D1C4BC] hover:border-[#1A1109] transition-colors cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 border-[#D1C4BC] text-[#1A1109] focus:ring-0 rounded-none cursor-pointer" checked={selectedItemsToCancel.includes(item.id)} onChange={() => setSelectedItemsToCancel(p => p.includes(item.id) ? p.filter(id => id !== item.id) : [...p, item.id])} />
                      <img src={item.product?.imageUrl} alt={item.product?.title} className="w-12 h-16 object-cover object-top bg-[#E8E1DE] grayscale-[20%]" />
                      <div className="flex-1"><p className="text-sm font-bold text-[#1A1109] truncate font-headline italic">{item.product?.title}</p></div>
                    </label>
                  ))
                )}
              </div>
              <div className="p-8 border-t border-[#D1C4BC] flex gap-4 bg-[#E8E1DE]">
                <button onClick={() => { setIsCancelModalOpen(false); setSelectedItemsToCancel([]); }} className="flex-1 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-[#1A1109] border border-[#D1C4BC] hover:bg-[#D1C4BC] transition-colors">Abort</button>
                <button onClick={handleCancelSubmit} disabled={selectedItemsToCancel.length === 0 || cancelLoading} className="flex-1 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-[#FFF8F5] bg-red-800 hover:bg-red-700 disabled:opacity-50 transition-colors">
                  {cancelLoading ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="max-w-4xl w-full text-center mb-16 relative">
        <button onClick={() => navigate("/account/orders")} className="absolute left-0 top-0 flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-[#7F756E] hover:text-[#C8742A] transition-colors font-bold">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Archive
        </button>
        <h1 className="text-5xl md:text-7xl font-headline italic tracking-tighter text-[#1A1109] mb-6 mt-8 md:mt-0">
          Where is your Clothsy?
        </h1>
        <p className="font-body text-sm uppercase tracking-[0.2em] text-[#7F756E] font-bold">
          Order #{order?.id}
        </p>
      </section>

      <div className="max-w-4xl w-full space-y-24">

        <section className="w-full overflow-hidden px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative flex justify-between items-start pt-8"
          >
            <div className="absolute top-[41px] left-0 w-full h-[1px] bg-[#D1C4BC] -z-10"></div>

            {!isFullyCancelled && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: currentStepIndex / (timelineSteps.length - 1) }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-[41px] left-0 w-full h-[1px] bg-[#1A1109] -z-10 origin-left"
              />
            )}

            {isFullyCancelled ? (
              <div className="w-full text-center py-8">
                <span className="font-headline italic text-3xl text-red-800">This order has been cancelled.</span>
              </div>
            ) : (
              displayLabels.map((label, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <motion.div key={label} variants={nodeVariants} className="flex flex-col items-center text-center">
                    <div className={`w-6 h-6 mb-4 flex items-center justify-center transition-colors duration-500
                      ${isActive ? 'bg-[#1A1109]' : 'border border-[#D1C4BC] bg-[#FFF8F5]'}`}
                    >
                      {isCurrent && <div className="w-1.5 h-1.5 bg-[#FFF8F5]"></div>}
                    </div>
                    <span className={`text-[0.625rem] uppercase tracking-widest font-black ${isActive ? 'text-[#1A1109]' : 'text-[#7F756E]'}`}>
                      {label}
                    </span>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </section>

        {/* AUTOMATED LOGISTICS TRACKING LOG */}
        {order?.trackingNumber && (
          <section className="w-full">
            <div className="bg-[#F9F2EF] p-8 border border-[#D1C4BC] flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="w-full md:w-1/3">
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#7F756E] font-bold mb-2">Tracking Registry</p>
                <p className="font-headline italic text-3xl text-[#1A1109] tracking-tighter">{order.trackingNumber}</p>
                {order.orderStatus === "SHIPPED" || order.orderStatus === "OUT_FOR_DELIVERY" ? (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                    <span className="font-label text-[9px] uppercase tracking-widest text-green-700 font-bold">Active Transit</span>
                  </div>
                ) : null}
              </div>
              
              <div className="w-full md:w-2/3 border-l border-[#D1C4BC] pl-0 md:pl-8">
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-[#7F756E] font-bold mb-6">Logistics Ledger</p>
                <div className="max-h-56 overflow-y-auto pr-4 space-y-6" style={{ scrollbarWidth: 'thin' }}>
                  {[...(order.trackingHistory || [])].reverse().map((entry, idx) => {
                    const [timestampStr, message] = entry.split("|");
                    const dateObj = new Date(timestampStr);
                    const formattedDate = dateObj.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
                    
                    return (
                      <div key={idx} className="flex gap-6 items-start relative">
                        <div className="w-24 shrink-0 font-label text-[9px] uppercase tracking-widest text-[#7F756E] pt-1">
                          {formattedDate}
                        </div>
                        <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-[#C8742A]">
                          <div className="font-body text-sm text-[#1A1109]">{message}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="border-t border-[#D1C4BC] pt-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-label text-[0.6875rem] uppercase tracking-[0.2em] font-black text-[#7F756E]">
              Shipment Contents
            </h2>

            <div className="flex gap-6">
              {eligibleItemsForReturn.length > 0 && (
                <button
                  onClick={() => navigate(`/account/order/${orderId}/return`)}
                  className="font-label text-[10px] uppercase tracking-[0.2em] text-[#1A1109] font-black border-b border-[#1A1109] hover:text-[#C8742A] hover:border-[#C8742A] pb-0.5 transition-colors"
                >
                  Request Return
                </button>
              )}

              {order?.orderItems?.some(item => String(item.itemStatus).includes("RETURN")) && (
                <button
                  onClick={() => navigate(`/returns`)}
                  className="font-label text-[10px] uppercase tracking-[0.2em] text-[#C8742A] font-black border-b border-[#C8742A] pb-0.5 transition-colors"
                >
                  Track Returns
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-12 overflow-x-auto pb-8 snap-x" style={{ scrollbarWidth: 'none' }}>
            {order?.orderItems?.map((item, index) => {
              const isItemCancelled = item.itemStatus === "CANCELLED";
              const returnBadgeText = getReturnBadgeConfig(item.itemStatus);

              return (
                <div
                  key={item.id || index}
                  className={`flex items-center gap-6 flex-shrink-0 snap-start w-80 ${isItemCancelled ? 'opacity-50' : ''
                    }`}
                >
                  <div
                    onClick={() => navigate(`/product/${item?.product?.id}`)}
                    className="w-24 h-32 bg-[#E8E1DE] overflow-hidden cursor-pointer relative"
                  >
                    {isItemCancelled && (
                      <div className="absolute inset-0 bg-[#FFF8F5]/50 flex items-center justify-center z-10">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-red-800">
                          Cancelled
                        </span>
                      </div>
                    )}
                    {returnBadgeText && (
                      <div className="absolute top-0 left-0 bg-[#1A1109] text-[#FFF8F5] px-1 py-0.5 z-10">
                        <span className="text-[7px] font-bold uppercase tracking-widest">
                          {returnBadgeText}
                        </span>
                      </div>
                    )}
                    <img
                      src={item.product?.imageUrl}
                      alt={item.product?.title}
                      className="w-full h-full object-cover object-top grayscale-[15%] hover:grayscale-0 hover:scale-105 transition-transform duration-[1.5s]"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="font-label text-[0.625rem] uppercase tracking-[0.2em] text-[#7F756E] font-bold">
                      {item.product?.brand}
                    </p>

                    <h4
                      onClick={() => navigate(`/product/${item?.product?.id}`)}
                      className="font-headline italic text-xl cursor-pointer hover:text-[#C8742A] transition-colors line-clamp-2 text-[#1A1109]"
                    >
                      {item.product?.title}
                    </h4>

                    <p className="font-label text-[0.625rem] uppercase tracking-widest text-[#7F756E] font-bold mt-2">
                      Size: {item.size} / Qty: {item.quantity}
                    </p>

                    {(item.itemStatus === "DELIVERED" || String(item.itemStatus).includes("RETURN")) && (
                      <button
                        onClick={() => navigate(`/product/${item?.product?.id}/rate`)}
                        className="mt-4 font-label text-[9px] uppercase tracking-widest text-[#1A1109] border-b border-[#1A1109] font-black pb-0.5 hover:text-[#C8742A] hover:border-[#C8742A] transition-colors"
                      >
                        Leave Narrative
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading || isFullyCancelled}
            className="w-full border border-[#1A1109] text-[#1A1109] py-6 font-label text-[0.7rem] uppercase tracking-[0.2em] font-black hover:bg-[#1A1109] hover:text-[#FFF8F5] transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {downloading ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : <span className="material-symbols-outlined text-[16px]">receipt_long</span>}
            Invoice
          </button>

          {!isFullyCancelled && !isDeliveredOrReturned && eligibleItemsForCancellation.length > 0 && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="w-full border border-red-800 text-red-800 py-6 font-label text-[0.7rem] uppercase tracking-[0.2em] font-black hover:bg-red-800 hover:text-[#FFF8F5] transition-all duration-300"
            >
              Cancel Pieces
            </button>
          )}

          {eligibleItemsForReturn.length > 0 && (
            <button
              onClick={() => navigate(`/account/order/${orderId}/return`)}
              className="w-full bg-[#1A1109] text-[#FFF8F5] py-6 font-label text-[0.7rem] uppercase tracking-[0.2em] font-black hover:bg-[#C8742A] transition-all duration-300"
            >
              Request Return
            </button>
          )}
        </section>

      </div>

      <div className="mt-32 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-[#D1C4BC] pt-16">
        <div className="aspect-[4/5] overflow-hidden bg-[#E8E1DE]">
          <img
            src="https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=800&q=80"
            alt="Close-up of luxury fabric"
            className="w-full h-full object-cover grayscale-[15%] transition-transform duration-[1.5s] hover:scale-105"
          />
        </div>
        <div className="space-y-6">
          <span className="font-label text-[0.65rem] uppercase tracking-[0.3em] font-bold text-[#7F756E] block">Atelier Craftsmanship</span>
          <p className="font-headline text-3xl leading-relaxed italic text-[#1A1109] tracking-tight">
            "Every garment is tracked not just by numbers, but by the hands that touched it."
          </p>
          <div className="h-px w-24 bg-[#C8742A] opacity-50"></div>
          <p className="font-body text-sm text-[#7F756E] leading-loose">
            At Clothsy, our logistical process mirrors our design philosophy: precise, intentional, and transparent. From our atelier to your door, every step is a commitment to quality.
          </p>
        </div>
      </div>
    </div>
  );
}