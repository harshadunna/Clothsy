import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import api from "../../config/api";

export default function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ weekly: [], monthly: [], yearly: [] });

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
      <div className="flex justify-center items-center min-h-screen bg-[#FFF8F5]">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#1A1109] animate-spin rounded-none" />
      </div>
    );
  }

  const activeData = chartData[timeframe] || [];

  return (
    <div className="p-12 max-w-[1440px] mx-auto min-h-screen bg-[#FFF8F5]">
      
      <header className="mb-16 border-b border-[#D1C4BC] pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-6xl font-headline italic text-[#1A1109] tracking-tight leading-none mb-4">
            Analytics Ledger
          </h1>
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#C8742A]">
            Financial & Volume Index
          </p>
        </div>
        
        <div className="flex gap-4">
          {["weekly", "monthly", "yearly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeframe(tab)}
              className={`font-label text-[0.65rem] font-bold uppercase tracking-widest pb-1 transition-all ${
                timeframe === tab 
                  ? "border-b border-[#1A1109] text-[#1A1109]" 
                  : "text-[#7F756E] hover:text-[#1A1109]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        
        {/* REVENUE TRAJECTORY */}
        <div className="bg-[#FFF8F5] p-10 border border-[#D1C4BC]">
          <h2 className="font-label text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[#1A1109] mb-10 border-b border-[#1A1109] pb-2">Revenue Trajectory</h2>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1C4BC" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7F756E', fontFamily: 'Inter', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7F756E', fontFamily: 'Inter', fontWeight: 700 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{ stroke: '#1A1109', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#1A1109', borderRadius: '0px', border: 'none', color: '#FFF' }}
                  itemStyle={{ color: '#C8742A', fontWeight: '700', fontSize: '12px', fontFamily: 'Inter' }}
                  labelStyle={{ color: '#FFF', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="linear" dataKey="revenue" stroke="#1A1109" strokeWidth={2} fillOpacity={0.05} fill="#1A1109" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VOLUME METRICS */}
        <div className="bg-[#FFF8F5] p-10 border border-[#D1C4BC]">
          <h2 className="font-label text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[#1A1109] mb-10 border-b border-[#1A1109] pb-2">Logistics Volume</h2>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1C4BC" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7F756E', fontFamily: 'Inter', fontWeight: 700 }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7F756E', fontFamily: 'Inter', fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#F9F2EF' }}
                  contentStyle={{ backgroundColor: '#1A1109', borderRadius: '0px', border: 'none', color: '#FFF' }}
                  itemStyle={{ color: '#C8742A', fontWeight: '700', fontSize: '12px', fontFamily: 'Inter' }}
                  labelStyle={{ color: '#FFF', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  formatter={(value) => [value, 'Dispatches']}
                />
                <Bar dataKey="orders" fill="#C8742A" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}