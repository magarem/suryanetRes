<template>
    <div class="absolute top-4 left-4 z-10">
    <img src="/assets/logo2.png" alt="SuryaNet" class="h-7 w-auto" />
  </div>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
    <div class="relative w-full max-w-md bg-surface-0 dark:bg-surface-900 shadow-xl rounded-xl p-6 sm:p-8 border border-surface-200 dark:border-surface-700">
      

      <div class="text-center mb-6">
        <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0">Crie sua conta</h2>
      </div>

      <form @submit.prevent="register" class="space-y-4 text-sm" autocomplete="off">
        <div>
          <label for="username" class="block text-surface-700 dark:text-surface-300 font-medium mb-1 text-xs">Nome de Usuário</label>
          <InputText
            autocomplete="off"
            id="username"
            v-model="registrationData.username"
            placeholder="Seu nome de usuário"
            class="w-full h-10 px-3 py-2 rounded-md bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-900 dark:text-surface-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          />
          <p v-if="submitted && !registrationData.username" class="text-red-500 mt-1 text-xs">Obrigatório.</p>
        </div>

        <div>
          <label for="email" class="block text-surface-700 dark:text-surface-300 font-medium mb-1 text-xs">Email</label>
          <InputText
            autocomplete="off"
            id="email"
            v-model="registrationData.email"
            type="email"
            placeholder="Seu endereço de email"
            class="w-full h-10 px-3 py-2 rounded-md bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-900 dark:text-surface-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          />
          <p v-if="submitted && !registrationData.email" class="text-red-500 mt-1 text-xs">Obrigatório.</p>
        </div>

        <div>
          <label for="password" class="block text-surface-700 dark:text-surface-300 font-medium mb-1 text-xs">Senha</label>
          <Password
            autocomplete="off"
            id="password"
            v-model="registrationData.password"
            placeholder="Sua senha"
            :toggleMask="true"
            :feedback="false"
            class="w-full"
            inputClass="w-full h-10 px-3 py-2 rounded-md bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-900 dark:text-surface-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          />
          <p v-if="submitted && !registrationData.password" class="text-red-500 mt-1 text-xs">Obrigatória.</p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-surface-700 dark:text-surface-300 font-medium mb-1 text-xs">Confirmar Senha</label>
          <Password
            autocomplete="off"
            id="confirmPassword"
            v-model="registrationData.confirmPassword"
            placeholder="Confirme sua senha"
            :toggleMask="true"
            :feedback="false"
            class="w-full"
            inputClass="w-full h-10 px-3 py-2 rounded-md bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 text-surface-900 dark:text-surface-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          />
          <p v-if="submitted && !registrationData.confirmPassword" class="text-red-500 mt-1 text-xs">Obrigatória.</p>
          <p v-if="submitted && registrationData.password !== registrationData.confirmPassword"
            class="text-red-500 mt-1 text-xs">As senhas não coincidem.</p>
        </div>

        <Button
          type="submit"
          :disabled="isButtonRegisterTriger"
          :label="registerButtonLabel"
          class="w-full h-10 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold shadow-md transition-colors duration-200"
        />

        <div class="text-center mt-4">
          <NuxtLink :to="linkToLogin" class="text-primary text-sm hover:underline">Já tenho uma conta</NuxtLink>
        </div>

        <div v-if="error" class="text-center text-red-500 mt-2 text-xs">{{ error }}</div>
      </form>
    </div>
  </div>
</template>





  
  <script setup>
  definePageMeta({
  layout: false, // ou 'empty'
})
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import InputText from 'primevue/inputtext';
  import Password from 'primevue/password';
  import Button from 'primevue/button';
  import { useToast } from 'primevue/usetoast';
  
  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  const domain = route.params.domain;
  

  const primary = 'indigo-500'; // Define a primary color for consistency
const primaryDark = 'indigo-700'; 

  const linkToLogin = '/' + domain + '/auth/login';

  const registrationData = ref({
    username: '',
    email: '',
    password: '',
    confirmPassword: '' // Adicionado o campo confirmPassword
  });
  
  const submitted = ref(false);
  const error = ref('');
  const isButtonRegisterTriger = ref(false);
  const registerButtonLabel = ref("Registrar");
  
  const register = async () => {
    submitted.value = true;
    isButtonRegisterTriger.value = true;
    registerButtonLabel.value = "Aguarde...";
    error.value = '';
  
    if (!registrationData.value.username || !registrationData.value.email || !registrationData.value.password || !registrationData.value.confirmPassword) {
      toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Por favor, preencha todos os campos.', life: 3000 });
      return;
    }
  
    if (registrationData.value.password !== registrationData.value.confirmPassword) {
      toast.add({ severity: 'error', summary: 'Erro', detail: 'As senhas não coincidem.', life: 3000 });
      return;
    }
  
    try {
      const response = await $fetch(`/api/${domain}/register`, {
        method: 'POST',
        body: {
          username: registrationData.value.username,
          email: registrationData.value.email,
          password: registrationData.value.password // Envie a senha (que será hashed no backend)
        }
      });
  
      if (response.success) {
        toast.add({ severity: 'success', summary: 'Sucesso', detail: response.message || 'Registro bem-sucedido. Redirecionando...', life: 3000 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push(`/${domain}/auth/registerSuccess`);
      } else {
        error.value = response.message || 'Falha ao registrar. Tente novamente.';
        toast.add({ severity: 'error', summary: 'Erro', detail: error.value, life: 3000 });
      }
    } catch (err) {
      console.error('Erro ao registrar:', err);
      error.value = 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
      toast.add({ severity: 'error', summary: 'Erro', detail: error.value, life: 3000 });
    }
  };
  </script>
  
  <style scoped>
  .login-form {
    max-width: 400px;
    margin: 0 auto;
  }
  </style>