import { Fragment, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, getUser } from '../../../Redux/Auth/Action'
import { getCart } from '../../../Redux/Customers/Cart/Action'
import { getWishlist } from '../../../Redux/Customers/Wishlist/Action'
import {
  Dialog, DialogBackdrop, DialogPanel,
  Tab, TabGroup, TabList, TabPanel, TabPanels,
  Menu, MenuButton, MenuItem, MenuItems
} from '@headlessui/react'
import { navigation } from './navigationMenu'
import AuthModel from '../Auth/AuthModel'

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const auth = useSelector((store) => store.auth);
  const cart = useSelector((store) => store.cart);
  const { wishlist } = useSelector((store) => store.wishlist); 

  const jwt = localStorage.getItem("jwt")

  useEffect(() => {
    if (jwt) {
      dispatch(getUser(jwt));
      dispatch(getCart());
      dispatch(getWishlist());
    }
  }, [jwt, dispatch])

  const openAuthModel = location.pathname === "/login" || location.pathname === "/register"
  const handleClose = () => navigate("/")

  const isLoggedIn = auth.user !== null
  const cartCount = cart?.cartItems?.length || 0
  const wishlistCount = wishlist?.products?.length || 0; 

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${searchInput.trim()}`);
      setSearchInput(""); 
      setOpen(false); 
    }
  };

  return (
    <div className="bg-background">
      
      {/* Mobile Menu (Kept functional for responsiveness, restyled) */}
      <Dialog open={open} onClose={setOpen} className="relative z-[100] lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 data-closed:opacity-0" />
        <div className="fixed inset-0 z-[100] flex">
          <DialogPanel transition className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-surface pb-12 shadow-2xl transition duration-300 data-closed:-translate-x-full border-r border-outline-variant/30">
            <div className="flex px-4 pt-5 pb-2 justify-end">
              <button onClick={() => setOpen(false)} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-6 mt-2 mb-6">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-outline-variant/50 focus-within:border-primary transition-colors">
                <input
                  type="text"
                  placeholder="Search the archive..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm focus:outline-none focus:ring-0 border-none placeholder:text-outline placeholder:italic font-body"
                />
                <button type="submit" className="absolute right-0 p-1 text-outline hover:text-primary">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </button>
              </form>
            </div>

            <TabGroup className="mt-2">
              <div className="border-b border-outline-variant/30">
                <TabList className="-mb-px flex space-x-8 px-6">
                  {navigation.categories.map((category) => (
                    <Tab key={category.name} className="flex-1 border-b-2 border-transparent py-4 font-label text-[10px] uppercase tracking-widest font-bold whitespace-nowrap text-on-surface-variant transition-colors outline-none data-selected:border-primary data-selected:text-primary">
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel key={category.name} className="space-y-10 px-6 pt-10 pb-8">
                    {category.sections.map((section) => (
                      <div key={section.name}>
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-outline">{section.name}</p>
                        <ul className="mt-4 flex flex-col space-y-4">
                          {section.items.map((item) => (
                            <li key={item.name} className="flow-root">
                              <Link to={`/${category.id}/${section.id}/${item.id}`} className="font-headline text-xl italic text-on-surface hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>

            <div className="space-y-4 border-t border-outline-variant/30 px-6 py-6">
              {navigation.pages.map((page) => (
                <Link key={page.name} to={page.id === "/" ? "/" : `/${page.id}`} className="block font-label text-xs uppercase tracking-widest text-on-surface hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                  {page.name}
                </Link>
              ))}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop Architectural Header */}
      <nav className="fixed top-0 w-full z-50 rounded-none border-b border-outline-variant/20 bg-surface/80 backdrop-blur-xl transition-all duration-300">
        <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-[1440px] mx-auto">
          
          {/* Mobile Hamburger */}
          <button type="button" onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Brand Logo */}
          <Link to="/" className="text-2xl lg:text-3xl font-black tracking-tighter text-on-surface hover:text-primary transition-colors" style={{ fontFamily: "'Newsreader', serif" }}>
            CLOTHSY
          </Link>

          {/* Navigation Links with Mega Menu Triggers */}
          <div className="hidden lg:flex items-center space-x-12 h-full">
            {navigation.categories.map((category) => (
              <div key={category.name} className="group/menu h-full flex items-center">
                <span className="font-label uppercase tracking-[0.15em] text-[10px] text-on-surface-variant hover:text-primary transition-colors duration-300 border-b border-transparent hover:border-primary pb-1 cursor-pointer">
                  {category.name}
                </span>
                
                {/* Editorial Mega Menu Dropdown */}
                <div className="absolute top-20 left-0 w-full bg-surface-bright/95 backdrop-blur-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-500 border-t border-outline-variant/20 shadow-2xl">
                  <div className="max-w-[1440px] mx-auto grid grid-cols-12 gap-8 p-12">
                    
                    {/* Sub-categories */}
                    {category.sections.map((section, idx) => (
                      <div key={section.name} className="col-span-3 space-y-4">
                        <h4 className="font-label text-[10px] tracking-[0.2em] uppercase font-bold text-outline">{section.name}</h4>
                        <ul className="space-y-2">
                          {section.items.map((item) => (
                            <li key={item.name}>
                              <Link to={`/${category.id}/${section.id}/${item.id}`} className="font-headline text-2xl hover:text-primary transition-colors text-on-surface italic block py-1">
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    
                    {/* Featured Imagery (Bento Box style) */}
                    <div className="col-span-6 grid grid-cols-2 gap-4">
                      {category.featured.map((item, idx) => (
                        <div key={item.name} className="relative overflow-hidden group/img aspect-[4/3]">
                          <img src={item.imageSrc} alt={item.imageAlt} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                          <div className="absolute bottom-6 left-6 text-white">
                            <p className="font-label text-[8px] tracking-[0.2em] uppercase text-white/80 mb-1">{idx === 0 ? "Featured" : "New Arrival"}</p>
                            <Link to={`/${category.id}`} className="font-headline text-2xl italic hover:text-primary-fixed transition-colors">
                              {item.name}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            ))}

            {navigation.pages.map((page) => (
              <Link key={page.name} to={page.id === "/" ? "/" : `/${page.id}`} className="font-label uppercase tracking-[0.15em] text-[10px] text-on-surface-variant hover:text-primary transition-colors duration-300 border-b border-transparent hover:border-primary pb-1">
                {page.name}
              </Link>
            ))}
          </div>

          {/* Actions & Search */}
          <div className="flex items-center space-x-4 md:space-x-6">
            
            {/* Expanding Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center group">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors cursor-pointer" onClick={() => document.getElementById('desktop-search').focus()}>
                search
              </span>
              <input 
                id="desktop-search"
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search the collection..." 
                className="search-line-input bg-transparent font-body text-sm placeholder:text-outline placeholder:italic transition-all duration-500 border-t-0 border-l-0 border-r-0 ring-0 focus:ring-0 ml-1"
              />
            </form>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative opacity-80 hover:opacity-100 transition-opacity text-on-surface hover:text-primary hidden sm:block">
              <span className="material-symbols-outlined">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] bg-primary text-on-primary w-4 h-4 flex items-center justify-center font-bold rounded-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative opacity-80 hover:opacity-100 transition-opacity text-on-surface hover:text-primary">
              <span className="material-symbols-outlined">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] bg-primary text-on-primary w-4 h-4 flex items-center justify-center font-bold rounded-none">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth Dropdown */}
            {isLoggedIn ? (
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="flex items-center opacity-80 hover:opacity-100 transition-opacity text-on-surface hover:text-primary outline-none">
                  <span className="material-symbols-outlined">person</span>
                </MenuButton>

                <MenuItems transition className="absolute right-0 z-50 mt-6 w-56 origin-top-right bg-surface border border-outline-variant/30 shadow-2xl focus:outline-none data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-100">
                  <div className="px-6 py-5 border-b border-outline-variant/30 bg-surface-container-low">
                    <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface">Hey, {auth.user?.firstName}</p>
                    <p className="text-xs text-on-surface-variant mt-1 truncate">{auth.user?.email}</p>
                  </div>
                  <div className="py-2">
                    <MenuItem>
                      <Link to="/account/profile" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                        Profile
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link to="/account/orders" className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
                        My Orders
                      </Link>
                    </MenuItem>
                  </div>
                  <div className="border-t border-outline-variant/30 py-2">
                    <MenuItem>
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-6 py-3 text-sm font-bold text-error hover:bg-error-container transition-colors">
                        Logout
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            ) : (
              <button onClick={() => navigate('/login')} className="opacity-80 hover:opacity-100 transition-opacity text-on-surface hover:text-primary flex items-center">
                <span className="material-symbols-outlined">person</span>
              </button>
            )}

          </div>
        </div>
      </nav>

      {/* Auth Modal Container */}
      <AuthModel handleClose={handleClose} open={openAuthModel} />
    </div>
  )
}