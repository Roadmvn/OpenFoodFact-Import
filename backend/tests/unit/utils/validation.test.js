import { describe, it, expect } from 'vitest';

// Fonctions de validation à tester
function estEmailValide(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function estMotDePasseValide(motDePasse) {
  // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(motDePasse);
}

function estNumeroTelephoneValide(telephone) {
  // Format international simple: +123456789 ou format français: 0123456789
  const regex = /^(\+\d{7,15}|0\d{9})$/;
  return regex.test(telephone);
}

function estCodePostalValide(codePostal, pays = 'FR') {
  if (pays === 'FR') {
    // Code postal français: 5 chiffres
    return /^\d{5}$/.test(codePostal);
  } else if (pays === 'US') {
    // Code postal américain: 5 chiffres ou 5+4 chiffres
    return /^\d{5}(-\d{4})?$/.test(codePostal);
  } else {
    // Format générique pour les autres pays
    return /^[A-Z0-9]{3,10}$/.test(codePostal);
  }
}

describe('Tests de validation', () => {
  describe('estEmailValide', () => {
    it('devrait valider un email correct', () => {
      expect(estEmailValide('test@example.com')).toBe(true);
      expect(estEmailValide('user.name+tag@example.co.uk')).toBe(true);
      expect(estEmailValide('user-name@domain.com')).toBe(true);
    });

    it('devrait rejeter un email invalide', () => {
      expect(estEmailValide('test@')).toBe(false);
      expect(estEmailValide('test@domain')).toBe(false);
      expect(estEmailValide('test.domain.com')).toBe(false);
      expect(estEmailValide('@domain.com')).toBe(false);
      expect(estEmailValide('test @ domain.com')).toBe(false);
      expect(estEmailValide('')).toBe(false);
    });
  });

  describe('estMotDePasseValide', () => {
    it('devrait valider un mot de passe correct', () => {
      expect(estMotDePasseValide('Password123')).toBe(true);
      expect(estMotDePasseValide('Abcdef1234')).toBe(true);
      expect(estMotDePasseValide('Secure987Password')).toBe(true);
    });

    it('devrait rejeter un mot de passe invalide', () => {
      expect(estMotDePasseValide('password')).toBe(false); // Pas de majuscule
      expect(estMotDePasseValide('PASSWORD')).toBe(false); // Pas de minuscule
      expect(estMotDePasseValide('Password')).toBe(false); // Pas de chiffre
      expect(estMotDePasseValide('Pass1')).toBe(false); // Trop court
      expect(estMotDePasseValide('')).toBe(false); // Vide
    });
  });

  describe('estNumeroTelephoneValide', () => {
    it('devrait valider un numéro de téléphone correct', () => {
      expect(estNumeroTelephoneValide('+33612345678')).toBe(true); 
      expect(estNumeroTelephoneValide('0612345678')).toBe(true);
      expect(estNumeroTelephoneValide('+447911123456')).toBe(true);
    });

    it('devrait rejeter un numéro de téléphone invalide', () => {
      expect(estNumeroTelephoneValide('123')).toBe(false); // Trop court
      expect(estNumeroTelephoneValide('telephone')).toBe(false); // Contient des lettres
      expect(estNumeroTelephoneValide('061234 5678')).toBe(false); // Contient un espace
      expect(estNumeroTelephoneValide('')).toBe(false); // Vide
    });
  });

  describe('estCodePostalValide', () => {
    it('devrait valider un code postal français correct', () => {
      expect(estCodePostalValide('75001')).toBe(true);
      expect(estCodePostalValide('13100')).toBe(true);
      expect(estCodePostalValide('06000')).toBe(true);
    });

    it('devrait valider un code postal américain correct', () => {
      expect(estCodePostalValide('90210', 'US')).toBe(true);
      expect(estCodePostalValide('12345-6789', 'US')).toBe(true);
    });

    it('devrait valider un code postal générique pour d\'autres pays', () => {
      expect(estCodePostalValide('SW1A1AA', 'UK')).toBe(true);
      expect(estCodePostalValide('123ABC', 'CA')).toBe(true);
    });

    it('devrait rejeter un code postal invalide', () => {
      expect(estCodePostalValide('7500')).toBe(false); // Trop court pour la France
      expect(estCodePostalValide('750012')).toBe(false); // Trop long pour la France
      expect(estCodePostalValide('12345-', 'US')).toBe(false); // Format US incomplet
      expect(estCodePostalValide('', 'UK')).toBe(false); // Vide
    });
  });
}); 