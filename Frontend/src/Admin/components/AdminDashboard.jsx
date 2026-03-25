import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CurrencyRupeeIcon, ShoppingBagIcon, UsersIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import api from "../../config/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AdminDashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockItems: [],
    pendingOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/api/admin/analytics/dashboard");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }}></div>
      </div>
    );
  }

  const stats = [
    { name: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString('en-IN')}`, icon: CurrencyRupeeIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: 'Total Orders', value: data.totalOrders, icon: ShoppingBagIcon, color: "text-blue-600", bg: "bg-blue-50" },
    { name: 'Active Customers', value: data.totalCustomers, icon: UsersIcon, color: "text-purple-600", bg: "bg-purple-50" },
    { name: 'Low Stock Alerts', value: data.lowStockItems.length, icon: ExclamationTriangleIcon, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
          Dashboard Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: "#9e8d7a" }}>Welcome back. Here is your live operational data.</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <motion.div key={stat.name} variants={itemVariants} className="bg-white p-6 rounded-2xl border flex flex-col justify-between" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.05)" }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{stat.name}</p>
                <h3 className="text-2xl font-black text-[#1a1109]">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders - Action Required */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6 flex flex-col" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.03)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">Action Required (Pending Orders)</h2>
            <a href="/admin/orders" className="text-sm font-bold text-[#c8742a] hover:underline">View All</a>
          </div>
          
          {data.pendingOrders.length === 0 ? (
            <div className="flex-1 border-2 border-dashed rounded-xl flex items-center justify-center p-12" style={{ borderColor: "#f0e8e0", background: "#fdfdfc" }}>
              <div className="text-center">
                <ShoppingBagIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-500">You are all caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No pending orders require action right now.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {data.pendingOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors" style={{ borderColor: "#f0e8e0" }}>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Order #{order.id}</p>
                    <p className="text-xs font-semibold mt-1 text-[#c8742a] uppercase tracking-wider">{order.status?.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₹{order.total?.toLocaleString('en-IN')}</p>
                    <a href="/admin/orders" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold mt-1 inline-block">Process &rarr;</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.03)" }}>
          <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
            Low Stock Alerts
            <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-md border border-red-100">{data.lowStockItems.length}</span>
          </h2>
          
          {data.lowStockItems.length === 0 ? (
             <p className="text-sm text-gray-500 text-center py-8">Inventory levels are healthy.</p>
          ) : (
            <div className="space-y-4">
              {data.lowStockItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3.5 rounded-xl border transition-colors hover:bg-gray-50" style={{ borderColor: "#f0e8e0" }}>
                  <div className="pr-4">
                    <p className="text-[10px] font-bold text-[#c8742a] uppercase tracking-wider mb-0.5">{item.brand}</p>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                  </div>
                  <div className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-black border ${
                    item.stock <= 0 
                      ? 'bg-red-50 text-red-700 border-red-100' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                  }`}>
                    {item.stock <= 0 ? 'Sold Out' : `${item.stock} left`}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <a href="/admin/products" className="block text-center w-full mt-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            Manage Inventory
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}