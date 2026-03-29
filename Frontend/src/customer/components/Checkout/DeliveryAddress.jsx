import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddressCard from "../Address/AddressCard";
import { createOrder } from "../../../Redux/Customers/Order/Action";
import { updateAddress, saveAddress, deleteAddress } from "../../../Redux/Auth/Action";


function FormInput({ label, name, id, autoComplete, type = "text", required = true, colSpan = 1, defaultValue = "" }) {
  return (
    <div className={`relative ${colSpan === 2 ? "md:col-span-2" : ""}`}>
      <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-1">
        {label} {required && "*"}
      </label>
      <input
        type={type} name={name} id={id} required={required} autoComplete={autoComplete} defaultValue={defaultValue}
        className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant py-3 px-0 font-body text-sm transition-all duration-300 focus:ring-0 focus:border-primary placeholder-transparent"
        placeholder={label}
      />
    </div>
  );
}

export default function DeliveryAddress({ handleNext }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auth, order } = useSelector((store) => store);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const savedAddresses = auth.user?.addresses || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const address = {
      firstName: data.get("firstName"), lastName: data.get("lastName"),
      streetAddress: data.get("address"), city: data.get("city"),
      state: data.get("state"), zipCode: data.get("zip"), mobile: data.get("phoneNumber"),
    };

    if (editingAddress) {
      dispatch(updateAddress(editingAddress.id, address));
      setEditingAddress(null);
      setShowForm(false);
    } else {
      try {
        const savedAddress = await dispatch(saveAddress(address));
        dispatch(createOrder({ address: savedAddress, navigate }));
      } catch (error) {
        console.error("Failed to save address and create order:", error);
      }
    }
  };

  const handleCreateOrder = (item) => {
    dispatch(createOrder({ address: item, navigate }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
      
      {/* Left: Form Area */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {showForm || savedAddresses.length === 0 ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <section>
                <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 mb-8">
                  <h2 className="font-label text-xs uppercase tracking-[0.15em] text-on-surface">
                    {editingAddress ? "Update Destination" : "Shipping Destination"}
                  </h2>
                  {savedAddresses.length > 0 && (
                    <button type="button" onClick={() => setShowForm(false)} className="text-[10px] font-label uppercase tracking-widest text-primary border-b border-primary pb-0.5">Cancel</button>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <FormInput label="First Name" name="firstName" id="firstName" defaultValue={editingAddress?.firstName} />
                    <FormInput label="Last Name" name="lastName" id="lastName" defaultValue={editingAddress?.lastName} />
                    <FormInput label="Street Address" name="address" id="address" defaultValue={editingAddress?.streetAddress} colSpan={2} />
                    <FormInput label="City" name="city" id="city" defaultValue={editingAddress?.city} />
                    <FormInput label="State" name="state" id="state" defaultValue={editingAddress?.state} />
                    <FormInput label="Postal Code" name="zip" id="zip" defaultValue={editingAddress?.zipCode} />
                    <FormInput label="Phone Number" name="phoneNumber" id="phoneNumber" defaultValue={editingAddress?.mobile} type="tel" />
                  </div>
                  
                  <div className="pt-8 flex justify-end">
                    <button type="submit" disabled={order?.loading} className="bg-on-background text-surface px-12 py-5 font-label text-xs font-black uppercase tracking-[0.3em] hover:bg-primary transition-all duration-300 disabled:opacity-50">
                      {order?.loading ? "PROCESSING..." : editingAddress ? "UPDATE ADDRESS" : "SAVE & DELIVER HERE"}
                    </button>
                  </div>
                </form>
              </section>
            </motion.div>
          ) : (
            <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <section>
                <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 mb-8">
                  <h2 className="font-label text-xs uppercase tracking-[0.15em] text-on-surface">Saved Destinations</h2>
                  <button type="button" onClick={() => { setEditingAddress(null); setShowForm(true); }} className="text-[10px] font-label uppercase tracking-widest text-primary border-b border-primary pb-0.5">Add New</button>
                </div>
                
                <div className="space-y-6">
                  {savedAddresses.map((item) => (
                    <div key={item.id} className="border border-outline-variant/30 p-6 relative">
                      <AddressCard address={item} selected={selectedAddress?.id === item.id} onEdit={setEditingAddress} onDelete={(id) => dispatch(deleteAddress(id))} />
                      <button 
                        disabled={order?.loading}
                        onClick={() => handleCreateOrder(item)}
                        className="mt-6 w-full bg-transparent border border-on-background text-on-background py-4 font-label text-[10px] font-black uppercase tracking-[0.2em] hover:bg-on-background hover:text-surface transition-colors disabled:opacity-50"
                      >
                        {order?.loading && selectedAddress?.id === item.id ? "PROCESSING..." : "DELIVER TO THIS ADDRESS"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Empty Summary Placeholder for Step 1 */}
      <div className="hidden lg:block lg:col-span-5">
        <div className="bg-surface-container-low p-10 sticky top-32">
          <h3 className="font-headline text-3xl italic tracking-tighter text-outline mb-10">Order Summary</h3>
          <p className="font-label text-[10px] uppercase tracking-widest text-outline">Summary available in the next step.</p>
        </div>
      </div>
    </div>
  );
}