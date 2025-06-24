import Aura from '@primeuix/themes/aura';
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  // Optional: Add Google Fonts
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap' },
     { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' },
          { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
       
      ]
    }
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css',
    '~/assets/css/tailwind.css',
    ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['@nuxt/scripts', 'nuxt-auth-utils', '@primevue/nuxt-module', '@vueuse/nuxt', '@nuxtjs/tailwindcss'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      'autoprefixer': {},
    },
  },
  plugins: [
    '~/plugins/primevue.js'
  ],
  primevue: {
     usePrimeVue: true,
      options: {
         ripple: true,
          theme: {
              preset: Aura
          },
          options: {
                  darkModeSelector: '.app-dark'
              }
      }
  }
})