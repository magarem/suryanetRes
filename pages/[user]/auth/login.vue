<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { $fetch } from 'ohmyfetch';

definePageMeta({
  layout: false // ou 'empty'
});
const pathStore = usePathStore()
const username = ref("");
const password = ref("");
const checked = ref(false);
const error = ref("");
const response = ref("");
const route = useRoute();
const router = useRouter();
const domain = route.params.domain;
const domainExists = ref(true); // Assume true initially

const linkToRegister = `/${domain}/auth/register`
const linkToRemember = `forgotPasswordEmail`

const navigateToRegister = () => {
  router.push(linkToRegister);
};

const checkDomain = async () => {
  try {
    const res = await $fetch(`/api/check-domain/${domain}`);
    domainExists.value = res.exists;
    if (!domainExists.value) {
      // Redirect to the "domain-not-exists" page if the domain doesn't exist
      // router.push(`/${domain}/domain-not-exists`);
    }
  } catch (err) {
    console.error("Erro ao verificar domínio:", err);
    error.value = "Erro ao verificar domínio.";
    domainExists.value = false; // Assume false on error
    // router.push(`/${domain}/domain-not-exists`); // Redirect on error as well
  }
};

const login = async () => {
  if (!domainExists.value) {
    error.value = `O domínio ${domain} não existe.`;
    return;
  }

  try {
    const response = await $fetch(`/api/${domain}/login`, {
      method: "POST",
      body: { username: username.value, password: password.value }
    });


    console.log('response>>login>>:', response);
    if (response.success) {
      // Armazena o token JWT (por exemplo, em localStorage)
      // localStorage.setItem('token', response.token);
      // Redireciona para a página protegida
      navigateTo({ path: `/${domain}/${username.value}/dashboard` });
    } else {
      error.value = response.message || response;
    }
  } catch (err) {
    error.value = "Erro ao fazer login";
  }
};

onMounted(async () => {
  // Check if the domain exists when the component mounts
  await checkDomain();
});
</script>

<template>


  <div
    class="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4"
  >
  <div class="absolute top-4 left-4 z-10">
    <img src="/assets/logo2.png" alt="SuryaNet" class="h-7 w-auto" />
  </div>
    <div
      class="w-full max-w-lg p-1 rounded-[2px] from-indigo-600/50 to-transparent shadow-xl"
    >
      <div
        class="bg-gray-900 rounded-[13px] py-12 px-6 sm:px-14 backdrop-blur-md border border-gray-800"
      >
        <h2 class="text-2xl font-semibold text-white text-center mb-6">
          {{ domain }}
        </h2>

        <div v-if="!domainExists" class="text-center text-red-500 text-lg mb-6">
          O domínio {{ domain }} não existe.
        </div>

        <form v-else @submit.prevent="login" class="space-y-5">
          <div>
            <label
              for="username"
              class="block text-sm font-medium text-gray-300 mb-1"
            >
              Usuário ou E-mail
            </label>
            <InputText
              id="username"
              type="text"
              v-model="username"
              placeholder=""
              class="w-full"
            />
          </div>

          <div>
            <label
              for="password1"
              class="block text-sm font-medium text-gray-300 mb-1"
            >
              Senha
            </label>
            <Password
              id="password1"
              v-model="password"
              placeholder=""
              :toggleMask="true"
              fluid
              :feedback="false"
              class="w-full"
            />
          </div>

          <div
            class="flex items-center justify-between mt-2 mb-2 text-sm text-gray-400"
          >
            <div class="flex items-center gap-2">
              <Checkbox
                v-model="checked"
                id="rememberme1"
                binary
                class="mr-1"
              />
              <label for="rememberme1">Lembrar de mim</label>
            </div>

            <a
              :href="linkToRemember"
              class="text-indigo-400 hover:text-indigo-300 transition"
            >
              Esqueci minha senha?
            </a>
          </div>

          <Button
            type="submit"
            label="Entrar"
            class="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 transition text-white font-medium py-2 rounded-lg shadow-md"
          />
          <button
          class="w-full  bg-amber-600 hover:bg-amber-800 transition text-white font-medium py-2 rounded-lg shadow-md"
          @click="navigateToRegister"
        >
          Registrar novo usuário
        </button>

          <div v-if="error" class="text-center text-red-400 text-sm mt-2">
            {{ error }}
          </div>
          <div v-if="response" class="text-center text-green-400 text-sm mt-2">
            {{ response }}
          </div>
         
        </form>

        
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}
</style>