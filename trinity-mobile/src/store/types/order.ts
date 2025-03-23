// src/store/types/order.ts

// Statuts possibles pour une commande
export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Interface pour un élément de commande (produit)
export interface OrderItem {
  id: number;
  orderId: number;
  internalProductId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  internalProduct?: {
    id: number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
  };
}

// Interface pour une commande
export interface Order {
  id: number;
  buyerId: number;
  sellerId: number;
  totalAmount: number;
  status: OrderStatus;
  paypalPayment: boolean;
  paypalTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  seller?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

// État Redux pour les commandes
export interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
}

// Actions pour les commandes
export const ORDER_ACTIONS = {
  FETCH_ORDERS_REQUEST: 'FETCH_ORDERS_REQUEST',
  FETCH_ORDERS_SUCCESS: 'FETCH_ORDERS_SUCCESS',
  FETCH_ORDERS_FAILURE: 'FETCH_ORDERS_FAILURE',
  FETCH_ORDER_DETAILS_REQUEST: 'FETCH_ORDER_DETAILS_REQUEST',
  FETCH_ORDER_DETAILS_SUCCESS: 'FETCH_ORDER_DETAILS_SUCCESS',
  FETCH_ORDER_DETAILS_FAILURE: 'FETCH_ORDER_DETAILS_FAILURE',
  CLEAR_ORDER_ERROR: 'CLEAR_ORDER_ERROR'
};

// Types pour les actions
export interface FetchOrdersRequestAction {
  type: typeof ORDER_ACTIONS.FETCH_ORDERS_REQUEST;
}

export interface FetchOrdersSuccessAction {
  type: typeof ORDER_ACTIONS.FETCH_ORDERS_SUCCESS;
  payload: Order[];
}

export interface FetchOrdersFailureAction {
  type: typeof ORDER_ACTIONS.FETCH_ORDERS_FAILURE;
  payload: string;
}

export interface FetchOrderDetailsRequestAction {
  type: typeof ORDER_ACTIONS.FETCH_ORDER_DETAILS_REQUEST;
  payload: number; // orderId
}

export interface FetchOrderDetailsSuccessAction {
  type: typeof ORDER_ACTIONS.FETCH_ORDER_DETAILS_SUCCESS;
  payload: Order;
}

export interface FetchOrderDetailsFailureAction {
  type: typeof ORDER_ACTIONS.FETCH_ORDER_DETAILS_FAILURE;
  payload: string;
}

export interface ClearOrderErrorAction {
  type: typeof ORDER_ACTIONS.CLEAR_ORDER_ERROR;
}

export type OrderActionTypes =
  | FetchOrdersRequestAction
  | FetchOrdersSuccessAction
  | FetchOrdersFailureAction
  | FetchOrderDetailsRequestAction
  | FetchOrderDetailsSuccessAction
  | FetchOrderDetailsFailureAction
  | ClearOrderErrorAction;
