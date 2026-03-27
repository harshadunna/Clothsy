import { Route, Routes } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminDashboard from "./components/AdminDashboard";
import AdminAnalytics from "./components/AdminAnalytics";
import CreateProduct from "./components/CreateProduct";
import AdminOrders from "./components/AdminOrders";
import AdminProducts from "./components/AdminProducts"; 
import UpdateProduct from "./components/UpdateProduct";
import AdminCustomers from "./components/AdminCustomers"; 
export default function AdminRoutes() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF8F5] text-[#1A1109] font-body selection:bg-[#FEA052] selection:text-[#1A1109]">
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/analytics" element={<AdminAnalytics />} />
          <Route path="/product/create" element={<CreateProduct />} />
          <Route path="/product/update/:productId" element={<UpdateProduct />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/customers" element={<AdminCustomers />} />
        </Routes>
      </div>
    </div>
  );
}