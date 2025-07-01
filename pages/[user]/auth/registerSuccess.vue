<template>
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div _class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Usuário Registrado com Sucesso!
        </h1>
        <p class="text-gray-600 dark:text-gray-400  px-5">
          Clique no link de confirmação que enviamos para o seu endereço de e-mail
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 px-5">
          Se você não encontrar o e-mail em sua caixa de entrada, verifique a pasta de spam.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
 definePageMeta({
  layout: false, // ou 'empty'
})
</script>

<style scoped>
/* Estilos opcionais para personalizar ainda mais */
.login-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>