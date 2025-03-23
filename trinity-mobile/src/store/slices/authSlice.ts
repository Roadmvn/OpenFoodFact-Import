import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, LoginResponse, RegisterCredentials, UpdateUserProfileRequest, User } from '../types/auth';

// Mise à jour de l'interface AuthState pour inclure registerSuccess
interface ExtendedAuthState extends AuthState {
  registerSuccess: boolean;
}

const initialState: ExtendedAuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  registerSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state, action: PayloadAction<LoginCredentials>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    registerRequest: (state, action: PayloadAction<RegisterCredentials>) => {
      state.loading = true;
      state.error = null;
      state.registerSuccess = false;
    },
    registerSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.registerSuccess = true;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.registerSuccess = false;
    },
    logout: (state) => {
      state.loading = true;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    },
    logoutFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetRegisterSuccess: (state) => {
      state.registerSuccess = false;
    },
    updateProfileRequest: (state, action: PayloadAction<UpdateUserProfileRequest>) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Actions pour l'authentification Google
    googleLoginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    googleLoginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    googleLoginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logout,
  logoutSuccess,
  logoutFailure,
  resetRegisterSuccess,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  googleLoginRequest,
  googleLoginSuccess,
  googleLoginFailure,
} = authSlice.actions;

export default authSlice.reducer;
