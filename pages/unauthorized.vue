<template>
  <div class="flex flex-col items-center min-h-screen bg-gray-900 text-gray-200 ">
    <div class="text-center bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
      <div class="mb-5 p-5">
        <i class="fas fa-lock text-red-500 text-8xl"></i>
      </div>
      <h1 class="text-4xl mt-5 font-bold text-white mb-2">Página com acesso restrito</h1>
      <p class="text-lg text-gray-400 ">
        Você não tem permissão para acessar esta página.
      </p>
      <p class="text-lg text-gray-400 mb-6">
         Faça login com uma conta autorizada.
      </p>
      <button 
        @click="goHome"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
      >
        Voltar para a página inicial
      </button>
    </div>
  </div>
</template>

<script setup>
// Define a layout for this page if you have one that doesn't include the main app sidebar/topbar.
// For example, if you have a `layouts/public.vue`, you could use:
// definePageMeta({
//   layout: 'public'
// });

const goHome = () => {
  // Navigates the user back to the root of the application.
  navigateTo('/');
};
</script>

<style scoped>
/* You can add component-specific styles here if needed. */
</style>
