export interface User {
  id: number;
  email: string;
  role: 'admin' | 'seller' | 'buyer';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}
