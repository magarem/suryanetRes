<template>
  <div class="bg-gray-900/50 p-6 rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold text-white mb-6">Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Avatar and Info -->
      <div class="lg:col-span-1">
        <div class="bg-gray-800 p-6 rounded-lg text-center">
            <img 
              class="h-32 w-32 rounded-full border-4 border-gray-700 mx-auto object-cover"
              src="https://placehold.co/100x100/6366f1/e0e7ff?text=JD" 
              alt="User avatar"
            >
            <h2 class="text-2xl font-bold text-white mt-4">John Doe</h2>
            <p class="text-gray-400">Software Engineer</p>

            <button class="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Upload class="h-5 w-5" />
                Change Photo
            </button>
        </div>
      </div>

      <!-- Right Column: Edit Profile Form -->
      <div class="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold text-white mb-4">Profile Information</h2>
        <form @submit.prevent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="fullName" class="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input type="text" id="fullName" value="John Doe" class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                 <div>
                    <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <input type="email" id="email" value="john.doe@example.com" class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                 <div>
                    <label for="title" class="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
                    <input type="text" id="title" value="Software Engineer" class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                 <div>
                    <label for="company" class="block text-sm font-medium text-gray-300 mb-1">Company</label>
                    <input type="text" id="company" value="NuxtDash Inc." class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div class="md:col-span-2">
                    <label for="bio" class="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                    <textarea id="bio" rows="4" class="w-full bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">Passionate developer creating beautiful and functional web applications.</textarea>
                </div>
            </div>
            <div class="mt-6 text-right">
                <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">Save Changes</button>
            </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Upload } from 'lucide-vue-next';
</script>
