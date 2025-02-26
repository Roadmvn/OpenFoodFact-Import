import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest, all } from 'redux-saga/effects';
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
import { LoginCredentials, RegisterCredentials, LoginResponse, RegisterResponse } from '../types/auth';
import Toast from 'react-native-toast-message';

function* handleLogin(action: PayloadAction<LoginCredentials>) {
  try {
    const response: LoginResponse = yield call(AuthService.login, action.payload);
    // S'assurer que nous avons bien un token dans la réponse
    if (!response.token) {
      throw new Error('Token manquant dans la réponse');
    }
    yield put(loginSuccess(response));
    // Configure les intercepteurs axios avec le nouveau token
    yield call(AuthService.setupAxiosInterceptors);
    Toast.show({
      type: 'success',
      text1: 'Connexion réussie',
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    yield put(loginFailure(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Erreur de connexion',
      text2: errorMessage,
    });
  }
}

function* handleRegister(action: PayloadAction<RegisterCredentials>) {
  try {
    const response: RegisterResponse = yield call(AuthService.register, action.payload);
    yield put(registerSuccess());
    Toast.show({
      type: 'success',
      text1: 'Inscription réussie',
      text2: 'Vous pouvez maintenant vous connecter',
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    yield put(registerFailure(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Erreur d\'inscription',
      text2: errorMessage,
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
    });
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    yield put(logoutFailure(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Erreur lors de la déconnexion',
      text2: errorMessage,
    });
  }
}

export function* watchAuth() {
  yield all([
    takeLatest(loginRequest.type, handleLogin),
    takeLatest(registerRequest.type, handleRegister),
    takeLatest(logout.type, handleLogout),
  ]);
}
