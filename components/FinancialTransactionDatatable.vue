<template>
  <div class="transactions-table">
    <DataTable
      scrollable
      scrollHeight="400px"
      @row-click="viewTransaction"
      selectionMode="single"
      :value="transactions"
      :paginator="true"
      :rows="10"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25, 50]"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} transactions"
      :loading="loading"
      stripedRows
      removableSort
      class="text-[15px]"
    >
      <Column field="id" header="#" :sortable="true">
        <template #body="{ data }">
          {{ data.id }}
        </template>
      </Column>

      <Column field="date" header="Data" :sortable="true">
        <template #body="{ data }">
          {{ formatDate(data.date) }}
        </template>
      </Column>
<!-- 
      <Column field="description" header="Descrição" :sortable="true">
        <template #body="{ data }">
          {{ data.description || "-" }}
        </template>
      </Column> -->

      <Column field="category" header="Categoria" :sortable="true" />

      <!-- <Column field="doc" header="Doc" :sortable="true">
        <template #body="{ data }">
          {{ data.doc || "-" }}
        </template>
      </Column> -->
  <Column field="type" header="Tipo" :sortable="true">
        <template #body="{ data }">
          <Tag
            :value="data.type.toUpperCase()"
            :severity="data.type === 'entrada' ? 'success' : 'danger'"
          />
        </template>
      </Column>
      <Column field="amount" header="Valor" :sortable="true">
        <template #body="{ data }">
          <span
            :class="data.type === 'entrada' ? 'text-green-600' : 'text-red-600'"
          >
            {{ formatCurrency(data.amount) }}
          </span>
        </template>
      </Column>

    

      <!-- <Column field="payment_method_name" header="Método" :sortable="true">
        <template #body="{ data }">
          {{ data.payment_method_name || "-" }}
        </template>
      </Column> -->

      <!-- <Column field="created_by_name" header="Created By" :sortable="true" />
      
      <Column field="created_at" header="Created At" :sortable="true">
        <template #body="{ data }">
          {{ formatDateTime(data.created_at) }}
        </template>
      </Column> -->

      <!-- <Column header="Actions">
        <template #body="{ data }">
          <Button icon="pi pi-eye" class="p-button-rounded p-button-text" @click="viewTransaction(data)" />
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-success" @click="editTransaction(data)" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="confirmDelete(data)" />
        </template>
      </Column> -->

      <template #empty>
        <div class="text-center p-4">
          No transactions found.
        </div>
      </template>

      <template #loading>
        <div class="text-center p-4">
          <ProgressSpinner style="width:50px;height:50px" />
          Loading transactions...
        </div>
      </template>
    </DataTable>
    <!-- Dialog for transaction details -->
    <Dialog
      v-model:visible="displayDialog"
      :style="{ width: '650px', padding: '10px 15px 10px 15px' }"
      :header="
        'Registro # ' + (selectedTransaction ? selectedTransaction.id : '')
      "
      :modal="true"
class="text-[15px]"
    >
      <div class="grid grid-cols-3 gap-4  ">
        <div class="mb-3">
          <label for="selectedTransaction.date" class=" block font-bold mb-2">
            Data
          </label>
          <!-- Campo de data -->
          
          <div class="rounded-lg bg-gray-800 p-3 inline-block w-full">
            {{ formatDate(selectedTransaction.date) }}
          </div>
        </div>

        <div>
          <label for="selectedTransaction.type" class="block font-bold mb-2">
            Entrada/Saída
          </label>
          <div class="rounded-lg bg-gray-800 p-2 inline-block w-full">
            <Tag
            :value="selectedTransaction.type.toUpperCase()"
            :severity="
              selectedTransaction.type === 'entrada' ? 'success' : 'danger'
            "
          />
          </div>
          
        </div>
        <div>
          <label for="selectedTransaction.doc" class="block font-bold mb-2">
            Documento
          </label>
          <!-- <InputText :value="selectedTransaction.doc" readonly /> -->
          <div class="rounded-lg bg-gray-800 p-3 inline-block w-full">
            {{ selectedTransaction.doc || "----" }}
          </div>
        </div>
        <div class="col-span-3 mb-3">
          <label
            for="selectedTransaction.category"
            class="block font-bold mb-2"
          >
            Categoria
          </label>
          <!-- <TreeSelect v-model="selectedTransaction.category_id" filter filterMode="lenient" :options="categoryTree" selectionMode="single" display="chip" :maxSelectedLabels="1" placeholder="Selecione" class="md:w-80 w-full" /> -->
          <div class="rounded-lg bg-gray-800 p-3 inline-block w-full">
            {{ selectedTransaction.category }}
          </div>
        </div>
        <div class="col-span-3 mb-6">
          <label
            :for="selectedTransaction.description"
            class="block font-bold mb-1"
          >
            Descrição
          </label>
          <div class="rounded-lg bg-gray-800 p-3 inline-block w-full h-full">
            {{ selectedTransaction.description }}
          </div>
          <!-- {{selectedTransaction.description}} -->
          <!-- <Textarea
            :id="selectedTransaction.description"
            v-model="selectedTransaction.description"
            rows="2"
            cols="67"
            readonly
          /> -->
        </div>
        <div class="mb-3">
          <label for="selectedTransaction.amount" class="block font-bold mb-2">
            Valor
          </label>
          <div 
    class="rounded-lg bg-gray-800 p-3 inline-block w-full "
   
  >
   {{ formatCurrency(selectedTransaction.amount) }}
  </div>
          
        </div>
        <div class="mb-3">
          <label for="selectedTransaction.amount" class="block font-bold mb-2">
            Forma de pagamento
          </label>
           <div class="rounded-lg bg-gray-800 p-3 inline-block w-full">
            {{ selectedTransaction.payment_method || "----"}}
          </div>
          
        </div>

        <div class="col-span-1">
          <label for="selectedTransaction.type" class="block font-bold mb-2">
            Contato relacionado
          </label>
           <div class="rounded-lg bg-gray-800 p-3 inline-block w-full">
            {{ selectedTransaction.contact_name || "----" }}
          </div>
          
        </div>

        <div class="col-span-3">
          <label
            :for="selectedTransaction.decription"
            class="block font-bold mb-2"
          >
            Obs
          </label>
           <div class="rounded-lg bg-gray-800 p-3 inline-block w-full">
            {{ selectedTransaction.obs }}
          </div>
          
        </div>
      </div>

      <template #footer>
        <Button
          label="Fechar"
          icon="pi pi-times"
          text
          @click="displayDialog = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["view", "edit", "delete"]);

const displayDialog = ref(false);
const selectedTransaction = ref(null);

const formatCurrency = value => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
};

const formatDate = dateInput => {
  if (!dateInput) return "";

  // Handle Date objects
  if (dateInput instanceof Date) {
    const day = String(dateInput.getDate()).padStart(2, "0");
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const year = dateInput.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Handle US format strings (MM/DD/YYYY)
  if (typeof dateInput === "string") {
    // Try US format first
    if (dateInput.includes("/")) {
      const parts = dateInput.split("/");
      if (
        parts.length === 3 &&
        parts[0].length === 2 &&
        parts[1].length === 2 &&
        parts[2].length === 4
      ) {
        return `${parts[1]}/${parts[0]}/${parts[2]}`;
      }
    }

    // Try ISO format (YYYY-MM-DD)
    if (dateInput.includes("-")) {
      const [year, month, day] = dateInput.split("-");
      return `${day}-${month}-${year}`;
    }
  }

  throw new Error(
    "Unsupported date format. Provide Date object, MM/DD/YYYY string, or YYYY-MM-DD string"
  );
};

const formatDateTime = dateTimeString => {
  if (!dateTimeString) return "-";
  return new Date(dateTimeString).toLocaleString();
};

const viewTransaction = event => {
  selectedTransaction.value = event.data;
  displayDialog.value = true;
  // emit('view', event.data);
};

const editTransaction = transaction => {
  emit("edit", transaction);
};

const confirmDelete = transaction => {
  emit("delete", transaction);
};
</script>

<style scoped>

</style>
