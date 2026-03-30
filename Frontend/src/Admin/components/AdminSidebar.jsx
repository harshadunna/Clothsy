import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../Redux/Auth/Action"; 

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: "dashboard" },
  { name: "Products", path: "/admin/products", icon: "inventory_2" },
  { name: "Add Product", path: "/admin/product/create", icon: "add_circle" },
  { name: "Orders", path: "/admin/orders", icon: "local_shipping" },
  { name: "Customers", path: "/admin/customers", icon: "people" },
  { name: "Analytics", path: "/admin/analytics", icon: "monitoring" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/");
  };

  return (
    <aside className="w-64 h-screen sticky top-0 overflow-y-auto bg-[#1A1109] flex flex-col py-8 border-r border-[#1A1109] z-50 shrink-0 custom-scrollbar">
      
      <div className="px-8 mb-12 shrink-0">
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

      <div className="px-6 mt-8 shrink-0">
        <button 
          onClick={() => navigate("/admin/product/create")}
          className="w-full bg-[#C8742A] text-white font-label text-[0.7rem] font-black tracking-widest py-4 uppercase hover:bg-[#924C00] transition-colors"
        >
          Add Product
        </button>
      </div>

      <div className="mt-auto px-8 space-y-4 pt-8 pb-28 border-t border-white/10 shrink-0">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full text-[#FFF8F5] opacity-60 hover:opacity-100 transition-opacity font-label text-[0.7rem] font-bold tracking-widest uppercase"
        >
          <span className="material-symbols-outlined mr-3 text-sm">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}