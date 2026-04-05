import {
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE,
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  GET_USER_REQUEST, GET_USER_SUCCESS, GET_USER_FAILURE,
  LOGOUT, GET_ALL_CUSTOMERS_REQUEST, GET_ALL_CUSTOMERS_SUCCESS, GET_ALL_CUSTOMERS_FAILURE,
} from "./ActionTypes";
import api from "../../config/api";
import { mergeCart } from "../Customers/Cart/Action"; 

export const socialLoginSuccess = (jwt) => async (dispatch) => {
  localStorage.setItem("jwt", jwt);
  dispatch({ type: LOGIN_SUCCESS, payload: jwt });
  dispatch(getUser(jwt));
  dispatch(mergeCart()); 
};

export const register = (userData) => async (dispatch) => {
  dispatch({ type: REGISTER_REQUEST });
  try {
    const { data } = await api.post("/auth/signup", userData);
    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
      dispatch({ type: REGISTER_SUCCESS, payload: data.jwt });
      dispatch(getUser(data.jwt));
      dispatch(mergeCart()); 
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
      dispatch(mergeCart()); 
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
    // Explicitly pass the token to prevent interceptor race conditions during login
    const { data } = await api.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    // If the authenticated user is an Admin, securely grant them an isolated admin token
    if (data.role === "ADMIN" || data.role === "ROLE_ADMIN") {
        localStorage.setItem("admin_jwt", token);
    }

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
  // Check which part of the application triggered the logout
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    localStorage.removeItem("admin_jwt");
  } else {
    localStorage.removeItem("jwt");
  }

  dispatch({ type: LOGOUT });
  dispatch({ type: "CLEAR_CART" }); 
};

export const updateUserProfile = (userData) => async (dispatch) => {
  dispatch({ type: "UPDATE_USER_REQUEST" });
  try {
    const { data } = await api.put("/api/users/profile", userData);
    dispatch({ type: "UPDATE_USER_SUCCESS", payload: data });
    
    // Check which token to use for reloading the profile
    const token = window.location.pathname.startsWith('/admin') ? localStorage.getItem("admin_jwt") : localStorage.getItem("jwt");
    dispatch(getUser(token));
  } catch (error) {
    dispatch({ type: "UPDATE_USER_FAILURE", payload: error.response?.data?.message || error.message });
  }
};

export const deleteAddress = (addressId) => async (dispatch) => {
  dispatch({ type: "DELETE_ADDRESS_REQUEST" });
  try {
    await api.delete(`/api/addresses/${addressId}`);
    dispatch({ type: "DELETE_ADDRESS_SUCCESS", payload: addressId });
  } catch (error) {
    dispatch({ type: "DELETE_ADDRESS_FAILURE", payload: error.response?.data?.message || error.message });
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
    return data; 
  } catch (error) {
    throw error;
  }
};