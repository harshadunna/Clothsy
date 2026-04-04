import api from '../../../config/api';
import {
  CREATE_REVIEW_FAILURE,
  CREATE_REVIEW_REQUEST,
  CREATE_REVIEW_SUCCESS,
  GET_ALL_REVIEWS_FAILURE,
  GET_ALL_REVIEWS_REQUEST,
  GET_ALL_REVIEWS_SUCCESS,
} from './ActionType';

export const createReview = (resData) => async (dispatch) => {
  dispatch({ type: CREATE_REVIEW_REQUEST });
  try {
    // 1. Submit the text review
    const reviewResponse = await api.post('/api/reviews/create', {
        productId: resData.productId,
        review: resData.review
    });

    // 2. Submit the star rating
    await api.post('/api/ratings/create', {
        productId: resData.productId,
        rating: resData.rating
    });

    dispatch({
      type: CREATE_REVIEW_SUCCESS,
      payload: reviewResponse.data,
    });
    
  } catch (error) {
    dispatch({
      type: CREATE_REVIEW_FAILURE,
      payload: error.message,
    });
  }
};

export const getAllReviews = (productId) => async (dispatch) => {
  dispatch({ type: GET_ALL_REVIEWS_REQUEST });
  try {
    const response = await api.get(`/api/reviews/product/${productId}`);
    dispatch({
      type: GET_ALL_REVIEWS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_REVIEWS_FAILURE,
      payload: error.message,
    });
  }
};