<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Install PWA</h1>
        <p class="mb-4">This page is designed to help you install the PWA on your device.</p>
        <p class="mb-4">Click the button below to install the PWA.</p>
        <!-- <button @click="installPWA" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Install PWA
        </button> -->
        <PwaInstallPrompt/>
        <!-- <p v-if="installMessage" class="mt-4 text-green-500">{{ installMessage }}</p>
        <p v-if="errorMessage" class="mt-4 text-red-500">{{ errorMessage }}</p> -->
    </div>
</template>
<script setup>
definePageMeta({
  layout: 'auth',
});
import PwaInstallPrompt from '~/components/PwaInstallPrompt.vue';
</script>