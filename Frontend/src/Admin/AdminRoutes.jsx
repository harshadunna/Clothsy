import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUser } from '../Redux/Auth/Action'; 

import AdminDashboard from './components/AdminDashboard';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminCustomers from './components/AdminCustomers';
import AdminSidebar from './components/AdminSidebar';
import CreateProduct from './components/CreateProduct';
import UpdateProduct from './components/UpdateProduct';
import AdminPromotions from './components/AdminPromotions'; 

const AdminRoutes = () => {
  const auth = useSelector(store => store.auth);
  const dispatch = useDispatch();
  
  const adminJwt = localStorage.getItem("admin_jwt");

  useEffect(() => {
    if (adminJwt && !auth.user) {
      dispatch(getUser(adminJwt));
    }
  }, [adminJwt, auth.user, dispatch]);

  if (!adminJwt) {
    return <Navigate to="/" replace />;
  }

  if (auth.isLoading || (!auth.user && adminJwt)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFF8F5]">
        <div className="w-12 h-12 border-2 border-t-transparent border-[#1A1109] animate-spin rounded-none" />
      </div>
    );
  }

  if (auth.user && auth.user.role !== "ADMIN" && auth.user.role !== "ROLE_ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      
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