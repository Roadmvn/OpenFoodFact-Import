// src/store/slices/orderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderState } from '../types/order';

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Récupération des commandes
    fetchOrdersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action: PayloadAction<Order[]>) => {
      state.loading = false;
      state.orders = action.payload;
      state.error = null;
    },
    fetchOrdersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Récupération des détails d'une commande
    fetchOrderDetailsRequest: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrderDetailsSuccess: (state, action: PayloadAction<Order>) => {
      state.loading = false;
      state.selectedOrder = action.payload;
      state.error = null;
    },
    fetchOrderDetailsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Effacer les erreurs
    clearOrderError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderDetailsRequest,
  fetchOrderDetailsSuccess,
  fetchOrderDetailsFailure,
  clearOrderError
} = orderSlice.actions;

export default orderSlice.reducer;
