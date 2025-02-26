import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import AuthService from '../../services/auth/authService';
import {
  loginFailure,
  loginRequest,
  loginSuccess,
  registerFailure,
  registerRequest,
  registerSuccess,
  logout,
  logoutSuccess,
  logoutFailure,
} from '../slices/authSlice';
import { LoginCredentials, RegisterCredentials } from '../types/auth';
import Toast from 'react-native-toast-message';

// Configuration des toasts
const TOAST_DURATION = 2000; // 2 secondes au lieu de la durée par défaut

function* handleLogin(action: PayloadAction<LoginCredentials>) {
  try {
    const response = yield call(AuthService.login, action.payload);
    yield put(loginSuccess(response));
    Toast.show({
      type: 'success',
      text1: 'Connexion réussie',
      visibilityTime: TOAST_DURATION,
    });
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    yield put(loginFailure(error.message));
    Toast.show({
      type: 'error',
      text1: 'Erreur de connexion',
      text2: error.message,
      visibilityTime: TOAST_DURATION,
    });
  }
}

function* handleRegister(action: PayloadAction<RegisterCredentials>) {
  try {
    yield call(AuthService.register, action.payload);
    yield put(registerSuccess());
    Toast.show({
      type: 'success',
      text1: 'Inscription réussie',
      text2: 'Vous pouvez maintenant vous connecter',
      visibilityTime: TOAST_DURATION,
    });
  } catch (error: any) {
    console.error('Erreur d\'inscription:', error);
    yield put(registerFailure(error.message));
    Toast.show({
      type: 'error',
      text1: 'Erreur d\'inscription',
      text2: error.message,
      visibilityTime: TOAST_DURATION,
    });
  }
}

function* handleLogout() {
  try {
    yield call(AuthService.logout);
    yield put(logoutSuccess());
    Toast.show({
      type: 'success',
      text1: 'Déconnexion réussie',
      visibilityTime: TOAST_DURATION,
    });
  } catch (error: any) {
    console.error('Erreur lors de la déconnexion:', error);
    yield put(logoutFailure(error.message));
    Toast.show({
      type: 'error',
      text1: 'Erreur lors de la déconnexion',
      text2: error.message,
      visibilityTime: TOAST_DURATION,
    });
  }
}

export function* watchAuth() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(logout.type, handleLogout);
}
