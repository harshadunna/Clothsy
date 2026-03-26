import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CurrencyRupeeIcon, ShoppingBagIcon, UsersIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockItems: [],
    pendingOrders: []
  });
  
  const [chartData, setChartData] = useState({
    weekly: [],
    monthly: [],
    yearly: []
  });

  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState("weekly"); // Toggle state for the chart

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch both endpoints concurrently for speed
        const [dashRes, chartRes] = await Promise.all([
          api.get("/api/admin/analytics/dashboard"),
          api.get("/api/admin/analytics/charts")
        ]);
        
        setDashboardData(dashRes.data);
        setChartData(chartRes.data);
      } catch (error) {
        console.error("Error fetching admin analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-[#fdf8f4]">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin border-[#c8742a]" />
      </div>
    );
  }

  const stats = [
    { name: 'Total Revenue', value: `₹${dashboardData.totalRevenue.toLocaleString('en-IN')}`, icon: CurrencyRupeeIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: 'Total Orders', value: dashboardData.totalOrders, icon: ShoppingBagIcon, color: "text-blue-600", bg: "bg-blue-50" },
    { name: 'Active Customers', value: dashboardData.totalCustomers, icon: UsersIcon, color: "text-purple-600", bg: "bg-purple-50" },
    { name: 'Low Stock Alerts', value: dashboardData.lowStockItems.length, icon: ExclamationTriangleIcon, color: "text-red-600", bg: "bg-red-50" },
  ];

  // Select which data array to pass to the chart based on the toggle
  const activeChartData = chartData[chartView] || [];

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24" style={{ background: "#fdf8f4", minHeight: "100vh" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-[#1a1109]" style={{ fontFamily: "'Georgia', serif" }}>
          Dashboard Overview
        </h1>
        <p className="text-sm mt-1 text-[#9e8d7a]">Live operational metrics and financial analytics.</p>
      </motion.div>

      {/* ── TOP STAT CARDS ── */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <motion.div key={stat.name} variants={itemVariants} className="bg-white p-6 rounded-2xl border border-[#e8ddd5] flex flex-col justify-between hover:shadow-xl transition-shadow shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{stat.name}</p>
                <h3 className="text-2xl font-black text-[#1a1109]">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" strokeWidth={2} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* ── DYNAMIC REVENUE CHART ── */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-[#e8ddd5] shadow-sm p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-black text-gray-900">Revenue Analysis</h2>
            
            {/* Timeframe Toggle Buttons */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit">
              {['weekly', 'monthly', 'yearly'].map((view) => (
                <button
                  key={view}
                  onClick={() => setChartView(view)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    chartView === view 
                      ? "bg-white text-[#c8742a] shadow-sm" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            {activeChartData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400 font-bold text-sm">Loading chart data...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c8742a" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#c8742a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e8e0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e8d7a', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e8d7a', fontWeight: 'bold' }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(200,116,42,0.15)' }}
                    itemStyle={{ color: '#c8742a', fontWeight: '900' }}
                    labelStyle={{ color: '#1a1109', fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#c8742a" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* ── ACTION REQUIRED (PENDING ORDERS) ── */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-[#e8ddd5] shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">Action Required</h2>
            <a href="/admin/orders" className="text-sm font-bold text-[#c8742a] hover:underline">View All</a>
          </div>
          
          {dashboardData.pendingOrders.length === 0 ? (
            <div className="flex-1 border-2 border-dashed border-[#f0e8e0] rounded-xl flex items-center justify-center p-8 bg-gray-50/50">
              <div className="text-center">
                <ShoppingBagIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-500">You are caught up!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: "300px" }}>
              {dashboardData.pendingOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-[#f0e8e0] rounded-xl hover:bg-orange-50/30 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Order #{order.id}</p>
                    <p className={`text-[10px] font-black mt-1 uppercase tracking-widest ${order.status.includes('RETURN') ? 'text-purple-600' : 'text-[#c8742a]'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">₹{order.total?.toLocaleString('en-IN')}</p>
                    <a href="/admin/orders" className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold mt-1 inline-block uppercase tracking-wider">Process &rarr;</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── LOW STOCK ALERTS ── */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-[#e8ddd5] shadow-sm p-6">
        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
          Low Stock Alerts
          <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-md border border-red-100 font-bold">{dashboardData.lowStockItems.length}</span>
        </h2>
        
        {dashboardData.lowStockItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4 font-medium">Inventory levels are healthy.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 rounded-xl border border-[#f0e8e0] transition-colors hover:bg-gray-50">
                <div className="pr-4">
                  <p className="text-[10px] font-black text-[#c8742a] uppercase tracking-wider mb-0.5">{item.brand}</p>
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                </div>
                <div className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-black border ${
                  item.stock <= 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                }`}>
                  {item.stock <= 0 ? 'Sold Out' : `${item.stock} left`}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}