import {
  FIND_PRODUCTS_BY_CATEGORY_REQUEST,
  FIND_PRODUCTS_BY_CATEGORY_SUCCESS,
  FIND_PRODUCTS_BY_CATEGORY_FAILURE,
  FIND_PRODUCT_BY_ID_REQUEST,
  FIND_PRODUCT_BY_ID_SUCCESS,
  FIND_PRODUCT_BY_ID_FAILURE,
} from "./ActionType";
import api from "../../../config/api";

export const findProducts = (reqData) => async (dispatch) => {
  dispatch({ type: FIND_PRODUCTS_BY_CATEGORY_REQUEST });
  try {
    const formatArray = (arr) => Array.isArray(arr) ? arr.join(",") : arr;

    const { data } = await api.get("/api/products", {
      params: {
        color: formatArray(reqData.colors),
        size: formatArray(reqData.sizes),
        minPrice: reqData.minPrice,
        maxPrice: reqData.maxPrice,
        minDiscount: reqData.minDiscount,
        category: reqData.category,
        stock: reqData.stock,
        sort: reqData.sort,
        pageNumber: reqData.pageNumber,
        pageSize: reqData.pageSize,
        search: reqData.search, 
      },
    });
    dispatch({ type: FIND_PRODUCTS_BY_CATEGORY_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FIND_PRODUCTS_BY_CATEGORY_FAILURE, payload: error.message });
  }
};

export const findProductById = (productId) => async (dispatch) => {
  dispatch({ type: FIND_PRODUCT_BY_ID_REQUEST });
  try {
    const { data } = await api.get(`/api/products/id/${productId}`);
    dispatch({ type: FIND_PRODUCT_BY_ID_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FIND_PRODUCT_BY_ID_FAILURE, payload: error.message });
  }
};