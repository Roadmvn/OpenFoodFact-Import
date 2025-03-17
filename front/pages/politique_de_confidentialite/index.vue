<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
    
    <div class="space-y-6 text-gray-700">
      <section class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">1. Collecte des Informations</h2>
        <p class="mb-4">
          Nous collectons les informations que vous nous fournissez directement lorsque vous :
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>Créez un compte</li>
          <li>Utilisez nos services</li>
          <li>Contactez notre support</li>
        </ul>
      </section>

      <section class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">2. Utilisation des Données</h2>
        <p class="mb-4">
          Nous utilisons vos informations pour :
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>Fournir et améliorer nos services</li>
          <li>Personnaliser votre expérience</li>
          <li>Assurer la sécurité de votre compte</li>
        </ul>
      </section>

      <section class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">3. Protection des Données</h2>
        <p class="mb-4">
          Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre tout accès, modification, divulgation ou destruction non autorisés.
        </p>
      </section>

      <section class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">4. Vos Droits</h2>
        <p class="mb-4">
          Vous avez le droit de :
        </p>
        <ul class="list-disc pl-6 mb-4">
          <li>Accéder à vos données personnelles</li>
          <li>Rectifier vos données</li>
          <li>Supprimer vos données</li>
          <li>Vous opposer au traitement</li>
        </ul>
      </section>

      <section class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">5. Contact</h2>
        <p class="mb-4">
          Pour toute question concernant notre politique de confidentialité, vous pouvez nous contacter à l'adresse suivante : contact@example.com
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Politique de Confidentialité',
  description: 'Notre politique de confidentialité détaille comment nous protégeons vos données personnelles'
})
</script>