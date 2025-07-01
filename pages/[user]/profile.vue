<template>
  <div class="container mx-auto mt-1 _p-6 rounded-md shadow-md">
    <h2 class="text-2xl font-bold mb-6">Perfil</h2>
    <Toast />
    <form v-if="profile" @submit.prevent="saveProfile" class="grid grid-cols-1 gap-4">
      <div  _class="flex flex-col items-center space-y-4 mb-4">
        <!-- {{ profile.foto }} -->
        <img
          v-if="profile?.foto"
          :src="profile.foto"
          alt="Foto de Perfil"
          class="w-20 h-20 rounded-full mb-5"
        />
        <ProfilePictureUploader :domain="domain" :username="profile.nome" @update:imageUrl="updateProfilePicture" />
      </div>
      <div>
        <label for="name" class="block text-gray-700 font-bold mb-2">
          Username
        </label>
        <InputText
          id="name"
          v-model="profile.nome"
          type="text"
          class="w-1/3 shadow appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div>
        <label for="email" class="block text-gray-700 font-bold mb-2">
          Email
        </label>
        <InputText
          id="email"
          v-model="profile.email"
          type="email"
          class="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div>
        <label for="phone" class="block text-gray-700 font-bold mb-2">
          Telefone
        </label>
        <InputText
          id="phone"
          v-model="profile.telefone"
          type="tel"
          class="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div>
        <label class="block text-gray-700 font-bold mb-2">
          Senha
        </label>
        <Button
          label="Alterar Senha"
          @click="openChangePasswordModal"
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        />
      </div>

      <div class="flex justify-end">
        <Button
          label="Salvar"
          type="submit"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        />
      </div>
    </form>
    <Dialog
      v-model:visible="changePasswordModal"
      :style="{ width: '450px' }"
      header="Alterar Senha"
      :modal="true"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label
            for="currentPassword"
            class="block text-gray-700 font-bold mb-2"
            >Senha Atual</label
          >
          <Password
            id="currentPassword"
            v-model="changePasswordForm.currentPassword"
            class="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            :feedback="false"
          />
        </div>

        <div>
          <label for="newPassword" class="block text-gray-700 font-bold mb-2"
            >Nova Senha</label
          >
          <Password
            id="newPassword"
            v-model="changePasswordForm.newPassword"
            class="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            :feedback="false"
          />
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-gray-700 font-bold mb-2"
            >Confirmar Nova Senha</label
          >
          <Password
            id="confirmPassword"
            v-model="changePasswordForm.confirmPassword"
            class="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            :feedback="false"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          text
          @click="changePasswordModal = false"
        />
        <Button
          label="Salvar Senha"
          icon="pi pi-check"
          @click="updatePassword"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import ProfilePictureUploader from "~/components/ProfilePictureUploader.vue";

import Dialog from "primevue/dialog";
  
const route = useRoute();
const router = useRouter();
const domain = route.params.domain;
const toast = useToast();

const profile = ref({
  name: "",
  email: "",
  phone: "",
  password: ""
  // foto: `/${domain}/${profile.value.nome}/avatar.png`
});

async function executeQuery(domain, sql) {
  // Added username
  try {
    const response = await fetch(`/api/${domain}/query`, {
      // Changed URL
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sql })
    });
    // Handle errors like before
    const data = await response.json();
    return data;
  } catch (error) {
    router.push(`/${domain}/auth/login`);
  }
}

const updateProfilePicture = (imageUrl) => {
  profile.value.foto = imageUrl;
};

const changePasswordModal = ref(false);

const changePasswordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});


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

async function updatePassword() {
  // Lógica para atualizar a senha
  // Verifique se currentPassword está correto (você precisa fazer isso no backend)
  // Verifique se newPassword e confirmPassword são iguais
  // Se tudo estiver OK, envie a nova senha para o backend
  // Não envie a senha em texto plano! Hashing no backend é essencial!

  if (
    changePasswordForm.value.newPassword !==
    changePasswordForm.value.confirmPassword
  ) {
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "As novas senhas não coincidem.",
      life: 3000
    });
    return;
  }

  try {
    const response = await $fetch(`/api/${domain}/password`, {
      method: "POST",
      body: {
        userId: profile.value.id,
        currentPassword: changePasswordForm.value.currentPassword,
        newPassword: changePasswordForm.value.newPassword,
        confirmPassword: changePasswordForm.value.confirmPassword
      }
    });

    if (response && response.message) {
      toast.add({
        severity: "success",
        summary: "Sucesso",
        detail: response.message,
        life: 3000
      });
      changePasswordModal.value = false;
      // Limpar os campos do formulário
      changePasswordForm.value.currentPassword = "";
      changePasswordForm.value.newPassword = "";
      changePasswordForm.value.confirmPassword = "";
    } else {
      toast.add({
        severity: "error",
        summary: "Erro",
        detail: response.message || "Falha ao alterar senha.",
        life: 3000
      });
    }
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao alterar senha.",
      life: 3000
    });
  }
}

function openChangePasswordModal() {
  changePasswordModal.value = true;
}

async function fetchUserProfile() {
  try {
    const { data: ret } = await useFetch("/api/user");

    console.log("ret.value.user>>>>:::", ret.value.user.username);
    console.log(
      `select * from users where nome like '${ret.value.user.username}'`
    );
    const response = await executeQuery(
      domain,
      `select * from users where nome like '${ret.value.user.username}'`
    ); // Chamada à API para obter os dados do usuário
    // console.log("response>>>>:::", response.length);

    //   const response = await $fetch('/api/user'); // Chamada à API para obter os dados do usuário
    console.log("response>>>>:::", response);
    if (response?.length > 0) {
      profile.value = response[0]; // Espalhe os dados do usuário e limpe a senha

      
      profile.value.foto = await checkImageExists(`/api/${domain}/${profile.value.nome}/uploads/avatar.png?${Date.now()}`)
      // profile.value.foto = `/${domain}/${profile.value.nome}/avatar.png`
    } else {
      toast.add({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao carregar perfil.",
        life: 3000
      });
    }
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
    const ret = await $fetch(`/api/${domain}/upsert`, {
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

// onBeforeMount(async () => {
 fetchUserProfile();
// });
</script>
