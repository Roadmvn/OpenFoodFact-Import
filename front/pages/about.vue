<template>
  <div class="about-container">
    <div class="header-section">
      <h1 class="page-title">Qui sommes-nous</h1>
      <div class="separator"></div>
    </div>

    <div class="content-section">
      <div class="mission-section">
        <h2>Notre Mission</h2>
        <p>
          Chez Trinity, nous croyons que chacun mérite d'avoir accès à des informations transparentes sur les produits alimentaires qu'il consomme. 
          Notre mission est de démocratiser l'accès aux données nutritionnelles et de permettre à nos utilisateurs de faire des choix alimentaires 
          éclairés grâce à une plateforme intuitive et complète.
        </p>
        <p>
          En utilisant les données d'OpenFoodFacts, nous offrons une expérience unique qui combine informations détaillées sur les produits, 
          transparence et facilité d'utilisation, le tout dans une application accessible à tous.
        </p>
      </div>

      <div class="values-section">
        <h2>Nos Valeurs</h2>
        <div class="values-grid">
          <div class="value-card">
            <el-icon class="value-icon"><InfoFilled /></el-icon>
            <h3>Transparence</h3>
            <p>Nous croyons en une totale transparence concernant les produits alimentaires et leur composition.</p>
          </div>
          <div class="value-card">
            <el-icon class="value-icon"><User /></el-icon>
            <h3>Accessibilité</h3>
            <p>Nous rendons l'information nutritionnelle accessible à tous, quel que soit leur niveau de connaissance.</p>
          </div>
          <div class="value-card">
            <el-icon class="value-icon"><Connection /></el-icon>
            <h3>Communauté</h3>
            <p>Nous valorisons la contribution de notre communauté pour enrichir et améliorer notre base de données.</p>
          </div>
          <div class="value-card">
            <el-icon class="value-icon"><Check /></el-icon>
            <h3>Qualité</h3>
            <p>Nous nous engageons à fournir des informations précises et vérifiées sur tous les produits.</p>
          </div>
        </div>
      </div>

      <div class="history-section">
        <h2>Notre Histoire</h2>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-date">2020</div>
            <div class="timeline-content">
              <h3>Création de Trinity</h3>
              <p>Fondation de l'entreprise avec l'ambition de rendre les données alimentaires accessibles à tous.</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-date">2021</div>
            <div class="timeline-content">
              <h3>Lancement de la plateforme</h3>
              <p>Première version de notre plateforme intégrant les données d'OpenFoodFacts.</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-date">2022</div>
            <div class="timeline-content">
              <h3>Application mobile</h3>
              <p>Lancement de notre application mobile permettant de scanner les codes-barres des produits.</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-date">2023</div>
            <div class="timeline-content">
              <h3>Expansion internationale</h3>
              <p>Ouverture de notre service à l'international et traduction en plusieurs langues.</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-date">2024</div>
            <div class="timeline-content">
              <h3>Nouvelle interface</h3>
              <p>Refonte complète de notre interface utilisateur pour une expérience plus intuitive.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="team-section">
        <h2>Notre Équipe</h2>
        <div class="team-grid">
          <div class="team-member">
            <div class="member-photo" style="background-image: url('/images/team/ceo.jpg')"></div>
            <h3>Alexandre Martin</h3>
            <p class="member-role">CEO & Fondateur</p>
            <p class="member-description">Passionné par la nutrition et la technologie, Alexandre a fondé Trinity avec la vision de transformer notre rapport à l'alimentation.</p>
          </div>
          <div class="team-member">
            <div class="member-photo" style="background-image: url('/images/team/cto.jpg')"></div>
            <h3>Sophie Dubois</h3>
            <p class="member-role">CTO</p>
            <p class="member-description">Experte en développement web et mobile, Sophie dirige l'équipe technique et veille à l'excellence de nos produits.</p>
          </div>
          <div class="team-member">
            <div class="member-photo" style="background-image: url('/images/team/cmo.jpg')"></div>
            <h3>Thomas Legrand</h3>
            <p class="member-role">CMO</p>
            <p class="member-description">Avec une solide expérience en marketing digital, Thomas développe notre stratégie de communication et notre présence en ligne.</p>
          </div>
          <div class="team-member">
            <div class="member-photo" style="background-image: url('/images/team/nutritionist.jpg')"></div>
            <h3>Émilie Petit</h3>
            <p class="member-role">Nutritionniste</p>
            <p class="member-description">Nutritionniste diplômée, Émilie veille à la qualité et à la pertinence des informations nutritionnelles sur notre plateforme.</p>
          </div>
        </div>
      </div>

      <div class="contact-section">
        <h2>Nous Contacter</h2>
        <p>Vous avez des questions, des suggestions ou souhaitez collaborer avec nous ? N'hésitez pas à nous contacter !</p>
        <div class="contact-info">
          <div class="contact-item">
            <el-icon><Message /></el-icon>
            <span>contact@trinity-food.com</span>
          </div>
          <div class="contact-item">
            <el-icon><Phone /></el-icon>
            <span>+33 1 23 45 67 89</span>
          </div>
          <div class="contact-item">
            <el-icon><Location /></el-icon>
            <span>123 Avenue de la République, 75011 Paris, France</span>
          </div>
        </div>
        <el-button type="primary" size="large" class="contact-button" @click="scrollToContactForm">
          Nous envoyer un message
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const scrollToContactForm = () => {
  // Rediriger vers la page de contact ou faire défiler jusqu'à un formulaire de contact
  window.location.href = '/contact';
};
</script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Roboto', sans-serif;
  color: #333;
}

.header-section {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
}

.separator {
  width: 80px;
  height: 4px;
  background-color: #409EFF;
  margin: 0 auto;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.mission-section, .values-section, .history-section, .team-section, .contact-section {
  margin-bottom: 40px;
}

h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 15px;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #409EFF;
}

p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #5c6a7a;
}

/* Section Valeurs */
.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.value-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.value-icon {
  font-size: 2.5rem;
  color: #409EFF;
  margin-bottom: 20px;
}

.value-card h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

/* Section Histoire */
.timeline {
  position: relative;
  margin: 40px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  height: 100%;
  width: 2px;
  background-color: #e0e0e0;
}

.timeline-item {
  position: relative;
  padding-left: 60px;
  margin-bottom: 40px;
}

.timeline-date {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  background-color: #409EFF;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 1;
}

.timeline-content {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.timeline-content h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

/* Section Équipe */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.team-member {
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.team-member:hover {
  transform: translateY(-5px);
}

.member-photo {
  height: 200px;
  background-size: cover;
  background-position: center;
  background-color: #e0e0e0;
}

.team-member h3 {
  margin: 20px 20px 5px;
  font-size: 1.2rem;
  color: #2c3e50;
}

.member-role {
  margin: 0 20px 10px;
  color: #409EFF;
  font-weight: 600;
  font-size: 0.9rem;
}

.member-description {
  margin: 0 20px 20px;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Section Contact */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 30px 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1.1rem;
}

.contact-item .el-icon {
  color: #409EFF;
  font-size: 1.3rem;
}

.contact-button {
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .values-grid, .team-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.7rem;
  }
}
</style>