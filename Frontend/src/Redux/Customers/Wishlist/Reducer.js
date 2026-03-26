import {
  GET_WISHLIST_REQUEST, GET_WISHLIST_SUCCESS, GET_WISHLIST_FAILURE,
  TOGGLE_WISHLIST_ITEM_REQUEST, TOGGLE_WISHLIST_ITEM_SUCCESS, TOGGLE_WISHLIST_ITEM_FAILURE
} from "./ActionType";

const initialState = {
  wishlist: null,
  loading: false,
  error: null,
};

export const wishlistReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_WISHLIST_REQUEST:
    case TOGGLE_WISHLIST_ITEM_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_WISHLIST_SUCCESS:
    case TOGGLE_WISHLIST_ITEM_SUCCESS:
      return { ...state, loading: false, wishlist: action.payload, error: null };
    case GET_WISHLIST_FAILURE:
    case TOGGLE_WISHLIST_ITEM_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};