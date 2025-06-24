<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-white">Report Builder</h1>
        <div class="flex items-center gap-4">
            <button class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Save class="h-5 w-5" />
                Save Template
            </button>
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <FileDown class="h-5 w-5" />
                Generate Report
            </button>
        </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <!-- Left Column: Available Widgets -->
        <div class="lg:col-span-1 bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 class="text-xl font-semibold text-white mb-4">Available Widgets</h2>
            <div class="space-y-3">
                <div v-for="widget in availableWidgets" :key="widget.id" class="bg-gray-700 p-4 rounded-lg cursor-grab hover:bg-gray-600 transition-colors flex items-center gap-3">
                    <component :is="widget.icon" class="h-5 w-5 text-gray-400" />
                    <span class="font-medium">{{ widget.name }}</span>
                </div>
            </div>
        </div>

        <!-- Right Column: Report Layout -->
        <div class="lg:col-span-3 bg-gray-900/50 p-6 rounded-xl shadow-lg border-2 border-dashed border-gray-700 min-h-[60vh]">
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
                <LayoutGrid class="h-16 w-16" />
                <p class="mt-4 text-lg font-semibold">Report Layout</p>
                <p class="text-sm">Drag and drop widgets here to build your report.</p>
            </div>
            
            <!-- This area would be populated with the dropped widgets -->
            <!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> -->
                <!-- Example of a dropped widget -->
                <!-- <div class="bg-gray-800 p-4 rounded-lg"> ... </div> -->
            <!-- </div> -->
        </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { FileDown, Save, BarChart3, Users, DollarSign, LayoutGrid } from 'lucide-vue-next';

const availableWidgets = ref([
    { id: 1, name: 'Sales Bar Chart', icon: BarChart3 },
    { id: 2, name: 'User Table', icon: Users },
    { id: 3, name: 'Revenue Stats', icon: DollarSign },
    { id: 4, name: 'Activity Feed', icon: LayoutGrid },
]);
</script>
