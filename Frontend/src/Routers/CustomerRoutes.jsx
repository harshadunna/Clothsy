import React from "react";
import { Route, Routes } from "react-router-dom";

// Existing components
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

// TODO: Create these files when needed
// import { ThemeProvider } from '@mui/material/styles';
// import { customerTheme } from "../Admin/them/customeThem";
// import About from "../Pages/About";
// import PrivacyPolicy from "../Pages/PrivacyPolicy";
// import TearmsCondition from "../Pages/TearmsCondition";
// import Contact from "../Pages/Contact";
// import SearchProduct from "../customer/components/Product/SearchProduct";
// import RateProduct from "../customer/components/ReviewProduct/RateProduct";

const CustomerRoutes = () => {
  return (
    <div>
      <Navigation />

      <Routes>
        {/* Authentication & Home Routes */}
        <Route path="/login" element={<HomePage />} />
        <Route path="/register" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        {/* Static Pages — uncomment when components are created */}
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
        {/* <Route path="/terms-condition" element={<TearmsCondition />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}

        {/* Product Routes */}
        {/* <Route path="/products/search" element={<SearchProduct />} /> */}
        <Route path="/:levelOne/:levelTwo/:levelThree" element={<Product />} />
        <Route path="/product/:productId" element={<ProductDetails />} />

        {/* E-commerce Flow */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Set to match the exact URL Stripe redirects to */}
        <Route path="/payment/success" element={<PaymentSuccess />} />

        {/* User Account & Orders */}
        <Route path="/account/orders" element={<Order />} />
        <Route path="/account/order/:orderId" element={<OrderDetails />} />
        {/* <Route path="/account/rate/:productId" element={<RateProduct />} /> */}

        {/* Fallback 404 Route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>

      <Footer />
    </div>
  );
};

export default CustomerRoutes;