const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API OpenFoodFact-Import',
      version: '1.0.0',
      description: 'Documentation de l\'API pour l\'application OpenFoodFact-Import',
      contact: {
        name: 'Support',
        email: 'contact@openfoodfact-import.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    path.resolve(__dirname, '../routes/*.js'),
    path.resolve(__dirname, '../controllers/*.js'),
    path.resolve(__dirname, '../models/*.js')
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;