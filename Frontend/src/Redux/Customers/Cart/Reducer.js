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
} from "./ActionType";

// Initialize with local storage data if user is a guest
const localCartInit = JSON.parse(localStorage.getItem("localCart")) || [];

// Calculate initial fake cart totals so the UI shows correct numbers on page reload
let initTotal = 0; 
let initDisc = 0; 
let initCount = 0;
localCartInit.forEach(i => { 
  initTotal += i.price || 0; 
  initDisc += i.discountedPrice || 0; 
  initCount += i.quantity || 0; 
});

const initialState = {
  cart: {
     cartItems: localCartInit,
     totalPrice: initTotal,
     totalDiscountedPrice: initDisc,
     discount: initTotal - initDisc,
     totalItem: initCount
  },
  cartItems: localCartInit, 
  loading: false,
  error: null,
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CART_REQUEST:
      return { ...state, loading: true, error: null };

    case ADD_ITEM_TO_CART_REQUEST:
    case REMOVE_CART_ITEM_REQUEST:
    case UPDATE_CART_ITEM_REQUEST:
      return { ...state, error: null };

    case ADD_ITEM_TO_CART_SUCCESS:
      return {
        ...state,
        loading: false,
        cartItems: [...state.cartItems, action.payload],
      };

    case GET_CART_SUCCESS:
      return {
        ...state,
        loading: false,
        cart: action.payload,
        cartItems: action.payload.cartItems || [],
      };

    case REMOVE_CART_ITEM_SUCCESS:
      return {
        ...state,
        loading: false,
        // Ensure both normal DB IDs and local string IDs are filtered correctly
        cartItems: state.cartItems.filter((item) => item.id !== action.payload && item.productId !== action.payload),
      };

    case UPDATE_CART_ITEM_SUCCESS:
      return {
        ...state,
        loading: false,
        cartItems: state.cartItems.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case ADD_ITEM_TO_CART_FAILURE:
    case GET_CART_FAILURE:
    case REMOVE_CART_ITEM_FAILURE:
    case UPDATE_CART_ITEM_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CLEAR_CART:
      return { ...state, cart: null, cartItems: [] };

    default:
      return state;
  }
};

export default cartReducer;