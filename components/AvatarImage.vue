<template>
  <div class="relative">
    <img
      v-if="!erroAoCarregar"
      :src="avatarUrl"
      @error="erroAoCarregar = true"
      :alt="`Avatar de ${name}`"
      class="h-9 w-9 rounded-full object-cover ring-2 ring-offset-2 ring-offset-gray-800 ring-transparent"
    />
    <div
      v-else
      class="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold ring-2 ring-offset-2 ring-offset-gray-800 ring-transparent"
    >
      {{ name?.charAt(0).toUpperCase() || '?' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  username: { type: String, required: true },
  name: { type: String, default: '' }
})

const erroAoCarregar = ref(false)

const avatarUrl = computed(() => `/api/uploads/${props.username}/avatar.png?${Date.now()}`)

watch(() => props.username, () => {
  erroAoCarregar.value = false // Resetar erro ao trocar de usuário
})
</script>
