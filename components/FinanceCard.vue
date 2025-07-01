<template>
  <div _class="flex justify-center items-center bg-gray-100 p-4 rounded-xl shadow">
    <Card class="w-96">
      <template #title>Resumo Financeiro do período</template>

      <template #content>
        <div class="space-y-4 mt-3">
          <div class="flex justify-between">
            <span class="font-semibold text-gray-300">Entradas:</span>
            <span class="text-green-300 font-bold">R$ {{ formatNumber(finance.entradas) }}</span>
          </div>

          <div class="flex justify-between">
            <span class="font-semibold text-gray-300">Saídas:</span>
            <span class="text-red-500 font-bold">R$ {{ formatNumber(finance.saidas) }}</span>
          </div>

          <div class="flex justify-between border-t pt-4 mt-4">
  <span class="font-semibold text-gray-300">Saldo:</span>
  <span 
    :class="[
      'text-lg font-bold',
      finance.saldo >= 0 ? 'text-green-500' : 'text-red-500'
    ]"
  >
    R$ {{ formatNumber(finance.saldo) }}
  </span>
</div>

        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
// import { Card } from 'primevue/card'

const props = defineProps({
  finance: {
    type: Object,
    required: true,
    default: () => ({
      entradas: 0,
      saidas: 0,
      saldo: 0
    })
  }
})

function formatNumber(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
</style>
