import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import AuthService from '../../services/auth/authService';
import UserService from '../../services/user/userService';
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
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
} from '../slices/authSlice';
import { LoginCredentials, RegisterCredentials, UpdateUserProfileRequest } from '../types/auth';
import Toast from 'react-native-toast-message';

const TOAST_DURATION = 2000;

function* handleLogin(action: PayloadAction<LoginCredentials>): Generator<any, void, any> {
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

function* handleRegister(action: PayloadAction<RegisterCredentials>): Generator<any, void, any> {
  try {
    const response = yield call(AuthService.register, action.payload);
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

function* handleLogout(): Generator<any, void, any> {
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

function* handleUpdateProfile(action: PayloadAction<UpdateUserProfileRequest>): Generator<any, void, any> {
  try {
    console.log('AuthSaga: Starting profile update', action.payload);
    
    // Vérifier si nous avons des données d'adresse
    const addressFields = {
      street: action.payload.street,
      postalCode: action.payload.postalCode,
      city: action.payload.city,
      country: action.payload.country
    };
    
    console.log('AuthSaga: Address fields in update request', addressFields);
    
    const user = yield call(UserService.updateUserProfile as any, action.payload);
    
    console.log('AuthSaga: Profile update successful', user);
    
    // Vérifier que les champs d'adresse ont été correctement mis à jour
    console.log('AuthSaga: Updated address fields', {
      street: user.street,
      postalCode: user.postalCode,
      city: user.city,
      country: user.country
    });
    
    yield put(updateProfileSuccess(user));
    
    Toast.show({
      type: 'success',
      text1: 'Profil mis à jour',
      text2: 'Vos informations ont été mises à jour avec succès',
      visibilityTime: TOAST_DURATION,
    });
  } catch (error: any) {
    console.error('AuthSaga: Profile update failed', error);
    yield put(updateProfileFailure(error.message));
    Toast.show({
      type: 'error',
      text1: 'Erreur de mise à jour',
      text2: error.message,
      visibilityTime: TOAST_DURATION,
    });
  }
}

// Renommer la fonction pour correspondre à ce qui est attendu dans le store
export function* watchAuth(): Generator<any, void, any> {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(logout.type, handleLogout);
  yield takeLatest(updateProfileRequest.type, handleUpdateProfile);
}

// Garder authSaga comme alias pour la compatibilité
export const authSaga = watchAuth;
