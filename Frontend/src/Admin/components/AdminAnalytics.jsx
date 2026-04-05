import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../config/api";

// Helpers

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (isoString) => {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    const month = d.toLocaleString("en-IN", { month: "short" }).toUpperCase();
    return `${month} ${d.getDate()}, ${d.toTimeString().slice(0, 5)}`;
  } catch {
    return "—";
  }
};

const statusStyle = (status) => {
  switch (status) {
    case "DELIVERED":        return "bg-[#1A1109] text-white";
    case "SHIPPED":          return "bg-[#924C00] text-white";
    case "CONFIRMED":        return "bg-[#4D453F] text-white";
    case "PLACED":           return "border border-[#7F756E] text-[#4D453F]";
    case "CANCELLED":        return "border border-[#BA1A1A] text-[#BA1A1A]";
    case "RETURN_REQUESTED":
    case "RETURNED":         return "border border-[#924C00] text-[#924C00]";
    default:                 return "border border-[#D1C4BC] text-[#7F756E]";
  }
};

const humanStatus = (s) => (s ? s.replace(/_/g, " ") : "—");

// Framer variants

const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 18 } },
};

// Subtle KPI number cross-fade when timeframe changes
const kpiVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// Custom Chart Tooltip

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1109] text-[#FFF8F5] px-4 py-3 text-xs font-bold font-label border-l-2 border-[#924C00]">
        <p className="tracking-widest uppercase opacity-60 mb-1">{label}</p>
        <p className="text-[#C8742A]">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// Skeleton loader for KPI cards 

const KpiSkeleton = () => (
  <div className="h-8 w-28 bg-[#E8E1DE] animate-pulse" />
);

// Main Component 

export default function AdminAnalytics() {
  const navigate = useNavigate();

  const [metrics, setMetrics]         = useState(null);
  const [charts, setCharts]           = useState({ weekly: [], monthly: [], yearly: [] });
  const [timeframe, setTimeframe]     = useState("monthly");
  const [kpiLoading, setKpiLoading]   = useState(true);  
  const [chartsLoading, setChartsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true); 

  // Fetch dashboard
  const fetchDashboard = useCallback(async (tf, isInitial = false) => {
    if (!isInitial) setKpiLoading(true);
    try {
      const { data } = await api.get(`/api/admin/analytics/dashboard?timeframe=${tf}`);
      setMetrics(data);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setKpiLoading(false);
      if (isInitial) setPageLoading(false);
    }
  }, []);

  // Fetch charts once on mount
  const fetchCharts = useCallback(async () => {
    try {
      const { data } = await api.get("/api/admin/analytics/charts");
      setCharts(data);
    } catch (err) {
      console.error("Charts fetch failed:", err);
    } finally {
      setChartsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard("monthly", true);
    fetchCharts();
  }, []);

  const handleTimeframeChange = (tf) => {
    if (tf === timeframe) return;
    setTimeframe(tf);
    fetchDashboard(tf, false);
  };

  // Navigation helpers
  const goToProduct = (productId) => {
    navigate("/admin/products", { state: { highlightProductId: productId } });
  };

  const goToOrder = (orderId) => {
    navigate("/admin/orders", { state: { highlightOrderId: orderId } });
  };

  // Full-page loader
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFF8F5]">
        <div className="w-10 h-10 border-[1.5px] border-t-transparent border-[#1A1109] animate-spin" />
      </div>
    );
  }

  // Category bar widths
  const catRevenues    = metrics?.categoryRevenue || [];
  const maxCatRevenue  = catRevenues.length > 0 ? Math.max(...catRevenues.map((c) => c.revenue)) : 1;

  // Status bar widths
  const statusDist     = metrics?.orderStatusDistribution || [];
  const maxStatusCount = statusDist.length > 0 ? Math.max(...statusDist.map((s) => Number(s.count))) : 1;

  const timeframeLabel = { weekly: "THIS WEEK", monthly: "THIS MONTH", yearly: "THIS YEAR" };

  return (
    <div className="min-h-screen pb-24 bg-[#FFF8F5] text-[#1D1B1A]">

      {/* Top Nav */}
      <header className="flex justify-between items-center w-full px-12 py-4 h-20 border-b border-[#D1C4BC] sticky top-0 bg-[#FFF8F5]/90 backdrop-blur-md z-40">
        <span className="font-label uppercase font-bold tracking-[0.05em] text-xs text-[#1D1B1A] opacity-40">
          Section / Intelligence
        </span>
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-[#1D1B1A]">notifications</span>
          <span className="material-symbols-outlined text-[#1D1B1A]">account_circle</span>
        </div>
      </header>

      {/* Canvas */}
      <motion.div
        className="px-12 py-12 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >

        {/* Page Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
        >
          <div>
            <h2 className="font-headline italic text-6xl md:text-8xl text-[#000000] leading-none mb-2">
              The Intelligence.
            </h2>
            <p className="font-label uppercase font-black tracking-[0.2em] text-xs text-[#7F756E]">
              PLATFORM METRICS &amp; REVENUE INTELLIGENCE
            </p>
          </div>

          {/* Timeframe switcher */}
          <div className="flex border border-[#D1C4BC]">
            {[
              { key: "weekly",  label: "This Week"  },
              { key: "monthly", label: "This Month" },
              { key: "yearly",  label: "This Year"  },
            ].map(({ key, label }, i, arr) => (
              <button
                key={key}
                onClick={() => handleTimeframeChange(key)}
                className={`relative px-6 py-3 font-label text-[10px] uppercase font-bold tracking-widest transition-colors
                  ${i < arr.length - 1 ? "border-r border-[#D1C4BC]" : ""}
                  ${timeframe === key ? "bg-[#000000] text-white" : "hover:bg-[#F9F2EF]"}`}
              >
                {label}
                {/* subtle loading dot on active button */}
                {timeframe === key && kpiLoading && (
                  <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#924C00] rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Row 1: KPI Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#D1C4BC] border border-[#D1C4BC] mb-12"
        >
          {[
            { label: "TOTAL REVENUE",    value: formatCurrency(metrics?.totalRevenue),  },
            { label: "TOTAL ORDERS",     value: metrics?.totalOrders ?? "—",            },
            { label: "AVG ORDER VALUE",  value: formatCurrency(metrics?.avgOrderValue), },
            { label: "RETURN RATE",      value: `${metrics?.returnRate ?? 0}%`,         },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#FFF8F5] p-8 border-b-2 border-[#924C00]">
              <div className="flex items-center justify-between mb-6">
                <p className="font-label uppercase text-[10px] font-black tracking-widest text-[#924C00]">
                  {label}
                </p>
                <span className="font-label text-[9px] font-bold text-[#7F756E] tracking-widest opacity-60">
                  {timeframeLabel[timeframe]}
                </span>
              </div>
              <AnimatePresence mode="wait">
                {kpiLoading ? (
                  <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <KpiSkeleton />
                  </motion.div>
                ) : (
                  <motion.span
                    key={`${label}-${timeframe}`}
                    variants={kpiVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="font-headline italic text-4xl text-[#000000] tracking-tight block"
                  >
                    {value}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Row 2: Revenue Trend + Order Status */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-10 gap-12 mb-12"
        >
          {/* Revenue Trend */}
          <div className="lg:col-span-6 flex flex-col border border-[#D1C4BC] bg-[#FFF8F5] p-8">
            <div className="flex justify-between items-center mb-8 border-b border-[#D1C4BC] pb-4">
              <h3 className="font-label uppercase text-[11px] font-black tracking-widest text-[#1D1B1A]">
                REVENUE TREND
              </h3>
              <span className="material-symbols-outlined text-[#7F756E] text-lg">timeline</span>
            </div>
            <div className="h-72 w-full">
              {chartsLoading ? (
                <div className="h-full flex items-end gap-2 pb-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#E8E1DE] animate-pulse rounded-none"
                      style={{ height: `${30 + Math.random() * 60}%` }}
                    />
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts[timeframe]}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#924C00" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#924C00" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "#7F756E", fontFamily: "Inter", fontWeight: "bold" }}
                      dy={10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#924C00"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="lg:col-span-4 flex flex-col border border-[#D1C4BC] bg-[#FFF8F5] p-8">
            <div className="flex justify-between items-center mb-8 border-b border-[#D1C4BC] pb-4">
              <h3 className="font-label uppercase text-[11px] font-black tracking-widest text-[#1D1B1A]">
                ORDER STATUS
              </h3>
              <span className="font-label text-[9px] font-bold text-[#7F756E] tracking-widest opacity-60">
                {timeframeLabel[timeframe]}
              </span>
            </div>
            <div className="flex flex-col gap-4 flex-grow justify-center">
              {kpiLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-24 h-3 bg-[#E8E1DE] animate-pulse" />
                    <div className="flex-grow h-5 bg-[#F3ECEA] animate-pulse" />
                    <div className="w-6 h-3 bg-[#E8E1DE] animate-pulse" />
                  </div>
                ))
              ) : statusDist.length === 0 ? (
                <p className="font-label text-xs text-[#7F756E] text-center">No data for this period.</p>
              ) : (
                statusDist.map((item) => {
                  const widthPct = Math.max(2, Math.round((Number(item.count) / maxStatusCount) * 100));
                  const isNeutral = ["CANCELLED", "RETURNED", "RETURN_REQUESTED"].includes(item.status);
                  return (
                    <div key={item.status} className="flex items-center gap-4">
                      <div className="w-24 font-label text-[9px] font-bold uppercase tracking-widest text-[#4D453F] truncate">
                        {humanStatus(item.status)}
                      </div>
                      <div className="flex-grow h-5 bg-[#F3ECEA]">
                        <motion.div
                          className={`h-full ${isNeutral ? "bg-[#4D453F]" : "bg-[#924C00]"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <div className="w-8 text-[10px] font-black text-right">{item.count}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* Row 3: Top Products + Recent Transactions */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-12"
        >

          {/* Top Performing Pieces */}
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-[#D1C4BC] pb-4">
              <h3 className="font-label uppercase text-[11px] font-black tracking-widest text-[#1D1B1A]">
                TOP PERFORMING PIECES
              </h3>
              <span className="font-label text-[9px] font-bold text-[#7F756E] tracking-widest opacity-60">
                {timeframeLabel[timeframe]}
              </span>
            </div>
            <table className="w-full text-left">
              <thead className="border-b border-[#D1C4BC]">
                <tr>
                  {["RANK", "PRODUCT NAME", "CATEGORY", "UNITS", "REVENUE"].map((h, i) => (
                    <th key={h} className={`py-4 font-label text-[10px] font-black uppercase tracking-widest text-[#7F756E] ${i >= 3 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1C4BC]/30">
                {kpiLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="py-5 pr-4">
                          <div className="h-3 bg-[#E8E1DE] animate-pulse rounded-none" style={{ width: j === 1 ? "80%" : "40%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (metrics?.topProducts || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center font-label text-xs text-[#7F756E]">
                      No order data for this period.
                    </td>
                  </tr>
                ) : (
                  (metrics?.topProducts || []).map((product, idx) => (
                    <tr key={product.id} className="hover:bg-[#F9F2EF] transition-colors">
                      <td className="py-5 font-headline italic text-lg text-[#924C00]">
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="py-5 font-label text-xs font-bold uppercase tracking-tight pr-4">
                        {product.name}
                      </td>
                      <td className="py-5 font-label text-[10px] text-[#7F756E]">
                        {product.category}
                      </td>
                      <td className="py-5 font-label text-xs font-bold text-right">
                        {product.unitsSold}
                      </td>
                      <td className="py-5 font-label text-xs font-bold text-right">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="font-label uppercase text-[11px] font-black tracking-widest text-[#1D1B1A] mb-8 border-b border-[#D1C4BC] pb-4">
              RECENT TRANSACTIONS
            </h3>
            <table className="w-full text-left">
              <thead className="border-b border-[#D1C4BC]">
                <tr>
                  {["ID", "CUSTOMER", "AMOUNT", "STATUS", "DATE"].map((h, i) => (
                    <th key={h} className={`py-4 font-label text-[10px] font-black uppercase tracking-widest text-[#7F756E]
                      ${i === 2 ? "text-right" : ""} ${i === 3 ? "text-center" : ""} ${i === 4 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1C4BC]/30">
                {(metrics?.recentTransactions || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center font-label text-xs text-[#7F756E]">No transactions yet.</td>
                  </tr>
                ) : (
                  (metrics?.recentTransactions || []).map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => goToOrder(tx.id)}
                      className="hover:bg-[#F9F2EF] transition-colors cursor-pointer group"
                      title={`View order #ORD-${tx.id}`}
                    >
                      <td className="py-5 font-label text-[10px] font-bold group-hover:text-[#924C00] transition-colors">
                        #ORD-{tx.id}
                      </td>
                      <td className="py-5 font-label text-xs font-bold uppercase truncate max-w-[100px]">
                        {tx.customerName}
                      </td>
                      <td className="py-5 font-label text-xs font-bold text-right">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-5 text-center">
                        <span className={`inline-block px-3 py-1 text-[9px] font-black tracking-widest uppercase ${statusStyle(tx.status)}`}>
                          {humanStatus(tx.status)}
                        </span>
                      </td>
                      <td className="py-5 font-label text-[10px] text-[#7F756E] text-right whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Row 4: Category Revenue */}
        <motion.div
          variants={itemVariants}
          className="border border-[#D1C4BC] p-10 bg-[#F9F2EF] mb-12"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-label uppercase text-[11px] font-black tracking-widest text-[#1D1B1A]">
              CATEGORY REVENUE BREAKDOWN
            </h3>
            <span className="font-label text-[9px] font-bold text-[#7F756E] tracking-widest opacity-60">
              {timeframeLabel[timeframe]}
            </span>
          </div>

          {kpiLoading ? (
            <div className="space-y-7">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-24 bg-[#E8E1DE] animate-pulse" />
                    <div className="h-5 w-20 bg-[#E8E1DE] animate-pulse" />
                  </div>
                  <div className="h-3 bg-[#E8E1DE] animate-pulse" style={{ width: `${40 + i * 10}%` }} />
                </div>
              ))}
            </div>
          ) : catRevenues.length === 0 ? (
            <p className="font-label text-xs text-[#7F756E]">No revenue data for this period.</p>
          ) : (
            <div className="space-y-7">
              {catRevenues.map((item) => {
                const widthPct = Math.max(1, Math.round((item.revenue / maxCatRevenue) * 100));
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="font-label text-[10px] font-black tracking-widest text-[#1D1B1A]">
                        {item.category}
                      </span>
                      <span className="font-headline italic text-2xl text-[#1D1B1A]">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="h-3 bg-[#E8E1DE]">
                      <motion.div
                        className="h-full bg-[#924C00]"
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Row 5: Inventory Alerts + Pending Directives */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-12"
        >

          {/* Inventory Alerts — clickable rows → /admin/products with highlight */}
          <div>
            <div className="flex items-end justify-between mb-8 border-b border-[#D1C4BC] pb-4">
              <h3 className="font-label uppercase text-[11px] font-black tracking-widest text-[#1D1B1A]">
                INVENTORY ALERTS
              </h3>
              <span className="font-label text-[9px] text-[#7F756E] tracking-widest opacity-60 uppercase">
                Click row to edit stock
              </span>
            </div>
            <table className="w-full text-left">
              <thead className="border-b border-[#D1C4BC]">
                <tr>
                  {["ID", "PRODUCT NAME", "BRAND", "STOCK"].map((h, i) => (
                    <th key={h} className={`py-4 font-label text-[10px] font-black uppercase tracking-widest text-[#7F756E] ${i === 3 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1C4BC]/30">
                {(metrics?.lowStockItems || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 font-label text-xs text-center text-[#7F756E]">
                      Inventory optimal. No low stock items.
                    </td>
                  </tr>
                ) : (
                  (metrics?.lowStockItems || []).map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => goToProduct(item.id)}
                      className="hover:bg-[#F9F2EF] transition-colors cursor-pointer group"
                      title={`Edit stock for ${item.name}`}
                    >
                      <td className="py-5 font-headline italic text-lg group-hover:text-[#924C00] transition-colors">
                        #{item.id}
                      </td>
                      <td className="py-5 font-label text-xs font-bold uppercase tracking-tight">
                        {item.name}
                        {/* Arrow hint on hover */}
                        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#924C00] text-[10px]">
                          → Edit
                        </span>
                      </td>
                      <td className="py-5 font-label text-[10px] text-[#7F756E]">{item.brand}</td>
                      <td className="py-5 font-label text-xs font-bold text-right">
                        <span className={`inline-block px-2 py-0.5 border text-[9px] font-black tracking-widest uppercase ${
                          item.stock === 0
                            ? "border-[#BA1A1A] text-[#BA1A1A] bg-[#FFDAD6]/20"
                            : "border-[#924C00] text-[#924C00]"
                        }`}>
                          {item.stock === 0 ? "OUT" : `${item.stock} LEFT`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pending Directives — clickable rows → /admin/orders with highlight */}
          <div>
            <div className="flex items-end justify-between mb-8 border-b border-[#D1C4BC] pb-4">
              <h3 className="font-label uppercase text-[11px] font-black tracking-widest text-[#1D1B1A]">
                PENDING DIRECTIVES
              </h3>
              <span className="font-label text-[9px] text-[#7F756E] tracking-widest opacity-60 uppercase">
                Click row to action
              </span>
            </div>
            <table className="w-full text-left">
              <thead className="border-b border-[#D1C4BC]">
                <tr>
                  {["ORDER ID", "STATUS", "VALUE"].map((h, i) => (
                    <th key={h} className={`py-4 font-label text-[10px] font-black uppercase tracking-widest text-[#7F756E]
                      ${i === 1 ? "text-center" : ""} ${i === 2 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1C4BC]/30">
                {(metrics?.pendingOrders || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 font-label text-xs text-center text-[#7F756E]">
                      No pending directives at this time.
                    </td>
                  </tr>
                ) : (
                  (metrics?.pendingOrders || []).map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => goToOrder(order.id)}
                      className="hover:bg-[#F9F2EF] transition-colors cursor-pointer group"
                      title={`Action order #ORD-${order.id}`}
                    >
                      <td className="py-5 font-label text-[10px] font-bold group-hover:text-[#924C00] transition-colors">
                        #ORD-{order.id}
                        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#924C00] text-[10px]">
                          → View
                        </span>
                      </td>
                      <td className="py-5 text-center">
                        <span className={`inline-block px-3 py-1 text-[9px] font-black tracking-widest uppercase ${statusStyle(order.status)}`}>
                          {humanStatus(order.status)}
                        </span>
                      </td>
                      <td className="py-5 font-label text-xs font-bold text-right">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="mt-20 pt-10 border-t border-[#D1C4BC] flex flex-col md:flex-row justify-between items-start gap-8"
        >
          <div className="flex flex-col gap-2">
            <p className="font-headline italic text-xl">The Intelligence Platform</p>
            <p className="font-label text-[9px] font-bold text-[#7F756E] tracking-widest">
              INTERNAL DATA USE ONLY — PROPERTY OF CLOTHSY ARCHIVES
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-1">
              <span className="font-label text-[8px] font-black text-[#7F756E] uppercase tracking-widest">
                Server Status
              </span>
              <span className="font-label text-[10px] font-bold uppercase text-emerald-700">
                Optimal / Connected
              </span>
            </div>
          </div>
        </motion.footer>

      </motion.div>
    </div>
  );
}