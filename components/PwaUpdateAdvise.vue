<script setup>
const { $pwa } = useNuxtApp();
const toast = useToast(); // Assuming you are using a toast library like primevue/usetoast

onMounted(() => {
  if ($pwa.offlineReady) {
    toast.add({ severity: 'info', summary: 'Ready to work offline', life: 3000 });
  }
});

const reloadPage = () => {
  $pwa.updateServiceWorker();
};
</script>

<template>
  <div v-if="$pwa.needRefresh" class="pwa-toast" role="alert">
    <div class="message">
      <span>New content available, click on the reload button to update.</span>
    </div>
    <button @click="reloadPage">Reload</button>
  </div>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px;
  border: 1px solid #888;
  border-radius: 4px;
  z-index: 1000;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pwa-toast .message {
  margin-bottom: 8px;
}
.pwa-toast button {
  margin-left: 8px;
}
</style>