<template>
  <div>
    <label
      for="upload-input"
      class="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
    >
      Trocar Foto
    </label>

    <input
      id="upload-input"
      type="file"
      @change="handleFileChange"
      accept="image/*"
      class="hidden"
    />

    <div v-if="uploading" class="mt-4">
      Reduzindo e enviando...
    </div>
    <div v-if="uploadSuccess" class="mt-4 text-green-500">
      Foto enviada com sucesso!
    </div>
    <div v-if="uploadError" class="mt-4 text-red-500">
      Erro ao enviar a foto: {{ uploadErrorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
const { user, clear: clearSession } = useUserSession()
const toast = useToast();
const file = ref(null);
const uploading = ref(false);
const uploadSuccess = ref(false);
const uploadError = ref(false);
const uploadErrorMessage = ref('');

let props = defineProps(['username']);
const emit = defineEmits(['update:imageUrl']);

const currentImageUrl = ref(`/api/uploads/${user.username}/avatar.png?${Date.now()}`);

const handleFileChange = (event) => {
  file.value = event.target.files[0];
  if (file.value) {
    reduceImageAndUpload(); // 🚀 Chama a função para reduzir e enviar
  }
};

const reduceImageAndUpload = async () => {
  if (!file.value) {
    toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Selecione uma foto para enviar.', life: 3000 });
    return;
  }

  uploading.value = true;
  uploadSuccess.value = false;
  uploadError.value = false;
  uploadErrorMessage.value = '';

  try {
    const compressedFile = await compressImage(file.value, 0.7); // ⚙️ Reduz a qualidade para 70% (ajuste conforme necessário)
    const formData = new FormData();
    formData.append('foto', compressedFile, file.value.name); // ✅ Envia o arquivo comprimido com o nome original

    const response = await fetch(`/api/upload_avatar`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao enviar a foto.');
    }

    const data = await response.json();

    if (data.success) {
      uploadSuccess.value = true;
      currentImageUrl.value = `/api/uploads/${props.username}/avatar.png?${Date.now()}`;
      emit('update:imageUrl', currentImageUrl.value);
    } else {
      uploadError.value = true;
      uploadErrorMessage.value = data.message || 'Falha ao enviar a foto.';
    }
  } catch (error) {
    console.error('Erro ao enviar a foto:', error);
    uploadError.value = true;
    uploadErrorMessage.value = error.message || 'Erro desconhecido ao enviar a foto.';
  } finally {
    uploading.value = false;
  }
};

// Função para reduzir a imagem localmente
const compressImage = (file, quality) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 150; // Defina a largura máxima desejada (ajuste conforme necessário)
        const maxHeight = 150; // Defina a altura máxima desejada (ajuste conforme necessário)
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            reject(new Error('Falha ao comprimir a imagem.'));
          }
        }, file.type, quality);
      };
      img.onerror = (error) => reject(error);
      img.src = event.target.result;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
</script>