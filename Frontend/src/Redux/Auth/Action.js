import {
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_FAILURE,
  LOGOUT,
  GET_ALL_CUSTOMERS_REQUEST,
  GET_ALL_CUSTOMERS_SUCCESS,
  GET_ALL_CUSTOMERS_FAILURE,
  DELETE_ADDRESS_REQUEST,
  DELETE_ADDRESS_SUCCESS,
  DELETE_ADDRESS_FAILURE,
} from "./ActionTypes";
import api from "../../config/api";

export const register = (userData) => async (dispatch) => {
  dispatch({ type: REGISTER_REQUEST });
  try {
    const { data } = await api.post("/auth/signup", userData);
    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
      dispatch({ type: REGISTER_SUCCESS, payload: data.jwt });
      dispatch(getUser(data.jwt));
    } else {
      dispatch({ type: REGISTER_SUCCESS, payload: data });
    }
  } catch (error) {
    dispatch({ type: REGISTER_FAILURE, payload: error.response?.data?.message || "Registration failed" });
  }
};

export const login = (userData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const { data } = await api.post("/auth/signin", userData);
    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
      dispatch({ type: LOGIN_SUCCESS, payload: data.jwt });
      dispatch(getUser(data.jwt));
    } else {
      dispatch({ type: LOGIN_SUCCESS, payload: data });
    }
  } catch (error) {
    dispatch({ type: LOGIN_FAILURE, payload: error.response?.data?.message || "Login failed" });
  }
};

export const getUser = (token) => async (dispatch) => {
  dispatch({ type: GET_USER_REQUEST });
  try {
    const { data } = await api.get("/api/users/profile");
    dispatch({ type: GET_USER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_USER_FAILURE, payload: error.message });
  }
};

export const getAllCustomers = () => async (dispatch) => {
  dispatch({ type: GET_ALL_CUSTOMERS_REQUEST });
  try {
    const { data } = await api.get("/api/admin/users");
    dispatch({ type: GET_ALL_CUSTOMERS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_ALL_CUSTOMERS_FAILURE, payload: error.message });
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem("jwt");
  dispatch({ type: LOGOUT });
};

export const deleteAddress = (addressId) => async (dispatch) => {
  dispatch({ type: "DELETE_ADDRESS_REQUEST" });
  try {
    // Assuming your backend uses this standard endpoint for deleting addresses
    await api.delete(`/api/addresses/${addressId}`);

    dispatch({
      type: "DELETE_ADDRESS_SUCCESS",
      payload: addressId
    });
  } catch (error) {
    dispatch({
      type: "DELETE_ADDRESS_FAILURE",
      payload: error.response?.data?.message || error.message
    });
    console.error("Error deleting address:", error);
  }
};

export const updateAddress = (addressId, addressData) => async (dispatch) => {
  dispatch({ type: "UPDATE_ADDRESS_REQUEST" });
  try {
    const { data } = await api.put(`/api/addresses/${addressId}`, addressData);
    dispatch({ type: "UPDATE_ADDRESS_SUCCESS", payload: data });
  } catch (error) {
    dispatch({ type: "UPDATE_ADDRESS_FAILURE", payload: error.message });
  }
};

export const saveAddress = (addressData) => async (dispatch) => {
  try {
    const { data } = await api.post("/api/users/addresses", addressData);
    dispatch({ type: "ADD_NEW_ADDRESS_SUCCESS", payload: data });
    return data; // returns saved address with its ID
  } catch (error) {
    console.error("Failed to save address:", error);
    throw error;
  }
};