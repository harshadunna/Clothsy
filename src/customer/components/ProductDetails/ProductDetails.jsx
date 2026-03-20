import { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

// IMPORT YOUR COMPONENTS HERE
import ProductReviewCard from "./ProductReviewCard"; 
import HomeSectionCard from "../HomeSectionCard/HomeSectionCard"; // Adjust this path if needed based on your folder structure!

// --- DUMMY DATA ---
const dummyProductInfo = {
  brand: "DressBerry",
  title: "Women Floral Print Flared Gown",
  discountedPrice: 996,
  price: 1999,
  discountPersent: 50,
  imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
  description: "Experience the perfect blend of comfort and style. This beautiful floral print flared gown is crafted from premium breathable fabric, making it an ideal choice for summer evenings, casual outings, or elegant garden parties. Featuring a flattering silhouette and delicate detailing.",
  highlights: [
    "Hand-stitched premium cotton blend",
    "Breathable and lightweight fabric",
    "Fade-resistant proprietary dyes",
    "Ethically sourced and manufactured",
  ],
  reviews: [
    { id: 1, author: "Jane Doe", rating: 5, comment: "Absolutely stunning! The fit is true to size and the fabric feels incredibly premium. I wore this to a summer wedding and received countless compliments.", date: "Oct 12, 2023" },
    { id: 2, author: "Alice Smith", rating: 4, comment: "Beautiful design and very comfortable. Deducted one star because it's slightly longer than expected, but nothing a pair of heels couldn't fix.", date: "Nov 05, 2023" }
  ]
};

const dummySimilarProducts = [
  { id: 1, brand: "Biba", title: "Yellow Anarkali Suit", discountedPrice: 1500, price: 3000, discountPersent: 50, imageUrl: "https://images.unsplash.com/photo-1619533394727-57d522857f89?auto=format&fit=crop&w=800&q=80" },
  { id: 2, brand: "W", title: "Pink Cotton Kurta", discountedPrice: 1200, price: 2400, discountPersent: 50, imageUrl: "https://images.unsplash.com/photo-1583391733958-d2597284cece?auto=format&fit=crop&w=800&q=80" },
  { id: 3, brand: "Aurelia", title: "Blue Straight Kurti", discountedPrice: 800, price: 1600, discountPersent: 50, imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80" },
  { id: 4, brand: "FabIndia", title: "White Silk Tunic", discountedPrice: 2100, price: 3000, discountPersent: 30, imageUrl: "https://images.unsplash.com/photo-1550614000-4b95d4edc0c9?auto=format&fit=crop&w=800&q=80" },
];

const productImages = [
  { src: dummyProductInfo.imageUrl, alt: "Front view" },
  { src: "https://images.unsplash.com/photo-1515347619253-0803bfdb34b9?auto=format&fit=crop&w=800&q=80", alt: "Side view" },
  { src: "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=800&q=80", alt: "Detail view" },
  { src: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80", alt: "Back view" },
];

const sizes = [
  { name: "XS", inStock: true },
  { name: "S", inStock: true },
  { name: "M", inStock: true },
  { name: "L", inStock: false },
  { name: "XL", inStock: true },
];

// --- CUSTOM UI COMPONENTS ---
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const StarIcon = ({ filled }) => (
  <svg className={`h-5 w-5 ${filled ? 'text-yellow-400' : 'text-gray-200'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CustomRating = ({ value }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <StarIcon key={star} filled={star <= value} />
    ))}
  </div>
);

const ProgressBar = ({ label, percentage, count, colorClass }) => (
  <div className="flex items-center mt-2">
    <span className="w-20 text-sm font-medium text-gray-600">{label}</span>
    <div className="w-full h-2.5 mx-4 bg-gray-200 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${percentage}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-2.5 rounded-full ${colorClass}`}
      />
    </div>
    <span className="w-10 text-sm text-gray-500 text-right">{count}k</span>
  </div>
);

// --- ANIMATION VARIANTS ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState(sizes[1]);
  const [activeImage, setActiveImage] = useState(productImages[0]);

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log("Added to cart: ", { size: selectedSize.name, product: dummyProductInfo.title });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Breadcrumbs */}
        <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex text-sm text-gray-500 mb-8">
          <ol className="flex items-center space-x-2">
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Home</a></li>
            <li><span className="mx-2 text-gray-300">/</span></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Women</a></li>
            <li><span className="mx-2 text-gray-300">/</span></li>
            <li className="text-gray-900 font-medium">Clothing</li>
          </ol>
        </motion.nav>

        {/* Main Product Layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          
          {/* Image Gallery */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 w-full lg:w-24 shrink-0">
              {productImages.map((image, index) => (
                <motion.button
                  variants={fadeUp}
                  key={index}
                  onClick={() => setActiveImage(image)}
                  className={`relative h-24 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 transition-all ${
                    activeImage.src === image.src ? 'ring-2 ring-indigo-600 ring-offset-2' : 'hover:opacity-80'
                  }`}
                >
                  <img src={image.src} alt={image.alt} className="absolute inset-0 w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>

            <motion.div variants={fadeUp} className="w-full aspect-[4/5] lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage.src}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={activeImage.src}
                  alt="Product view"
                  className="w-full h-full object-cover object-center"
                />
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Product Info */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-10 lg:mt-0 px-2 lg:px-0">
            <motion.div variants={fadeUp}>
              <h2 className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">{dummyProductInfo.brand}</h2>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">{dummyProductInfo.title}</h1>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-900">₹{dummyProductInfo.discountedPrice}</p>
                <p className="text-lg text-gray-400 line-through mb-1">₹{dummyProductInfo.price}</p>
                <p className="text-sm font-semibold text-green-600 mb-1.5 bg-green-50 px-2 py-0.5 rounded-md">{dummyProductInfo.discountPersent}% OFF</p>
              </div>
              <div className="flex items-center gap-2">
                <CustomRating value={4.5} />
                <span className="text-sm text-indigo-600 font-medium hover:underline cursor-pointer">117 Reviews</span>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8">
              <p className="text-base text-gray-600 leading-relaxed">{dummyProductInfo.description}</p>
              
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                {dummyProductInfo.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.form variants={fadeUp} className="mt-10 border-t border-gray-200 pt-8" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size guide</a>
              </div>

              <RadioGroup value={selectedSize} onChange={setSelectedSize} className="mt-4">
                <div className="grid grid-cols-5 gap-3">
                  {sizes.map((size) => (
                    <RadioGroup.Option
                      key={size.name}
                      value={size}
                      disabled={!size.inStock}
                      className={({ active, checked }) => classNames(
                        size.inStock ? "cursor-pointer bg-white text-gray-900 shadow-sm hover:bg-gray-50" : "cursor-not-allowed bg-gray-50 text-gray-300",
                        checked ? "ring-2 ring-indigo-600 ring-offset-1 bg-indigo-50/50" : "ring-1 ring-gray-200",
                        "group relative flex items-center justify-center rounded-xl py-3 text-sm font-semibold uppercase transition-all outline-none"
                      )}
                    >
                      <RadioGroup.Label as="span">{size.name}</RadioGroup.Label>
                      {!size.inStock && (
                        <svg className="absolute inset-0 h-full w-full stroke-2 text-gray-200" viewBox="0 0 100 100" preserveAspectRatio="none" stroke="currentColor">
                          <line x1={0} y1={100} x2={100} y2={0} vectorEffect="non-scaling-stroke" />
                        </svg>
                      )}
                    </RadioGroup.Option>
                  ))}
                </div>
              </RadioGroup>

              <motion.button 
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="mt-8 flex w-full items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-8 py-4 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md shadow-indigo-600/20"
              >
                Add to Cart
              </motion.button>
            </motion.form>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.section 
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="mt-24 border-t border-gray-200 pt-16"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-gray-900 tracking-tight">Customer Reviews</motion.h2>
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-extrabold text-gray-900">4.6</div>
                <div>
                  <CustomRating value={5} />
                  <p className="text-sm text-gray-500 mt-1">Based on 42,807 reviews</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <ProgressBar label="Excellent" percentage={70} count="30" colorClass="bg-green-500" />
                <ProgressBar label="Very Good" percentage={15} count="6.4" colorClass="bg-green-400" />
                <ProgressBar label="Good" percentage={8} count="3.4" colorClass="bg-yellow-400" />
                <ProgressBar label="Average" percentage={5} count="2.1" colorClass="bg-orange-400" />
                <ProgressBar label="Poor" percentage={2} count="0.9" colorClass="bg-red-500" />
              </div>
            </motion.div>

            {/* PRODUCT REVIEW CARD */}
            <motion.div variants={fadeUp} className="lg:col-span-8 space-y-6">
              {dummyProductInfo.reviews.map((review) => (
                <ProductReviewCard key={review.id} item={review} />
              ))}
              <button className="text-indigo-600 font-semibold text-sm hover:underline mt-4">Read all reviews &rarr;</button>
            </motion.div>

          </div>
        </motion.section>

        {/* Similar Products USING YOUR HOME SECTION CARD */}
        <motion.section 
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="mt-24 border-t border-gray-200 pt-16"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">You might also like</h2>
            <a href="#" className="hidden sm:block text-sm font-semibold text-indigo-600 hover:text-indigo-500">Shop the collection &rarr;</a>
          </motion.div>

          {/* Replaced old cards with your HomeSectionCard component */}
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start">
            {dummySimilarProducts.map((item) => (
              <motion.div variants={fadeUp} key={item.id}>
                <HomeSectionCard product={item} />
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}