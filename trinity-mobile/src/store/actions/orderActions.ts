// src/store/actions/orderActions.ts
import {
  ORDER_ACTIONS,
  FetchOrdersRequestAction,
  FetchOrdersSuccessAction,
  FetchOrdersFailureAction,
  FetchOrderDetailsRequestAction,
  FetchOrderDetailsSuccessAction,
  FetchOrderDetailsFailureAction,
  ClearOrderErrorAction,
  Order
} from '../types/order';

// Action pour demander la liste des commandes
export const fetchOrdersRequest = (): FetchOrdersRequestAction => ({
  type: ORDER_ACTIONS.FETCH_ORDERS_REQUEST
});

// Action pour recevoir la liste des commandes avec succès
export const fetchOrdersSuccess = (orders: Order[]): FetchOrdersSuccessAction => ({
  type: ORDER_ACTIONS.FETCH_ORDERS_SUCCESS,
  payload: orders
});

// Action en cas d'échec de récupération des commandes
export const fetchOrdersFailure = (error: string): FetchOrdersFailureAction => ({
  type: ORDER_ACTIONS.FETCH_ORDERS_FAILURE,
  payload: error
});

// Action pour demander les détails d'une commande
export const fetchOrderDetailsRequest = (orderId: number): FetchOrderDetailsRequestAction => ({
  type: ORDER_ACTIONS.FETCH_ORDER_DETAILS_REQUEST,
  payload: orderId
});

// Action pour recevoir les détails d'une commande avec succès
export const fetchOrderDetailsSuccess = (order: Order): FetchOrderDetailsSuccessAction => ({
  type: ORDER_ACTIONS.FETCH_ORDER_DETAILS_SUCCESS,
  payload: order
});

// Action en cas d'échec de récupération des détails d'une commande
export const fetchOrderDetailsFailure = (error: string): FetchOrderDetailsFailureAction => ({
  type: ORDER_ACTIONS.FETCH_ORDER_DETAILS_FAILURE,
  payload: error
});

// Action pour effacer les erreurs
export const clearOrderError = (): ClearOrderErrorAction => ({
  type: ORDER_ACTIONS.CLEAR_ORDER_ERROR
});
