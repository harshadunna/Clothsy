import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainCarousel from "../components/HomeCarousel/MainCarousel";
import HomeSectionCarousel from "../components/HomeSectionCarousel/HomeSectionCarousel";
import { findProducts } from "../../Redux/Customers/Product/Action";

const HomePage = () => {
  const dispatch = useDispatch();
  const { customersProduct } = useSelector((store) => store);

  useEffect(() => {
    dispatch(findProducts({
      category: "mens_kurta",
      colors: "",
      sizes: "",
      minPrice: 0,
      maxPrice: 10000,
      minDiscount: 0,
      stock: "",
      sort: "price_low",
      pageNumber: 0,
      pageSize: 40,
    }));
  }, []);

  const products = customersProduct?.products?.content || [];

  // Loading skeleton
  if (customersProduct?.loading) {
    return (
      <div>
        <MainCarousel />
        <div className="space-y-10 py-20 flex flex-col justify-center px-5 lg:px-10">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="flex gap-4 overflow-hidden">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-48 h-72 bg-gray-200 rounded-2xl animate-pulse shrink-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <MainCarousel />
      <div className="space-y-10 py-20 flex flex-col justify-center px-5 lg:px-10">
        {products.length > 0 ? (
          <>
            <HomeSectionCarousel
              data={products.slice(0, 10)}
              sectionName="Men's Kurta"
            />
            <HomeSectionCarousel
              data={products.slice(10, 20)}
              sectionName="Men's Printed Kurta"
            />
            <HomeSectionCarousel
              data={products.slice(5, 15)}
              sectionName="Cotton Blend Kurta"
            />
            <HomeSectionCarousel
              data={products.slice(15, 25)}
              sectionName="Pure Cotton Kurta"
            />
            <HomeSectionCarousel
              data={products.slice(20, 30)}
              sectionName="Designer Kurta"
            />
          </>
        ) : (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <p className="text-lg font-medium">No products available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;