import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Fonction à tester
function calculerRemise(prix, quantite) {
  if (quantite <= 0) {
    throw new Error('La quantité doit être positive');
  }
  
  // Remise de 10% pour plus de 5 articles
  // Remise de 20% pour plus de 10 articles
  if (quantite > 10) {
    return prix * 0.8;
  } else if (quantite > 5) {
    return prix * 0.9;
  }
  return prix;
}

// Service à mocker
const serviceNotification = {
  envoyerEmail: (destinataire, message) => {
    // Dans le code réel, cette fonction enverrait un email
    console.log(`Email envoyé à ${destinataire}: ${message}`);
    return true;
  }
};

// Fonction qui utilise le service
function traiterCommande(produit, quantite, email) {
  if (!produit || !produit.nom || !produit.prix) {
    throw new Error('Produit invalide');
  }
  
  const prixTotal = calculerRemise(produit.prix * quantite, quantite);
  
  // Envoyer une confirmation par email
  const message = `Votre commande de ${quantite} ${produit.nom} a été traitée. Montant total: ${prixTotal}€`;
  const emailEnvoye = serviceNotification.envoyerEmail(email, message);
  
  return {
    produit: produit.nom,
    quantite,
    prixTotal,
    emailEnvoye
  };
}

describe('Tests avec mocks', () => {
  // Mock du service de notification
  beforeEach(() => {
    vi.spyOn(serviceNotification, 'envoyerEmail').mockImplementation(() => true);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('calculerRemise', () => {
    it('devrait retourner le prix normal pour moins de 6 articles', () => {
      expect(calculerRemise(100, 3)).toBe(100);
    });
    
    it('devrait appliquer une remise de 10% pour 6 à 10 articles', () => {
      expect(calculerRemise(100, 6)).toBe(90);
    });
    
    it('devrait appliquer une remise de 20% pour plus de 10 articles', () => {
      expect(calculerRemise(100, 11)).toBe(80);
    });
    
    it('devrait lever une erreur si la quantité est négative', () => {
      expect(() => calculerRemise(100, -1)).toThrow('La quantité doit être positive');
    });
  });
  
  describe('traiterCommande', () => {
    it('devrait traiter une commande valide et envoyer un email', () => {
      const produit = { nom: 'Ordinateur', prix: 1000 };
      const quantite = 2;
      const email = 'client@exemple.com';
      
      const resultat = traiterCommande(produit, quantite, email);
      
      expect(resultat.produit).toBe('Ordinateur');
      expect(resultat.quantite).toBe(2);
      expect(resultat.prixTotal).toBe(2000);
      expect(resultat.emailEnvoye).toBe(true);
      
      // Vérifier que le mock a été appelé correctement
      expect(serviceNotification.envoyerEmail).toHaveBeenCalledTimes(1);
      expect(serviceNotification.envoyerEmail).toHaveBeenCalledWith(
        'client@exemple.com',
        'Votre commande de 2 Ordinateur a été traitée. Montant total: 2000€'
      );
    });
    
    it('devrait lever une erreur si le produit est invalide', () => {
      expect(() => traiterCommande(null, 2, 'client@exemple.com')).toThrow('Produit invalide');
      expect(() => traiterCommande({}, 2, 'client@exemple.com')).toThrow('Produit invalide');
      expect(() => traiterCommande({ nom: 'Test' }, 2, 'client@exemple.com')).toThrow('Produit invalide');
    });
    
    it('devrait appliquer la remise sur le prix total', () => {
      const produit = { nom: 'Stylo', prix: 10 };
      const quantite = 12;
      const email = 'client@exemple.com';
      
      const resultat = traiterCommande(produit, quantite, email);
      
      // 10 * 12 = 120, avec remise de 20% = 96
      expect(resultat.prixTotal).toBe(96);
    });
  });
}); 