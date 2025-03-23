// src/store/reducers/orderReducer.ts
import {
  OrderState,
  OrderActionTypes,
  ORDER_ACTIONS
} from '../types/order';

// État initial
const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null
};

// Reducer pour les commandes
const orderReducer = (state = initialState, action: OrderActionTypes): OrderState => {
  switch (action.type) {
    // Demande de récupération des commandes
    case ORDER_ACTIONS.FETCH_ORDERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    // Récupération des commandes réussie
    case ORDER_ACTIONS.FETCH_ORDERS_SUCCESS:
      return {
        ...state,
        orders: action.payload,
        loading: false,
        error: null
      };
    
    // Échec de récupération des commandes
    case ORDER_ACTIONS.FETCH_ORDERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Demande de récupération des détails d'une commande
    case ORDER_ACTIONS.FETCH_ORDER_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    // Récupération des détails d'une commande réussie
    case ORDER_ACTIONS.FETCH_ORDER_DETAILS_SUCCESS:
      return {
        ...state,
        selectedOrder: action.payload,
        loading: false,
        error: null
      };
    
    // Échec de récupération des détails d'une commande
    case ORDER_ACTIONS.FETCH_ORDER_DETAILS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    // Effacer les erreurs
    case ORDER_ACTIONS.CLEAR_ORDER_ERROR:
      return {
        ...state,
        error: null
      };
    
    // Action non reconnue
    default:
      return state;
  }
};

export default orderReducer;
