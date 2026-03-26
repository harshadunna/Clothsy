import React from "react";
import { Route, Routes } from "react-router-dom";

// Components
import Navigation from "../customer/components/Navigation/Navigation";
import Footer from "../customer/components/Footer/Footer";
import HomePage from "../customer/pages/HomePage";
import Product from "../customer/components/Product/Product";
import ProductDetails from "../customer/components/ProductDetails/ProductDetails";
import Cart from "../customer/components/Cart/Cart";
import Checkout from "../customer/components/Checkout/Checkout";
import Order from "../customer/components/Order/Order";
import OrderDetails from "../customer/components/Order/OrderDetails";
import PaymentSuccess from "../customer/components/Payment/PaymentSuccess";
import PaymentCancel from "../customer/components/Payment/PaymentCancel";
import RateProduct from "../customer/components/ProductDetails/RateProduct"; 

const CustomerRoutes = () => {
  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/login" element={<HomePage />} />
        <Route path="/register" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/product/:productId/rate" element={<RateProduct />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        
        {/* ── NEW: Global Search Route ── */}
        <Route path="/products" element={<Product />} />
        
        {/* Generic Category Route */}
        <Route path="/:levelOne/:levelTwo/:levelThree" element={<Product />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        <Route path="/account/orders" element={<Order />} />
        <Route path="/account/order/:orderId" element={<OrderDetails />} />
        
        <Route path="/account/rate/:productId" element={<RateProduct />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default CustomerRoutes;