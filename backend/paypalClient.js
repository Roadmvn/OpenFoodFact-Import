// paypalClient.js
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration de l'environnement
function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        console.error("Les identifiants PayPal n'ont pas été configurés dans le fichier .env");
        throw new Error("Configuration PayPal manquante");
    }

    // Environnement Sandbox (développement)
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

// Instance du client PayPal
function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };