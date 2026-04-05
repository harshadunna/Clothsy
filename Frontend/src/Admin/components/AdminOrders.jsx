import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../config/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const highlightRef = useRef(null);

  // Grab the order ID to highlight from the router state (passed from Dashboard)
  const highlightOrderId = location.state?.highlightOrderId || null;
 
  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const { data } = await api.get("/api/admin/orders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load with the spinner
    fetchOrders(true);

    // Auto-refresh (Live Polling): Fetch new data silently every 10 seconds
    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Effect to scroll to the highlighted order once the orders load
  useEffect(() => {
    if (!loading && highlightOrderId && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); 
    }
  }, [loading, highlightOrderId]);

  const updateOrderStatus = async (orderId, action) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/${action}`);
      // Fetch fresh data silently so the screen doesn't blank out
      fetchOrders(false);
    } catch (error) {
      console.error(`Error updating order to ${action}:`, error);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("CONFIRM DELETION: Permanently erase this logistics record?")) return;
    try {
      await api.delete(`/api/admin/orders/${orderId}/delete`);
      // Fetch fresh data silently
      fetchOrders(false);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const isPartialReturn = (order) => {
    if (!order.orderItems) return false;
    const returnStatuses = ["RETURN_REQUESTED", "RETURN_PICKED", "RETURN_RECEIVED", "REFUND_INITIATED", "REFUND_COMPLETED"];
    const hasReturns = order.orderItems.some(item => returnStatuses.includes(item.itemStatus));
    const hasKept = order.orderItems.some(item => item.itemStatus === "DELIVERED");
    return hasReturns && hasKept;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFF8F5]">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#1A1109] animate-spin rounded-none" />
      </div>
    );
  }

  return (
    <div className="p-12 max-w-[1440px] mx-auto min-h-screen bg-[#FFF8F5]">
      
      {/* INJECT CUSTOM BLINK ANIMATION */}
      <style>{`
        @keyframes blink-row {
          0% { background-color: transparent; }
          25% { background-color: #F2DFD1; } /* Tobacco accent low opacity */
          50% { background-color: transparent; }
          75% { background-color: #F2DFD1; }
          100% { background-color: transparent; }
        }
        .animate-blink {
          animation: blink-row 2.5s ease-in-out;
        }
      `}</style>

      {/* HEADER */}
      <div className="flex justify-between items-end mb-16 border-b border-[#D1C4BC] pb-8">
        <div>
          <h1 className="text-6xl font-headline italic text-[#1A1109] tracking-tight leading-none mb-4">
            Order Logistics
          </h1>
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#C8742A]">
            Global Shipping Manifest
          </p>
        </div>
      </div>

      {/* BRUTALIST LEDGER */}
      <div className="bg-[#FFF8F5] border-t-2 border-[#1A1109]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D1C4BC] bg-[#F9F2EF]">
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">Dispatch ID</th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">Client</th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">Volume</th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">Value</th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase">State</th>
              <th className="py-4 px-6 font-label text-[0.65rem] font-black tracking-[0.1em] text-[#7F756E] uppercase text-right">Directives</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center font-label text-[0.75rem] tracking-widest uppercase text-[#7F756E]">No active dispatches.</td>
              </tr>
            ) : (
              orders.map((order) => {
                // Get image from first item for the editorial thumbnail look
                const previewImg = order.orderItems?.[0]?.product?.imageUrl;
                
                // Check if this is the row we need to highlight
                const isHighlighted = order.id === highlightOrderId;

                return (
                  <tr 
                    key={order.id} 
                    ref={isHighlighted ? highlightRef : null}
                    className={`border-b border-[#D1C4BC] hover:bg-[#F9F2EF] transition-colors group ${isHighlighted ? 'animate-blink' : ''}`}
                  >
                    
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-6">
                        {previewImg && (
                          <div className="w-12 h-16 bg-[#F3ECEA] overflow-hidden rounded-none shrink-0 border border-[#D1C4BC]">
                            <img src={previewImg} alt="Preview" className="w-full h-full object-cover transition-all duration-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#C8742A] mb-1">ORD-{order.id}</p>
                          <p className="font-label text-[0.6rem] font-bold uppercase tracking-widest text-[#7F756E]">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-6 px-6">
                      <p className="font-headline text-xl text-[#1A1109] line-clamp-1">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="font-label text-[0.65rem] font-bold uppercase tracking-widest text-[#7F756E]">{order.user?.email}</p>
                    </td>

                    <td className="py-6 px-6 font-label text-[0.75rem] font-black tracking-widest text-[#1A1109]">
                      {order.totalItem} <span className="text-[0.6rem] text-[#7F756E]">UNITS</span>
                    </td>

                    <td className="py-6 px-6 font-headline text-xl font-bold text-[#1A1109]">
                      ₹{order.totalDiscountedPrice?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-6 px-6">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-3 py-1 font-label text-[0.6rem] font-black uppercase tracking-widest border ${
                          order.orderStatus === "DELIVERED" ? "border-[#1A1109] text-[#1A1109]" :
                          order.orderStatus === "CANCELLED" ? "border-[#BA1A1A] text-[#BA1A1A] bg-[#FFDAD6]/30" :
                          order.orderStatus === "SHIPPED" ? "border-[#C8742A] text-[#C8742A] bg-[#C8742A]/10" :
                          "border-[#D1C4BC] text-[#7F756E]"
                        }`}>
                          {order.orderStatus?.replace(/_/g, " ")}
                        </span>
                        {isPartialReturn(order) && (
                          <span className="font-label text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#7F756E] mt-1">
                            (Partial Return)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-6 px-6 text-right">
                      <div className="flex flex-wrap justify-end gap-3">
                        {order.orderStatus === "PLACED" && (
                          <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="border border-[#1A1109] text-[#1A1109] hover:bg-[#1A1109] hover:text-[#FFF8F5] px-4 py-2 font-label text-[0.6rem] font-black uppercase tracking-widest transition-colors">Confirm</button>
                        )}
                        {order.orderStatus === "CONFIRMED" && (
                          <button onClick={() => updateOrderStatus(order.id, 'ship')} className="border border-[#C8742A] text-[#C8742A] hover:bg-[#C8742A] hover:text-[#FFF8F5] px-4 py-2 font-label text-[0.6rem] font-black uppercase tracking-widest transition-colors">Dispatch</button>
                        )}
                        {order.orderStatus === "SHIPPED" && (
                          <button onClick={() => updateOrderStatus(order.id, 'deliver')} className="bg-[#1A1109] text-[#FFF8F5] px-4 py-2 font-label text-[0.6rem] font-black uppercase tracking-widest hover:bg-[#C8742A] transition-colors">Deliver</button>
                        )}

                        {/* Returns Process */}
                        {order.orderStatus === "RETURN_REQUESTED" && (
                          <button onClick={() => updateOrderStatus(order.id, 'return-picked')} className="border border-[#1A1109] text-[#1A1109] px-4 py-2 font-label text-[0.6rem] font-black uppercase tracking-widest hover:bg-[#1A1109] hover:text-[#FFF8F5] transition-colors">Mark Picked</button>
                        )}
                        {order.orderStatus === "RETURN_PICKED" && (
                          <button onClick={() => updateOrderStatus(order.id, 'return-received')} className="border border-[#1A1109] text-[#1A1109] px-4 py-2 font-label text-[0.6rem] font-black uppercase tracking-widest hover:bg-[#1A1109] hover:text-[#FFF8F5] transition-colors">Warehouse Recv</button>
                        )}
                        {order.orderStatus === "RETURN_RECEIVED" && (
                          <button onClick={() => updateOrderStatus(order.id, 'refund-initiated')} className="border border-[#C8742A] text-[#C8742A] px-4 py-2 font-label text-[0.6rem] font-black uppercase tracking-widest hover:bg-[#C8742A] hover:text-[#FFF8F5] transition-colors">Init Refund</button>
                        )}
                        {order.orderStatus === "REFUND_INITIATED" && (
                          <button onClick={() => updateOrderStatus(order.id, 'refund-completed')} className="bg-[#1A1109] text-[#FFF8F5] px-4 py-2 font-label text-[0.6rem] font-black uppercase tracking-widest hover:bg-[#C8742A] transition-colors">End Refund</button>
                        )}

                        <button onClick={() => deleteOrder(order.id)} className="font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#BA1A1A] hover:opacity-60 transition-opacity ml-2">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}