import {
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE,
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  GET_USER_REQUEST, GET_USER_SUCCESS, GET_USER_FAILURE,
  LOGOUT,
  GET_ALL_CUSTOMERS_SUCCESS,
  DELETE_ADDRESS_REQUEST, DELETE_ADDRESS_SUCCESS, DELETE_ADDRESS_FAILURE,
  // --- ADDED UPDATE IMPORTS ---
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
    // ONLY Auth-critical actions trigger global loading
    case REGISTER_REQUEST:
    case LOGIN_REQUEST:
    case GET_USER_REQUEST:
      return { ...state, isLoading: true, error: null };

    // --- ANTI-GRAVITY FIX: ADDRESS ACTIONS ARE COMPLETELY SILENT ---
    case DELETE_ADDRESS_REQUEST:
    case UPDATE_ADDRESS_REQUEST: // Added update request here
      return { ...state, error: null, isLoading: false }; // Force loading to false

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
      // We explicitly keep the existing user object and just swap the addresses array
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

    // --- NEW: UPDATE ADDRESS SUCCESS ---
    case UPDATE_ADDRESS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: {
          ...state.user,
          // Map over the array: if the ID matches the updated one, swap it out. Otherwise, keep the old one.
          addresses: (state.user?.addresses || []).map((addr) =>
            addr.id === action.payload.id ? action.payload : addr
          ),
        },
      };

    case DELETE_ADDRESS_FAILURE:
    case UPDATE_ADDRESS_FAILURE: // Added update failure here
      return { ...state, isLoading: false, error: action.payload };

    case LOGOUT:
      return { ...initialState };

    default:
      return state;
  }
};

export default authReducer;