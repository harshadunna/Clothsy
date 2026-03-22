import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Auth/Reducer";
// import customerProductReducer from "./Customers/Product/Reducer";
// import productReducer from "./Admin/Product/Reducer";
// import cartReducer from "./Customers/Cart/Reducer";
// import { orderReducer } from "./Customers/Order/Reducer";
// import adminOrderReducer from "./Admin/Orders/Reducer";
// import ReviewReducer from "./Customers/Review/Reducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // customersProduct: customerProductReducer,
    // cart: cartReducer,
    // order: orderReducer,
    // review: ReviewReducer,

    // // admin
    // adminsProduct: productReducer,
    // adminsOrder: adminOrderReducer,
  },
});