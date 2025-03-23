import { describe, it, expect } from 'vitest';

// Fonctions de formatage à tester
function formatPrix(prix, devise = 'EUR') {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
  });
  return formatter.format(prix);
}

function formatDateHeure(date) {
  const dateObj = new Date(date);
  return dateObj.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDate(date) {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function tronquerTexte(texte, longueurMax = 50) {
  if (!texte || texte.length <= longueurMax) {
    return texte;
  }
  return texte.substring(0, longueurMax) + '...';
}

function capitaliserPremiereLettre(texte) {
  if (!texte || texte.length === 0) {
    return texte;
  }
  return texte.charAt(0).toUpperCase() + texte.slice(1).toLowerCase();
}

describe('Tests de formatage', () => {
  describe('formatPrix', () => {
    it('devrait formater un prix en euros', () => {
      const formattedPrice = formatPrix(1000);
      expect(formattedPrice).toMatch(/1[\s\u202f]000,00\s?€/);
      expect(formatPrix(19.99)).toMatch(/19,99\s?€/);
      expect(formatPrix(0)).toMatch(/0,00\s?€/);
    });

    it('devrait formater un prix dans d\'autres devises', () => {
      expect(formatPrix(1000, 'USD')).toMatch(/1[\s\u202f]000,00\s?\$US/);
      expect(formatPrix(19.99, 'GBP')).toMatch(/19,99\s?£GB/);
    });
  });

  describe('formatDateHeure', () => {
    it('devrait formater une date et heure complète', () => {
      const date = new Date(2023, 0, 15, 14, 30, 0);
      const resultat = formatDateHeure(date);
      expect(resultat).toMatch(/15\/01\/2023.*14:30:00/);
    });

    it('devrait gérer les chaînes de date ISO', () => {
      const resultat = formatDateHeure('2023-01-15T14:30:00');
      expect(resultat).toMatch(/15\/01\/2023.*14:30:00/);
    });
  });

  describe('formatDate', () => {
    it('devrait formater une date sans l\'heure', () => {
      const date = new Date(2023, 0, 15, 14, 30, 0);
      expect(formatDate(date)).toBe('15/01/2023');
    });

    it('devrait gérer les chaînes de date ISO', () => {
      expect(formatDate('2023-01-15T14:30:00')).toBe('15/01/2023');
    });
  });

  describe('tronquerTexte', () => {
    it('devrait tronquer un texte trop long', () => {
      const texte = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
      expect(tronquerTexte(texte, 20)).toBe('Lorem ipsum dolor si...');
    });

    it('ne devrait pas tronquer un texte court', () => {
      const texte = 'Texte court';
      expect(tronquerTexte(texte, 20)).toBe('Texte court');
    });

    it('devrait gérer les valeurs vides ou nulles', () => {
      expect(tronquerTexte('')).toBe('');
      expect(tronquerTexte(null)).toBe(null);
      expect(tronquerTexte(undefined)).toBe(undefined);
    });
  });

  describe('capitaliserPremiereLettre', () => {
    it('devrait capitaliser la première lettre et mettre le reste en minuscules', () => {
      expect(capitaliserPremiereLettre('jean')).toBe('Jean');
      expect(capitaliserPremiereLettre('DUPONT')).toBe('Dupont');
      expect(capitaliserPremiereLettre('pARIS')).toBe('Paris');
    });

    it('devrait gérer les valeurs vides ou nulles', () => {
      expect(capitaliserPremiereLettre('')).toBe('');
      expect(capitaliserPremiereLettre(null)).toBe(null);
      expect(capitaliserPremiereLettre(undefined)).toBe(undefined);
    });
  });
}); 