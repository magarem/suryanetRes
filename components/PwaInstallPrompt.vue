<template>
  <div  class="bg-gray-800 text-gray-300">
    <p>Deseja instalar este aplicativo em seu dispositivo?</p>
    <Button class="mt-4" label="Instalar" @click="installPWA" />
    <!-- <Button label="Agora não" @click="dismissPrompt" /> -->
  </div>
</template>

<script setup>
const showPrompt = ref(false)
const deferredPrompt = ref(null)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showPrompt.value = true
  })
})

const installPWA = () => {
  showPrompt.value = false
  deferredPrompt.value.prompt()
  deferredPrompt.value.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('Usuário aceitou a instalação')
    }
    deferredPrompt.value = null
  })
}

const dismissPrompt = () => {
  showPrompt.value = false
}
</script>

<style>
.pwa-prompt {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 9999;
}
</style>