import { Fragment, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, getUser } from '../../../Redux/Auth/Action'
import { getCart } from '../../../Redux/Customers/Cart/Action' // ➕ Added getCart import
import {
  Dialog, DialogBackdrop, DialogPanel,
  Popover, PopoverButton, PopoverGroup, PopoverPanel,
  Tab, TabGroup, TabList, TabPanel, TabPanels,
  Menu, MenuButton, MenuItem, MenuItems
} from '@headlessui/react'
import { Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { navigation } from './navigationMenu'
import AuthModel from '../Auth/AuthModel'

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const auth = useSelector((store) => store.auth);
  const cart = useSelector((store) => store.cart);
  const jwt = localStorage.getItem("jwt")

  // ── FIX: Fetch the user AND their cart when the app loads ──
  useEffect(() => {
    if (jwt) {
      dispatch(getUser(jwt));
      dispatch(getCart()); // Fetch cart so the badge shows immediately
    }
  }, [jwt, dispatch])

  const openAuthModel = location.pathname === "/login" || location.pathname === "/register"
  const handleClose = () => navigate("/")

  const isLoggedIn = auth.user !== null
  const userInitial = auth.user?.firstName ? auth.user.firstName[0].toUpperCase() : "U"
  const cartCount = cart?.cartItems?.length || 0

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  return (
    <div className="bg-white">

      {/* ── Mobile Menu ── */}
      <Dialog open={open} onClose={setOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-50 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-2xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="size-6" />
              </button>
            </div>

            <TabGroup className="mt-2">
              <div className="border-b border-gray-100">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium whitespace-nowrap text-gray-900 transition-colors duration-200 outline-none data-selected:border-[#c8742a] data-selected:text-[#c8742a]"
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel key={category.name} className="space-y-10 px-4 pt-10 pb-8">
                    <div className="grid grid-cols-2 gap-x-4">
                      {category.featured.map((item) => (
                        <div key={item.name} className="group relative text-sm">
                          <div className="overflow-hidden rounded-xl bg-gray-100 aspect-square">
                            <img
                              alt={item.imageAlt}
                              src={item.imageSrc}
                              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <Link
                            to={`/${category.id}`}
                            className="mt-4 block font-semibold text-gray-900"
                            onClick={() => setOpen(false)}
                          >
                            <span aria-hidden="true" className="absolute inset-0 z-10" />
                            {item.name}
                          </Link>
                          <p className="mt-1 text-[#c8742a] font-medium text-xs uppercase tracking-wide">Shop now</p>
                        </div>
                      ))}
                    </div>
                    {category.sections.map((section) => (
                      <div key={section.name}>
                        <p className="font-bold text-xs uppercase tracking-widest text-gray-900">
                          {section.name}
                        </p>
                        <ul className="mt-4 flex flex-col space-y-4">
                          {section.items.map((item) => (
                            <li key={item.name} className="flow-root">
                              <Link
                                to={`/${category.id}/${section.id}/${item.id}`}
                                className="text-sm text-gray-500 hover:text-[#c8742a] transition-colors"
                                onClick={() => setOpen(false)}
                              >
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

            <div className="space-y-4 border-t border-gray-100 px-4 py-6">
              {navigation.pages.map((page) => (
                <Link
                  key={page.name}
                  to={page.id === "/" ? "/" : `/${page.id}`}
                  className="block text-sm font-medium text-gray-700 hover:text-[#c8742a] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {page.name}
                </Link>
              ))}
            </div>

            <div className="space-y-4 border-t border-gray-100 px-4 py-6 bg-gray-50/50">
              {isLoggedIn ? (
                <>
                  <Link to="/account/profile" className="block text-sm font-medium text-gray-700 hover:text-[#c8742a]" onClick={() => setOpen(false)}>Profile</Link>
                  <Link to="/account/orders" className="block text-sm font-medium text-gray-700 hover:text-[#c8742a]" onClick={() => setOpen(false)}>My Orders</Link>
                  <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-sm font-medium text-gray-700 hover:text-[#c8742a]" onClick={() => setOpen(false)}>Sign in</Link>
                  <Link to="/register" className="block text-sm font-medium text-[#c8742a] hover:text-[#b06524]" onClick={() => setOpen(false)}>Create account</Link>
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* ── Desktop Header ── */}
      <header className="relative z-40">
        <p
          className="flex h-10 items-center justify-center px-4 text-sm font-medium text-white sm:px-6 lg:px-8"
          style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
        >
          Get free delivery on orders over ₹999
        </p>

        <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
          <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center">

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-transparent p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all lg:hidden"
              >
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="size-6" />
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link to="/" className="flex items-center gap-2 group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
                  >
                    S
                  </div>
                  <span className="hidden sm:block font-black text-xl tracking-tight text-gray-900 transition-colors group-hover:text-[#c8742a]">
                    Shophive
                  </span>
                </Link>
              </div>

              {/* Desktop Flyout menus */}
              <PopoverGroup className="hidden lg:ml-12 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      <div className="relative flex">
                        <PopoverButton className="group relative flex items-center justify-center text-sm font-semibold transition-colors duration-200 ease-out text-gray-700 hover:text-[#c8742a] data-open:text-[#c8742a] outline-none">
                          {category.name}
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 -bottom-px z-30 h-0.5 transition duration-300 ease-out scale-x-0 group-data-open:scale-x-100 bg-[#c8742a]"
                          />
                        </PopoverButton>
                      </div>

                      <PopoverPanel
                        transition
                        className="absolute inset-x-0 top-full z-20 bg-white/95 backdrop-blur-md text-sm text-gray-500 shadow-2xl ring-1 ring-black/5 transition origin-top data-closed:-translate-y-2 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                      >
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-12">
                            <div className="col-start-2 grid grid-cols-2 gap-x-8">
                              {category.featured.map((item) => (
                                <div key={item.name} className="group relative text-base sm:text-sm">
                                  <div className="overflow-hidden rounded-2xl bg-gray-100 shadow-sm aspect-square">
                                    <img
                                      alt={item.imageAlt}
                                      src={item.imageSrc}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                  </div>
                                  <Link
                                    to={`/${category.id}`}
                                    className="mt-4 block font-bold text-gray-900 group-hover:text-[#c8742a] transition-colors"
                                  >
                                    <span aria-hidden="true" className="absolute inset-0 z-10" />
                                    {item.name}
                                  </Link>
                                  <p className="mt-1 font-medium text-[#c8742a] text-xs uppercase tracking-wide">Shop now &rarr;</p>
                                </div>
                              ))}
                            </div>

                            <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-8 text-sm">
                              {category.sections.map((section) => (
                                <div key={section.name}>
                                  <p className="font-bold text-xs uppercase tracking-widest text-gray-900 mb-4">
                                    {section.name}
                                  </p>
                                  <ul className="space-y-3">
                                    {section.items.map((item) => (
                                      <li key={item.name}>
                                        <Link
                                          to={`/${category.id}/${section.id}/${item.id}`}
                                          className="text-gray-500 hover:text-[#c8742a] transition-colors font-medium relative w-fit block after:block after:content-[''] after:absolute after:h-[1px] after:bg-[#c8742a] after:w-full after:scale-x-0 after:hover:scale-x-100 after:transition after:duration-300 after:origin-left"
                                        >
                                          {item.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </Popover>
                  ))}

                  {navigation.pages.map((page) => (
                    <Link
                      key={page.name}
                      to={page.id === "/" ? "/" : `/${page.id}`}
                      className="flex items-center text-sm font-semibold text-gray-700 transition-colors hover:text-[#c8742a]"
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </PopoverGroup>

              {/* Right side icons */}
              <div className="ml-auto flex items-center gap-2 sm:gap-4">
                <button className="p-2 rounded-full text-gray-400 hover:text-[#c8742a] hover:bg-orange-50 transition-all duration-200">
                  <span className="sr-only">Search</span>
                  <MagnifyingGlassIcon className="size-5 sm:size-6" />
                </button>

                {/* Cart — count from Redux */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-full text-gray-400 hover:text-[#c8742a] hover:bg-orange-50 transition-all duration-200 flex items-center group"
                >
                  <ShoppingBagIcon className="size-5 sm:size-6 transition-transform group-hover:scale-110" />
                  {cartCount > 0 && (
                    <span
                      className="absolute top-1 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 rounded-full shadow-sm"
                      style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative ml-2">
                  {isLoggedIn ? (
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 outline-none ring-2 ring-transparent focus:ring-orange-200"
                        style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
                      >
                        {userInitial}
                      </MenuButton>

                      <MenuItems
                        transition
                        className="absolute right-0 z-50 mt-3 w-56 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
                      >
                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            Hey, {auth.user?.firstName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{auth.user?.email}</p>
                        </div>
                        <div className="py-1">
                          <MenuItem>
                            <Link to="/account/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-[#c8742a] transition-colors data-focus:bg-orange-50 data-focus:text-[#c8742a]">
                              <svg className="w-4 h-4 text-[#c8742a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Profile
                            </Link>
                          </MenuItem>
                          <MenuItem>
                            <Link to="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-[#c8742a] transition-colors data-focus:bg-orange-50 data-focus:text-[#c8742a]">
                              <svg className="w-4 h-4 text-[#c8742a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              My Orders
                            </Link>
                          </MenuItem>
                        </div>
                        <div className="border-t border-gray-50 py-1">
                          <MenuItem>
                            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors data-focus:bg-red-50">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Logout
                            </button>
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Menu>
                  ) : (
                    <div className="hidden lg:flex items-center gap-5">
                      <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-[#c8742a] transition-colors">
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        className="text-sm font-semibold px-5 py-2.5 rounded-full text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        style={{ background: "linear-gradient(135deg, #d4832f, #c8742a)" }}
                      >
                        Create account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <AuthModel handleClose={handleClose} open={openAuthModel} />
    </div>
  )
}