'use strict';
const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function createProfile(profileData) {
    try {
        // Vérification du type de profil
        if (!['admin', 'seller', 'buyer'].includes(profileData.role)) {
            throw new Error('Type de profil invalide. Doit être: admin, seller ou buyer');
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email: profileData.email } });
        if (existingUser) {
            console.log(`Un utilisateur avec l'email ${profileData.email} existe déjà`);
            return existingUser;
        }

        // Hashage du mot de passe
        const hashedPassword = await bcrypt.hash(profileData.password, 10);

        // Création du profil
        const user = await User.create({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            password: hashedPassword,
            role: profileData.role,
            phone: profileData.phone || null,
            address: profileData.address || null,
            zipCode: profileData.zipCode || null,
            city: profileData.city || null,
            country: profileData.country || null
        });

        console.log(`Profil ${profileData.role} créé avec succès:`, {
            id: user.id,
            email: user.email,
            role: user.role
        });

        return user;
    } catch (error) {
        console.error('Erreur lors de la création du profil:', error.message);
        throw error;
    }
}

// Données des profils à créer
const profiles = [
    {
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin',
        phone: '0123456789',
        address: '123 rue Admin',
        zipCode: '75001',
        city: 'Paris',
        country: 'France'
    },
    {
        firstName: 'Vendeur',
        lastName: 'Test',
        email: 'seller@example.com',
        password: 'Seller123!',
        role: 'seller',
        phone: '0123456788',
        address: '456 rue Vendeur',
        zipCode: '75002',
        city: 'Paris',
        country: 'France'
    },
    {
        firstName: 'Acheteur',
        lastName: 'Test',
        email: 'buyer@example.com',
        password: 'Buyer123!',
        role: 'buyer',
        phone: '0123456787',
        address: '789 rue Acheteur',
        zipCode: '75003',
        city: 'Paris',
        country: 'France'
    }
];

// Fonction pour créer tous les profils
async function createAllProfiles() {
    try {
        console.log('Début de la création des profils...');
        
        for (const profileData of profiles) {
            try {
                await createProfile(profileData);
                console.log(`Informations de connexion pour ${profileData.role}:`);
                console.log(`Email: ${profileData.email}`);
                console.log(`Mot de passe: ${profileData.password}\n`);
            } catch (error) {
                console.error(`Erreur lors de la création du profil ${profileData.role}:`, error.message);
            }
        }
        
        console.log('Création des profils terminée');
    } catch (error) {
        console.error('Erreur générale:', error.message);
    }
}

// Exécuter le script si lancé directement
if (require.main === module) {
    createAllProfiles()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Erreur:', error);
            process.exit(1);
        });
}

module.exports = createProfile;