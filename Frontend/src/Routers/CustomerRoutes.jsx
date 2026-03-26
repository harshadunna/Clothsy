import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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
import Wishlist from "../customer/pages/Wishlist";
import Profile from "../customer/components/Account/Profile";
import NotFound from "../customer/pages/NotFound";

// ── Page transition wrapper ──
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const CustomerRoutes = () => {
  const location = useLocation();

  return (
    <div>
      <Navigation />

      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/home" element={<PageTransition><HomePage /></PageTransition>} />

          <Route path="/product/:productId/rate" element={<PageTransition><RateProduct /></PageTransition>} />
          <Route path="/product/:productId" element={<PageTransition><ProductDetails /></PageTransition>} />

          <Route path="/products" element={<PageTransition><Product /></PageTransition>} />
          <Route path="/:levelOne/:levelTwo/:levelThree" element={<PageTransition><Product /></PageTransition>} />

          <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />

          <Route path="/payment/success" element={<PageTransition><PaymentSuccess /></PageTransition>} />
          <Route path="/payment/cancel" element={<PageTransition><PaymentCancel /></PageTransition>} />

          <Route path="/account/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/account/orders" element={<PageTransition><Profile /></PageTransition>} />
          
          <Route path="/account/order/:orderId" element={<PageTransition><OrderDetails /></PageTransition>} />
          
          {/* ── FIXED THE CLOSING TAGS BELOW ── */}
          <Route 
            path="/account/rate/:productId" 
            element={
              <PageTransition>
                <RateProduct />
              </PageTransition>
            } 
          />

          {/* ── 404 FALLBACK ── */}
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default CustomerRoutes;