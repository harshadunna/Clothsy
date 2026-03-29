import api from "../../../config/api";
import {
  CREATE_ORDER_REQUEST,
  CREATE_ORDER_SUCCESS,
  CREATE_ORDER_FAILURE,
  GET_ORDER_BY_ID_REQUEST,
  GET_ORDER_BY_ID_SUCCESS,
  GET_ORDER_BY_ID_FAILURE,
  GET_ORDER_HISTORY_REQUEST,
  GET_ORDER_HISTORY_SUCCESS,
  GET_ORDER_HISTORY_FAILURE,
} from "./ActionType";

export const createOrder = (reqData) => async (dispatch) => {
  dispatch({ type: CREATE_ORDER_REQUEST });
  try {
    console.log("Sending to backend:", { addressId: reqData.address.id });
    const { data } = await api.post("/api/orders/", { addressId: reqData.address.id });

    dispatch({ type: CREATE_ORDER_SUCCESS, payload: data });

    if (data.id && reqData.navigate) {
      reqData.navigate(`/checkout?step=3&order_id=${data.id}`);
    }

    return data;
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
    dispatch({ type: GET_ORDER_BY_ID_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: GET_ORDER_BY_ID_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const createPayment = (orderId) => async (dispatch) => {
  dispatch({ type: "CREATE_PAYMENT_REQUEST" });
  try {
    const { data } = await api.post(`/api/payments/${orderId}`);
    
    if (data.payment_url) {
      window.location.href = data.payment_url;
    }
    
    dispatch({ type: "CREATE_PAYMENT_SUCCESS", payload: data });
  } catch (error) {
    dispatch({
      type: "CREATE_PAYMENT_FAILURE",
      payload: error.response?.data?.message || error.message,
    });
  }
};