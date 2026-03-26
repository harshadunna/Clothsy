import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderCard from "./OrderCard";
import api from "../../../config/api"; 

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/orders/user")
      .then((res) => {
        const sortedOrders = res.data.sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  const allItems = (orders || []).flatMap((order) => {
    if (!order || !Array.isArray(order.orderItems)) return [];
    return order.orderItems.map((item) => ({ item, order }));
  });

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <section className="mb-32">
      <h2 className="font-headline text-4xl italic mb-12 border-b border-outline-variant/30 pb-6 text-on-surface">
        Order History
      </h2>
      
      {allItems.length === 0 ? (
        <div className="py-12 border-t border-outline-variant/30">
          <p className="font-label uppercase tracking-[0.2em] text-[10px] text-outline">No order history found in the archive.</p>
        </div>
      ) : (
        <div className="relative pl-8 border-l border-outline-variant/40">
          <AnimatePresence>
            {allItems.map(({ item, order }, idx) => (
              <motion.div key={`${order.id}-${item.id}`} variants={fadeUp} initial="hidden" animate="show" exit="hidden" transition={{ delay: idx * 0.1 }}>
                <OrderCard item={item} order={order} /> 
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}