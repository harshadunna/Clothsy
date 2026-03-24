import { Route, Routes } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminDashboard from "./components/AdminDashboard";
import CreateProduct from "./components/CreateProduct"; 

export default function AdminRoutes() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          
          <Route path="/product/create" element={<CreateProduct />} />
          
        </Routes>
      </div>
    </div>
  );
}