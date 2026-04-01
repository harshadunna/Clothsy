import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminCustomers from './components/AdminCustomers';
import AdminSidebar from './components/AdminSidebar';
import CreateProduct from './components/CreateProduct';
import UpdateProduct from './components/UpdateProduct';
import AdminPromotions from './components/AdminPromotions'; 

const AdminRoutes = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      
      {/* Main content area takes the rest of the screen and scrolls */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/product/create" element={<CreateProduct />} />
          <Route path="/product/update/:productId" element={<UpdateProduct />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/customers" element={<AdminCustomers />} />
          <Route path="/promotions" element={<AdminPromotions />} /> 
        </Routes>
      </main>
    </div>
  );
};

export default AdminRoutes;