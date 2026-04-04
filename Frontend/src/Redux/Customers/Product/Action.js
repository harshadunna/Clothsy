import {
  FIND_PRODUCTS_REQUEST,
  FIND_PRODUCTS_SUCCESS,
  FIND_PRODUCTS_FAILURE,
  FIND_PRODUCT_BY_ID_REQUEST,
  FIND_PRODUCT_BY_ID_SUCCESS,
  FIND_PRODUCT_BY_ID_FAILURE,
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
} from "./ActionType";
import api from "../../../config/api";

export const findProducts = (reqData) => async (dispatch) => {
  dispatch({ type: FIND_PRODUCTS_REQUEST });
  
  try {
    const params = new URLSearchParams();

    if (reqData.colors && reqData.colors !== "undefined" && reqData.colors !== "") params.append("color", reqData.colors);
    if (reqData.sizes && reqData.sizes !== "undefined" && reqData.sizes !== "") params.append("size", reqData.sizes);
    if (reqData.minPrice != null) params.append("minPrice", reqData.minPrice);
    if (reqData.maxPrice != null) params.append("maxPrice", reqData.maxPrice);
    if (reqData.minDiscount != null) params.append("minDiscount", reqData.minDiscount);
    
    if (reqData.category && reqData.category !== "undefined" && reqData.category !== "null" && reqData.category !== "") {
      params.append("category", reqData.category);
    }
    
    if (reqData.stock && reqData.stock !== "undefined" && reqData.stock !== "") params.append("stock", reqData.stock);
    if (reqData.sort && reqData.sort !== "undefined" && reqData.sort !== "") params.append("sort", reqData.sort);
    if (reqData.pageNumber != null) params.append("pageNumber", reqData.pageNumber);
    if (reqData.pageSize != null) params.append("pageSize", reqData.pageSize);
    if (reqData.search && reqData.search !== "undefined" && reqData.search !== "") params.append("search", reqData.search);

    const { data } = await api.get(`/api/products?${params.toString()}`);
    dispatch({ type: FIND_PRODUCTS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FIND_PRODUCTS_FAILURE, payload: error.message });
  }
};

export const findProductById = (reqData) => async (dispatch) => {
  dispatch({ type: FIND_PRODUCT_BY_ID_REQUEST });
  try {
    const { data } = await api.get(`/api/products/id/${reqData}`);
    dispatch({ type: FIND_PRODUCT_BY_ID_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FIND_PRODUCT_BY_ID_FAILURE, payload: error.message });
  }
};

export const createProduct = (productData) => async (dispatch) => {
  dispatch({ type: CREATE_PRODUCT_REQUEST });
  try {
    let config = {};
    if (productData instanceof FormData) {
      config = { headers: { "Content-Type": "multipart/form-data" } };
    }

    const { data } = await api.post("/api/admin/products/", productData, config);
    dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: CREATE_PRODUCT_FAILURE, payload: error.message });
  }
};

export const updateProduct = (product) => async (dispatch) => {
  dispatch({ type: UPDATE_PRODUCT_REQUEST });
  try {
    const { data } = await api.put(
      `/api/admin/products/${product.productId}/update`,
      product
    );
    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: UPDATE_PRODUCT_FAILURE, payload: error.message });
  }
};

export const deleteProduct = (productId) => async (dispatch) => {
  dispatch({ type: DELETE_PRODUCT_REQUEST });
  try {
    await api.delete(`/api/admin/products/${productId}/delete`);
    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: productId });
  } catch (error) {
    dispatch({ type: DELETE_PRODUCT_FAILURE, payload: error.message });
  }
};

export const getProductRecommendations = async (productId) => {
  try {
    const { data } = await api.get(`/api/products/${productId}/recommendations`);
    return data;
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
};