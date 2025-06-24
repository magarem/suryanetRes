<template>
  <div>
    <h2 class="text-2xl font-bold text-white mb-6">Início</h2>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Card 1: Total Revenue -->
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-500/30 transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-400">Total Revenue</p>
            <p class="text-3xl font-bold text-white">$45,231.89</p>
          </div>
          <div class="p-3 bg-indigo-500/20 rounded-lg">
             <DollarSign class="h-6 w-6 text-indigo-400" />
          </div>
        </div>
        <p class="text-xs text-green-400 mt-2">+20.1% from last month</p>
      </div>

      <!-- Card 2: Subscriptions -->
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-500/30 transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-400">Subscriptions</p>
            <p class="text-3xl font-bold text-white">+2,350</p>
          </div>
           <div class="p-3 bg-orange-500/20 rounded-lg">
            <Users class="h-6 w-6 text-orange-400" />
          </div>
        </div>
        <p class="text-xs text-green-400 mt-2">+180.1% from last month</p>
      </div>

      <!-- Card 3: Sales -->
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-500/30 transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-400">Sales</p>
            <p class="text-3xl font-bold text-white">+12,234</p>
          </div>
          <div class="p-3 bg-green-500/20 rounded-lg">
             <CreditCard class="h-6 w-6 text-green-400" />
          </div>
        </div>
        <p class="text-xs text-red-400 mt-2">-19% from last month</p>
      </div>

      <!-- Card 4: Active Now -->
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-indigo-500/30 transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-400">Active Now</p>
            <p class="text-3xl font-bold text-white">+573</p>
          </div>
          <div class="p-3 bg-sky-500/20 rounded-lg">
            <Activity class="h-6 w-6 text-sky-400" />
          </div>
        </div>
         <p class="text-xs text-gray-400 mt-2">+201 since last hour</p>
      </div>
    </div>
    
    <!-- Bar Chart Card -->
    <div class="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 class="text-xl font-semibold text-white mb-4">Weekly Sales</h2>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>

  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['authenticated'],
})
import { ref, onMounted } from 'vue';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-vue-next';
import Chart from 'primevue/chart';

// Reactive references for chart data and options
const chartData = ref();
const chartOptions = ref();

// Function to set chart data
const setChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
            {
                label: 'Sales',
                backgroundColor: documentStyle.getPropertyValue('--p-indigo-500'),
                borderColor: documentStyle.getPropertyValue('--p-indigo-500'),
                borderRadius: 4,
                data: [65, 59, 80, 81, 56, 55, 40]
            }
        ]
    };
};

// Function to set chart options
const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
};

// Set the chart data and options when the component is mounted
onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});
</script>
