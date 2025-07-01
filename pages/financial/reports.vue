<template>
  <span class="text-[20px] mr-3">Relatórios</span>
  <div class="grid grid-cols-2 ">
    <div class="p-2">
      <SuperCard title="Filtros" class="w-full">
        <div class="my-4 flex  gap-4">
          <div class="w-1/2 _mr-3 ">
            <div class="w-full md:w-14rem  mb-4">
              <label for="month-select" class="block text-900 font-medium mb-2"
                >Mês</label
              >
              <Dropdown
                id="month-select"
                v-model="selectedMonth"
                :options="months"
                optionLabel="name"
                optionValue="code"
                placeholder="Selecione um mês"
                class="w-full"
              />
            </div>
            <label for="month-select" class="block text-900 font-medium mb-2"
              >Início</label
            >

            <DatePicker
              v-model="startDate"
              placeholder="Data início"
              showIcon
              dateFormat="dd/mm/yy"
            />
          </div>
          <div class="w-1/2 _mr-3">
            <div class="w-full md:w-14rem mb-4">
              <label for="month-select" class="block text-900 font-medium mb-2"
                >Ano</label
              >
              <Dropdown
                id="year-select"
                v-model="selectedYear"
                :options="years"
                optionLabel="name"
                optionValue="code"
                placeholder="Selecione o ano"
                class="w-full"
              />
            </div>
            <label for="month-select" class="block text-900 font-medium mb-2"
              >Fim</label
            >

            <DatePicker
              v-model="endDate"
              placeholder="Data fim"
              showIcon
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>
        <div>
          <label for="month-select" class="block text-900 font-medium mb-2"
            >Categoria</label
          >

          <Dropdown
            v-model="selectedCategory"
            :options="categories"
            optionLabel="value"
            optionValue="key"
            placeholder="Filtrar por categoria"
            class="w-full _mr-3 mb-9"
          />

          <!-- Wrap buttons in a flex container -->
          <div class="flex gap-4">
            <Button
              label="Limpar Filtros"
              @click="
                selectedCategory = null;
                startDate = null;
                endDate = null;
                transactions = [];
                load_data();
              "
              class="w-1/2 p-button-raised p-button-secondary"
            />
            <Button
              label="Carregar Transações"
              @click="load_data"
              class="w-1/2 p-button-raised p-button-success"
            />
          </div>
        </div>
      </SuperCard>
    </div>
    <div class="p-2">
      <SuperCard title="Resumo Financeiro" class="w-full text-[15px]">
        <LabelValueTable :data="noticeDetails" />
      </SuperCard>
    </div>
    <div class="col-span-2 p-2 my-2">
      <SuperCard title="Lançamentos">
        <FinancialTransactionDatatable
          :transactions="transactions"
          @view="row_view"
        />
      </SuperCard>
    </div>
    <div class="col-span-2 p-2">
      <SuperCard title="Totais por categorias" class="w-full text-[15px]">
        <LabelValueTable width_col1="55%" :data="totais_by_categories" />
      </SuperCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import FinancialTransactionDatatable from "@/components/FinancialTransactionDatatable.vue";
import FinanceCard from '@/components/FinanceCard.vue'
import SuperCard from '@/components/SuperCard.vue'
import {
  executeQuery,
  executeQueryRun,
  formatCurrency,
  formatDateForSQL,
  formatDateBR
} from "@/utils/db";
import LabelValueTable from '@/components/LabelValueTable.vue'

const route = useRoute();
const categories = ref([]);
const selectedCategory = ref();
const transactions = ref([]);
const totals = ref([]);
const totais_by_categories = ref([]);
const startDate = ref(null);
const endDate = ref(null);
const noticeDetails = ref([]);
const selectedMonth = ref(new Date().getMonth()+1);
const selectedYear = ref(new Date().getFullYear());
const months = ref([
  { name: 'Janeiro', code: 1 },
  { name: 'Fevereiro', code: 2 },
  { name: 'Março', code: 3 },
  { name: 'Abril', code: 4 },
  { name: 'Maio', code: 5 },
  { name: 'Junho', code: 6 },
  { name: 'Julho', code: 7 },
  { name: 'Agosto', code: 8 },
  { name: 'Setembro', code: 9 },
  { name: 'Outubro', code: 10 },
  { name: 'Novembro', code: 11 },
  { name: 'Dezembro', code: 12 }
]);

const years = ref([
  { name: '2025', code: 2025 },
  { name: '2024', code: 2024 },
  { name: '2023', code: 2023 },
  { name: '2022', code: 2022 },
  { name: '2021', code: 2021 },
  { name: '2020', code: 2020 }
]);

// Define the available years array
// const availableYears = computed(() => {
//   selectedYear.value = new Date().getFullYear();
//   const years = [];
//   for (let i = 0; i < 6; i++) { // Current year + 5 previous years = 6 years total
//     const year = currentYear - i;
//     years.push({ name: String(year), code: year }); // Format as { name: 'YYYY', code: YYYY }
//   }
//   return years.sort((a, b) => b.code - a.code); // Sort in descending order (most recent first)
// });




async function load_data() {
  transactions.value = await load_transactions();
  totals.value = await load_totais()
  categories.value = await load_categories();
  noticeDetails.value = [
    { label: 'Período', value: formatDateBR(startDate.value) + ' a ' + formatDateBR(endDate.value) },
    { label: 'Categoria', value: selectedCategory.value ? categories.value.find(c => c.key === selectedCategory.value)?.value : 'Todas' },
    { label: 'Total de transações', value: transactions.value.length },
    { label: 'Total de categorias', value: totals.value[0].total_categories },
    { label: 'Total de entradas', value: formatCurrency(totals.value[0]?.entradas || 0) },
    { label: 'Total de saídas', value: formatCurrency(totals.value[0]?.saidas || 0) },
    { label: 'Saldo', value: formatCurrency(totals.value[0]?.saldo || 0)}
  ]
  totais_by_categories.value = await load_totais_by_categories()
  totais_by_categories.value = totais_by_categories.value.map(item => ({
    label: '[ ' + item.item_count + ' ] ' + item.label,
    value: formatCurrency(item.value)
  }));
}

function row_view(row) {
  console.log("Row view clicked:", row);
  alert(`Viewing transaction: ${row.id}`);
  // Implement the logic to view the transaction details
}

const load_categories = async () => {
  const res = await $fetch(`/api/categories`);
  return [{ key: "", value: "Limpar filtro" }, ...res];
};

const load_transactions = async () => {
  const params = {
    start_date: formatDateForSQL(startDate.value),
    end_date: formatDateForSQL(endDate.value)
  };

  console.log("Loading transactions with params:", params);

  let sql = `
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
  fpm.name AS payment_method,
  ft.obs,
  ft.date,
  fc.id AS category_id,
  cp.full_path AS category,
  u.name AS user,
  c.id AS related_id,
  c.name AS contact_name,
  c.type AS contact_type,          -- New: Contact type (e.g., 1=Person, 2=Company)
  c.doc AS contact_doc,            -- New: CPF/CNPJ
  c.email AS contact_email,        -- New: Email
  c.fone1 AS contact_phone,        -- New: Primary phone
  c.address AS contact_address,    -- New: Address
  fpm.description AS payment_method_description
FROM financial_transactions ft
LEFT JOIN financial_categories fc ON ft.category_id = fc.id
LEFT JOIN category_path cp ON fc.id = cp.id
LEFT JOIN users u ON ft.created_by = u.id
LEFT JOIN contacts c ON ft.related_id = c.id
LEFT JOIN financial_payment_methods fpm ON ft.payment_method = fpm.id
WHERE ft.date BETWEEN
  CASE WHEN ${params.start_date} IS NULL THEN '1970-01-01' ELSE '${params.start_date}' END
  AND
  CASE WHEN ${params.end_date} IS NULL THEN '2100-01-01' ELSE '${params.end_date}' END
`;

 if (selectedCategory.value) {
  sql += `
  AND ft.category_id IN (
  SELECT id FROM category_path
  WHERE full_path LIKE (
    SELECT full_path || '%' FROM category_path WHERE id = ${selectedCategory.value}
  )
  )`
    // sql += ` AND ft.category_id = ${selectedCategory.value}`;
  }

  sql += ` ORDER BY ft.date DESC;`;

  console.log("SQL Query:", sql);
  const res = await executeQuery(sql);
  return res;
};

const load_totais = async () => {
  const params = {
    start_date: formatDateForSQL(startDate.value),
    end_date: formatDateForSQL(endDate.value)
  };

  console.log("totals Loading transactions with params:", params);

  const category_id = selectedCategory.value ?? null

  let sql = `
 WITH RECURSIVE category_path AS (
  -- Build the category tree
  SELECT id, parent_id, name, type, name AS full_path
  FROM financial_categories
  WHERE parent_id IS NULL

  UNION ALL

  SELECT fc.id, fc.parent_id, fc.name, fc.type, cp.full_path || ' › ' || fc.name
  FROM financial_categories fc
  JOIN category_path cp ON fc.parent_id = cp.id
),

filtered_categories AS (
  -- Return categories to filter or all if no category selected
  SELECT id FROM category_path
  WHERE ${category_id} IS NULL
     OR full_path LIKE (
        SELECT full_path || '%' FROM category_path WHERE id = ${category_id}
     )
)

SELECT
  COUNT(*) AS total_operations,
  COUNT(DISTINCT category_id) AS total_categories,
  SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) AS entradas,
  SUM(CASE WHEN type = 'saída' THEN amount ELSE 0 END) AS saidas,
  SUM(amount) AS saldo
FROM financial_transactions
WHERE date BETWEEN
  CASE WHEN ${params.start_date} IS NULL THEN '1970-01-01' ELSE '${params.start_date}' END
  AND
  CASE WHEN ${params.end_date} IS NULL THEN '2100-01-01' ELSE '${params.end_date}' END
  AND (
    ${category_id} IS NULL
    OR category_id IN (SELECT id FROM filtered_categories)
  );
`;

  console.log("totais - SQL Query:", sql);
  const res = await executeQuery(sql);
  return res;
};
const load_totais_by_categories = async () => {
  const params = {
    start_date: formatDateForSQL(startDate.value),
    end_date: formatDateForSQL(endDate.value)
  };

  console.log("totals Loading transactions with params:", params);

  const category_id = selectedCategory.value ?? null

 let sql = `
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
  cp.full_path AS label, -- Renamed to avoid confusion with grouping
  SUM(ft.amount) AS value,
  COUNT(*) AS item_count
FROM financial_transactions ft
LEFT JOIN financial_categories fc ON ft.category_id = fc.id
LEFT JOIN category_path cp ON fc.id = cp.id
WHERE ft.date BETWEEN
  CASE WHEN ${params.start_date} IS NULL THEN '1970-01-01' ELSE '${params.start_date}' END
  AND
  CASE WHEN ${params.end_date} IS NULL THEN '2100-01-01' ELSE '${params.end_date}' END
`;

 if (selectedCategory.value) {
  sql += `
 AND (
    ${category_id} IS NULL OR -- If no category ID is provided, don't filter by category
    ft.category_id IN (
      SELECT id FROM category_path
      WHERE full_path LIKE (
        SELECT full_path || '%' FROM category_path WHERE id = ${category_id}
      )
    )
  )`
    // sql += ` AND ft.category_id = ${selectedCategory.value}`;
  }

  sql += ` GROUP BY
  cp.full_path -- Group by the full category path to get totals per specific category
ORDER BY
  cp.full_path;`;

  console.log("totais - SQL Query:", sql);
  const res = await executeQuery(sql);
  return res;
};

load_data()

watch(selectedYear, (newValue) => {
  startDate.value = new Date(newValue, selectedMonth.value - 1, 1);
  endDate.value = new Date(newValue, selectedMonth.value, 0); // Day 0 of next month gives last day of current month
}, { immediate: true });


watch(selectedMonth, (newValue) => {
  startDate.value = new Date(selectedYear.value, newValue - 1, 1);
  endDate.value = new Date(selectedYear.value, newValue, 0); // Day 0 of next month gives last day of current month
}, { immediate: true });
</script>
