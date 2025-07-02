<template>
  <div class="bg-gray-900/50 p-4 rounded-xl shadow-lg">
    <h1 class="text-2xl font-bold text-white mb-6">Meus dados</h1>
    <div v-if="true" class="grid grid-cols-1 lg:grid-cols-3 gap-0 ">
      <!-- Left Column: Avatar and Info -->
      <div class="lg:col-span-1 mb-4">
        <div class="bg-gray-800 p-8 rounded-lg text-center">
          <!-- <img
            class="h-32 w-32 rounded-full border-4 border-gray-700 mx-auto object-cover"
            src="https://placehold.co/100x100/6366f1/e0e7ff?text=JD"
            alt="User avatar"
          /> -->
          <img
            v-if="profile?.foto"
            :src="profile.foto"
            alt="Foto de Perfil"
            class="h-32 w-32 rounded-full border-4 border-gray-700 mx-auto object-cover"
          />

          <h2 class="text-2xl font-bold text-white mt-4">{{ user.name }}</h2>
          <p class="text-gray-400">{{ user.roles_names.join(", ") }}</p>

          <ProfilePictureUploader
            class="mt-5"
            :username="user.username"
            @update:imageUrl="updateProfilePicture"
          />

          <!-- <button
            class="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Upload class="h-5 w-5" />
            Change Photo
          </button> -->
        </div>
      </div>

      <!-- Right Column: Edit Profile Form -->
      <div class="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
        <!-- <h2 class="text-xl font-semibold text-white mb-4">Meu perfil</h2> -->
        <Toast />
        <form @submit.prevent="saveProfile" _class="grid grid-cols-1 gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="username"
                class="block text-sm font-medium text-gray-300 mb-1"
                >Nome de usuário</label
              >
              <input
                type="text"
                id="username"
                v-model="profile.username"
                class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-300 mb-1"
                >Email</label
              >
              <input
                type="email"
                id="email"
                v-model="profile.email"
                class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-300 mb-1"
                >Nome completo</label
              >
              <input
                type="text"
                id="name"
                v-model="profile.name"
                class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                for="phone"
                class="block text-sm font-medium text-gray-300 mb-1"
                >Fone</label
              >
              <input
                type="text"
                id="phone"
                v-model="profile.phone"
                class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div class="md:col-span-2">
              <label
                for="bio"
                class="block text-sm font-medium text-gray-300 mb-1"
                >Descrição</label
              >
              <textarea
                id="bio"
                rows="4"
                v-model="profile.description"
                class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>
          <div class="mt-6 text-right">
            <button
            type="submit"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Upload } from "lucide-vue-next";
import ProfilePictureUploader from "~/components/ProfilePictureUploader.vue";
import { useToast } from "primevue/usetoast";
const { user, clear: clearSession } = useUserSession();
const toast = useToast();
const profile = ref({
  username: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  description: "",
  foto: `/api/uploads/${user.value.username}/avatar.png?${Date.now()}`
});
const updateProfilePicture = imageUrl => {
  profile.value.foto = imageUrl;
};

const checkImageExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return url;
    } else {
      return '/avatar-default-icon.png';
    }
  } catch (error) {
    console.error('Error checking image existence:', error);
    return '/avatar-default-icon.png';
  }
}

async function fetchUserProfile() {
  try {
    const { data: ret } = await useFetch("/api/user/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    profile.value = ret.value; // Espalhe os dados do usuário e limpe a senha
    profile.value.foto = `/api/uploads/${user.value.username}/avatar.png?${Date.now()}`
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao carregar perfil.",
      life: 3000
    });
  }
}

async function saveProfile() {
  try {
    let profileclone = {...profile.value };
    delete profileclone.foto; // Remover a foto antes de enviar
    // 1. Salvar/atualizar os dados básicos do usuário na tabela 'users'
    const ret = await $fetch(`/api/upsert`, {
      method: "POST",
      body: {
        table: "users",
        data: profileclone,
        condition: profile.value.id ? `id = ${profile.value.id}` : null
      }
    });

    if (ret.success) {
      toast.add({
        severity: "success",
        summary: "Sucesso",
        detail: "Perfil atualizado.",
        life: 3000
      });
      await fetchUserProfile(); // Recarrega os dados atualizados
    } else {
      toast.add({
        severity: "error",
        summary: "Erro",
        detail: ret.message || "Falha ao atualizar perfil.",
        life: 3000
      });
    }
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao salvar perfil.",
      life: 3000
    });
  }
}

// onMounted(async () => {
  await fetchUserProfile();
// });

</script>
