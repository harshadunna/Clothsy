import api from "../../../config/api";
import {
  ADD_ITEM_TO_CART_REQUEST,
  ADD_ITEM_TO_CART_SUCCESS,
  ADD_ITEM_TO_CART_FAILURE,
  GET_CART_REQUEST,
  GET_CART_SUCCESS,
  GET_CART_FAILURE,
  REMOVE_CART_ITEM_REQUEST,
  REMOVE_CART_ITEM_SUCCESS,
  REMOVE_CART_ITEM_FAILURE,
  UPDATE_CART_ITEM_REQUEST,
  UPDATE_CART_ITEM_SUCCESS,
  UPDATE_CART_ITEM_FAILURE,
  CLEAR_CART,
  MERGE_CART_SUCCESS,
} from "./ActionType";

// GUEST CHECKOUT LOGIC: If no JWT, save to local storage!
export const addItemToCart = (reqData) => async (dispatch) => {
  dispatch({ type: ADD_ITEM_TO_CART_REQUEST });
  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    let localCart = JSON.parse(localStorage.getItem("localCart")) || [];
    
    const existingIndex = localCart.findIndex(
      (item) => item.productId === reqData.data.productId && item.size === reqData.data.size
    );

    const productPrice = reqData.product?.price || 0;
    const productDiscountedPrice = reqData.product?.discountedPrice || 0;

    if (existingIndex >= 0) {
      localCart[existingIndex].quantity += reqData.data.quantity;
      localCart[existingIndex].price = localCart[existingIndex].quantity * productPrice;
      localCart[existingIndex].discountedPrice = localCart[existingIndex].quantity * productDiscountedPrice;
      
      localStorage.setItem("localCart", JSON.stringify(localCart));
      dispatch({ type: ADD_ITEM_TO_CART_SUCCESS, payload: localCart[existingIndex] });
    } else {
      // Construct a fake CartItem that mimics the backend exactly
      const fakeCartItem = {
        id: `local_${Date.now()}_${Math.random()}`, 
        productId: reqData.data.productId,
        size: reqData.data.size,
        quantity: reqData.data.quantity,
        price: productPrice * reqData.data.quantity,
        discountedPrice: productDiscountedPrice * reqData.data.quantity,
        product: reqData.product // Inject the full image/title details!
      };
      
      localCart.push(fakeCartItem);
      localStorage.setItem("localCart", JSON.stringify(localCart));
      dispatch({ type: ADD_ITEM_TO_CART_SUCCESS, payload: fakeCartItem });
    }
    
    return { success: true, local: true };
  }

  // STANDARD LOGIC: If logged in, save to DB
  try {
    const { data } = await api.put("/api/cart/add", reqData.data);
    dispatch({ type: ADD_ITEM_TO_CART_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: ADD_ITEM_TO_CART_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Merges local cart into DB after login
export const mergeCart = () => async (dispatch) => {
  const localCart = JSON.parse(localStorage.getItem("localCart"));
  const jwt = localStorage.getItem("jwt");

  if (localCart && localCart.length > 0 && jwt) {
    try {
      // Strip out the fake data and only send what the backend AddItemRequest expects
      const mergePayload = localCart.map(item => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.product?.price || 0
      }));
      
      await api.post("/api/cart/merge", mergePayload);
      localStorage.removeItem("localCart"); 
      dispatch({ type: MERGE_CART_SUCCESS });
      dispatch(getCart()); 
    } catch (error) {
      console.error("Failed to merge local cart", error);
    }
  }
};

export const getCart = () => async (dispatch) => {
  dispatch({ type: GET_CART_REQUEST });
  
  const jwt = localStorage.getItem("jwt");
  
  if (!jwt) {
     const localCart = JSON.parse(localStorage.getItem("localCart")) || [];
     
     let totalPrice = 0;
     let totalDiscountedPrice = 0;
     let totalItem = 0;
     
     localCart.forEach(item => {
         totalPrice += item.price || 0;
         totalDiscountedPrice += item.discountedPrice || 0;
         totalItem += item.quantity || 0;
     });
     
     const fakeCart = {
         cartItems: localCart,
         totalPrice,
         totalDiscountedPrice,
         discount: totalPrice - totalDiscountedPrice,
         totalItem
     };
     
     dispatch({ type: GET_CART_SUCCESS, payload: fakeCart });
     return;
  }

  try {
    const { data } = await api.get("/api/cart/");
    dispatch({ type: GET_CART_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: GET_CART_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const removeCartItem = (cartItemId, isLocal = false) => async (dispatch) => {
  dispatch({ type: REMOVE_CART_ITEM_REQUEST });
  
  const jwt = localStorage.getItem("jwt");
  if (!jwt || String(cartItemId).startsWith("local_")) {
    let localCart = JSON.parse(localStorage.getItem("localCart")) || [];
    localCart = localCart.filter(item => item.id !== cartItemId);
    localStorage.setItem("localCart", JSON.stringify(localCart));
    
    dispatch({ type: REMOVE_CART_ITEM_SUCCESS, payload: cartItemId });
    dispatch(getCart());
    return;
  }

  try {
    await api.delete(`/api/cart_items/${cartItemId}`);
    dispatch({ type: REMOVE_CART_ITEM_SUCCESS, payload: cartItemId });
  } catch (error) {
    dispatch({
      type: REMOVE_CART_ITEM_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const updateCartItem = (reqData) => async (dispatch) => {
  dispatch({ type: UPDATE_CART_ITEM_REQUEST });
  
  const jwt = localStorage.getItem("jwt");
  if (!jwt || String(reqData.cartItemId).startsWith("local_")) {
    let localCart = JSON.parse(localStorage.getItem("localCart")) || [];
    const index = localCart.findIndex(item => item.id === reqData.cartItemId);
    
    if (index >= 0) {
        const qty = reqData.data.quantity;
        localCart[index].quantity = qty;
        localCart[index].price = (localCart[index].product?.price || 0) * qty;
        localCart[index].discountedPrice = (localCart[index].product?.discountedPrice || 0) * qty;
        localStorage.setItem("localCart", JSON.stringify(localCart));
        dispatch({ type: UPDATE_CART_ITEM_SUCCESS, payload: localCart[index] });
        dispatch(getCart());
    }
    return;
  }

  try {
    const { data } = await api.put(
      `/api/cart_items/${reqData.cartItemId}`,
      reqData.data
    );
    dispatch({ type: UPDATE_CART_ITEM_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_CART_ITEM_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const clearCart = () => async (dispatch) => {
  dispatch({ type: CLEAR_CART }); 
  try {
    await api.delete("/api/cart/clear"); 
    const { data } = await api.get("/api/cart/");
    dispatch({ type: GET_CART_SUCCESS, payload: data });
  } catch (error) {
    console.error("Failed to clear cart on backend:", error);
  }
};