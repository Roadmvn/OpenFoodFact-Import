// src/services/order/orderService.ts
import axios from 'axios';
import { API_URL } from '../../config/api';
import { Order } from '../../store/types/order';
import AuthService from '../auth/authService';

class OrderService {
  static async setupAxiosInterceptors() {
    await AuthService.setupAxiosInterceptors();
  }

  static handleError(error: any) {
    console.error('OrderService Error:', error);
    if (error.response && error.response.data) {
      return error.response.data.message || 'Une erreur est survenue';
    }
    return error.message || 'Une erreur est survenue';
  }

  // Récupérer toutes les commandes de l'utilisateur connecté
  static async getUserOrders(): Promise<Order[]> {
    try {
      console.log('OrderService: Fetching user orders');
      await OrderService.setupAxiosInterceptors();
      
      // Récupérer le CSRF token
      console.log('OrderService: Fetching CSRF token');
      const csrfResponse = await axios.get(`${API_URL}/api/user/csrf-token`);
      const csrfToken = csrfResponse.data.csrfToken;
      console.log('OrderService: CSRF token received');
      
      // Appeler l'API pour récupérer les commandes
      const response = await axios.get(`${API_URL}/api/orders/buyer/me`, {
        headers: {
          'X-CSRF-Token': csrfToken
        },
        withCredentials: true
      });
      
      console.log('OrderService: Orders fetched successfully', response.data);
      return response.data.orders;
    } catch (error) {
      console.error('OrderService: Error fetching orders', error);
      // Si l'erreur est 404 (Not Found), cela signifie qu'il n'y a pas de commandes
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('OrderService: No orders found for this user, returning empty array');
        return []; // Retourner un tableau vide au lieu de lancer une erreur
      }
      throw OrderService.handleError(error);
    }
  }

  // Récupérer les détails d'une commande spécifique
  static async getOrderDetails(orderId: number): Promise<Order> {
    try {
      console.log(`OrderService: Fetching order details for order ${orderId}`);
      await OrderService.setupAxiosInterceptors();
      
      // Récupérer le CSRF token
      console.log('OrderService: Fetching CSRF token');
      const csrfResponse = await axios.get(`${API_URL}/api/user/csrf-token`);
      const csrfToken = csrfResponse.data.csrfToken;
      console.log('OrderService: CSRF token received');
      
      // Appeler l'API pour récupérer les détails de la commande
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          'X-CSRF-Token': csrfToken
        },
        withCredentials: true
      });
      
      console.log('OrderService: Order details fetched successfully', response.data);
      return response.data.order;
    } catch (error) {
      console.error(`OrderService: Error fetching order details for order ${orderId}`, error);
      throw OrderService.handleError(error);
    }
  }
}

export default OrderService;
