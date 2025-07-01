<script setup>
const { $urlParams } = useNuxtApp();

// Acesso direto aos valores atuais
const { domain, user, page } = $urlParams.current;

// Função para extrair novamente
const refreshParams = () => {
  const newParams = $urlParams.extract();
  console.log('Novos parâmetros:', newParams);
};
</script>

<template>
  <div>
    <h1>Análise de URL</h1>
    <p>Domínio: {{ domain }}</p>
    <p>Usuário: {{ user || 'N/A' }}</p>
    <p>Página: {{ page || 'N/A' }}</p>
    <p>Caminho completo: {{ $urlParams.current.fullPath }}</p>
    
    <button @click="refreshParams">Atualizar Parâmetros</button>
  </div>
</template>