import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import OrderTracker from "./OrderTracker";
import AddressCard from "../Address/AddressCard";

const dummyOrder = {
  id: 1,
  orderStatus: "SHIPPED",
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    streetAddress: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    mobile: "9876543210",
  },
  orderItems: [
    {
      id: 1,
      size: "M",
      price: 996,
      product: {
        id: 101,
        title: "Women Floral Gown",
        brand: "DressBerry",
        color: "Pink",
        imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
      },
    },
  ],
};

const getStepIndex = (status) => {
  switch (status) {
    case "PLACED": return 1;
    case "CONFIRMED": return 2;
    case "SHIPPED": return 3;
    case "OUT_FOR_DELIVERY": return 4;
    case "DELIVERED": return 5;
    default: return 0;
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // TODO: replace with Redux when ready
  const order = dummyOrder;
  const activeStep = getStepIndex(order?.orderStatus);
  const isDelivered = order?.orderStatus === "DELIVERED";

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "linear-gradient(160deg, #fdf8f4 0%, #f5f0eb 100%)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">

        {/* ── Page Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
        >
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate("/account/orders")}
              className="flex items-center gap-1.5 text-sm font-bold transition-colors"
              style={{ color: "#c8742a" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              My Orders
            </button>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}
          >
            Order #{order?.id}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "#9e8d7a" }}>
            {order?.orderItems?.length} item{order?.orderItems?.length !== 1 ? "s" : ""} · Status:{" "}
            <span className="font-semibold" style={{ color: "#c8742a" }}>
              {order?.orderStatus?.replace(/_/g, " ")}
            </span>
          </p>
        </motion.div>

        {/* ── Delivery Address ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
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
              Delivery Address
            </h2>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#f5ede4", color: "#c8742a" }}
            >
              HOME
            </span>
          </div>
          <div className="p-5">
            {order?.shippingAddress && (
              <AddressCard address={order.shippingAddress} compact />
            )}
          </div>
        </motion.div>

        {/* ── Order Tracker + Action ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
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
              Order Status
            </h2>

            {/* Cancel / Return button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
              style={
                isDelivered
                  ? { color: "#dc2626", background: "#fef2f2" }
                  : { color: "#7a6a5a", background: "#f5ede4" }
              }
            >
              {isDelivered ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Return Order
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Order
                </>
              )}
            </motion.button>
          </div>

          <div className="px-6 py-8">
            <OrderTracker activeStep={activeStep} />
          </div>
        </motion.div>

        {/* ── Order Items ── */}
        <div className="space-y-4">
          {order?.orderItems?.map((item, i) => (
            <motion.div
              key={item.id || i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3 + i}
              className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 16px rgba(180,140,90,0.07)" }}
            >
              <div className="flex flex-col sm:flex-row">

                {/* Product Image */}
                <div
                  className="w-full sm:w-36 h-44 sm:h-auto shrink-0 overflow-hidden"
                  style={{ background: "#f9f3ed" }}
                >
                  <img
                    src={item?.product?.imageUrl}
                    alt={item?.product?.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 p-5 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <p
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#c8742a" }}
                    >
                      {item?.product?.brand}
                    </p>
                    <h3
                      className="font-bold text-base leading-snug"
                      style={{ color: "#1a1109" }}
                    >
                      {item?.product?.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {item?.product?.color && (
                        <span
                          className="px-2.5 py-1 text-xs font-bold rounded-lg"
                          style={{ background: "#f5ede4", color: "#7a5c3a" }}
                        >
                          Color: {item.product.color}
                        </span>
                      )}
                      <span
                        className="px-2.5 py-1 text-xs font-bold rounded-lg"
                        style={{ background: "#f5ede4", color: "#7a5c3a" }}
                      >
                        Size: {item?.size}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <p className="font-black text-lg" style={{ color: "#1a1109" }}>
                        ₹{item?.price}
                      </p>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "#f0faf4", color: "#16a34a" }}
                      >
                        Seller: {item?.product?.brand}
                      </span>
                    </div>
                  </div>

                  {/* Rate & Review */}
                  {isDelivered && (
                    <div className="flex items-start sm:items-end sm:justify-end">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate(`/account/rate/${item?.product?.id}`)}
                        className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl"
                        style={{ color: "#c8742a", background: "#fdf0e6" }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Rate & Review
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}