import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrashIcon, CheckCircleIcon, TruckIcon, CheckIcon, ArrowPathIcon, BuildingStorefrontIcon, CurrencyRupeeIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import api from "../../config/api";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/orders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, action) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/${action}`);
      fetchOrders();
    } catch (error) {
      console.error(`Error updating order to ${action}:`, error);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return;
    try {
      await api.delete(`/api/admin/orders/${orderId}/delete`);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PLACED": return "bg-blue-50 text-blue-600 border-blue-200";
      case "CONFIRMED": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "SHIPPED": return "bg-orange-50 text-orange-600 border-orange-200";
      case "DELIVERED": return "bg-green-50 text-green-600 border-green-200";
      case "CANCELLED": return "bg-red-50 text-red-600 border-red-200";
      case "RETURN_REQUESTED": return "bg-purple-50 text-purple-600 border-purple-200";
      case "RETURN_PICKED": return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "RETURN_RECEIVED": return "bg-teal-50 text-teal-600 border-teal-200";
      case "REFUND_INITIATED": return "bg-pink-50 text-pink-600 border-pink-200";
      case "REFUND_COMPLETED": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
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
      <div className="flex justify-center items-center h-full">
        <div className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }}></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
          Order Management
        </h1>
        <p className="text-sm mt-1" style={{ color: "#9e8d7a" }}>View and process customer orders and returns.</p>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#e8ddd5" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b text-xs uppercase tracking-widest text-gray-500 font-bold" style={{ borderColor: "#e8ddd5" }}>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#f0e8e0" }}>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="font-bold text-gray-900">{order.totalItem}</span> items
                    </td>
                    <td className="px-6 py-4 font-black text-[#c8742a]">
                      ₹{order.totalDiscountedPrice}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus?.replace(/_/g, " ")}
                        </span>
                        {isPartialReturn(order) && (
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                            (Partial Return)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      
                      {order.orderStatus === "PLACED" && (
                        <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-xs font-bold transition-colors">
                          <CheckCircleIcon className="w-4 h-4" /> Confirm
                        </button>
                      )}
                      {order.orderStatus === "CONFIRMED" && (
                        <button onClick={() => updateOrderStatus(order.id, 'ship')} className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-xs font-bold transition-colors">
                          <TruckIcon className="w-4 h-4" /> Ship
                        </button>
                      )}
                      {order.orderStatus === "SHIPPED" && (
                        <button onClick={() => updateOrderStatus(order.id, 'deliver')} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-bold transition-colors">
                          <CheckIcon className="w-4 h-4" /> Deliver
                        </button>
                      )}

                      {order.orderStatus === "RETURN_REQUESTED" && (
                        <button onClick={() => updateOrderStatus(order.id, 'return-picked')} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-xs font-bold transition-colors">
                          <ArrowPathIcon className="w-4 h-4" /> Mark Picked Up
                        </button>
                      )}
                      {order.orderStatus === "RETURN_PICKED" && (
                        <button onClick={() => updateOrderStatus(order.id, 'return-received')} className="flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-lg text-xs font-bold transition-colors">
                          <BuildingStorefrontIcon className="w-4 h-4" /> Receive at Warehouse
                        </button>
                      )}
                      {order.orderStatus === "RETURN_RECEIVED" && (
                        <button onClick={() => updateOrderStatus(order.id, 'refund-initiated')} className="flex items-center gap-1 px-3 py-1.5 bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-lg text-xs font-bold transition-colors">
                          <CurrencyRupeeIcon className="w-4 h-4" /> Initiate Refund
                        </button>
                      )}
                      {order.orderStatus === "REFUND_INITIATED" && (
                        <button onClick={() => updateOrderStatus(order.id, 'refund-completed')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-bold transition-colors">
                          <CheckBadgeIcon className="w-4 h-4" /> Complete Refund
                        </button>
                      )}

                      <button onClick={() => deleteOrder(order.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}