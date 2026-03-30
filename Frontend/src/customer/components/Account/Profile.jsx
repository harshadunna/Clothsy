import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, updateUserProfile } from "../../../Redux/Auth/Action";
import { getWishlist } from "../../../Redux/Customers/Wishlist/Action";
import { motion, AnimatePresence } from "framer-motion";
import Order from "../Order/Order"; 

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { auth, wishlist } = useSelector((store) => store);
  const user = auth.user;

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: ""
  });

  useEffect(() => {
    dispatch(getWishlist());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || ""
      });
    }
  }, [user, isUpdateModalOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData));
    setIsUpdateModalOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex justify-center items-center bg-background">
        <div className="animate-spin rounded-none h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  const wishlistItems = wishlist?.wishlist?.products || [];

  return (
    <div className="bg-background text-on-background font-body antialiased min-h-screen flex pt-20">
      
      <AnimatePresence>
        {isUpdateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }} 
              className="bg-surface-container border border-outline-variant shadow-2xl w-full max-w-lg"
            >
              <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-headline italic tracking-tighter text-on-surface">Update Details</h3>
                  <p className="font-label text-[10px] uppercase tracking-widest text-outline mt-2">Modify your registry identity.</p>
                </div>
                <button onClick={() => setIsUpdateModalOpen(false)} className="text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleUpdateSubmit} className="p-8 space-y-6">
                <div>
                  <label className="font-label text-[10px] tracking-[0.2em] text-primary uppercase font-bold block mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary px-0 py-3 text-on-surface font-body text-sm outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="font-label text-[10px] tracking-[0.2em] text-primary uppercase font-bold block mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary px-0 py-3 text-on-surface font-body text-sm outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="flex-1 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface border border-outline-variant hover:bg-outline-variant/20 transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-surface bg-on-surface hover:bg-primary transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex fixed left-0 top-20 h-[calc(100vh-5rem)] overflow-y-auto z-40 flex-col pt-10 pb-24 w-80 border-r border-outline-variant/30 bg-surface-container-low">
        <div className="px-8 mb-12 mt-4">
          <div className="w-16 h-16 bg-surface-container mb-4 overflow-hidden flex items-center justify-center text-2xl font-headline italic text-primary">
            {user.firstName ? user.firstName[0].toUpperCase() : "U"}
          </div>
          <h2 className="text-xl font-bold tracking-widest uppercase font-label text-on-surface">Member</h2>
          <p className="font-headline italic text-outline mt-1">Curated Selection</p>
        </div>
        
        <nav className="flex flex-col gap-2 mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-4 py-4 text-outline hover:text-on-surface hover:bg-surface-container transition-colors font-headline text-xl italic pl-8 text-left">
            Home
          </button>
          <button onClick={() => navigate('/products')} className="flex items-center gap-4 py-4 text-outline hover:text-on-surface hover:bg-surface-container transition-colors font-headline text-xl italic pl-8 text-left">
            The Archive
          </button>
          <button className="flex items-center gap-4 py-4 text-primary font-bold border-l-2 border-primary pl-8 bg-surface-container font-headline text-xl italic text-left">
            Account Profile
          </button>
        </nav>

        <div className="mt-auto px-8 pt-4">
          <button onClick={handleLogout} className="w-full bg-on-surface text-surface py-4 font-label text-[10px] tracking-[0.2em] uppercase transition-all hover:bg-primary font-bold">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-80 px-6 md:px-16 py-12 max-w-6xl">
        
        <header className="mb-24">
          <h1 className="font-headline italic text-6xl md:text-8xl tracking-tighter mb-4 opacity-90 text-on-surface">Account Profile</h1>
          <p className="font-label text-[10px] tracking-[0.3em] uppercase text-outline">
            Identity Registry • Tier: Architectural Access
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-32">
          <div className="md:col-span-4 bg-surface-container p-8">
            <div className="aspect-[4/5] w-full bg-outline-variant/20 mb-8 flex items-center justify-center border border-outline-variant/30">
              <span className="material-symbols-outlined text-8xl text-outline-variant opacity-50">person</span>
            </div>
            <button 
              onClick={() => setIsUpdateModalOpen(true)}
              className="w-full border border-outline-variant py-3 font-label text-[10px] tracking-widest uppercase hover:bg-on-surface hover:text-surface transition-colors"
            >
              Update Details
            </button>
          </div>
          
          <div className="md:col-span-8 flex flex-col justify-between">
            <div>
              <div className="border-b border-outline-variant/30 pb-4 mb-8">
                <span className="font-label text-[10px] tracking-[0.2em] text-primary uppercase font-bold">Full Name</span>
                <p className="font-headline italic text-4xl mt-2 text-on-surface capitalize">{user.firstName} {user.lastName}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <span className="font-label text-[10px] tracking-[0.2em] text-primary uppercase font-bold">Email Registry</span>
                  <p className="font-body text-sm mt-2 text-on-surface-variant">{user.email}</p>
                </div>
                <div>
                  <span className="font-label text-[10px] tracking-[0.2em] text-primary uppercase font-bold">Primary Address</span>
                  <p className="font-body text-sm mt-2 text-on-surface-variant">
                    {user.addresses?.[0] ? `${user.addresses[0].streetAddress}, ${user.addresses[0].city}` : "No address saved."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-8 bg-surface-container-low border-l border-primary">
              <p className="font-headline italic text-2xl leading-relaxed text-on-surface-variant">
                "Curating a wardrobe of structural permanence. Focusing on heavy wools, raw silks, and the intersection of geometry and garment."
              </p>
            </div>
          </div>
        </section>

        <Order />

        <section className="mb-32">
          <div className="flex justify-between items-end mb-12 border-b border-outline-variant/30 pb-6">
            <h2 className="font-headline italic text-4xl text-on-surface">Archive Selection</h2>
            <button onClick={() => navigate('/wishlist')} className="font-label text-[10px] tracking-[0.2em] uppercase text-primary border-b border-primary mb-2">
              View All
            </button>
          </div>
          
          {wishlistItems.length === 0 ? (
             <div className="py-12">
               <p className="font-label uppercase tracking-[0.2em] text-[10px] text-outline">Your selection is currently empty.</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {wishlistItems.slice(0, 4).map((item) => (
                <div key={item.id} onClick={() => navigate(`/product/${item.id}`)} className="group cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden mb-4 bg-surface-container">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[20%] group-hover:grayscale-0" 
                    />
                  </div>
                  <h4 className="font-label text-[10px] tracking-widest uppercase mb-1 truncate text-on-surface">{item.title}</h4>
                  <p className="font-headline italic text-outline">{item.brand}</p>
                  <p className="font-body font-bold mt-2 text-on-surface">₹{item.discountedPrice}</p>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}