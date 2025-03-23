// resetDb.js
const { sequelize } = require('../models');

console.log('Début de la réinitialisation de la base de données...');

sequelize.sync({ force: true })
    .then(() => {
        console.log('Base de données réinitialisée avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Erreur lors de la réinitialisation :', error);
        process.exit(1);
    });