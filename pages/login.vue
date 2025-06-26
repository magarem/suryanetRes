<template>
  <div class="w-full max-w-sm">
    <div class="bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl p-8 space-y-6 border border-gray-700">
      <!-- Logo and Welcome Message -->
      <div class="flex flex-col items-center space-y-2">
        <svg class="h-12 w-12 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <h1 class="text-3xl font-bold text-white">SuryaNet</h1>
        <!-- <p class="text-gray-400 text-center">Welcome back! Please login to your account.</p> -->
      </div>

      <!-- Login Form -->
      <form class="space-y-6" @submit.prevent="login">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email ou nome do usuário</label>
          <input v-model="credentials.email"
            type="text" 
            name="email" 
            id="email" 
            class="w-full bg-gray-700 py-1 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-transparent" 
            placeholder="you@example.com"
            required
          >
        </div>
        <div>
           <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Senha</label>
           <input v-model="credentials.password"
            type="password" 
            name="password" 
            id="password" 
            class="w-full bg-gray-700 py-1 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-transparent" 
            placeholder="••••••••"
            required
          >
        </div>
        <div class="flex items-center justify-between">
            <a href="#" class="text-sm text-yellow-400 hover:underline">Lembrar senha?</a>
        </div>
        <div>
          <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <LogIn class="h-5 w-5" />
            Login
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import { LogIn } from 'lucide-vue-next';

// This tells Nuxt to use the 'auth' layout for this page
definePageMeta({
  layout: 'auth',
});

const { loggedIn, user, fetch: refreshSession } = useUserSession()
const credentials = reactive({
  domain: 'novagokula',
  email: '',
  password: '',
})
async function login() {
  $fetch('/api/login', {
    method: 'POST',
    body: credentials
  })
  .then(async () => {
    // Refresh the session on client-side and redirect to the home page
    await refreshSession()
    await navigateTo('/')
  })
  .catch(() => alert('Bad credentials'))
}
</script>
