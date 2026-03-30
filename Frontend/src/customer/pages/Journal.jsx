import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { findProducts } from "../../Redux/Customers/Product/Action"; 

export default function Journal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customersProduct } = useSelector((store) => store);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch a few products from the backend to use as article images
    dispatch(
      findProducts({
        category: "",
        colors: "",
        sizes: "",
        minPrice: 0,
        maxPrice: 100000,
        minDiscount: 0,
        stock: "",
        sort: "",
        pageNumber: 0,
        pageSize: 10,
      })
    );
  }, [dispatch]);

  // Safely grab the first 5 product images from the database
  const products = customersProduct?.products?.content || [];
  
  // Fallback images just in case the database is empty or loading
  const imgLead = products[0]?.imageUrl || "https://static.zara.net/assets/public/700b/c89d/90ed4e81abb6/b9a56b3a6dc1/02949150700-p/02949150700-p.jpg?w=1024";
  const imgArt1 = products[1]?.imageUrl || "https://static.zara.net/assets/public/bdc5/524f/a73f42059efa/6b56ec3fea18/06103407250-p/06103407250-p.jpg?w=1024";
  const imgArt2 = products[2]?.imageUrl || "https://image.hm.com/assets/hm/54/e9/54e9bd506e4f7f2f267ce0da9fa92a52edd9a68b.jpg?imwidth=1024";
  const imgArt3 = products[3]?.imageUrl || "https://static.zara.net/assets/public/599e/c48f/016a474398ac/012b767d2fd5/02949310800-p/02949310800-p.jpg?w=1024";
  const imgArt4 = products[4]?.imageUrl || "https://image.hm.com/assets/hm/dd/64/dd64de2cfe48fdb6c31636d39a28e49b6234e8d2.jpg?imwidth=1024";

  // Animation variants for smooth scroll reveals
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } }
  };

  return (
    <div className="bg-[#FFF8F5] text-[#1A1109] min-h-screen font-body selection:bg-[#C8742A] selection:text-[#FFF8F5] pb-32 pt-24">
      
      <main className="max-w-[1440px] mx-auto">
        
        {/* MASTHEAD */}
        <motion.header 
          initial="hidden" 
          animate="visible" 
          variants={fadeUp}
          className="flex flex-col items-center text-center px-6 md:px-12 mb-24 md:mb-32 mt-12"
        >
          <span className="text-[0.65rem] uppercase tracking-[0.3em] font-bold text-[#7F756E] mb-6">
            CLOTHSY ATELIER
          </span>
          <h1 className="font-headline italic text-7xl md:text-9xl text-[#1A1109] tracking-tighter leading-none mb-8">
            The Journal.
          </h1>
          <p className="font-body text-sm md:text-base text-[#7F756E] max-w-2xl leading-relaxed tracking-wide">
            Notes on form, architecture, and the modern silhouette.
          </p>
          <div className="w-full mt-24 border-b border-[#D1C4BC]"></div>
        </motion.header>

        {/* LEAD FEATURE */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="px-6 md:px-12 mb-32 md:mb-48"
        >
          <div className="group relative overflow-hidden bg-[#E8E1DE]">
            <div 
              className="aspect-[4/3] md:aspect-[16/9] w-full overflow-hidden cursor-pointer"
              onClick={() => products[0] && navigate(`/product/${products[0].id}`)}
            >
              <img 
                src={imgLead}
                alt="Editorial high fashion photography" 
                className="w-full h-full object-cover object-top grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
              />
            </div>
            
            <span className="hidden md:block absolute top-6 left-6 bg-[#1A1109]/90 text-[#FFF8F5] px-4 py-2 text-[0.65rem] uppercase tracking-widest font-bold pointer-events-none">
              Campaign
            </span>
          </div>

          <div className="py-10 flex flex-col items-start max-w-4xl mx-auto md:mx-0">
            <span className="font-label text-[0.65rem] uppercase tracking-[0.3em] font-bold text-[#7F756E] mb-4">
              OCTOBER 2026 · AW26
            </span>
            <h2 className="font-headline italic text-4xl md:text-6xl text-[#1A1109] leading-tight mb-6 tracking-tighter">
              The Architecture of Drape
            </h2>
            <p className="text-[#7F756E] text-sm leading-relaxed max-w-2xl mb-8">
              Exploring the tension between fluidity and structure. Our latest collection focuses on garments that act as modern armor, folding and falling with deliberate architectural intent.
            </p>
            <button 
              onClick={() => products[0] && navigate(`/product/${products[0].id}`)}
              className="inline-block border-b border-[#1A1109] pb-1 font-label text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#1A1109] hover:text-[#C8742A] hover:border-[#C8742A] transition-colors"
            >
              Explore Collection
            </button>
          </div>
        </motion.section>

        {/* ASYMMETRIC ARCHIVE */}
        <section className="px-6 md:px-12">
          <div className="flex justify-between items-end border-b border-[#D1C4BC] pb-6 mb-16">
            <h2 className="font-headline italic text-3xl md:text-5xl text-[#1A1109] tracking-tighter">
              Archive Directory
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-12">
            
            {/* Article 1 */}
            <motion.article 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="md:col-span-7 group cursor-pointer"
              onClick={() => products[1] && navigate(`/product/${products[1].id}`)}
            >
              <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-[#E8E1DE]">
                <span className="absolute top-4 left-4 z-10 bg-[#1A1109]/90 text-[#FFF8F5] px-3 py-1.5 text-[0.55rem] font-black uppercase tracking-widest">
                  Materiality
                </span>
                <img 
                  src={imgArt1}
                  alt="Textile detail" 
                  className="w-full h-full object-cover object-top grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                />
              </div>
              <div className="mt-8">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#7F756E]">Nov 2026 · Textile Research</span>
                <h3 className="font-headline italic text-3xl md:text-4xl mt-3 text-[#1A1109] group-hover:text-[#C8742A] transition-colors leading-tight tracking-tight">
                  Sculpting the Raw: The New Minimalism
                </h3>
              </div>
            </motion.article>

            {/* Article 2 */}
            <motion.article 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="md:col-span-4 md:col-start-9 md:mt-48 group cursor-pointer"
              onClick={() => products[2] && navigate(`/product/${products[2].id}`)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#E8E1DE]">
                <span className="absolute top-4 left-4 z-10 bg-[#1A1109]/90 text-[#FFF8F5] px-3 py-1.5 text-[0.55rem] font-black uppercase tracking-widest">
                  Atelier
                </span>
                <img 
                  src={imgArt2}
                  alt="Fashion atelier detail" 
                  className="w-full h-full object-cover object-top grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                />
              </div>
              <div className="mt-8">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#7F756E]">Nov 2026 · Process</span>
                <h3 className="font-headline italic text-2xl md:text-3xl mt-3 text-[#1A1109] group-hover:text-[#C8742A] transition-colors leading-tight tracking-tight">
                  Behind the Seams: 48 Hours in the Studio
                </h3>
              </div>
            </motion.article>

            {/* Article 3 */}
            <motion.article 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="md:col-span-5 group cursor-pointer mt-12 md:mt-0"
              onClick={() => products[3] && navigate(`/product/${products[3].id}`)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#E8E1DE]">
                <span className="absolute top-4 left-4 z-10 bg-[#1A1109]/90 text-[#FFF8F5] px-3 py-1.5 text-[0.55rem] font-black uppercase tracking-widest">
                  Culture
                </span>
                <img 
                  src={imgArt3}
                  alt="Architecture abstract" 
                  className="w-full h-full object-cover object-top grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                />
              </div>
              <div className="mt-8">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#7F756E]">Dec 2026 · Inspiration</span>
                <h3 className="font-headline italic text-2xl md:text-3xl mt-3 text-[#1A1109] group-hover:text-[#C8742A] transition-colors leading-tight tracking-tight">
                  Brutalism and the Body: Defining Proportions
                </h3>
              </div>
            </motion.article>

            {/* Article 4 */}
            <motion.article 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="md:col-span-6 md:col-start-7 group cursor-pointer md:-mt-32"
              onClick={() => products[4] && navigate(`/product/${products[4].id}`)}
            >
              <div className="relative aspect-[3/4] md:aspect-[4/3] overflow-hidden bg-[#E8E1DE]">
                <span className="absolute top-4 left-4 z-10 bg-[#1A1109]/90 text-[#FFF8F5] px-3 py-1.5 text-[0.55rem] font-black uppercase tracking-widest">
                  Legacy
                </span>
                <img 
                  src={imgArt4}
                  alt="Vintage silhouette" 
                  className="w-full h-full object-cover object-top grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                />
              </div>
              <div className="mt-8">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-[#7F756E]">Dec 2026 · Archive</span>
                <h3 className="font-headline italic text-3xl md:text-4xl mt-3 text-[#1A1109] group-hover:text-[#C8742A] transition-colors leading-tight tracking-tight">
                  The Persistent Silhouette: Lessons from 1954
                </h3>
              </div>
            </motion.article>

          </div>
        </section>
      </main>

    </div>
  );
}