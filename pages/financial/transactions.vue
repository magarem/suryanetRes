<template>
  <div class="p-5">
    <div class="card w-full">
       
      <Toolbar class="mb-3" style="background-color: #111829;">
        <template #start>
          <h1 class="text-2xl mr-5 pb-1 pl-1">Lançamentos</h1>
         
        </template>

        <template #end>
           <Button
            label="Novo"
            icon="pi pi-plus"
            severity="secondary"
            class="mr-2"
            @click="openNew"
          />
          <Button
            label="Excluir"
            icon="pi pi-trash"
            severity="secondary"
            @click="confirmDeleteSelected"
            :disabled="!selectedItems || !selectedItems.length"
         class="mr-2"
            />
            <IconField class="mr-2">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Procurar..."
              />
            </IconField>
          <Button
            label="Exportar"
            icon="pi pi-upload"
            severity="secondary"
            @click="exportCSV($event)"
          />
        </template>
      </Toolbar>

      <DataTable
      class="custom-datatable"
        tableStyle="background-color: red; color: white;"
        paginatorStyle="background-color: #111829;"
        ref="dt"
        scrollable
        scrollHeight="360px"
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
        <!-- <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
           
          
          </div>
        </template> -->

        <Column
          bodyClass="bg-gray-700"
          headerClass="bg-gray-800"
          selectionMode="multiple"
          style="width: 3rem; background-color:#111829"
          :exportable="false"
        ></Column>

        <Column
          bodyClass="bg-gray-700"
          headerClass="bg-gray-800"
          v-for="col in visibleColumns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          :sortable="col.sortable"
          :style="col.style"
        >
          <template #body="slotProps">
            <span v-if="col.editTemplate === 'money'">
              {{ formatCurrency(slotProps.data[col.field]) }}
            </span>
            <span v-else-if="col.editTemplate === 'calendar'">
              {{ formatDateBR(slotProps.data[col.field]) }}
            </span>
            <span v-else>
              <!-- {{ formatValue(slotProps.data[col.field]) }} -->
              {{ slotProps.data[col.field] }}
            </span>
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

        <Column bodyClass="bg-gray-700"
          headerClass="bg-gray-800" :exportable="false" style="min-width: 12rem; background-color:#111829">
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
      :style="{ width: '800px', padding: '10px 15px 10px 15px' }"
      :header="'Lançamento - ' + (flg_isEdit ? 'Editar registro' : 'Novo registro')"
      :modal="true"
    >
      <form @submit.prevent="saveItem">
        <!-- Adicione esta linha -->
        <div class="grid grid-cols-3 gap-4  ">
          <div class="mb-1">
            <label for="item.date" class="block font-bold mb-1">
              Data
            </label>
            <!-- Campo de data -->
            <DatePicker
              id="item.date"
              v-model="item.date"
              dateFormat="dd/mm/yy"
              :locale="brLocale"
              showIcon
              class="w-full"
              :utc="true"
            />
          </div>

          <div>
            <label for="item.type" class="block font-bold mb-1">
              Entrada/Saída
            </label>
            <Select
              id="item.type"
              v-model="item.type"
              :options="item_type_options"
              optionLabel="value"
              optionValue="key"
              placeholder="Selecione"
              checkmark
              :highlightOnSelect="false"
              class="w-full"
            />
          </div>
          <div>
            <label for="item.doc" class="block font-bold mb-1">
              Documento
            </label>
            <InputText id="doc" v-model="item.doc"  class="w-full" />
          </div>
          <div class="col-span-3 mb-1">
            <label for="item.category" class="block font-bold mb-2">
              Categoria
            </label>
            <!-- <TreeSelect v-model="item.category_id" filter filterMode="lenient" :options="categoryTree" selectionMode="single" display="chip" :maxSelectedLabels="1" placeholder="Selecione" class="md:w-80 w-full" /> -->
            <AutoComplete
              id="item.category_id"
              :disabled="!flag_categorias_select_active"
              v-model="item.category_id"
              :suggestions="filteredItems"
              @complete="searchItems($event)"
              placeholder="Buscar um item"
              dropdown
              field="value"
              forceSelection
              :dropdownMode="'current'"
              optionLabel="value"
              class="w-full"
              :inputClass="'w-full'"
            ></AutoComplete>
          </div>
          <div class="col-span-3 mb-1">
            <label :for="item.description" class="block font-bold mb-2">
              Descrição
            </label>
            <Textarea
              :id="item.description"
              v-model="item.description"
              rows="2"
              cols="63"
              class="w-full"
            />
          </div>
          <div class="mb-3">
            <label for="item.amount" class="block font-bold mb-2">
              Valor
            </label>
            <money3
              id="item.amount"
              v-model="item.amount"
              v-bind="config"
              style="background-color: #272729;"
              class="p-inputtext p-component w-full"
            />
          </div>
          <div class="mb-3">
            <label for="item.amount" class="block font-bold mb-2">
              Forma de pagamento
            </label>
            <Select
              id="item.payment_method"
              v-model="item.payment_method"
              :options="payment_method_ops"
              optionLabel="value"
              optionValue="key"
              placeholder="Selecione"
              checkmark
              :highlightOnSelect="false"
              class="md:w-40 w-full"
            />
          </div>

          <div class="col-span-1">
            <label for="item.type" class="block font-bold mb-2">
              Contato relacionado
            </label>
            <AutoComplete
              id="item.related_id"
              v-model="item.related_id"
              :suggestions="filteredItems_related_id"
              @complete="searchItems_related_id($event)"
              field="value"
              placeholder="Buscar um item"
              dropdown
              forceSelection
              :dropdownMode="'current'"
              optionLabel="value"
              optionValue="key"
              class="w-full"
              :inputClass="'w-full'"
            ></AutoComplete>
          </div>

          <div class="col-span-3">
            <label :for="item.decription" class="block font-bold mb-2">
              Obs
            </label>
            <Textarea :id="item.obs" v-model="item.obs" rows="2" cols="67" class="w-full" />
          </div>
        </div>
      </form>
      <template #footer>
        <Button label="Fechar" icon="pi pi-times" text @click="hideDialog" />
        <Button
          label="Salvar"
          icon="pi pi-check"
          @click="saveItem"
          :disabled="editSaveButtonPressed"
        />
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "@primevue/core/api";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import CustomSelect from "~/components/CustomSelect.vue";
import { parseISO, format, parse } from "date-fns";
import { executeQuery, executeQueryRun, formatCurrency } from '@/utils/db'
// 1. Define the Pass-Through object for the Toolbar
const toolbarPT = {
    root: {
        class: 'bg-gray-900 text-white px-4 py-2 rounded-md mb-3' // Change bg-gray-800 to bg-gray-900 or any other color
    }
};

const toast = useToast();
const route = useRoute();

const filteredItems = ref([]);
const dt = ref();
const items = ref([]);
const item = ref({});
const itemDialog = ref(false);
const deleteItemDialog = ref(false);
const deleteItemsDialog = ref(false);
const selectedItems = ref([]);
const submitted = ref(false);
const editSaveButtonPressed = ref(false);
const filteredItems_related_id = ref([]);
const flag_categorias_select_active = ref(false);
const op = computed(() => route.query.op);
const item_type_options = [
  { key: "entrada", value: "Entrada" },
  { key: "saída", value: "Saída" }
];
const payment_method_ops = ref([]);
const flg_isEdit = ref(false);
const categoryOptions = ref([]);
const contactsOptions = ref([]);

const { user, clear: clearSession } = useUserSession()

const searchItems = event => {
  setTimeout(() => {
    if (!event.query.trim().length) {
      filteredItems.value = [...categoryOptions.value];
    } else {
      filteredItems.value = categoryOptions.value.filter(item => {
        return item.value.toLowerCase().includes(event.query.toLowerCase());
      });
    }
  }, 250);
};

const searchItems_related_id = event => {
  setTimeout(() => {
    if (!event.query.trim().length) {
      filteredItems_related_id.value = [...contactsOptions.value];
    } else {
      filteredItems_related_id.value = contactsOptions.value.filter(item => {
        return item.value.toLowerCase().includes(event.query.toLowerCase());
      });
    }
  }, 250);
};

function formatDateBR(isoString) {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

const config = {
  prefix: "",
  suffix: "",
  thousands: ".",
  decimal: ",",
  precision: 2,
  disableNegative: false,
  disabled: false,
  min: null,
  max: null,
  allowBlank: false,
  minimumNumberOfCharacters: 0,
  shouldRound: true,
  focusOnRight: false
};

// Localização em português do Brasil
const brLocale = {
  firstDayOfWeek: 0,
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado"
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"
  ],
  today: "Hoje",
  clear: "Limpar"
};

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const columns = ref([
  {
    field: "date",
    header: "Data",
    sortable: true,
    style: { "min-width": "8rem", "background-color": "#111829" },
    editTemplate: "calendar"
  },
  {
    field: "type",
    header: "Tipo",
    sortable: true,
    style: { "min-width": "5rem", "background-color": "#111829" },
    editTemplate: "Select",
    options: [
      { key: "entrada", value: "Entrada" },
      { key: "saída", value: "Saída" }
    ]
  },
  {
    field: "category_id",
    header: "Categoria",
    sortable: true,
    style: { "min-width": "10rem", "background-color": "#111829" },
    editTemplate: "Select",
    options: categoryOptions,
    hidden: true
  },
  {
    field: "category",
    header: "Categoria",
    sortable: true,
    style: { "min-width": "10rem", "background-color": "#111829" },
    editTemplate: CustomSelect,
    options: categoryOptions,
    hide_editForm: true
  },
  {
    field: "description",
    header: "Descrição",
    sortable: true,
    style: { "min-width": "10rem", "background-color": "#111829" },
    editTemplate: InputText,
    hidden: true
  },
  {
    field: "related_id",
    header: "Contato",
    sortable: true,
    style: { "min-width": "15rem", "background-color": "#111829" },
    editTemplate: "Select",
    options: contactsOptions,
    hidden: true
  },
  {
    field: "contact_name",
    header: "Contato",
    sortable: true,
    style: { "min-width": "10rem", "background-color": "#111829" },
    editTemplate: InputText,
    hide_editForm: true,
    hidden: true
  },
  {
    field: "payment_method",
    header: "Pagamento",
    sortable: true,
    style: { "min-width": "10rem", "background-color": "#111829" },
    editTemplate: "Select",
    options: payment_method_ops,
    hidden: true
  },
  {
    field: "doc",
    header: "Documento",
    sortable: true,
    style: { "min-width": "5rem", "background-color": "#111829" },
    editTemplate: InputText
  },
  {
    field: "amount",
    header: "Valor",
    sortable: true,
    style: { "min-width": "5rem", "background-color": "#172037" },
    editTemplate: "money"
  }
]);

item.value.tipo = "entrada";

const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden);
});

const fetchDados = async newVal => {

  //Get lançamentos
  const data = await executeQuery(
    ` WITH RECURSIVE category_path AS (
      SELECT id, parent_id, name, type, name AS full_path
      FROM financial_categories
      WHERE parent_id IS NULL 

      UNION ALL

      SELECT fc.id, fc.parent_id, fc.name, fc.type, cp.full_path || ' › ' || fc.name
      FROM financial_categories fc
      JOIN category_path cp ON fc.parent_id = cp.id
    )
    SELECT
      ft.id,
      ft.amount,
      ft.doc,
      ft.description,
      ft.type,
      ft.payment_method,
      ft.obs,
      ft.date,
      fc.id AS category_id,
      cp.full_path AS category,
      u.name AS user,
      c.id AS related_id,
      c.name AS contact_name
    FROM financial_transactions ft
    LEFT JOIN financial_categories fc ON ft.category_id = fc.id
    LEFT JOIN category_path cp ON fc.id = cp.id
    LEFT JOIN users u ON ft.created_by = u.id
    LEFT JOIN contacts c ON ft.related_id = c.id
    ORDER BY ft.date DESC;`
  );
  items.value = data;


  // Get categorias ( recursivamente )
  const categorias = await executeQuery(
    ` WITH RECURSIVE category_tree AS (
      SELECT 
        id,
        parent_id,
        name,
        type,
        node_type,
        name AS full_path
      FROM financial_categories
      WHERE parent_id IS NULL

      UNION ALL

      SELECT 
        fc.id,
        fc.parent_id,
        fc.name,
        fc.type,
        fc.node_type,
        ct.full_path || ' › ' || fc.name
      FROM financial_categories fc
      JOIN category_tree ct ON fc.parent_id = ct.id
    )
    SELECT 
      id AS key, 
      full_path AS value
    FROM category_tree
    WHERE 
    (node_type is null or 
      node_type != 'grupo')
      ${newVal ? `AND type = '${newVal}'` : ""}
    ORDER BY full_path;
  `
  );
  categoryOptions.value = [{ key: null, value: "---" }, ...categorias];


  // Get contatos
  const contacts = await executeQuery(`SELECT * FROM contacts`);
  contactsOptions.value = contacts.map(cat => ({
    value: cat.name,
    key: cat.id
  }));


  //Get payment methods
  const sql_payment_method_ops = await executeQuery(
    `SELECT * FROM financial_payment_methods`
  );
  payment_method_ops.value = sql_payment_method_ops.map(cat => ({
    value: cat.name,
    key: cat.id
  }));
  
};

function openNew() {
  flg_isEdit.value = false;
  item.value = {};
  item.value.type = route.query.op;
  item.value.date = new Date();
  submitted.value = false;
  itemDialog.value = true;
}

function hideDialog() {
  itemDialog.value = false;
  submitted.value = false;
}

async function saveItem() {
  submitted.value = true;
  editSaveButtonPressed.value = true;
  let isValid = true;
  // for (const col of columns.value) {
  //   if (col.editTemplate && !item.value[col.field]) {
  //     isValid = false;
  //     break;
  //   }
  // }

  // if (!isValid) return;
  console.log("item.value", item.value);

  const dataToSave = {
    ...item.value,
    amount: item.value.type == "saída"? -Math.abs(Number(item.value.amount)):Math.abs(Number(item.value.amount)),
    date: item.value.date ? format(item.value.date, "yyyy-MM-dd") : null,

    created_by: user.value.id,
    category_id: item.value.category_id?.key,
    related_id: item.value.related_id?.key
  };

  delete dataToSave.category;
  delete dataToSave.contact;
  delete dataToSave.user;
  delete dataToSave.contact_name;

  console.log("item.value>>>", item.value);
  console.log("dataToSave>>>", dataToSave);

  const isNew = !dataToSave.id;

  const result = await $fetch(`/api/upsert`, {
    method: "POST",
    body: {
      table: "financial_transactions",
      data: dataToSave,
      condition: !isNew ? `id = ${dataToSave.id}` : null
    }
  });

  if (result?.error) {
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Falha ao salvar",
      life: 3000
    });
  } else {
    editSaveButtonPressed.value = false;
    toast.add({
      severity: "success",
      summary: "Sucesso",
      detail: isNew ? "Criado" : "Atualizado",
      life: 3000
    });

    // itemDialog.value = false;
    const aux_type = item.value.type;
    item.value = {};
    item.value.date = new Date();
    item.value.type = aux_type;
    console.log(">>>>", op);

    if (flg_isEdit.value) {
      flg_isEdit.value = false;
      itemDialog.value = false;
    }
    await fetchDados(aux_type);
  }
}

async function editItem(row) {
  flg_isEdit.value = true;
  item.value = { ...row };
  item.value.category_id = categoryOptions.value.find(
    x => x.key === row.category_id
  );
  item.value.related_id = contactsOptions.value.find(
    x => x.key === row.related_id
  );
  item.value.date = parseISO(`${item.value.date.split("T")[0]}T00:00:00`);

  if (item.value.category_id) itemDialog.value = true;
}

function confirmDeleteItem(row) {
  item.value = { ...row };
  deleteItemDialog.value = true;
}

async function deleteItem() {
  await executeQueryRun(
    `DELETE FROM financial_transactions WHERE id = ${item.value.id}`
  );
  fetchDados(op.value);
  deleteItemDialog.value = false;
  item.value = {};
  toast.add({ severity: "success", summary: "Removido", life: 3000 });
}

function confirmDeleteSelected() {
  deleteItemsDialog.value = true;
}

async function deleteSelectedItems() {
  items.value = items.value.filter(val => !selectedItems.value.includes(val));
  deleteItemsDialog.value = false;
  
  const response = await $fetch(`/api/delete`, {
    method: "POST",
    body: {
      table: "financial_transactions", // Substitua pelo nome da sua tabela
      condition: `id in (${selectedItems.value.map(item => item.id).join(',')})`
    }
  });
  selectedItems.value = null;
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Items Deleted",
    life: 3000
  });
}

onMounted(async () => {
  await fetchDados(op.value);
});


watch(
  () => item.value.type,
  newVal => {
    // alert(items.value.type)
    flag_categorias_select_active.value = true;
    fetchDados(newVal);
  }
);
</script>

<style scoped>


</style>
