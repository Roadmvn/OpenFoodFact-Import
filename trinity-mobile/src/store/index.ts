import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import { watchAuth } from './sagas/authSaga';
import { watchOrder } from './sagas/orderSaga';
import { all, fork } from 'redux-saga/effects';

// Saga racine
function* rootSaga() {
  yield all([
    fork(watchAuth),
    fork(watchOrder)
  ]);
}

// Créer le middleware saga
const sagaMiddleware = createSagaMiddleware();

// Configurer le store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

// Démarrer les sagas
sagaMiddleware.run(rootSaga);

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
