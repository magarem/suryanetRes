<template>
  <div>
    <div class="card">
      <Toolbar class="mb-1">
        <template #start>
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
          />
        </template>

        <template #end>
          <Button
            label="Exportar"
            icon="pi pi-upload"
            severity="secondary"
            @click="exportCSV($event)"
          />
        </template>
      </Toolbar>
      <DataTable
        ref="dt"
        v-model:selection="selectedItems"
        :value="items"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="{first} até {last} de {totalRecords} páginas"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Páginas</h4>
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
          <!-- <template #body="slotProps">
            {{ slotProps.data[col.field] }}
          </template> -->

          <template v-if="col.bodyTemplate">
            <component
              :is="col.bodyTemplate"
              :slotProps="slotProps"
              :formatCurrency="formatCurrency"
              :getStatusLabel="getStatusLabel"
            />
          </template>
          <template v-else>
            {{ slotProps.data[col.field] }}
          </template>
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
      header="Detalhes da Página"
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
              >{{ col.header }} é obrigatório.</small
            >
          </div>
        </template>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Salvar" icon="pi pi-check" @click="saveItem" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteItemDialog"
      :style="{ width: '450px' }"
      header="Confirmar Exclusão"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="item"
          >Excluir página <b>{{ item.page }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="Não"
          icon="pi pi-times"
          text
          @click="deleteItemDialog = false"
        />
        <Button label="Sim" icon="pi pi-check" @click="deleteItem" />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteItemsDialog"
      :style="{ width: '450px' }"
      header="Confirmar Exclusão"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="item">Excluir páginas selecionadas?</span>
      </div>
      <template #footer>
        <Button
          label="Não"
          icon="pi pi-times"
          text
          @click="deleteItemsDialog = false"
        />
        <Button
          label="Sim"
          icon="pi pi-check"
          text
          @click="deleteSelectedItems"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["authenticated"]
});
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "@primevue/core/api";
import InputText from "primevue/inputtext";
import { executeQuery, executeQueryRun } from "~/utils/db"; // Adjust the import path as necessary
const { user, clear: clearSession } = useUserSession();
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
const data_roles = ref([]);

const visibleColumns = computed(() => {
  return columns.value.filter(col => !col.hidden);
});

const columns = ref([]);

onMounted(async () => {
  await fetchData();
});

function formatValue(value) {
  if (typeof value == "object") {
    return value.join(", ");
  }
  return value;
}

async function fetchData() {
  const dataRoles = await executeQuery("SELECT id, name FROM roles");
  data_roles.value = dataRoles?.map(x => ({ key: x.id, value: x.name }));
  console.log("Fetched dataRoles----+:", data_roles.value);

  const data = await executeQuery(
    `SELECT
        p.id,
        p.page,
        GROUP_CONCAT(r.name, ', ') AS roles_names,
        GROUP_CONCAT(pr.role_id, ', ') AS roles_ids
    FROM
        pages p
    LEFT JOIN
        page_roles pr ON p.id = pr.page_id
    LEFT JOIN
        roles r ON pr.role_id = r.id
    GROUP BY
        p.page;
    `
  );

  console.log("Fetched data:", data);
  // items.value = data;

  items.value = data.map(page => {
    return {
      ...page,
      roles_ids: page.roles_ids
        ? page.roles_ids.split(",").map(id => Number(id.trim()))
        : [],
      roles_names: page.roles_names
        ? page.roles_names.split(",").map(name => name.trim())
        : []
    };
  });

  columns.value = [
    {
      field: "id",
      header: "ID",
      sortable: true,
      style: { "min-width": "8rem" }
      // hidden: true
    }, // Ocultar o ID na edição
    {
      field: "page",
      header: "Página",
      sortable: true,
      style: { "min-width": "16rem" },
      editTemplate: InputText
    },
    {
      field: "roles_names", // Coluna para exibição na tabela
      header: "Roles",
      sortable: true,
      style: { "min-width": "12rem" },
      bodyTemplate: slotProps => slotProps.data.roles_names, // Exibe os nomes concatenados
      editTemplate: null // Não usar este campo para editar
    },
    {
      field: "roles_ids", // Coluna para edição
      header: "Roles", // Pode manter o mesmo header ou mudar para "Selecionar Roles"
      sortable: true,
      style: { "min-width": "12rem" },
      editTemplate: CustomCheckbox, // Usar o CustomCheckbox para editar
      options: data_roles.value, // Passar as opções para o CustomCheckbox
      hidden: true // Ocultar esta coluna na tabela (opcional, pode remover se não quiser)
    }
  ];
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
    if (
      col.editTemplate &&
      !item.value[col.field] &&
      col.field !== "roles_names"
    ) {
      isValid = false;
      break;
    }
  }

  if (isValid) {
    try {
      const pageData = {
        page: item.value.page
      };

      // 1. Salvar/atualizar a página na tabela 'pages'
      let pageResponse;
      try {
        pageResponse = await $fetch(`/api/upsert`, {
          method: "POST",
          body: {
            table: "pages",
            data: pageData,
            condition: item.value.id ? `id = ${item.value.id}` : null
          }
        });
        console.log(
          "pageResponse?.result?.lastInsertRowid:",
          pageResponse?.result.lastInsertRowid
        );
      } catch (error) {
        console.error("Erro ao salvar/atualizar página:", error);
        toast.add({
          severity: "error",
          summary: "Erro",
          detail: `Erro ao salvar/atualizar página: ${error.message}`,
          life: 5000
        });
        return; // Pare a execução em caso de erro na chamada à API
      }

      let pageId;
      if (item.value.id) {
        pageId = item.value.id;
        if (!pageResponse?.message && pageResponse !== null) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Falha ao atualizar a página.",
            life: 3000
          });
          return;
        }
      } else if (pageResponse?.result?.lastInsertRowid) {
        pageId = pageResponse.result?.lastInsertRowid;
        pageData.id = pageId;
      } else {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Falha ao criar nova página.",
          life: 3000
        });
        return;
      }

      const selectedRoleIds = item.value.roles_ids || [];

      // 2. Atualizar a tabela 'page_roles'
      if (pageId) {
        // Remover roles existentes para a página
        try {
          await executeQueryRun(
            "DELETE FROM page_roles WHERE page_id = " + pageId
          );
        } catch (error) {
          console.error("Erro ao deletar roles:", error);
          toast.add({
            severity: "error",
            summary: "Erro",
            detail: `Erro ao deletar roles: ${error.message}`,
            life: 5000
          });
          return;
        }

        // Inserir os novos roles selecionados
        if (selectedRoleIds.length > 0) {
          const insertPromises = selectedRoleIds.map(roleId => {
            try {
              return executeQueryRun(
                "INSERT INTO page_roles (page_id, role_id) VALUES (" +
                  pageId +
                  ", " +
                  roleId +
                  ")"
              );
            } catch (error) {
              console.error("Erro ao inserir role:", error);
              toast.add({
                severity: "error",
                summary: "Erro",
                detail: `Erro ao inserir role: ${error.message}`,
                life: 5000
              });
              return Promise.reject(error); // Rejeite a promessa para parar o Promise.all
            }
          });
          try {
            await Promise.all(insertPromises);
          } catch (error) {
            console.error("Erro em Promise.all:", error);
            return;
          }
        }
      }

      toast.add({
        severity: "success",
        summary: "Sucesso",
        detail: "Página Salva",
        life: 3000
      });

      itemDialog.value = false;
      item.value = {};

      await fetchData();
    } catch (error) {
      console.error("Erro ao salvar a página:", error);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Erro ao salvar a página.",
        life: 3000
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

async function deleteItem() {
  try {
    const response = await $fetch(`/api/delete`, {
      method: "POST",
      body: {
        table: "pages",
        condition: `id = ${item.value.id}`
      }
    });

    if (response && response.message) {
      // Atualize a lista localmente
      items.value = items.value.filter(val => val.id !== item.value.id);

      toast.add({
        severity: "success",
        summary: "Sucesso",
        detail: response.message,
        life: 3000
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Falha ao excluir a página.",
        life: 3000
      });
    }

    deleteItemDialog.value = false;
    item.value = {};
    fetchData();
  } catch (error) {
    console.error("Erro ao excluir a página:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Erro ao excluir a página.",
      life: 3000
    });
  }
}

function findIndexById(id) {
  return items.value.findIndex(val => val.id === id);
}

function createId() {
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

async function deleteSelectedItems() {
  items.value = items.value.filter(val => !selectedItems.value.includes(val));
  deleteItemsDialog.value = false;
  

  const response = await $fetch(`/api/delete`, {
    method: "POST",
    body: {
      table: "pages", // Substitua pelo nome da sua tabela
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

function formatCurrency(value) {
  if (value)
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  return;
}
</script>
