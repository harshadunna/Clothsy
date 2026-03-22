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
} from "./ActionTypes";
import api from "../../config/api";

// ─── Register ───────────────────────────────────────────────
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

// ─── Login ──────────────────────────────────────────────────
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

// ─── Get Current User ───────────────────────────────────────
export const getUser = (token) => async (dispatch) => {
  dispatch({ type: GET_USER_REQUEST });
  try {
    const { data } = await api.get("/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({ type: GET_USER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_USER_FAILURE, payload: error.message });
  }
};

// ─── Get All Customers (Admin) ──────────────────────────────
export const getAllCustomers = (token) => async (dispatch) => {
  dispatch({ type: GET_ALL_CUSTOMERS_REQUEST });
  try {
    const { data } = await api.get("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({ type: GET_ALL_CUSTOMERS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_ALL_CUSTOMERS_FAILURE, payload: error.message });
  }
};

// ─── Logout ─────────────────────────────────────────────────
export const logout = () => (dispatch) => {
  localStorage.clear();
  dispatch({ type: LOGOUT });
};