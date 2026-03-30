import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, getUser } from '../../../Redux/Auth/Action'
import { getCart } from '../../../Redux/Customers/Cart/Action'
import { getWishlist } from '../../../Redux/Customers/Wishlist/Action'
import {
  Dialog, DialogBackdrop, DialogPanel,
  Tab, TabGroup, TabList, TabPanel, TabPanels,
  Menu, MenuButton, MenuItem, MenuItems,
} from '@headlessui/react'
import { gsap } from 'gsap'
import AuthModel from '../Auth/AuthModel'

/* 
   NAV DATA — Women / Men + real product images from JSON
*/
const NAV = [
  {
    label: 'WOMEN',
    id: 'collections',
    sections: [
      {
        heading: 'Clothing',
        id: 'silhouettes',
        items: [
          { label: 'Silk Dresses',    id: 'silk-dresses',    img: 'https://static.zara.net/assets/public/4372/a485/f72645259e91/921f424a71fb/04192001691-e1/04192001691-e1.jpg?ts=1773398613979&w=813' },
          { label: 'Evening Dresses', id: 'evening-dresses', img: 'https://static.zara.net/assets/public/51c9/0d67/36c34a98b5d6/22c8833fa478/02581532620-p/02581532620-p.jpg?ts=1774344742980&w=813' },
          { label: 'Blouses',         id: 'blouses',         img: 'https://static.zara.net/assets/public/2a29/35f0/2fda4a3eb9d2/e5b29ce0adda/01689023800-p/01689023800-p.jpg?ts=1774372280845&w=813' },
          { label: 'Outerwear',       id: 'outerwear',       img: 'https://static.zara.net/assets/public/9661/892a/3ea64d839beb/75aeb4ed3739/04070023704-p/04070023704-p.jpg?ts=1768566304733&w=813' },
          { label: 'Knits',           id: 'knits',           img: 'https://static.zara.net/assets/public/7873/d55e/e69149af9e9e/3b9cec7d8a3f/05536018330-ult1/05536018330-ult1.jpg?ts=1768997416314&w=813' },
          { label: 'Trousers',        id: 'womens-trousers', img: 'https://static.zara.net/assets/public/80ec/5a85/de8e4bac8874/415c00c9ec42/04661408800-p/04661408800-p.jpg?ts=1765546370666&w=813' },
          { label: 'Jumpers',         id: 'jumpers',         img: 'https://static.zara.net/assets/public/5058/5caf/0af44c2f9ff5/2c08c0abf244/08851005645-p/08851005645-p.jpg?ts=1774450618068&w=813' },
        ],
      },
      {
        heading: 'Accessories',
        id: 'accents',
        items: [
          { label: 'Bags',       id: 'bags',       img: 'https://static.zara.net/assets/public/b1f7/fb0d/426348278ca8/7160c528be19/16213711500-p/16213711500-p.jpg?ts=1773933821556&w=813' },
          { label: 'Footwear',   id: 'footwear',   img: 'https://static.zara.net/assets/public/9f49/dd43/5a33480382c5/eda55ac08359/12254719700-e1/12254719700-e1.jpg?ts=1772196501567&w=813' },
          { label: 'Jewellery',  id: 'jewelry',    img: 'https://static.zara.net/assets/public/6d12/4271/2549430dbc2a/7271d3bc46f3/01856116303-p/01856116303-p.jpg?ts=1774444624246&w=813' },
          { label: 'Eyewear',    id: 'eyewear',    img: 'https://www.versace.com/dw/image/v2/BGWN_PRD/on/demandware.static/-/Sites-ver-master-catalog/default/dw249b1688/original/90_O2289-O1002D861_ONUL_20_GrecaPilotSunglasses-Sunglasses-Versace-online-store_0_2.jpg?sw=1200&q=85&strip=true' },
          { label: 'Scarves',    id: 'scarves',    img: 'https://static.zara.net/assets/public/2cfa/386b/cbf1482db833/ae30ba41c40a/03920172712-p/03920172712-p.jpg?ts=1774430872765&w=813' },
        ],
      },
    ],
    featured: [
      { label: 'The Silk Edit',    sublabel: 'NEW IN',   img: 'https://static.zara.net/assets/public/5c5a/70db/51704f0c9a69/3343e94f9e26/02644419539-p/02644419539-p.jpg?ts=1773835684796&w=813',  link: '/collections/silhouettes/silk-dresses' },
      { label: 'Evening Dressing', sublabel: 'EDIT',     img: 'https://static.zara.net/assets/public/acec/dea1/51ed4bbbb4ca/0b685f2a1bc2/04387044715-p/04387044715-p.jpg?ts=1774009912501&w=813',  link: '/collections/silhouettes/evening-dresses' },
    ],
  },
  {
    label: 'MEN',
    id: 'atelier',
    sections: [
      {
        heading: 'Clothing',
        id: 'silhouettes',
        items: [
          { label: 'Overcoats',     id: 'overcoats',     img: 'https://static.zara.net/assets/public/599e/c48f/016a474398ac/012b767d2fd5/02949310800-p/02949310800-p.jpg?ts=1762520435301&w=1024' },
          { label: 'Suits',         id: 'suits',         img: 'https://image.hm.com/assets/hm/dd/64/dd64de2cfe48fdb6c31636d39a28e49b6234e8d2.jpg?imwidth=2160' },
          { label: 'Poplin Shirts', id: 'poplin-shirts', img: 'https://static.zara.net/assets/public/bdc5/524f/a73f42059efa/6b56ec3fea18/06103407250-p/06103407250-p.jpg?ts=1770278470760&w=1024' },
          { label: 'Fine Knits',    id: 'fine-knits',    img: 'https://static.zara.net/assets/public/9619/9b2c/492d4139b411/02c8be2c97b6/03332410251-p/03332410251-p.jpg?ts=1770742115747&w=813' },
          { label: 'Raw Denim',     id: 'raw-denim',     img: 'https://static.zara.net/assets/public/3588/a65a/997b4b679cf9/cdba5f1337b0/00840479822-p/00840479822-p.jpg?ts=1772612778543&w=813' },
        ],
      },
      {
        heading: 'Accessories',
        id: 'accents',
        items: [
          { label: 'Belts',       id: 'belts',   img: 'https://static.zara.net/assets/public/bf24/afad/328347e3b1e1/daa242317489/05919421700-a1/05919421700-a1.jpg?ts=1773659508605&w=813' },
          { label: 'Boots',       id: 'boots',   img: 'https://static.zara.net/assets/public/7e3d/ab4d/49b44d1bbcaf/878671c33bc1/12201620001-000-a1/12201620001-000-a1.jpg?ts=1755618495127&w=813' },
          { label: 'Watches',     id: 'watches', img: 'https://www.tissotwatches.com/dw/image/v2/BKKD_PRD/on/demandware.static/-/Sites-Tissot-Catalogue/default/dwe5f91ba9/product-pictures/dba55532-a5c2-4766-90ec-be5d0c648114_T141-462-27-051-00_shadow.png?sm=fit&sw=1680&sh=1680,gravity=center' },
        ],
      },
    ],
    featured: [
      { label: 'The Overcoat',  sublabel: 'NEW IN',   img: 'https://static.zara.net/assets/public/700b/c89d/90ed4e81abb6/b9a56b3a6dc1/02949150700-p/02949150700-p.jpg?ts=1759306100987&w=1024', link: '/atelier/silhouettes/overcoats' },
      { label: 'Suiting Season', sublabel: 'ATELIER', img: 'https://image.hm.com/assets/hm/54/e9/54e9bd506e4f7f2f267ce0da9fa92a52edd9a68b.jpg?imwidth=2160',                                    link: '/atelier/silhouettes/suits' },
    ],
  },
  { label: 'JOURNAL',     id: null, path: '/journal', sections: [], featured: [] },
  { label: 'ABOUT',       id: null, path: '/about',   sections: [], featured: [] },
]

const ANNOUNCEMENT_ITEMS = [
  'FREE SHIPPING ON ORDERS ABOVE ₹2999', '·',
  'NEW ARRIVALS EVERY FRIDAY', '·',
  'COMPLIMENTARY GIFTWRAPPING ON ALL ORDERS', '·',
  'FREE SHIPPING ON ORDERS ABOVE ₹2999', '·',
  'NEW ARRIVALS EVERY FRIDAY', '·',
  'COMPLIMENTARY GIFTWRAPPING ON ALL ORDERS',
]

/* 
   ANNOUNCEMENT BAR — GSAP ticker
*/
function AnnouncementBar() {
  const trackRef = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, { xPercent: -50, duration: 30, ease: 'none', repeat: -1 })
    }, trackRef)
    return () => ctx.revert()
  }, [])
  return (
    <div style={{ background: '#0A0A0A', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 999 }}>
      <div ref={trackRef} style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', willChange: 'transform' }}>
        {[...ANNOUNCEMENT_ITEMS, ...ANNOUNCEMENT_ITEMS].map((t, i) => (
          <span key={i} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* 
   HOVER PREVIEW — tiny product image next to hovered item
*/
function HoverPreview({ src }) {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { opacity: 0, scale: 0.94, y: 6 }, { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: 'power2.out' })
    });
    return () => ctx.revert();
  }, [])
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute', left: 'calc(100% + 20px)', top: '50%',
        transform: 'translateY(-50%)',
        width: 110, height: 148, overflow: 'hidden',
        pointerEvents: 'none', background: '#F0F0F0', zIndex: 100, 
      }}
    >
      <img 
        src={src} 
        alt="" 
        onError={(e) => { e.target.src = "https://via.placeholder.com/110x148?text=+" }} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'grayscale(15%)' }} 
      />
    </div>
  )
}

/* 
   MEGA MENU
*/
function MegaMenu({ category, visible, topOffset }) {
  const panelRef = useRef(null)
  const itemRefs = useRef([])
  const imgRefs  = useRef([])
  const prevVis  = useRef(false)
  const [hoveredImg, setHoveredImg] = useState(null)

  itemRefs.current = [];
  imgRefs.current = [];

  useEffect(() => {
    if (!panelRef.current) return
    const ctx = gsap.context(() => {
      if (visible && !prevVis.current) {
        gsap.fromTo(panelRef.current,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.26, ease: 'power3.out' }
        )
        gsap.fromTo(itemRefs.current.filter(Boolean),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.38, stagger: 0.038, ease: 'power2.out', delay: 0.06 }
        )
        gsap.fromTo(imgRefs.current.filter(Boolean),
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 0.55, stagger: 0.09, ease: 'power2.out', delay: 0.1 }
        )
      } else if (!visible && prevVis.current) {
        gsap.to(panelRef.current, { opacity: 0, y: -8, duration: 0.18, ease: 'power2.in' })
      }
    })
    prevVis.current = visible
    return () => ctx.revert()
  }, [visible])

  if (!category.sections.length) return null

  let itemIdx = 0;
  let imgIdx = 0;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: topOffset, 
        left: 0, width: '100vw',
        background: '#FFFFFF',
        borderTop: '1px solid #E8E8E8',
        borderBottom: '1px solid #E8E8E8',
        pointerEvents: visible ? 'all' : 'none',
        opacity: 0,
        zIndex: 90,
        boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
        transition: 'top 320ms ease',
      }}
    >
      <div
        style={{
          maxWidth: 1440, margin: '0 auto',
          padding: '52px 96px 60px',
          display: 'grid',
          gridTemplateColumns: 'repeat(12,1fr)',
          gap: 32,
        }}
      >
        {category.sections.map((section, sIdx) => (
          <div key={section.id} style={{ gridColumn: 'span 3', position: 'relative', zIndex: 50 - sIdx }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: 16 }}>
              {section.heading}
            </p>
            <div style={{ height: 1, background: '#EBEBEB', marginBottom: 20 }} />
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {section.items.map((item) => {
                const currentIndex = itemIdx++;
                return (
                  <li
                    key={item.id}
                    ref={el => { if(el) itemRefs.current[currentIndex] = el }}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setHoveredImg(item.id)}
                    onMouseLeave={() => setHoveredImg(null)}
                  >
                    <Link
                      to={`/${category.id}/${section.id}/${item.id}`}
                      style={{
                        display: 'block',
                        fontFamily: "'Cormorant Garamond',serif",
                        fontStyle: 'italic', fontWeight: 400,
                        fontSize: 26, color: '#0A0A0A',
                        lineHeight: 1.58, textDecoration: 'none',
                        transition: 'padding-left 220ms ease, opacity 180ms ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.paddingLeft = '8px'; e.currentTarget.style.opacity = '0.42' }}
                      onMouseLeave={e => { e.currentTarget.style.paddingLeft = '0';   e.currentTarget.style.opacity = '1' }}
                    >
                      {item.label}
                    </Link>
                    {hoveredImg === item.id && item.img && <HoverPreview src={item.img} />}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Featured tiles — 3 cols each */}
        {category.featured.map((f, fi) => {
          const currentImgIndex = imgIdx++;
          return (
            <div
              key={fi}
              ref={el => { if(el) imgRefs.current[currentImgIndex] = el }}
              style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column' }}
            >
              <Link
                to={f.link}
                style={{ display: 'block', aspectRatio: '3/4', overflow: 'hidden', background: '#F0F0F0', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1.045)'; e.currentTarget.style.outline = '1px solid #0A0A0A' }}
                onMouseLeave={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1)';     e.currentTarget.style.outline = 'none' }}
              >
                <img
                  src={f.img} alt={f.label}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x400?text=+" }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', filter: 'grayscale(8%)', transition: 'transform 650ms ease' }}
                />
              </Link>
              <div style={{ marginTop: 12 }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: 4 }}>{f.sublabel}</p>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 17, color: '#0A0A0A' }}>{f.label}</p>
              </div>
            </div>
          )
        })}

        {/* View all */}
        <div style={{ gridColumn: '1/-1', paddingTop: 28, borderTop: '1px solid #EBEBEB', display: 'flex', justifyContent: 'flex-end' }}>
          <Link to={`/${category.id}`} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0A0A0A', textDecoration: 'none', borderBottom: '1px solid #0A0A0A', paddingBottom: 2 }}>
            View all {category.label.charAt(0) + category.label.slice(1).toLowerCase()} →
          </Link>
        </div>
      </div>
    </div>
  )
}

/* 
   BADGE
*/
function Badge({ count, dark }) {
  if (!count || count <= 0) return null
  return (
    <span style={{
      position: 'absolute', top: -4, right: -5,
      width: 14, height: 14, borderRadius: 0,
      background: dark ? '#FFFFFF' : '#0A0A0A',
      color:      dark ? '#0A0A0A' : '#FFFFFF',
      fontSize: 8, fontWeight: 700,
      fontFamily: "'DM Sans',sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {count > 9 ? '9+' : count}
    </span>
  )
}

/* 
   NAVIGATION  — main export
*/
export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const menuTimeoutRef = useRef(null)
  const searchRef  = useRef(null)
  const navRef     = useRef(null)
  const logoRef    = useRef(null)
  const linksRef   = useRef([])
  const iconsRef   = useRef(null)

  const navigate  = useNavigate()
  const location  = useLocation()
  const dispatch  = useDispatch()

  const auth          = useSelector(s => s.auth) || {}
  const cartState     = useSelector(s => s.cart) || {}
  const wishlistState = useSelector(s => s.wishlist) || {}
  
  const isLoggedIn    = auth.user !== null
  const cartCount     = cartState.cartItems?.length || 0
  const wishlistCount = wishlistState.wishlist?.products?.length || 0

  useEffect(() => {
    const localJwt = localStorage.getItem('jwt')
    if (localJwt && !auth.user) { 
      dispatch(getUser(localJwt)); 
    }
  }, [dispatch, auth.user])

  useEffect(() => {
    if (auth.user) {
      dispatch(getCart()); 
      dispatch(getWishlist());
    }
  }, [auth.user, dispatch])

  /* scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* GSAP mount entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(logoRef.current,
        { opacity: 0, y: -10, letterSpacing: '0.65em' },
        { opacity: 1, y: 0, letterSpacing: '0.35em', duration: 1.2, ease: 'power3.out', delay: 0.05 }
      )
      gsap.fromTo(linksRef.current.filter(Boolean),
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.08, ease: 'power2.out', delay: 0.25 }
      )
      if (iconsRef.current) {
        gsap.fromTo(iconsRef.current,
          { opacity: 0, x: 14 },
          { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out', delay: 0.5 }
        )
      }
    }, navRef)
    return () => ctx.revert()
  }, [])

  /* GSAP search expand / collapse */
  useEffect(() => {
    if (!searchRef.current) return
    if (searchOpen) {
      gsap.fromTo(searchRef.current,
        { width: 0, opacity: 0 },
        { width: 190, opacity: 1, duration: 0.4, ease: 'power2.out' }
      )
      searchRef.current.focus()
    } else {
      gsap.to(searchRef.current, { width: 0, opacity: 0, duration: 0.26, ease: 'power2.in' })
    }
  }, [searchOpen])

  const isHomePage    = location.pathname === '/'
  const openAuthModel = location.pathname === '/login' || location.pathname === '/register'

  const handleLogout = () => { dispatch(logout()); navigate('/') }
  
  const handleSearchSubmit = e => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`)
      setSearchInput(''); setSearchOpen(false); setMobileOpen(false)
    }
  }
  const openMenu  = id => { clearTimeout(menuTimeoutRef.current); if (id) setActiveMenu(id) }
  const closeMenu = ()  => { menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 130) }

  /* Appearance */
  const transparent  = isHomePage && !scrolled
  const navBg        = transparent ? 'linear-gradient(to bottom,rgba(0,0,0,0.62) 0%,rgba(0,0,0,0) 100%)' : '#FFFFFF'
  const textHi       = transparent ? '#FFFFFF' : '#0A0A0A'
  const textLo       = transparent ? 'rgba(255,255,255,0.68)' : '#6B6B6B'
  const borderColor  = transparent ? 'transparent' : '#E8E8E8'

  const iconBase = {
    background: 'none', border: 'none', padding: 0,
    cursor: 'pointer', position: 'relative',
    display: 'flex', alignItems: 'center',
    transition: 'color 200ms ease', lineHeight: 1,
    fontFamily: 'inherit',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,300,0,0&display=swap');
        .mat { font-family:'Material Symbols Outlined'; font-size:20px; font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24; user-select:none; line-height:1; }
        .nlbl { position:relative; display:inline-block; }
        .nlbl::after { content:''; position:absolute; bottom:-3px; left:0; width:100%; height:1px; background:currentColor; transform:scaleX(0); transform-origin:left; transition:transform 260ms ease; }
        .nlbl:hover::after,.nlbl.on::after { transform:scaleX(1); }
        .gsearch { background:transparent; border:none; border-bottom:1px solid currentColor; outline:none; padding:0 0 3px; font-family:'DM Sans',sans-serif; font-style:italic; font-size:13px; color:inherit; width:0; opacity:0; overflow:hidden; }
        .gsearch::placeholder { opacity:.4; }
        .mdrawer { background:#fff; border-right:1px solid #E8E8E8; height:100%; overflow-y:auto; display:flex; flex-direction:column; width:min(85vw,360px); }
        .mdrawer::-webkit-scrollbar { display:none; }
        .adrop { position:absolute; right:0; top:calc(100% + 14px); width:220px; background:#fff; border:1px solid #E8E8E8; z-index:300; animation:dropIn 140ms ease forwards; }
        @keyframes dropIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        .aitem { display:block; width:100%; padding:11px 20px; font-family:'DM Sans',sans-serif; font-size:12px; color:#0A0A0A; text-decoration:none; text-align:left; background:none; border:none; cursor:pointer; transition:background 130ms; }
        .aitem:hover { background:#F7F7F7; }
      `}</style>

      <AnnouncementBar />

      <nav
        ref={navRef}
        style={{
          position: 'fixed', 
          top: scrolled ? 0 : 36,
          left: 0, width: '100%', zIndex: 100, height: 64,
          background: navBg, borderBottom: `1px solid ${borderColor}`,
          transition: 'background 320ms ease, border-color 320ms ease, top 320ms ease',
        }}
        onMouseLeave={closeMenu}
      >
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <button onClick={() => setMobileOpen(true)} className="lg:hidden" style={{ ...iconBase, color: textHi }}>
            <span className="mat">menu</span>
          </button>

          <Link ref={logoRef} to="/"
            style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:26, letterSpacing:'0.35em', color:textHi, textDecoration:'none', textTransform:'uppercase', transition:'color 320ms ease', flexShrink:0, opacity:0 }}>
            CLOTHSY
          </Link>

          <div className="hidden lg:flex items-center" style={{ gap:36, height:'100%' }}>
            {NAV.map((cat, i) => (
              <div key={cat.label} ref={el => { if(el) linksRef.current[i] = el }}
                style={{ height:'100%', display:'flex', alignItems:'center', opacity:0 }}
                onMouseEnter={() => openMenu(cat.id)}>
                {cat.path ? (
                  <Link to={cat.path} className={`nlbl${location.pathname === cat.path ? ' on' : ''}`}
                    style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:location.pathname===cat.path ? textHi : textLo, textDecoration:'none', transition:'color 200ms' }}>
                    {cat.label}
                  </Link>
                ) : (
                  <span className={`nlbl${activeMenu===cat.id ? ' on' : ''}`}
                    style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:activeMenu===cat.id ? textHi : textLo, cursor:'default', transition:'color 200ms' }}>
                    {cat.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div ref={iconsRef} style={{ display:'flex', alignItems:'center', gap:20, opacity:0 }}>
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center" style={{ gap:8, color:textLo }}>
              <button type="button" onClick={() => setSearchOpen(v => !v)}
                style={{ ...iconBase, color: searchOpen ? textHi : textLo }}
                onMouseEnter={e => e.currentTarget.style.color = textHi}
                onMouseLeave={e => e.currentTarget.style.color = searchOpen ? textHi : textLo}>
                <span className="mat">search</span>
              </button>
              <input ref={searchRef} className="gsearch"
                style={{ color:textHi, borderBottomColor:textHi }}
                placeholder="Search..." value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onBlur={() => { if (!searchInput) setSearchOpen(false) }} />
            </form>

            <Link to="/wishlist" className="hidden sm:flex"
              style={{ ...iconBase, color:textLo, textDecoration:'none' }}
              onMouseEnter={e => e.currentTarget.style.color = textHi}
              onMouseLeave={e => e.currentTarget.style.color = textLo}>
              <span className="mat">favorite</span>
              <Badge count={wishlistCount} dark={transparent} />
            </Link>

            <Link to="/cart" style={{ ...iconBase, color:textLo, textDecoration:'none' }}
              onMouseEnter={e => e.currentTarget.style.color = textHi}
              onMouseLeave={e => e.currentTarget.style.color = textLo}>
              <span className="mat">shopping_bag</span>
              <Badge count={cartCount} dark={transparent} />
            </Link>

            {isLoggedIn ? (
              <Menu as="div" style={{ position:'relative' }}>
                <MenuButton style={{ ...iconBase, color:textLo }}
                  onMouseEnter={e => e.currentTarget.style.color = textHi}
                  onMouseLeave={e => e.currentTarget.style.color = textLo}>
                  <span className="mat">person</span>
                </MenuButton>
                <MenuItems className="adrop" style={{ outline:'none' }}>
                  <div style={{ padding:'18px 20px', borderBottom:'1px solid #E8E8E8', background:'#F7F7F7' }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#0A0A0A' }}>
                      {auth.user?.firstName?.toUpperCase()}
                    </p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'#6B6B6B', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {auth.user?.email}
                    </p>
                  </div>
                  <div style={{ padding:'6px 0' }}>
                    <MenuItem><Link to="/account/profile" className="aitem">Profile</Link></MenuItem>
                    <MenuItem><Link to="/account/orders" className="aitem">My Orders</Link></MenuItem>
                  </div>
                  <div style={{ borderTop:'1px solid #E8E8E8', padding:'6px 0' }}>
                    <MenuItem>
                      <button onClick={handleLogout} className="aitem" style={{ color:'#C0392B', fontWeight:600 }}>Logout</button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            ) : (
              <button onClick={() => navigate('/login')} style={{ ...iconBase, color:textLo }}
                onMouseEnter={e => e.currentTarget.style.color = textHi}
                onMouseLeave={e => e.currentTarget.style.color = textLo}>
                <span className="mat">person</span>
              </button>
            )}
          </div>
        </div>

        {NAV.filter(c => c.sections.length > 0).map(cat => (
          <MegaMenu key={cat.id} category={cat} visible={activeMenu === cat.id} topOffset={scrolled ? 64 : 100} />
        ))}
      </nav>

      {!isHomePage && <div style={{ height: 36 + 64 }} />}

      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} className="relative z-[200] lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 transition-opacity duration-300 data-closed:opacity-0" style={{ background:'rgba(0,0,0,0.3)' }} />
        <div className="fixed inset-0 flex">
          <DialogPanel transition className="mdrawer transition duration-300 data-closed:-translate-x-full">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px 16px', borderBottom:'1px solid #E8E8E8' }}>
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:22, letterSpacing:'0.32em', color:'#0A0A0A', textDecoration:'none' }}>
                CLOTHSY
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#0A0A0A', padding:4 }}>
                <span className="mat">close</span>
              </button>
            </div>

            <div style={{ padding:'18px 24px', borderBottom:'1px solid #E8E8E8' }}>
              <form onSubmit={handleSearchSubmit} style={{ display:'flex', alignItems:'center', borderBottom:'1px solid #0A0A0A', paddingBottom:8 }}>
                <input type="text" placeholder="Search..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', fontFamily:"'DM Sans',sans-serif", fontStyle:'italic', fontSize:13, color:'#0A0A0A' }} />
                <button type="submit" style={{ background:'none', border:'none', cursor:'pointer', color:'#0A0A0A' }}>
                  <span className="mat">search</span>
                </button>
              </form>
            </div>

            <TabGroup style={{ flex:1 }}>
              <div style={{ borderBottom:'1px solid #E8E8E8' }}>
                <TabList style={{ display:'flex', padding:'0 24px', gap:28 }}>
                  {NAV.filter(c => c.sections.length > 0).map(cat => (
                    <Tab key={cat.id} style={{ outline:'none' }} className="py-4 border-b-2 border-transparent data-selected:border-black">
                      {({ selected }) => (
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:selected ? '#0A0A0A' : '#6B6B6B', transition:'color 150ms' }}>
                          {cat.label}
                        </span>
                      )}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels>
                {NAV.filter(c => c.sections.length > 0).map(cat => (
                  <TabPanel key={cat.id} style={{ padding:'24px' }}>
                    {cat.sections.map(section => (
                      <div key={section.id} style={{ marginBottom:28 }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'#BBBBBB', marginBottom:14 }}>
                          {section.heading}
                        </p>
                        <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                          {section.items.map(item => (
                            <li key={item.id} style={{ minHeight:44, display:'flex', alignItems:'center' }}>
                              <Link to={`/${cat.id}/${section.id}/${item.id}`} onClick={() => setMobileOpen(false)}
                                style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:24, color:'#0A0A0A', textDecoration:'none' }}>
                                {item.label}
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

            <div style={{ borderTop:'1px solid #E8E8E8', padding:'20px 24px' }}>
              {NAV.filter(c => c.path).map(p => (
                <Link key={p.path} to={p.path} onClick={() => setMobileOpen(false)}
                  style={{ display:'block', fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6B6B6B', textDecoration:'none', marginBottom:14 }}>
                  {p.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link to="/account/profile" onClick={() => setMobileOpen(false)}
                    style={{ display:'block', fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6B6B6B', textDecoration:'none', marginBottom:14 }}>
                    MY ACCOUNT
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }}
                    style={{ background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#C0392B', padding:0 }}>
                    LOGOUT
                  </button>
                </>
              ) : (
                <button onClick={() => { navigate('/login'); setMobileOpen(false) }}
                  style={{ background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#0A0A0A', padding:0 }}>
                  SIGN IN
                </button>
              )}
            </div>

          </DialogPanel>
        </div>
      </Dialog>

      <AuthModel handleClose={() => navigate('/')} open={openAuthModel} />
    </>
  )
}