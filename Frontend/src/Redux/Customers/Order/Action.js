import api from "../../../config/api";
import {
  CREATE_ORDER_FAILURE,
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  GET_ORDER_BY_ID_FAILURE,
  GET_ORDER_BY_ID_REQUEST,
  GET_ORDER_BY_ID_SUCCESS,
  GET_ORDER_HISTORY_FAILURE,
  GET_ORDER_HISTORY_REQUEST,
  GET_ORDER_HISTORY_SUCCESS,
} from "./ActionType";

export const createOrder = (reqData) => async (dispatch) => {
  dispatch({ type: CREATE_ORDER_REQUEST });
  try {
    // We use your 'api' interceptor, so no need to manually pass the JWT anymore!
    const { data } = await api.post("/api/orders/", reqData.address);

    if (data.id && reqData.navigate) {
      reqData.navigate({ search: `step=3&order_id=${data.id}` });
    }
    
    // Antigravity State-Sync: Instantly push the new address to Auth
    if (data.shippingAddress) {
      dispatch({ 
        type: "ADD_NEW_ADDRESS_SUCCESS", 
        payload: data.shippingAddress 
      });
    }
    
    dispatch({
      type: CREATE_ORDER_SUCCESS,
      payload: data,
    });
    
    return data; // Enables await in your React components
  } catch (error) {
    dispatch({
      type: CREATE_ORDER_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getOrderById = (orderId) => async (dispatch) => {
  dispatch({ type: GET_ORDER_BY_ID_REQUEST });
  try {
    const { data } = await api.get(`/api/orders/${orderId}`);
    
    dispatch({
      type: GET_ORDER_BY_ID_SUCCESS,
      payload: data,
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: GET_ORDER_BY_ID_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getOrderHistory = () => async (dispatch) => {
  dispatch({ type: GET_ORDER_HISTORY_REQUEST });
  try {
    const { data } = await api.get(`/api/orders/user`);
    
    dispatch({
      type: GET_ORDER_HISTORY_SUCCESS,
      payload: data,
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: GET_ORDER_HISTORY_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};