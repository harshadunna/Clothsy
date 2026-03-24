import { motion } from "framer-motion";
import { CurrencyRupeeIcon, ShoppingBagIcon, UsersIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const stats = [
  { name: 'Total Revenue', value: '₹45,231', icon: CurrencyRupeeIcon, trend: '+20.1%' },
  { name: 'Total Orders', value: '156', icon: ShoppingBagIcon, trend: '+12.5%' },
  { name: 'Active Customers', value: '2,300', icon: UsersIcon, trend: '+5.2%' },
  { name: 'Conversion Rate', value: '3.2%', icon: ArrowTrendingUpIcon, trend: '+1.1%' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
          Dashboard Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: "#9e8d7a" }}>Welcome back. Here is what's happening in your store today.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.name} 
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl border"
            style={{ borderColor: "#e8ddd5", boxShadow: "0 4px 20px rgba(200,116,42,0.05)" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{stat.name}</p>
                <h3 className="text-2xl font-black text-[#1a1109]">{stat.value}</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ background: "#fdf0e6", color: "#c8742a" }}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                {stat.trend}
              </span>
              <span className="text-xs text-gray-400 font-medium">vs last month</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Placeholder for future Charts or Recent Orders Table */}
      <motion.div variants={itemVariants} initial="hidden" animate="show" className="bg-white p-8 rounded-2xl border h-96 flex items-center justify-center" style={{ borderColor: "#e8ddd5" }}>
        <p className="text-gray-400 font-medium">Recent Orders Table will go here...</p>
      </motion.div>
    </div>
  );
}