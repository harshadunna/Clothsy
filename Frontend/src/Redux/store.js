import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Auth/Reducer";
import customerProductReducer from "./Customers/Product/Reducer";
import cartReducer from "./Customers/Cart/Reducer";
import productReducer from "./Customers/Product/Reducer";
import { orderReducer } from "./Customers/Order/Reducer";
import { wishlistReducer } from "./Customers/Wishlist/Reducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    customersProduct: customerProductReducer,
    cart: cartReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
  },
});