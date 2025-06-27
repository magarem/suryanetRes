<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-white mb-6">
      Gerenciamento de usuários
    </h1>

    <!-- É aqui que você usa o componente genérico -->
    <GenericDataTable
      :schema="userSchema"
      :fetchData="fetchData"
      :createData="createData"
      :updateData="updateData"
      :deleteData="deleteData"
      :config="customConfig"
    />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["authenticated"]
});
import { ref } from "vue";
// Importe o seu componente genérico
import GenericDataTable from "~/components/GenericDataTable.vue";

// Importe os componentes do PrimeVue que você usará nos formulários
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import MultiSelect from "primevue/multiselect";

// --- 1. Definição do Schema para a tabela de 'Usuários' ---

// Dados de exemplo para o dropdown de 'roles'
const roles = ref([
  { name: "Administrator", code: "admin" },
  { name: "Editor", code: "editor" },
  { name: "Viewer", code: "viewer" }
]);

const data_roles = ref([]); // Usado para armazenar os dados de roles
const dataRoles = await executeQuery("SELECT id, name FROM roles");
data_roles.value = dataRoles?.map(x => ({ key: x.id, label: x.name }));
console.log("Fetched dataRoles----+:", data_roles.value);

// O schema descreve cada coluna e campo do formulário
const userSchema = [
  {
    field: "id",
    header: "ID"
    // `form: false` (ou omitido) significa que não aparecerá no formulário
  },
  {
    field: "name",
    header: "Full Name",
    form: true, // Aparecerá no formulário
    component: InputText, // Usará o componente <InputText>
    required: true, // Campo obrigatório
    displayField: true // Será usado na mensagem de confirmação de exclusão
  },
  {
    field: "email",
    header: "Email Address",
    form: true,
    component: InputText,
    required: true
  },
  {
    field: "roles_names",
    header: "Role",
    form: true,
    component: MultiSelect, // Usará um dropdown <Select>
    required: true,
    props: {
      // Propriedades passadas para o componente <Select>
      options: data_roles.value,
      optionLabel: "label", // O que mostrar para o usuário
      optionValue: "key", // O valor a ser salvo
      placeholder: "Select a Role"
    }
  },
  {
    field: "tags",
    header: "Tags",
    form: true,
    component: MultiSelect, // Usará um <MultiSelect> (grupo de checkboxes)
    defaultValue: [], // Importante para inicializar como um array vazio
    props: {
      options: ["Premium", "Active", "Newsletter Subscriber"],
      placeholder: "Select Tags"
    }
  }
];

async function executeQuery(sql) {
  // Added domain
  try {
    const response = await fetch(`/api/query`, {
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
    // Handle error
  }
}

const fetchData = async () => {
  // Em um app real, você faria a chamada à sua API
  // return await $fetch('/api/users');

  const data = await executeQuery(`
  SELECT
      u.id,
      u.username,
      u.name,
      u.email,
      u.telefone,
      u.password,
      u.status,
      GROUP_CONCAT(r.name, ', ') AS roles_names,
      GROUP_CONCAT(ur.role_id) AS roles_ids
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    GROUP BY u.id, u.username, u.email, u.telefone, u.password, u.status
  `);

  console.log("Fetched data:", data);

  // Para este exemplo, retornamos dados mocados
  return data;
};

const createData = async user => {
  console.log("Creating user:", user);
  // return await $fetch('/api/users', { method: 'POST', body: user });
  const newUser = { ...user, id: Math.floor(Math.random() * 1000) };
  return newUser;
};

const updateData = async user => {
  console.log("Updating user:", user);
  // return await $fetch(`/api/users/${user.id}`, { method: 'PUT', body: user });
  return user;
};

const deleteData = async id => {
  console.log("Deleting user with ID:", id);
  // return await $fetch(`/api/users/${id}`, { method: 'DELETE' });
  return { message: "User deleted" };
};

// --- 3. (Opcional) Configuração customizada para textos ---
const customConfig = {
  // Rótulos usados em várias partes do componente
  labels: {
    search: "Procurar...",
    paginatorReport: "Mostrando de {first} a {last} de {totalRecords} itens"
  },

  // Textos para todos os botões
  buttons: {
    new: "Novo Item",
    deleteSelected: "Deletar Selecionados",
    cancel: "Cancelar",
    save: "Salvar",
    yes: "Sim",
    no: "Não"
  },

  // Títulos para todas as caixas de diálogo
  dialogs: {
    newItem: "Adicionar Novo Item",
    editItem: "Editar Item",
    delete: {
      header: "Confirmar Exclusão"
    },
    deleteSelected: {
      header: "Confirmar Exclusão dos Itens"
    }
  },

  // Objeto de estilos (Pass Through) para customizar a aparência da DataTable
  // Estas são as classes padrão de tema escuro. Você pode sobrescrevê-las.
  tableStyles: {
    // Mantém a maioria dos estilos padrão, mas sobrescreve o que você quer
    root: {
      class: "border-separate border-spacing-0 rounded-lg overflow-hidden"
    },
    header: { class: "bg-gray-900 text-gray-100 p-4 border-b border-gray-700" }, // Cabeçalho um pouco mais escuro
    thead: { class: "bg-gray-900" }, // Cabeçalho da tabela mais escuro

    // ESTA É A LINHA PRINCIPAL PARA MUDAR O FUNDO DA TABELA
    tbody: { class: "bg-gray-800" }, // <--- Mude esta classe para a cor que desejar. Ex: 'bg-slate-900'

    row: ({ props }) => ({
      class: [
        // Cor do hover da linha
        "text-gray-200 hover:bg-gray-700/60",
        // Cor da linha selecionada
        { "bg-blue-900/50 text-blue-200": props.selected }
      ]
    }),
    column: {
      headercell: {
        class: "text-left p-4 font-semibold border-b border-gray-700"
      },
      bodycell: { class: "p-4 border-b border-gray-700" }
    },
    paginator: {
      root: {
        class:
          "bg-gray-900 text-gray-200 flex items-center justify-center flex-wrap p-4 border-t border-gray-700 rounded-b-lg"
      },
      pagebutton: ({ props }) => ({
        class: [
          "rounded-full w-10 h-10 mx-1 transition-colors duration-200",
          { "bg-blue-600 text-white": props.active }
        ]
      })
    }
  }
};
</script>
