<template>
  <!-- <div class="container mx-auto"> -->
    <div class="card w-[90%]">
      <Toolbar class="mb-1">
        <template #start>
          <Button
            label="New"
            icon="pi pi-plus"
            severity="secondary"
            class="mr-2"
            @click="openNew"
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            severity="secondary"
            @click="confirmDeleteSelected"
            :disabled="!selectedItems || !selectedItems.length"
          />
        </template>

        <template #end>
          <Button
            label="Export"
            icon="pi pi-upload"
            severity="secondary"
            @click="exportCSV($event)"
          />
        </template>
      </Toolbar>
      <DataTable
       :pt="myTableStyles"  tableStyle="min-width: 50rem"
        ref="dt"
        v-model:selection="selectedItems"
        :value="items"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="{first} até {last} de {totalRecords} itenxs"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Usuários</h4>
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Procurar..."
              />
            </IconField>
          </div>
        </template>

        <Column
          selectionMode="multiple"
          style="width: 3rem"
          :exportable="false"
        ></Column>

        <Column
          v-for="col in visibleColumns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          :sortable="col.sortable"
          :style="col.style"
        >
          <template #body="slotProps">
            <!-- {{ formatValue(slotProps.data[col.field]) }} -->
            {{ slotProps.data[col.field] }}
          </template>

          <!-- <template v-if="col.bodyTemplate" #body="slotProps">
            <component
              :is="col.bodyTemplate"
              :slotProps="slotProps"
              :formatCurrency="formatCurrency"
              :getStatusLabel="getStatusLabel"
            />
          </template> -->
        </Column>

        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              class="mr-2"
              @click="editItem(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteItem(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="itemDialog"
      :style="{ width: '450px' }"
      header="Item Details"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <template v-for="col in columns" :key="col.field">
          <div v-if="col.editTemplate">
            <label :for="col.field" class="block font-bold mb-3">{{
              col.header
            }}</label>
            
            <component
              :is="col.editTemplate"
              v-model="item[col.field]"
              :item="item"
              :options="col.options"
              :submitted="submitted"
              :field="col.field"
            />
            <small v-if="submitted && !item[col.field]" class="text-red-500"
              >{{ col.header }} is required.</small
            >
          </div>
        </template>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="saveItem" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteItemDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="item"
          >Excluir item <b>{{ item.name }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteItemDialog = false"
        />
        <Button label="Yes" icon="pi pi-check" @click="deleteItem" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteItemsDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="item">Excluir itens selecionados?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteItemsDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          text
          @click="deleteSelectedItems"
        />
      </template>
    </Dialog>
  <!-- </div> -->
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "@primevue/core/api";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import RadioButton from "primevue/radiobutton";
import Rating from "primevue/rating";
import Tag from "primevue/tag";
import CustomSelect from "~/components/CustomSelect.vue";
import CustomCheckbox from "~/components/CustomCheckbox.vue";

const toast = useToast();
const dt = ref();
const items = ref([]);
const itemDialog = ref(false);
const deleteItemDialog = ref(false);
const deleteItemsDialog = ref(false);
const item = ref({});
const selectedItems = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const route = useRoute();
const domain = route.params.domain;
let data_roles = ref([]);
const dataRoles = await executeQuery(domain, "SELECT id, name FROM roles");
data_roles.value = dataRoles?.map(x => ({key: x.id, value: x.name}));
console.log("Fetched dataRoles----+:", data_roles.value);


// Crie o objeto de estilo Pass Through (PT)
const myTableStyles = {
    header: { class: 'bg-gray-800 text-gray-100 p-4 border-b border-gray-700' },
    table: { class: 'w-full' },
    thead: { class: 'bg-gray-800' },
    tbody: { class: 'bg-gray-900' },
    row: ({ props }) => ({
        class: [
            props.frozenRow ? 'bg-gray-900' : 'text-gray-200 hover:bg-gray-800/50', // Efeito hover nas linhas
            { 'bg-blue-900/50 text-blue-200': props.selected } // Estilo para linha selecionada
        ]
    }),
    column: {
        headercell: { class: 'text-left p-4 font-bold border-b border-gray-700' },
        bodycell: { class: 'p-4 border-b border-gray-700' }
    },
    paginator: {
        root: { class: 'bg-gray-800 text-gray-200 flex items-center justify-center flex-wrap p-4 border-t border-gray-700' },
        // Você pode customizar os botões, dropdown, etc., aqui se precisar
        pagebutton: ({ props }) => ({
            class: [
                'rounded-full w-10 h-10 mx-1 transition-colors duration-200',
                { 'bg-blue-500 text-white': props.active } // Botão da página ativa
            ]
        })
    }
};


const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden);
});

const columns = ref([
  {
    field: "nome",
    header: "Nome",
    sortable: true,
    style: { "min-width": "10rem" },
    editTemplate: InputText
  },
  {
    field: "email",
    header: "Email",
    sortable: true,
    style: { "min-width": "10rem" },
    editTemplate: InputText
  },
  {
    field: "telefone",
    header: "Telefone",
    sortable: true,
    style: { "min-width": "10rem" },
    editTemplate: InputText
  },
  {
    field: "password",
    header: "Senha",
    sortable: true,
    style: { "min-width": "5rem" },
    editTemplate: InputText
  },
  {
    field: "roles_names", // Coluna para exibição na tabela
    header: "Roles",
    sortable: true,
    style: { "min-width": "5rem" },
    bodyTemplate: (slotProps) => slotProps.data.roles_names, // Exibe os nomes concatenados
    editTemplate: null, // Não usar este campo para editar
  },
  {
    field: "roles_ids", // Coluna para edição
    header: "Roles", // Pode manter o mesmo header ou mudar para "Selecionar Roles"
    sortable: true,
    style: { "min-width": "10rem" },
    editTemplate: CustomCheckbox, // Usar o CustomCheckbox para editar
    options: data_roles.value, // Passar as opções para o CustomCheckbox
    hidden: true, // Ocultar esta coluna na tabela (opcional, pode remover se não quiser)
  },
  {
    field: "status",
    header: "Status",
    sortable: true,
    style: { "min-width": "2rem" },
    editTemplate: InputText
  }
]);

onMounted(async () => {
  const data = await fetchData();
  items.value = data;
});


function formatValue(value) {
  if (typeof value == 'object') {
    return value.join(', '); // Format as JSON string
  }
  return value 
}

async function executeQuery(domain, sql) {
  // Added domain
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
    // Handle error
  }
}

async function executeQueryRun(domain, sql) {
  // Added domain
  try {
    const response = await fetch(`/api/${domain}/queryRun`, {
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

async function fetchData() {
  // const route = useRoute();
  // const domain = route.params.domain;
  
  console.log("Fetched dataRoles:", dataRoles.map(x=> x.name));
  // data_roles.value = dataRoles.name;
  // console.log("Fetched data_roles:", data_roles);

  const data = await executeQuery(domain, `
  SELECT
      u.id,
      u.nome,
      u.email,
      u.telefone,
      u.password,
      u.status,
      GROUP_CONCAT(r.name, ', ') AS roles_names,
      GROUP_CONCAT(ur.role_id) AS roles_ids
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    GROUP BY u.id, u.nome, u.email, u.telefone, u.password, u.status
  `);

  console.log("Fetched data:", data);

  return data;
}

function openNew() {
  item.value = {};
  submitted.value = false;
  itemDialog.value = true;
}

function hideDialog() {
  itemDialog.value = false;
  submitted.value = false;
}

async function saveItem() {
  submitted.value = true;

  let isValid = true;
  for (const col of columns.value) {
    if (col.editTemplate && !item.value[col.field] && col.field !== 'roles') {
      isValid = false;
      break;
    }
  }

  if (isValid) {
    try {
      const userData = {
        id: item.value.id,
        nome: item.value.nome,
        email: item.value.email,
        telefone: item.value.telefone,
        password: item.value.password,
        status: item.value.status,
      };

      // 1. Salvar/atualizar os dados básicos do usuário na tabela 'users'
      const userResponse = await $fetch(`/api/${domain}/upsert`, {
        method: "POST",
        body: {
          table: "users",
          data: userData,
          condition: item.value.id ? `id = ${item.value.id}` : null,
        },
      });

      let userId;
      if (item.value.id) {
        userId = item.value.id;
        if (!userResponse?.message && userResponse !== null) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update user data",
            life: 3000,
          });
          return;
        }
      } else {
        if (userResponse?.result?.lastInsertRowid) {
          userId = userResponse?.result?.lastInsertRowid;
          userData.id = userId; // Adicionar o ID ao userData para inserção
        } else {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to create new user",
            life: 3000,
          });
          return;
        }
      }

      const selectedRoleIds = item.value.roles_ids || [];

      // 2. Atualizar a tabela 'user_roles'
      if (userId) {
        await executeQueryRun(domain, `DELETE FROM user_roles WHERE user_id = ${userId}`);

        if (selectedRoleIds.length > 0) {
          const insertPromises = selectedRoleIds.map((roleId) =>
            executeQueryRun(domain, `INSERT INTO user_roles (user_id, role_id) VALUES (${userId}, ${roleId})`)
          );
          await Promise.all(insertPromises);
        }
      }

      toast.add({
        severity: "success",
        summary: "Successful",
        detail: "Item Saved",
        life: 3000,
      });

      itemDialog.value = false;
      item.value = {};

      // 3. Atualizar a lista localmente
      if (item.value.id) {
        // Atualizar registro existente
        const index = items.value.findIndex((val) => val.id === item.value.id);
        if (index !== -1) {
          items.value[index] = { ...userData, roles_ids: selectedRoleIds, roles_names: item.value.roles_names }; // Use userData para atualizar
        }
      } else {
        // Adicionar novo registro
        items.value.push({ ...userData, roles_ids: selectedRoleIds, roles_names: item.value.roles_names }); // Use userData para inserir
      }

      const data = await fetchData();
      items.value = data; // Recarregar os dados para exibir as alterações
    } catch (error) {
      console.error("Error saving item:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while saving the item.",
        life: 3000,
      });
    }
  }
}
function editItem(selectedItem) {
  item.value = { ...selectedItem };
  // Certifique-se de que roles_ids esteja presente, mesmo que seja um array vazio
  if (!item.value.roles_ids) {
    item.value.roles_ids = [];
  } else {
    // Se roles_ids for uma string, converta para array (se necessário)
    if (typeof item.value.roles_ids === 'string') {
      item.value.roles_ids = item.value.roles_ids.split(',').map(Number); // Converter string para array de números
    }
  }
  itemDialog.value = true;
}

function confirmDeleteItem(selectedItem) {
  item.value = selectedItem;
  deleteItemDialog.value = true;
}

async function deleteItem() {
  try {
    const response = await $fetch(`/api/${domain}/delete`, {
      method: "POST",
      body: {
        table: "users", // Substitua pelo nome da sua tabela
        condition: `id = ${item.value.id}`
      }
    });

    if (response && response.message) {
      // Excluiu com sucesso no banco de dados
      // Se necessário, atualize a lista localmente ou busque os dados novamente
      // items.value = items.value.filter((val) => val.id !== item.value.id); //Remova esta linha se voce for buscar os dados novamente.
      
      // Atualize a lista localmente
      items.value = items.value.filter(val => val.id !== item.value.id);

      toast.add({
        severity: "success",
        summary: "Successful",
        detail: response.message,
        life: 3000
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete item",
        life: 3000
      });
    }

    deleteItemDialog.value = false;
    item.value = {};
  } catch (error) {
    console.error("Error deleting item:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "An error occurred while deleting the item.",
      life: 3000
    });
  }
}

function findIndexById(id) {
  return items.value.findIndex(val => val.id === id);
}

function createId() {
  // Replace with your actual ID generation logic (e.g., UUID)
  let id = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function exportCSV() {
  dt.value.exportCSV();
}

function confirmDeleteSelected() {
  deleteItemsDialog.value = true;
}

function deleteSelectedItems() {
  items.value = items.value.filter(val => !selectedItems.value.includes(val));
  deleteItemsDialog.value = false;
  selectedItems.value = null;
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Items Deleted",
    life: 3000
  });
}

function formatCurrency(value) {
  if (value)
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  return;
}

</script>
