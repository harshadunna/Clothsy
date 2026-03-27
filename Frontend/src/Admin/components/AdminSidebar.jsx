import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Management Hub", path: "/admin", icon: "layers" },
  { name: "Inventory Ledger", path: "/admin/products", icon: "inventory_2" },
  { name: "Atelier Blueprint", path: "/admin/product/create", icon: "auto_stories" },
  { name: "Order Logistics", path: "/admin/orders", icon: "local_shipping" },
  { name: "Client Archive", path: "/admin/customers", icon: "history" },
  { name: "Analytics", path: "/admin/analytics", icon: "monitoring" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className="w-64 h-screen bg-[#1A1109] flex flex-col py-8 border-r border-[#1A1109] z-50 shrink-0">
      
      <div className="px-8 mb-12">
        <h1 className="text-2xl font-black text-[#FFF8F5] tracking-widest font-headline uppercase">CLOTHSY</h1>
        <p className="text-[0.65rem] font-bold text-[#C8742A] tracking-[0.2em] font-label mt-1 uppercase">Admin Suite</p>
      </div>

      <nav className="flex-grow space-y-0">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== "/admin" && location.pathname.startsWith(item.path));
          
          return (
            <div
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center px-8 py-4 cursor-pointer transition-all duration-300 ${
                isActive 
                  ? "bg-[#F2DFD1] text-[#1A1109] border-r-4 border-[#C8742A]" 
                  : "text-[#FFF8F5] opacity-70 hover:opacity-100 hover:bg-[#322820]"
              }`}
            >
              <span className="material-symbols-outlined mr-4 text-[1.2rem]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="font-label text-[0.7rem] font-bold tracking-[0.05em] uppercase">
                {item.name}
              </span>
            </div>
          );
        })}
      </nav>

      <div className="px-6 mt-8">
        <button 
          onClick={() => navigate("/admin/product/create")}
          className="w-full bg-[#C8742A] text-white font-label text-[0.7rem] font-black tracking-widest py-4 uppercase hover:bg-[#924C00] transition-colors"
        >
          New Blueprint
        </button>
      </div>

      <div className="mt-auto px-8 space-y-4 pt-8 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full text-[#FFF8F5] opacity-60 hover:opacity-100 transition-opacity font-label text-[0.7rem] font-bold tracking-widest uppercase"
        >
          <span className="material-symbols-outlined mr-3 text-sm">logout</span>
          Secure Logout
        </button>
      </div>
    </aside>
  );
}