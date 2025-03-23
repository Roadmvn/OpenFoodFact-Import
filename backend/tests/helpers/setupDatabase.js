import { sequelize } from '../../models';

/**
 * Réinitialise la base de données pour les tests
 */
export async function resetDatabase() {
  try {
    // Force la recréation de toutes les tables
    await sequelize.sync({ force: true });
    console.log('Base de données réinitialisée pour les tests');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de la base de données:', error);
    throw error;
  }
}

/**
 * Ferme la connexion à la base de données
 */
export async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('Connexion à la base de données fermée');
  } catch (error) {
    console.error('Erreur lors de la fermeture de la connexion:', error);
    throw error;
  }
} 