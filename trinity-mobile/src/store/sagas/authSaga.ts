import { takeLatest, call, put } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { LoginCredentials } from '../types/auth';
import { loginRequest, loginSuccess, loginFailure } from '../slices/authSlice';
import AuthService from '../../services/auth/authService';

function* handleLogin(action: PayloadAction<LoginCredentials>) {
  try {
    const response = yield call(AuthService.login, action.payload);
    yield put(loginSuccess(response));
    
    // Configure axios avec le nouveau token
    yield call(AuthService.setupAxiosInterceptors);
  } catch (error) {
    if (error instanceof Error) {
      yield put(loginFailure(error.message));
    } else {
      yield put(loginFailure('Une erreur est survenue'));
    }
  }
}

export function* watchAuth() {
  yield takeLatest(loginRequest.type, handleLogin);
}
