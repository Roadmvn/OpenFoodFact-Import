// src/store/sagas/orderSaga.ts
import { takeLatest, call, put, all } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderDetailsSuccess,
  fetchOrderDetailsFailure
} from '../slices/orderSlice';
import OrderService from '../../services/order/orderService';

// Saga pour récupérer toutes les commandes
function* handleFetchOrders() {
  try {
    console.log('OrderSaga: Fetching orders');
    const orders = yield call(OrderService.getUserOrders);
    // Si le service retourne un tableau vide, c'est normal, on le traite comme un succès
    console.log('OrderSaga: Orders fetched successfully', orders);
    yield put(fetchOrdersSuccess(orders || [])); // Assurer qu'on a toujours un tableau
  } catch (error) {
    console.error('OrderSaga: Error fetching orders', error);
    yield put(fetchOrdersFailure(error.toString()));
  }
}

// Saga pour récupérer les détails d'une commande
function* handleFetchOrderDetails(action: PayloadAction<number>) {
  try {
    console.log(`OrderSaga: Fetching order details for order ${action.payload}`);
    const order = yield call(OrderService.getOrderDetails, action.payload);
    console.log('OrderSaga: Order details fetched successfully', order);
    yield put(fetchOrderDetailsSuccess(order));
  } catch (error) {
    console.error(`OrderSaga: Error fetching order details for order ${action.payload}`, error);
    yield put(fetchOrderDetailsFailure(error.toString()));
  }
}

// Saga principal pour les commandes
export function* watchOrder() {
  yield all([
    takeLatest('order/fetchOrdersRequest', handleFetchOrders),
    takeLatest('order/fetchOrderDetailsRequest', handleFetchOrderDetails)
  ]);
}
