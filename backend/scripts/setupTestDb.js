const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.test' });

async function setupTestDb() {
  let connection;
  try {
    console.log('Configuration de la base de données de test...');
    
    // Connexion à MySQL sans spécifier de base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    });
    
    // Suppression de la base de données si elle existe déjà (pour des tests propres)
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_DATABASE};`);
    console.log(`Base de données ${process.env.DB_DATABASE} supprimée si existante.`);
    
    // Création de la base de données de test
    await connection.query(`CREATE DATABASE ${process.env.DB_DATABASE};`);
    console.log(`Base de données ${process.env.DB_DATABASE} créée avec succès.`);
    
    // Utilisation de la base de données de test
    await connection.query(`USE ${process.env.DB_DATABASE};`);
    
    console.log('Configuration de la base de données de test terminée avec succès.');
    return true;
  } catch (error) {
    console.error('Erreur lors de la configuration de la base de données de test:', error);
    return false;
  } finally {
    // Fermeture de la connexion si elle existe
    if (connection) {
      await connection.end();
      console.log('Connexion à la base de données fermée.');
    }
    
    if (process.env.NODE_ENV === 'test' && !process.env.VITEST) {
      process.exit(0);
    }
  }
}

// Si ce fichier est exécuté directement
if (require.main === module) {
  setupTestDb()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
} else {
  // Si importé comme module
  module.exports = setupTestDb;
} 