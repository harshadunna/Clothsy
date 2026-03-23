import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddressCard from "../Address/AddressCard";
import { createOrder } from "../../../Redux/Customers/Order/Action";

const inputClass = `
  w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all duration-200 placeholder-gray-400 bg-white
`;
const inputStyle = { borderColor: "#e8ddd5", color: "#1a1109" };
const inputFocusStyle = { borderColor: "#c8742a", boxShadow: "0 0 0 3px rgba(200,116,42,0.12)" };

function FormInput({ label, name, id, autoComplete, type = "text", required = true, colSpan = 1, multiline = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={colSpan === 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}>
      <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "#7a6a5a" }}>
        {label} {required && <span style={{ color: "#c8742a" }}>*</span>}
      </label>
      {multiline ? (
        <textarea
          name={name} id={id} rows={3} required={required} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={inputClass} style={focused ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
        />
      ) : (
        <input
          type={type} name={name} id={id} required={required} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={inputClass} style={focused ? { ...inputStyle, ...inputFocusStyle } : inputStyle}
        />
      )}
    </div>
  );
}

export default function DeliveryAddress({ handleNext }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { auth, order } = useSelector((store) => store);
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const savedAddresses = auth.user?.addresses || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    
    const address = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      streetAddress: data.get("address"),
      city: data.get("city"),
      state: data.get("state"),
      zipCode: data.get("zip"),
      mobile: data.get("phoneNumber"),
    };

    const reqData = { address, navigate };
    dispatch(createOrder(reqData));
  };

  const handleCreateOrder = (item) => {
    const reqData = { address: item, navigate };
    dispatch(createOrder(reqData));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── Left: Saved Addresses ── */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}>
            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
              Saved Addresses
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#9e8d7a" }}>
              Select an address to deliver to
            </p>
          </div>

          <div className="p-4 space-y-3 max-h-[28rem] overflow-y-auto">
            {savedAddresses.length > 0 ? (
              savedAddresses.map((item) => {
                const isSelected = selectedAddress?.id === item.id;
                return (
                  <motion.div
                    key={item.id}
                    onClick={() => setSelectedAddress(item)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.2 }}
                    className="cursor-pointer"
                  >
                    <AddressCard address={item} selected={isSelected} />
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <motion.button
                            type="button"
                            disabled={order?.loading} // <--- Added optional chaining here
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateOrder(item);
                            }}
                            className="mt-2 w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-70"
                            style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)", boxShadow: "0 4px 16px rgba(200,116,42,0.3)" }}
                          >
                            {order?.loading ? "Processing..." : "Deliver Here →"}
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-sm text-center py-4" style={{ color: "#9e8d7a" }}>No saved addresses found.</p>
            )}
          </div>

          <div className="p-4 border-t" style={{ borderColor: "#f0e8e0" }}>
            <button
              onClick={() => setShowForm((p) => !p)}
              className="flex items-center gap-2 text-sm font-bold transition-colors w-full"
              style={{ color: "#c8742a" }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#fdf0e6" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={showForm ? "M20 12H4" : "M12 4v16m8-8H4"} />
                </svg>
              </div>
              {showForm ? "Cancel" : "Add a new address"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: New Address Form / Placeholder ── */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {showForm || savedAddresses.length === 0 ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: "#e8ddd5", boxShadow: "0 2px 20px rgba(200,116,42,0.06)" }}
            >
              <div className="px-6 py-4 border-b" style={{ borderColor: "#f0e8e0", background: "linear-gradient(135deg, #fff9f4, #fff)" }}>
                <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#1a1109", fontFamily: "'Georgia', serif" }}>
                  New Address
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#9e8d7a" }}>
                  Fill in the details below
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="First Name" name="firstName" id="firstName" autoComplete="given-name" />
                  <FormInput label="Last Name" name="lastName" id="lastName" autoComplete="family-name" />
                  <FormInput label="Street Address" name="address" id="address" autoComplete="street-address" colSpan={2} multiline />
                  <FormInput label="City" name="city" id="city" autoComplete="address-level2" />
                  <FormInput label="State" name="state" id="state" autoComplete="address-level1" />
                  <FormInput label="PIN Code" name="zip" id="zip" autoComplete="postal-code" />
                  <FormInput label="Phone Number" name="phoneNumber" id="phoneNumber" autoComplete="tel" type="tel" />
                </div>
                <motion.button
                  disabled={order?.loading} // <--- Added optional chaining here
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="mt-6 w-full py-4 rounded-2xl text-sm font-black tracking-wider uppercase text-white disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)", boxShadow: "0 6px 24px rgba(200,116,42,0.3)", letterSpacing: "0.06em" }}
                >
                  {order?.loading ? "Processing..." : "Save & Deliver Here →"} {/* <--- Added optional chaining here */}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border flex flex-col items-center justify-center py-20 text-center"
              style={{ borderColor: "#e8ddd5", borderStyle: "dashed" }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#fdf0e6" }}>
                <svg className="w-7 h-7" style={{ color: "#c8742a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold" style={{ color: "#1a1109" }}>Select a saved address</p>
              <p className="text-xs mt-1" style={{ color: "#9e8d7a" }}>or click "Add a new address" to enter one</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}