<template>
  <div>
   <div class="card w-full p-5">
      
      <CustomDataTable
        title="Métodos de pagamento"
        :items="items"
        :filters="filters"
        :visibleColumns="visibleColumns"
        v-model:selectedItems="selectedItems"
        :formatCurrency="formatCurrency"
        :formatDateBR="formatDateBR"
        :editItem="editItem"
        :openNew="openNew"
        @deleteItem="deleteItem"
        @deleteSelectedItems="deleteSelectedItems"
      />
  
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

  </div>
</template>

<script setup>
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "@primevue/core/api";
import InputText from "primevue/inputtext";
import CustomCheckbox from "~/components/CustomCheckbox.vue";
import { executeQuery, executeQueryRun } from "~/utils/db"; // Adjust the import path as necessary

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

const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden);
});

const columns = ref([
  {
    field: "name",
    header: "Nome",
    sortable: true,
    style: { "min-width": "16rem", "background-color": "#111829" },
    editTemplate: InputText
  },
  {
    field: "description",
    header: "Descrição",
    sortable: true,
    style: { "min-width": "16rem", "background-color": "#111829" },
    editTemplate: InputText
  }
]);

onMounted(async () => {
  const data = await fetchData();
  items.value = data;
});


async function fetchData() {
  const data = await executeQuery(`SELECT id, name, description from financial_payment_methods`);
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
  // for (const col of columns.value) {
  //   if (col.editTemplate && !item.value[col.field] && col.field !== 'roles') {
  //     isValid = false;
  //     break;
  //   }
  // }

  if (isValid) {
    try {
      const userData = {...item.value};

      // 1. Salvar/atualizar os dados básicos do usuário na tabela 'users'
      const userResponse = await $fetch(`/api/upsert`, {
        method: "POST",
        body: {
          table: "financial_payment_methods",
          data: userData,
          condition: item.value.id ? `id = ${item.value.id}` : null,
        },
      });

      let _id;
      if (item.value.id) {
        _id = item.value.id;
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
          _id = userResponse?.result?.lastInsertRowid;
          userData.id = _id; // Adicionar o ID ao userData para inserção
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
          items.value[index] = { ...userData}; // Use userData para atualizar
        }
      } else {
        // Adicionar novo registro
        items.value.push({ ...userData}); // Use userData para inserir
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
  itemDialog.value = true;
}

function confirmDeleteItem(selectedItem) {
  item.value = selectedItem;
  deleteItemDialog.value = true;
}

async function deleteItem(item) {
  await executeQueryRun(
    `DELETE FROM financial_payment_methods WHERE id = ${item.id}`
  );
  const data = await fetchData();
  items.value = data;
  deleteItemDialog.value = false;
  item.value = {};
  toast.add({ severity: "success", summary: "Removido", life: 3000 });
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
  //Delete data in db
  deleteItem(selectedItems.value.map(x=>x.id))

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
