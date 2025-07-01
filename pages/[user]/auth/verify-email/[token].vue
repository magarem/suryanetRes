<template>
    <div class="container mx-auto mt-8 p-6 rounded-md shadow-md">
      <h1 class="text-2xl font-bold mb-6">Verificação de E-mail</h1>
  
      <div v-if="verificationSuccess">
        <p class="text-green-600 font-semibold mb-4">
          E-mail confirmado com sucesso!
        </p>
        <p>
          Você pode agora fazer login clicando no botão abaixo.
        </p>
        <Button label="Fazer Login" @click="goToLogin" />
      </div>
  
      <div v-else-if="verificationError">
        <p class="text-red-600 font-semibold mb-4">
          Erro ao verificar o e-mail: {{ verificationErrorMessage }}
        </p>
        <p>
          Por favor, tente novamente ou solicite um novo link de verificação.
        </p>
      </div>
  
      <div v-else>
        <p>
          Verificando seu e-mail... Por favor, aguarde.
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
    definePageMeta({
  layout: false, // ou 'empty'
})
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Button from 'primevue/button';
  import { useToast } from 'primevue/usetoast'; // Se você quiser usar toasts
  
  const route = useRoute();
  const router = useRouter();
  const domain = route.params.domain;
  const token = route.params.token;
  
  const verificationSuccess = ref(false);
  const verificationError = ref(false);
  const verificationErrorMessage = ref('');
  const toast = useToast();
  
  async function verifyEmail() {
    try {
      const response = await $fetch(`/api/${domain}/verify-email/${token}`, {
        method: 'GET'
      });
  
      if (response.success) {
        verificationSuccess.value = true;
      } else {
        verificationError.value = true;
        verificationErrorMessage.value = response.message || 'Falha ao verificar o e-mail.';
        toast.add({ severity: 'error', summary: 'Erro', detail: verificationErrorMessage.value, life: 5000 });
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      verificationError.value = true;
      verificationErrorMessage.value = error.message || 'Erro desconhecido ao verificar o e-mail.';
      toast.add({ severity: 'error', summary: 'Erro', detail: verificationErrorMessage.value, life: 5000 });
    }
  }
  
  function goToLogin() {
    router.push(`/${domain}/auth/login`);
  }
  
  onMounted(async () => {
    await verifyEmail();
  });
  
  </script>
  
  <style scoped>
  /* Estilos opcionais */
  </style>