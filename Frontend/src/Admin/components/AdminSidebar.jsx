import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HomeIcon, 
  Squares2X2Icon, 
  PlusCircleIcon, 
  ShoppingBagIcon, 
  UsersIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon 
} from "@heroicons/react/24/outline";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: HomeIcon },
  { name: "Analytics", path: "/admin/analytics", icon: ChartBarIcon },
  { name: "Products", path: "/admin/products", icon: Squares2X2Icon },
  { name: "Add Product", path: "/admin/product/create", icon: PlusCircleIcon },
  { name: "Orders", path: "/admin/orders", icon: ShoppingBagIcon },
  { name: "Customers", path: "/admin/customers", icon: UsersIcon },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20" style={{ borderColor: "#f0e8e0" }}>
      <div className="h-20 flex items-center px-8 border-b" style={{ borderColor: "#f0e8e0" }}>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
          Shophive <span style={{ color: "#c8742a" }}>Admin</span>
        </h1>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.name}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                isActive 
                  ? "shadow-sm" 
                  : "hover:bg-gray-50"
              }`}
              style={{ 
                backgroundColor: isActive ? "#fdf0e6" : "transparent",
                color: isActive ? "#c8742a" : "#6b7280"
              }}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-[#c8742a]" : "text-gray-400"}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>
                {item.name}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 border-t" style={{ borderColor: "#f0e8e0" }}>
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl cursor-pointer transition-all duration-200 hover:bg-red-50 text-gray-500 hover:text-red-600"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );
}