import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from "../../config/api";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockItems: [],
    pendingOrders: []
  });
  
  const [chartData, setChartData] = useState({ weekly: [], monthly: [], yearly: [] });
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState("weekly");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
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
      <div className="flex justify-center items-center min-h-screen bg-[#FFF8F5]">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#C8742A] animate-spin rounded-none" />
      </div>
    );
  }

  const activeChartData = chartData[chartView] || [];

  return (
    <div className="p-12 max-w-[1440px] mx-auto min-h-screen bg-[#FFF8F5]">
      
      {/* ── HEADER ── */}
      <header className="mb-16 border-b border-[#D1C4BC] pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-headline italic text-[#1A1109] tracking-tight leading-none mb-2">
            Management Hub
          </h1>
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#C8742A]">
            Global Operations Overview
          </p>
        </div>
      </header>

      {/* ── METRICS GRID (No rounded corners, 1px borders) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-[#D1C4BC] mb-16">
        
        <div className="border-r border-b border-[#D1C4BC] p-8 bg-white transition-colors hover:bg-[#F9F2EF]">
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-widest text-[#7F756E] mb-4">Total Revenue</p>
          <h3 className="text-4xl font-headline font-bold text-[#1A1109]">₹{dashboardData.totalRevenue.toLocaleString('en-IN')}</h3>
        </div>

        <div className="border-r border-b border-[#D1C4BC] p-8 bg-white transition-colors hover:bg-[#F9F2EF]">
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-widest text-[#7F756E] mb-4">Total Orders</p>
          <h3 className="text-4xl font-headline font-bold text-[#1A1109]">{dashboardData.totalOrders}</h3>
        </div>

        <div className="border-r border-b border-[#D1C4BC] p-8 bg-white transition-colors hover:bg-[#F9F2EF]">
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-widest text-[#7F756E] mb-4">Active Patrons</p>
          <h3 className="text-4xl font-headline font-bold text-[#1A1109]">{dashboardData.totalCustomers}</h3>
        </div>

        <div className="border-r border-b border-[#D1C4BC] p-8 bg-[#1A1109] text-white">
          <p className="font-label text-[0.65rem] font-bold uppercase tracking-widest opacity-60 mb-4">Action Required</p>
          <h3 className="text-4xl font-headline font-bold text-[#C8742A]">{dashboardData.pendingOrders.length} <span className="text-lg text-white font-body opacity-80">Pending</span></h3>
        </div>

      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-8 border border-[#D1C4BC] bg-white p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-label text-[0.75rem] font-bold tracking-[0.2em] uppercase text-[#1A1109]">Revenue Trajectory</h2>
            <div className="flex gap-4">
              {['weekly', 'monthly', 'yearly'].map((view) => (
                <button
                  key={view}
                  onClick={() => setChartView(view)}
                  className={`font-label text-[0.65rem] font-bold uppercase tracking-widest pb-1 transition-all ${
                    chartView === view 
                      ? "border-b border-[#1A1109] text-[#1A1109]" 
                      : "text-[#7F756E] hover:text-[#1A1109]"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[350px] w-full">
            {activeChartData.length === 0 ? (
               <div className="h-full flex items-center justify-center font-label text-xs tracking-widest uppercase text-[#7F756E]">Loading Chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {/* Changed to type="linear" for sharper architectural lines */}
                <AreaChart data={activeChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E1DE" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7F756E', fontFamily: 'Inter', fontWeight: 700 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7F756E', fontFamily: 'Inter', fontWeight: 700 }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                  <Tooltip 
                    cursor={{ stroke: '#1A1109', strokeWidth: 1 }}
                    contentStyle={{ backgroundColor: '#1A1109', borderRadius: '0px', border: 'none', color: '#FFF' }}
                    itemStyle={{ color: '#C8742A', fontWeight: '700', fontSize: '12px', fontFamily: 'Inter' }}
                    labelStyle={{ color: '#FFF', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', tracking: '0.1em' }}
                  />
                  <Area type="linear" dataKey="revenue" stroke="#1A1109" strokeWidth={2} fillOpacity={0.05} fill="#1A1109" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* LOGISTICS/ALERTS SECTION */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* Low Stock Alerts */}
          <div>
            <h2 className="font-headline text-3xl italic mb-6 border-b border-[#D1C4BC] pb-4">Inventory Alerts</h2>
            {dashboardData.lowStockItems.length === 0 ? (
              <p className="font-label text-[0.65rem] uppercase tracking-widest text-[#7F756E]">All lines optimized.</p>
            ) : (
              <div className="space-y-0 border border-[#D1C4BC]">
                {dashboardData.lowStockItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-5 border-b border-[#D1C4BC] bg-white last:border-b-0">
                    <div>
                      <p className="font-headline text-lg leading-tight truncate w-48">{item.name}</p>
                    </div>
                    <span className="font-label text-[0.6rem] font-black tracking-widest uppercase text-[#BA1A1A]">
                      {item.stock <= 0 ? 'Depleted' : `Qty: ${item.stock}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Logistics */}
          <div>
            <h2 className="font-headline text-3xl italic mb-6 border-b border-[#D1C4BC] pb-4">Pending Logistics</h2>
            {dashboardData.pendingOrders.length === 0 ? (
              <p className="font-label text-[0.65rem] uppercase tracking-widest text-[#7F756E]">All dispatch cleared.</p>
            ) : (
              <div className="space-y-0 border border-[#D1C4BC]">
                {dashboardData.pendingOrders.slice(0, 4).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-5 border-b border-[#D1C4BC] bg-white hover:bg-[#F9F2EF] transition-colors last:border-b-0 cursor-pointer" onClick={() => navigate('/admin/orders')}>
                    <div>
                      <p className="font-label text-[0.65rem] font-bold tracking-[0.1em] text-[#7F756E] uppercase mb-1">Order #{order.id}</p>
                      <p className="font-headline text-lg">₹{order.total?.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="material-symbols-outlined text-[#1A1109] opacity-40">arrow_forward</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}