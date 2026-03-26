import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getWishlist } from "../../Redux/Customers/Wishlist/Action";
import ProductCard from "../components/Product/ProductCard";
import { HeartIcon } from "@heroicons/react/24/outline";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { wishlist, loading } = useSelector((store) => store.wishlist);

  useEffect(() => {
    dispatch(getWishlist());
  }, [dispatch]);

  const products = wishlist?.products || [];

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-6">
          <HeartIcon className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <span className="text-sm font-medium text-gray-500 ml-auto bg-gray-200 px-3 py-1 rounded-full">
            {products.length} Items
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-200 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <HeartIcon className="w-12 h-12 text-red-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="text-gray-500 mt-2">Save items you love to keep track of them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((item) => (
              <div key={item.id} className="h-full">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;