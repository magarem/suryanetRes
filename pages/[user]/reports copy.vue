<template>
  <div class="p-6">
    <h1 class="font-bold mb-4">Relatórios Financeiros</h1>
    <!-- Filtros -->
    <div class="flex gap-4 mb-4 flex-wrap">
      <!-- Alternador de tipo -->
      <div _class="mt-6">
        <!-- <label class="font-semibold mr-2">Exibir por:</label> -->
        <Dropdown
          v-model="type"
          :options="[
            { key: 'categoria', value: 'Por categoria' },
            { key: 'data', value: 'Por data' }
          ]"
          optionLabel="value"
          optionValue="key"
          placeholder="Filtrar por categoria"
          class="min-w-[100px]"
        />

        <!-- <select v-model="type" class="border py-2  rounded bg-gray-800">
        <option value="categoria">Por categoria</option>
        <option value="data">Por data</option>
      </select> -->
      </div>
      <Dropdown
        v-if="type == 'categoria'"
        v-model="selectedCategory"
        :options="categories"
        optionLabel="value"
        optionValue="key"
        placeholder="Filtrar por categoria"
        class="min-w-[200px]"
      />
      <Calendar
        v-model="startDate"
        placeholder="Data início"
        showIcon
        dateFormat="dd/mm/yy"
        locale="brLocale"
      />
      <Calendar
        v-model="endDate"
        placeholder="Data fim"
        showIcon
        dateFormat="dd/mm/yy"
        locale="brLocale"
      />

      <Button label="Atualizar" icon="pi pi-refresh" @click="fetchReport" />
      <!-- <Button label="Exportar PDF" icon="pi pi-file-pdf" class="p-button-outlined" @click="exportToPDF" /> -->
    </div>

    <div class="grid grid-cols-[100%] gap-4 mt-6">
      <!-- <div>
        <Card class=" my-card h-[300px]">
          <template #title>
            <h4>Totais</h4>
          </template>

          <template #content>
            <DataTable :value="totais" :showGridlines="true" class="w-full">
              <Column
                field="label"
                header="Tipo"
                headerStyle="font-size: 18px; background-color: #696969"
              ></Column>
              <Column
                field="value"
                header="Valor"
                headerStyle="font-size: 18px; background-color: #696969"
              >
                <template #body="{ data }">
                  <span
                    :class="{
                      'text-green-500': data.label === 'Entradas',
                      'text-red-500': data.label === 'Saídas',
                      'font-bold': data.label === 'Saldo'
                    }"
                  >
                    {{ formatCurrency(data.value) }}
                  </span>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div> -->
      <div>



<Tabs value="0">
    <TabList>
        <Tab value="0">#</Tab>
        <Tab value="1">Categorias</Tab>
        <Tab value="2">Por data</Tab>
    </TabList>
    <TabPanels>
        <TabPanel value="0">
          <Card class="my-card h-[500px]">
            <template #content>
              <div _class="overflow-auto max-h-[500px] p-2">
                <!-- Tabela -->
                <FinancialTransactionDatatable :transactions="transactions"/>
                <!-- <ReportByCategory
                  v-if="type === 'categoria'"
                  :report="reportData"
                  class=" w-full"
                  @customEvent="customEvent"
                /> -->

                <!-- <ReportByDate v-else :report="reportData" /> -->
              </div>
            </template>
          </Card>
        </TabPanel>
        <TabPanel value="1">
          <ReportByCategory
                :report="reportData"
                class="w-full"
                @customEvent="customEvent"
              /> 
        </TabPanel>
        <TabPanel value="2">
            <ReportByDate :report="reportData_data" />
        </TabPanel>
    </TabPanels>
</Tabs>

      </div>
    </div>
    <div class="grid mt-6 grid-cols-[70%_30%] gap-4  ">
      <div>
        <Card class="my-card w-full h-[344px]">
          <template #title>
            <h4>{{ category_name }}</h4>
          </template>

          <template #content>
            <ReportByCategoryItens
              v-if="type === 'categoria'"
              :list="selectedProducts"
              class="w-full"
            />
          </template>
        </Card>
      </div>
      <div>
        <Card v-if="selectedProducts" class="my-card w-full">
          <template #title>
            Proporção
          </template>

          <template #content>
            <!-- {{ selectedProducts }} -->
            <pieGraph :list="selectedProducts" />
          </template>
        </Card>
      </div>
    </div>

    <Card v-if="chartData" class="mt-5 my-card">
      <template #title>
        Comparativo
      </template>

      <template #content>
        <ChartDrawTest
          class="mt-5"
          :chart-data="chartData"
          :chart-options="chartOptions"
        />
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import ChartDrawTest from "~/components/dashboard/ChartDrawTest.vue";
import pieGraph from "~/components/dashboard/pieGraph.vue";
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
// import { pt } from 'primevue/api'
// import { usePrimeVue } from 'primevue/config'

// Configura o locale global para pt-BR
// const primevue = usePrimeVue()
// primevue.config.locale = pt

// Componentes de relatório
import ReportByCategoryItens from "@/components/ReportByCategoryItens.vue";
import ReportByCategory from "@/components/ReportByCategory.vue";
import ReportByDate from "@/components/ReportByDate.vue";
import FinancialTransactionDatatable from "@/components/FinancialTransactionDatatable.vue";

const reportData = ref([]);
const reportData_data = ref([]);
const totais = ref([]);
const startDate = ref(null);
const endDate = ref(null);
const type = ref("categoria");
const selectedCategory = ref(null);
const categories = ref([]);
const selectedProducts = ref([]);
const transactions = ref([]);
const category_name = ref();

const route = useRoute();
const domain = route.params.domain;
console.log(22, reportData.value);

async function customEvent(selectedRow) {
  selectedProducts.value = await executeQuery(
    domain,
    "select * from financial_transactions where category_id = " +
      selectedRow.category_id
  );
  category_name.value = selectedRow.nome;
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

const chartData = ref({
  labels: reportData.value.map(x => x.nome),
  datasets: []
});
const formatCurrency = value => {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      position: "top"
    },
    title: {
      display: true,
      text: "Evolução"
    }
  }
});

function buildChart() {
  chartData.value = {
    labels: reportData.value.map(x => x.nome),
    datasets: [
      {
        label: "Entradas",
        data: reportData.value.map(x => x.entradas),
        backgroundColor: "#4BC0C0"
      },
      {
        label: "Saídas",
        data: reportData.value.map(x => x.saidas),
        backgroundColor: "#FF6384"
      }
    ]
  };

  console.log(222, reportData.value.map(x => x.entradas));
}

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

const fetchCategories = async () => {
  const res = await $fetch(`/api/${domain}/categories`);
  categories.value = [{ key: "", value: "Limpar filtro" }, ...res];
};

const fetchReport = async () => {
  const params = {
    start: startDate.value,
    end: endDate.value,
    type: type.value,
    category_id: selectedCategory.value
  };
  const res = await $fetch(`/api/${domain}/reports`, { params });
  reportData.value = [...res.rows];



  const params_data = {
    start: startDate.value,
    end: endDate.value,
    type: 'data',
    category_id: selectedCategory.value
  };
  const res_ = await $fetch(`/api/${domain}/reports`, { params_data });
  reportData_data.value = [...res_.rows];



  totais.value = [
    { label: "Entradas", value: res.rows_totais[0].total_entradas },
    { label: "Saídas", value: res.rows_totais[0].total_saídas },
    { label: "Saldo", value: res.rows_totais[0].saldo }
  ];
  buildChart();
};

const get_transactions = async () => {
  const sql = `
     WITH RECURSIVE category_path AS (
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
      u.nome AS user,
      c.id AS related_id,
      c.name AS contact_name
    FROM financial_transactions ft
    LEFT JOIN financial_categories fc ON ft.category_id = fc.id
    LEFT JOIN category_path cp ON fc.id = cp.id
    LEFT JOIN users u ON ft.created_by = u.id
    LEFT JOIN contacts c ON ft.related_id = c.id
    WHERE 
      ('${startDate.value}' IS NULL OR ft.date >= '${startDate.value}')
      AND ('${endDate.value}' IS NULL OR ft.date <= '${endDate.value}')
    ORDER BY ft.date DESC;`

  console.log("SQL Query:", sql);
  
  const res = executeQuery(
    domain, 
  );
  return res;
};

onMounted(async () => {
  fetchCategories();
  fetchReport(); 
  transactions.value = await get_transactions()
  
});

watch(
  () => type.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      if (newVal == "data") selectedCategory.value = "";
      fetchCategories();
      fetchReport(); // Chama ambos quando type muda
    }
  },
  { immediate: true } // Opcional: executa imediatamente na montagem do componente
);
</script>

<style scoped>
select {
  min-width: 160px;
}

/* Add this to your component's <style> section */
.p-datatable {
  border-radius: 8px; /* Adjust to your desired curvature */
  overflow: hidden; /* Ensures the content respects the rounded corners */
  font-size: 1.2rem;
}

.p-datatable-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

.my-card {
  border-radius: 16px; /* Rounded corners */
  overflow: hidden;
  font-size: 1.1rem; /* Bigger font if desired */
}
</style>
