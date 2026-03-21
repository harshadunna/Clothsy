import { motion } from "framer-motion";
import CartItem from "../Cart/CartItem";
import AddressCard from "../Address/AddressCard";

const dummyOrder = {
  id: 1,
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    streetAddress: "123 MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    mobile: "9876543210",
  },
  orderItems: [
    { id: 1, product: { title: "Women Floral Gown", brand: "DressBerry", price: 1999, discountedPrice: 996, discountPersent: 50, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80" }, size: "M", quantity: 1 },
    { id: 2, product: { title: "Yellow Anarkali Suit", brand: "Biba", price: 3000, discountedPrice: 1500, discountPersent: 50, imageUrl: "https://images.unsplash.com/photo-1619533394727-57d522857f89?auto=format&fit=crop&w=400&q=80" }, size: "S", quantity: 2 },
  ],
  totalItem: 3,
  totalPrice: 4999,
  discounte: 2503,
  totalDiscountedPrice: 2496,
};

export default function OrderSummary({ handleNext }) {
  const order = dummyOrder;

  const handleCreatePayment = () => {
    console.log("Payment for order:", order.id);
    // TODO: dispatch(createPayment({ orderId: order.id, jwt }));
    handleNext();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ── Left: Address + Items ── */}
      <div className="lg:col-span-7 space-y-4">

        {/* Delivery Address Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}
          >
            <h2
              className="text-sm font-black uppercase tracking-widest"
              style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
            >
              Delivering To
            </h2>
          </div>
          <div className="p-5">
            <AddressCard address={order.shippingAddress} compact />
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <p
            className="text-xs font-black uppercase tracking-widest px-1"
            style={{ color: "#9e8d7a" }}
          >
            {order.totalItem} Items in this order
          </p>
          {order.orderItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <CartItem item={item} showButton={false} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Right: Price Summary ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="lg:col-span-5 sticky top-6"
      >
        <div
          className="bg-white rounded-3xl border overflow-hidden"
          style={{ borderColor: "#e8ddd5", boxShadow: "0 8px 40px rgba(200,116,42,0.08)" }}
        >
          {/* Header */}
          <div
            className="px-6 py-5 border-b"
            style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}
          >
            <h2
              className="text-base font-black tracking-widest uppercase"
              style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
            >
              Price Details
            </h2>
          </div>

          <div className="px-6 py-5 space-y-4">
            {[
              { label: `Price (${order.totalItem} items)`, value: `₹${order.totalPrice}`, color: "#3d2e1e" },
              { label: "Discount", value: `-₹${order.discounte}`, color: "#16a34a" },
              { label: "Delivery", value: "FREE", color: "#16a34a" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span style={{ color: "#7a6a5a" }}>{label}</span>
                <span className="font-bold" style={{ color }}>{value}</span>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: "#f0e8e0" }}>
              <span className="text-base font-black" style={{ color: "#1a1109" }}>Total</span>
              <span className="text-2xl font-black" style={{ color: "#1a1109" }}>
                ₹{order.totalDiscountedPrice}
              </span>
            </div>

            {/* Savings badge */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: "#f0faf4", color: "#16a34a" }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              You're saving ₹{order.discounte} on this order
            </div>
          </div>

          <div className="px-6 pb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreatePayment}
              className="w-full py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-white"
              style={{
                background: "linear-gradient(135deg, #d4832f, #c8742a)",
                boxShadow: "0 6px 24px rgba(200,116,42,0.35)",
                letterSpacing: "0.08em",
              }}
            >
              Proceed to Payment →
            </motion.button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs" style={{ color: "#b5a89a" }}>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              100% Secure · SSL Encrypted
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div
          className="mt-4 bg-white rounded-2xl border px-5 py-4 flex items-center gap-4"
          style={{ borderColor: "#e8ddd5" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#fdf0e6" }}
          >
            <svg className="w-4 h-4" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414A1 1 0 0121 11.414V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: "#1a1109" }}>
              Estimated Delivery
            </p>
            <p className="text-sm font-bold mt-0.5" style={{ color: "#c8742a" }}>
              3 – 5 Business Days · Free
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}