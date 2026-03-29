import api from "../../../config/api";
import {
  GET_WISHLIST_REQUEST, GET_WISHLIST_SUCCESS, GET_WISHLIST_FAILURE,
  TOGGLE_WISHLIST_ITEM_REQUEST, TOGGLE_WISHLIST_ITEM_SUCCESS, TOGGLE_WISHLIST_ITEM_FAILURE
} from "./ActionType";

export const getWishlist = () => async (dispatch) => {
  dispatch({ type: GET_WISHLIST_REQUEST });
  try {
    const { data } = await api.get("/api/wishlist");
    dispatch({ type: GET_WISHLIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_WISHLIST_FAILURE, payload: error.message });
  }
};

export const toggleWishlistItem = (productId) => async (dispatch) => {
  dispatch({ type: TOGGLE_WISHLIST_ITEM_REQUEST });
  try {
    const { data } = await api.put(`/api/wishlist/toggle/${productId}`);
    dispatch({ type: TOGGLE_WISHLIST_ITEM_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: TOGGLE_WISHLIST_ITEM_FAILURE, payload: error.message });
  }
};