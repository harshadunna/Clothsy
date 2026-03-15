import MainCarousel from '../components/HomeCarousel/MainCarousel';
import HomeSectionCarousel from '../components/HomeSectionCarousel/HomeSectionCarousel';
import { mens_kurta } from '../../Data/Men/men_kurta';
import ProductCard from '../components/Product/ProductCard';  // add this

const testProduct = {
  id: 1,
  title: "Slim Fit Cotton Shirt",
  brand: "H&M",
  imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=80",
  price: 1999,
  discountedPrice: 1299,
  color: "Navy Blue",
  discountPersent: 35,
};

const HomePage = () => {
    return (
        <div>
            <MainCarousel />

            {/* TEMP TEST — delete after confirming */}
            <div className="flex flex-wrap p-4">
                <ProductCard product={testProduct} />
                <ProductCard product={testProduct} />
                <ProductCard product={testProduct} />
            </div>

            <div className='space-y-10 py-20 flex flex-col justify-center px-5 lg:px-10'>
                <HomeSectionCarousel data={mens_kurta.slice(0, 10)} sectionName="Men's Kurta" />
                <HomeSectionCarousel data={mens_kurta.slice(10, 20)} sectionName="Men's Printed Kurta" />
                <HomeSectionCarousel data={mens_kurta.slice(5, 15)} sectionName="Cotton Blend Kurta" />
                <HomeSectionCarousel data={mens_kurta.slice(15, 25)} sectionName="Pure Cotton Kurta" />
                <HomeSectionCarousel data={mens_kurta.slice(20, 30)} sectionName="Designer Kurta" />
            </div>
        </div>
    );
};

export default HomePage;