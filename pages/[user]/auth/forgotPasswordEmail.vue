<template>
 
  <div
    class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4"
  >
  <div class="absolute top-4 left-4 z-10">
    <img src="/assets/logo2.png"  class="h-7 w-auto" />
  </div>
    <div
      class="w-full max-w-md p-8 bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700"
    >
      <h2
        class="text-3xl font-semibold text-white text-center mb-6 tracking-tight"
      >
        🔒 Redefinir Senha
      </h2>

      <form @submit.prevent="forgotPassword" class="space-y-5">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-300 mb-1"
          >
            E-mail
          </label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="block w-full px-4 py-2 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <button
            type="submit"
            class="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
            :disabled="isSubmitting"
          >
            <svg
              v-if="isSubmitting"
              class="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.364 18.364l-.707-.707M12 20v-1M6.636 17.364l.707-.707M4 12h1M6.636 6.636l.707.707"
              />
            </svg>
            {{ isSubmitting ? "Enviando..." : "Enviar Link de Redefinição" }}
          </button>
        </div>

        <div v-if="message" class="text-sm text-center text-green-400">
          {{ message }}
        </div>

        <div v-if="error" class="text-sm text-center text-red-400">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false // ou 'empty'
});
import { ref } from "vue";

const email = ref("");
const message = ref("");
const error = ref("");
const isSubmitting = ref(false);
const route = useRoute();
const domain = route.params.domain;

const forgotPassword = async () => {
  message.value = "";
  error.value = "";
  isSubmitting.value = true;

  // Validação básica do e-mail (opcional, mas recomendado)
  if (!email.value) {
    error.value = "Por favor, insira seu e-mail.";
    isSubmitting.value = false;
    return;
  }

  // Mais validação de e-mail pode ser adicionada aqui (por exemplo, regex)

  try {
    const response = await $fetch(`/api/${domain}/forgot-password`, {
      // Substitua pela sua rota correta
      method: "POST",
      body: { email: email.value }
    });

    if (response.success) {
      message.value =
        response.message ||
        "Um link para redefinir sua senha foi enviado para o seu e-mail.";
    } else {
      error.value =
        response.message || "Falha ao solicitar a redefinição de senha.";
    }
  } catch (err) {
    console.error("Erro ao solicitar redefinição de senha:", err);
    error.value =
      "Ocorreu um erro ao processar sua solicitação. Tente novamente.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Estilos opcionais */
.reset-password-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
