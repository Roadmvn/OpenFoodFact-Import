<template>
  <div class="flex flex-col items-center p-8">
    <h1 class="text-2xl font-bold mb-5">Contactez-nous</h1>

    <el-form
        :model="form"
        :rules="rules"
        ref="contactForm"
        label-position="top"
        class="w-full max-w-lg"
    >
      <el-form-item label="Sujet" prop="sujet">
        <el-input v-model="form.sujet" placeholder="Entrez le sujet"></el-input>
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <el-input
            v-model="form.email"
            placeholder="Entrez votre adresse email"
            type="email">
        </el-input>
      </el-form-item>

      <el-form-item label="Message" prop="message">
        <el-input
            v-model="form.message"
            type="textarea"
            placeholder="Entrez votre message">
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button
            type="primary"
            @click="envoyerMessage"
            :loading="loading">
          Envoyer
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";

const form = ref({
  sujet: "",
  email: "",
  message: ""
});

const loading = ref(false);

const rules = {
  sujet: [
    { required: true, message: "Le sujet est requis.", trigger: "blur" },
    { min: 3, message: "Le sujet doit contenir au moins 3 caractères.", trigger: "blur" }
  ],
  email: [
    { required: true, message: "L'email est requis.", trigger: "blur" },
    { type: "email", message: "Format d'email invalide.", trigger: "blur" }
  ],
  message: [
    { required: true, message: "Le message est requis.", trigger: "blur" },
    { min: 5, message: "Le message doit contenir au moins 5 caractères.", trigger: "blur" }
  ]
};

const envoyerMessage = async () => {
  const contactForm = ref(null);
  loading.value = true;
  try {
    await axios.post("http://localhost:8001/api/contact", {
      message: form.value.message,
      sujet: form.value.sujet,
      email: form.value.email,
    });
    ElMessage.success("Votre message a été envoyé avec succès !");
    form.value = { sujet: "", email: "", message: "" };
  } catch (error) {
    ElMessage.error("Une erreur est survenue lors de l'envoi.");
  } finally {
    loading.value = false;
  }
};
</script>