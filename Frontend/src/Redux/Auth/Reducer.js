import {
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE,
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  GET_USER_REQUEST, GET_USER_SUCCESS, GET_USER_FAILURE,
  LOGOUT,
  GET_ALL_CUSTOMERS_SUCCESS,
  DELETE_ADDRESS_REQUEST, DELETE_ADDRESS_SUCCESS, DELETE_ADDRESS_FAILURE,
  UPDATE_ADDRESS_REQUEST, UPDATE_ADDRESS_SUCCESS, UPDATE_ADDRESS_FAILURE,
} from "./ActionTypes";

const initialState = {
  user: null,
  jwt: null,
  isLoading: false,
  error: null,
  customers: [],
  fetchingUser: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_REQUEST:
    case LOGIN_REQUEST:
    case GET_USER_REQUEST:
      return { ...state, isLoading: true, error: null };

    case DELETE_ADDRESS_REQUEST:
    case UPDATE_ADDRESS_REQUEST:
      return { ...state, error: null, isLoading: false };

    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      return { ...state, isLoading: false, jwt: action.payload };

    case REGISTER_FAILURE:
    case LOGIN_FAILURE:
    case GET_USER_FAILURE:
      return { ...state, isLoading: false, error: action.payload, fetchingUser: false };

    case GET_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        fetchingUser: false,
      };

    case GET_ALL_CUSTOMERS_SUCCESS:
      return { ...state, isLoading: false, customers: action.payload };

    case DELETE_ADDRESS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: {
          ...state.user,
          addresses: (state.user?.addresses || []).filter(
            (address) => address.id !== action.payload
          ),
        },
      };

    case "ADD_NEW_ADDRESS_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: {
          ...state.user,
          addresses: [...(state.user?.addresses || []), action.payload],
        },
      };

    case UPDATE_ADDRESS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: {
          ...state.user,
          addresses: (state.user?.addresses || []).map((addr) =>
            addr.id === action.payload.id ? action.payload : addr
          ),
        },
      };

    case DELETE_ADDRESS_FAILURE:
    case UPDATE_ADDRESS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case LOGOUT:
      return { ...initialState };

    default:
      return state;
  }
};

export default authReducer;