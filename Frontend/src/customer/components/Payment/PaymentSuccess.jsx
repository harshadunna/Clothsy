import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import api from "../../../config/api";
import { clearCart } from "../../../Redux/Customers/Cart/Action";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("updating");
  const [orderData, setOrderData] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("order_id");

  useEffect(() => {
    dispatch(clearCart());

    if (orderId) {
      const fetchOrderDetails = async () => {
        // Wait 1.5s for webhooks/DB synchronization
        setTimeout(async () => {
          try {
            const res = await api.get(`/api/orders/${orderId}`);
            setOrderData(res.data);
            setStatus("success");
          } catch (err) {
            console.error("Order synchronization in progress...");
            setStatus("error");
          }
        }, 1500);
      };
      fetchOrderDetails();
    }
  }, [orderId, dispatch]);

  const getExpectedArrival = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/api/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Clothsy_Invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Invoice generation failed:", error);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6 bg-background">
      <AnimatePresence mode="wait">
        
        {/* ── Loading State ── */}
        {status === "updating" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <div className="w-12 h-12 border-2 border-t-transparent border-primary animate-spin mb-8 mx-auto"></div>
            <h1 className="font-headline italic text-3xl text-on-surface">Securing the Silhouette...</h1>
            <p className="font-label text-[10px] uppercase tracking-widest text-outline mt-2">Verifying architectural transaction</p>
          </motion.div>
        )}

        {/* ── Error State ── */}
        {status === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-error mb-6">error_outline</span>
            <h1 className="font-headline italic text-4xl text-on-surface mb-4">Processing Delay</h1>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">Payment was received, but the archive registry is updating. Your order will appear in your profile shortly.</p>
            <button onClick={() => navigate("/account/orders")} className="mt-8 font-label text-[10px] uppercase tracking-widest text-primary border-b border-primary pb-1">View Archive</button>
          </motion.div>
        )}

        {/* ── Success State ── */}
        {status === "success" && (
          <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-5xl">
            
            {/* Header */}
            <div className="text-center mb-16">
              <div className="mb-8 flex justify-center">
                <span className="material-symbols-outlined text-8xl text-primary" style={{ fontVariationSettings: "'wght' 200" }}>check_circle</span>
              </div>
              <h1 className="font-headline italic text-5xl md:text-7xl text-on-surface mb-6 tracking-tight">Your wardrobe is waiting</h1>
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-outline">Order #{orderId} • SECURED & VERIFIED</p>
            </div>

            {/* Receipt Content Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 p-8 md:p-12 shadow-[0_20px_80px_rgba(35,26,17,0.04)] mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                
                {/* Items Summary */}
                <div className="space-y-8">
                  <h3 className="font-label uppercase tracking-[0.2em] text-xs font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">Manifest</h3>
                  {orderData?.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-center">
                      <div className="w-24 h-32 bg-surface-container overflow-hidden flex-shrink-0">
                        <img src={item.product?.imageUrl} alt={item.product?.title} className="w-full h-full object-cover grayscale-[20%]" />
                      </div>
                      <div className="pt-1">
                        <p className="font-headline italic text-xl text-on-surface">{item.product?.title}</p>
                        <p className="font-label text-[10px] uppercase tracking-widest text-outline mt-1">{item.product?.brand} / {item.size}</p>
                        <p className="font-body text-sm mt-2 font-bold">{item.quantity} × ₹{item.discountedPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Logistics & Totals */}
                <div className="flex flex-col justify-between">
                  <div className="space-y-10">
                    <div>
                      <h3 className="font-label uppercase tracking-[0.2em] text-xs font-bold text-on-surface mb-4">Destination</h3>
                      <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                        {orderData?.shippingAddress?.firstName} {orderData?.shippingAddress?.lastName}<br/>
                        {orderData?.shippingAddress?.streetAddress}<br/>
                        {orderData?.shippingAddress?.city}, {orderData?.shippingAddress?.state} {orderData?.shippingAddress?.zipCode}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-label uppercase tracking-[0.2em] text-xs font-bold text-on-surface mb-4">Estimated Arrival</h3>
                      <p className="font-headline italic text-xl text-primary">{getExpectedArrival()}</p>
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-outline-variant/30 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-label uppercase tracking-widest text-[10px] text-outline">Subtotal</span>
                      <span className="font-body font-bold">₹{orderData?.totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-label uppercase tracking-widest text-[10px] text-outline">Shipping</span>
                      <span className="font-label uppercase text-[10px] tracking-widest text-primary">Complimentary</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-outline-variant/30">
                      <span className="font-label uppercase tracking-[0.2em] text-xs font-bold text-on-surface">Total Secured</span>
                      <span className="font-headline italic text-4xl text-on-surface">₹{orderData?.totalDiscountedPrice}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
              <button 
                onClick={() => navigate("/")}
                className="bg-stone-900 text-stone-50 font-label uppercase tracking-[0.2em] text-[11px] px-12 py-5 hover:bg-primary transition-all duration-500 w-full md:w-auto text-center font-bold"
              >
                Continue Selection
              </button>
              <button 
                onClick={handleDownloadInvoice}
                className="border border-outline-variant text-on-surface font-label uppercase tracking-[0.2em] text-[11px] px-12 py-5 hover:bg-surface-container transition-all duration-500 w-full md:w-auto text-center font-bold"
              >
                Archive Invoice (PDF)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}