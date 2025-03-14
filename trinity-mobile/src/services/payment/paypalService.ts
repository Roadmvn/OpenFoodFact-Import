import axios from 'axios';
import { API_URL } from '../../config/api';
import { CartItem } from '../cart/cartService';

// Interfaces pour les réponses de l'API PayPal
export interface CreateOrderResponse {
  id: string;
  status: string;
  approvalUrl: string;
}

export interface CaptureOrderResponse {
  id: string;
  status: string;
  payer: {
    email_address: string;
    payer_id: string;
  };
  purchase_units: Array<{
    reference_id: string;
    amount: {
      value: string;
      currency_code: string;
    };
  }>;
  localOrderId: string;
}

// Configuration pour le mode développement
const DEV_MODE = true; // Mettre à true pour simuler les réponses sans appeler l'API
const DEBUG_MODE = true; // Mettre à true pour afficher les logs détaillés

class PaypalService {
  /**
   * Crée une commande PayPal à partir des articles du panier
   * @param cartItems Articles du panier
   * @param userId ID de l'utilisateur
   * @returns Informations sur la commande PayPal créée
   */
  static async createOrder(cartItems: CartItem[], userId: number): Promise<CreateOrderResponse> {
    try {
      // Calcul du montant total
      const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      if (DEBUG_MODE) {
        console.log(`[PaypalService] Création d'une commande pour un montant de ${totalAmount}€`);
        console.log(`[PaypalService] URL de l'API: ${API_URL}/api/orders`);
      }
      
      if (DEV_MODE) {
        // Simuler une réponse en mode développement
        console.log('[PaypalService] Mode développement: simulation de réponse');
        
        // Simuler un délai pour rendre l'expérience plus réaliste
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          id: `DEV-ORDER-${Date.now()}`,
          status: 'CREATED',
          approvalUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=DEV-TOKEN'
        };
      }
      
      // Création de la commande dans notre backend
      const orderResponse = await axios.post(`${API_URL}/api/orders`, {
        buyerId: userId,
        items: cartItems.map(item => ({
          internalProductId: item.internalProductId, // ID du produit interne
          quantity: item.quantity,
          price: item.price,
          sellerId: item.sellerId
        })),
        totalAmount
      });
      
      const localOrderId = orderResponse.data.id;
      
      if (DEBUG_MODE) {
        console.log(`[PaypalService] Commande locale créée avec l'ID: ${localOrderId}`);
        console.log(`[PaypalService] Appel de l'API PayPal: ${API_URL}/api/paypal/create-order`);
      }
      
      // Création de la commande PayPal avec l'ID de commande local
      const response = await axios.post(`${API_URL}/api/paypal/create-order`, {
        localOrderId
      });
      
      // Le backend renvoie paypalTransactionId et status
      const paypalOrderId = response.data.paypalTransactionId;
      
      // Construire l'URL d'approbation PayPal (sandbox pour le développement)
      const approvalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${paypalOrderId}`;
      
      if (DEBUG_MODE) {
        console.log(`[PaypalService] Commande PayPal créée avec l'ID: ${paypalOrderId}`);
        console.log(`[PaypalService] URL d'approbation: ${approvalUrl}`);
      }
      
      return {
        id: paypalOrderId,
        status: response.data.status,
        approvalUrl: approvalUrl
      };
    } catch (error) {
      console.error('Erreur lors de la création de la commande PayPal:', error);
      
      if (DEBUG_MODE && axios.isAxiosError(error)) {
        console.error(`[PaypalService] Détails de l'erreur: ${error.message}`);
        console.error(`[PaypalService] Status: ${error.response?.status}`);
        console.error(`[PaypalService] URL: ${error.config?.url}`);
        console.error(`[PaypalService] Méthode: ${error.config?.method}`);
        console.error(`[PaypalService] Données: ${JSON.stringify(error.config?.data)}`);
        console.error(`[PaypalService] Réponse: ${JSON.stringify(error.response?.data)}`);
      }
      
      // En mode développement, retourner une réponse simulée en cas d'erreur
      if (DEV_MODE) {
        console.log('[PaypalService] Mode développement: retour d\'une réponse simulée après erreur');
        return {
          id: `DEV-ERROR-ORDER-${Date.now()}`,
          status: 'CREATED',
          approvalUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=DEV-ERROR-TOKEN'
        };
      }
      
      throw error;
    }
  }

  /**
   * Capture une commande PayPal après approbation par l'utilisateur
   * @param paypalOrderId ID de la commande PayPal
   * @returns Informations sur la capture de la commande
   */
  static async captureOrder(paypalOrderId: string): Promise<CaptureOrderResponse> {
    try {
      if (DEBUG_MODE) {
        console.log(`[PaypalService] Capture de la commande PayPal: ${paypalOrderId}`);
        console.log(`[PaypalService] URL de l'API: ${API_URL}/api/paypal/capture-order/${paypalOrderId}`);
      }
      
      if (DEV_MODE) {
        // Simuler une réponse en mode développement
        console.log('[PaypalService] Mode développement: simulation de réponse de capture');
        return {
          id: paypalOrderId,
          status: 'COMPLETED',
          payer: {
            email_address: 'dev-client@example.com',
            payer_id: 'DEV-PAYER-ID'
          },
          purchase_units: [{
            reference_id: 'DEV-REF-ID',
            amount: {
              value: '9.99',
              currency_code: 'EUR'
            }
          }],
          localOrderId: 'DEV-LOCAL-ORDER-ID'
        };
      }
      
      const response = await axios.post(`${API_URL}/api/paypal/capture-order/${paypalOrderId}`);
      
      if (DEBUG_MODE) {
        console.log(`[PaypalService] Réponse de capture reçue: ${JSON.stringify(response.data)}`);
      }
      
      // Adapter la réponse du backend au format attendu par l'application
      return {
        id: response.data.captureId || paypalOrderId,
        status: response.data.status || 'COMPLETED',
        payer: response.data.payer || {
          email_address: 'client@example.com',
          payer_id: 'PAYER-ID'
        },
        purchase_units: response.data.purchase_units || [{
          reference_id: 'REF-ID',
          amount: {
            value: response.data.invoice?.totalAmount.toString() || '0',
            currency_code: 'EUR'
          }
        }],
        localOrderId: response.data.invoice?.orderId.toString() || ''
      };
    } catch (error) {
      console.error('Erreur lors de la capture de la commande PayPal:', error);
      
      if (DEBUG_MODE && axios.isAxiosError(error)) {
        console.error(`[PaypalService] Détails de l'erreur de capture: ${error.message}`);
        console.error(`[PaypalService] Status: ${error.response?.status}`);
        console.error(`[PaypalService] URL: ${error.config?.url}`);
      }
      
      // En mode développement, retourner une réponse simulée en cas d'erreur
      if (DEV_MODE) {
        console.log('[PaypalService] Mode développement: retour d\'une réponse simulée après erreur de capture');
        return {
          id: paypalOrderId,
          status: 'COMPLETED',
          payer: {
            email_address: 'dev-error-client@example.com',
            payer_id: 'DEV-ERROR-PAYER-ID'
          },
          purchase_units: [{
            reference_id: 'DEV-ERROR-REF-ID',
            amount: {
              value: '9.99',
              currency_code: 'EUR'
            }
          }],
          localOrderId: 'DEV-ERROR-LOCAL-ORDER-ID'
        };
      }
      
      throw error;
    }
  }

  /**
   * Vérifie le statut d'une commande PayPal
   * @param paypalOrderId ID de la commande PayPal
   * @returns Statut de la commande
   */
  static async checkOrderStatus(paypalOrderId: string): Promise<{ status: string }> {
    try {
      if (DEBUG_MODE) {
        console.log(`[PaypalService] Vérification du statut de la commande: ${paypalOrderId}`);
        console.log(`[PaypalService] Recherche de la commande avec paypalTransactionId: ${paypalOrderId}`);
      }
      
      if (DEV_MODE) {
        // Simuler une réponse en mode développement
        console.log('[PaypalService] Mode développement: simulation de réponse de statut');
        return { status: 'COMPLETED' };
      }
      
      // D'abord, nous devons trouver l'ID de la commande locale qui correspond à cet ID PayPal
      // Nous pouvons utiliser la route /api/orders/buyer/me pour obtenir toutes les commandes de l'utilisateur
      const ordersResponse = await axios.get(`${API_URL}/api/orders/buyer/me`);
      
      if (DEBUG_MODE) {
        console.log(`[PaypalService] Commandes reçues: ${JSON.stringify(ordersResponse.data)}`);
      }
      
      // Chercher la commande avec le paypalTransactionId correspondant
      const order = ordersResponse.data.find((order: any) => order.paypalTransactionId === paypalOrderId);
      
      if (!order) {
        throw new Error(`Commande avec paypalTransactionId ${paypalOrderId} non trouvée`);
      }
      
      // Maintenant que nous avons l'ID de la commande, nous pouvons obtenir ses détails
      const orderResponse = await axios.get(`${API_URL}/api/orders/${order.id}`);
      
      if (DEBUG_MODE) {
        console.log(`[PaypalService] Détails de la commande reçus: ${JSON.stringify(orderResponse.data)}`);
        console.log(`[PaypalService] Statut de la commande: ${orderResponse.data.status}`);
      }
      
      // Mapper le statut de la commande locale au statut PayPal
      let paypalStatus = 'UNKNOWN';
      
      switch (orderResponse.data.status) {
        case 'completed':
          paypalStatus = 'COMPLETED';
          break;
        case 'pending':
          paypalStatus = 'PENDING';
          break;
        case 'cancelled':
          paypalStatus = 'CANCELLED';
          break;
        default:
          paypalStatus = orderResponse.data.status.toUpperCase();
      }
      
      return { status: paypalStatus };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de la commande:', error);
      
      if (DEBUG_MODE && axios.isAxiosError(error)) {
        console.error(`[PaypalService] Détails de l'erreur de statut: ${error.message}`);
        console.error(`[PaypalService] Status: ${error.response?.status}`);
        console.error(`[PaypalService] URL: ${error.config?.url}`);
      }
      
      // En mode développement, retourner une réponse simulée en cas d'erreur
      if (DEV_MODE) {
        console.log('[PaypalService] Mode développement: retour d\'un statut simulé après erreur');
        return { status: 'COMPLETED' };
      }
      
      throw error;
    }
  }
}

export default PaypalService;
