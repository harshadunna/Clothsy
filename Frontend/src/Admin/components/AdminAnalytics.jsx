import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import api from "../../config/api";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

export default function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    weekly: [],
    monthly: [],
    yearly: []
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await api.get("/api/admin/analytics/charts");
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#fdf0e6", borderTopColor: "#c8742a" }}></div>
      </div>
    );
  }

  const activeData = chartData[timeframe] || [];

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
            Financial Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9e8d7a" }}>Deep dive into your actual revenue and sales metrics.</p>
        </div>
        
        {/* The BI Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          {["weekly", "monthly", "yearly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeframe(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                timeframe === tab ? "bg-white text-[#c8742a] shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Area Chart */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: "#e8ddd5" }}>
          <h2 className="text-lg font-black text-gray-900 mb-6">Revenue Trend</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c8742a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c8742a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e8e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e8d7a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e8d7a' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#c8742a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Orders Bar Chart */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: "#e8ddd5" }}>
          <h2 className="text-lg font-black text-gray-900 mb-6">Order Volume</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e8e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e8d7a' }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9e8d7a' }} />
                <Tooltip 
                  cursor={{ fill: '#fdf8f4' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(value) => [value, 'Orders']}
                />
                <Bar dataKey="orders" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}