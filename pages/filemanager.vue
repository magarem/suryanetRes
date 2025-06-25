<template>
  <!-- 
    The main container for the file manager. 
    It's wrapped in a single root element as required by Vue components.
    The classes from the original <body> tag are moved here, but `h-screen` is removed
    as your `app.vue` layout likely already controls the screen height.
  -->
  <div class="flex w-full h-full text-gray-200 antialiased">

    <!-- Sidebar -->
    <aside class="flex-shrink-0 bg-gray-800 p-4 flex flex-col justify-between transition-all duration-300 ease-in-out" :class="isSidebarCollapsed ? 'w-20' : 'w-64'">
        <div>
            <!-- Logo -->
            <div class="flex items-center mb-8" :class="isSidebarCollapsed ? 'justify-center' : ''">
                <i class="fas fa-rocket text-blue-400 text-2xl" :class="{'mr-3': !isSidebarCollapsed}"></i>
                <h1 v-if="!isSidebarCollapsed" class="text-xl font-bold text-white">{{ appConfig.general.appName }}</h1>
            </div>
            
            <!-- Tree View Navigation -->
            <nav>
                <ul>
                    <li v-for="item in navigationItems" :key="item.key" class="text-sm">
                        <div @click="toggleNode(item)" class="flex items-center justify-between px-4 py-2.5 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer" :class="{'bg-gray-900 text-white shadow': item.active}">
                            <div class="flex items-center" :class="isSidebarCollapsed ? 'justify-center' : ''">
                                <i :class="[item.icon, item.active ? 'text-blue-400' : '', 'w-6', 'text-center', {'mr-3': !isSidebarCollapsed}]"></i>
                                <span v-if="!isSidebarCollapsed" class="font-medium">{{ item.label }}</span>
                            </div>
                            <i v-if="!isSidebarCollapsed && item.children && item.children.length > 0" class="fas fa-chevron-down transform transition-transform duration-200" :class="{'rotate-180': item.isOpen}"></i>
                        </div>
                        <ul v-if="!isSidebarCollapsed && item.isOpen && item.children" class="pl-6 mt-1 space-y-1">
                            <li v-for="child in item.children" :key="child.key">
                                <div @click="toggleNode(child)" class="flex items-center px-4 py-2 hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer">
                                    <i :class="child.icon" class="w-6 text-center mr-3 text-gray-400"></i>
                                    <span>{{ child.label }}</span>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
        
        <div>
             <!-- Storage Indicator -->
            <div class="mt-8">
                <h3 v-if="!isSidebarCollapsed" class="text-sm font-medium text-gray-400 mb-2">Storage</h3>
                <div class="w-full bg-gray-700 rounded-full h-2.5">
                    <div class="bg-blue-500 h-2.5 rounded-full" :style="{ width: storagePercentage }"></div>
                </div>
                <p v-if="!isSidebarCollapsed" class="text-xs text-gray-400 mt-2">{{ usedStorage }} of {{ totalStorage }} used</p>
            </div>
            <!-- Collapse Button -->
             <div class="mt-4 pt-4 border-t border-gray-700">
                <button @click="toggleSidebarCollapse" class="w-full flex items-center p-2.5 hover:bg-gray-700 rounded-lg transition-colors" :class="isSidebarCollapsed ? 'justify-center' : ''">
                    <i class="fas" :class="isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
                    <span v-if="!isSidebarCollapsed" class="ml-3 font-medium">{{ appConfig.buttons.collapse }}</span>
                </button>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="bg-gray-800/50 backdrop-blur-sm p-4 flex items-center justify-between border-b border-gray-700">
            <div class="flex items-center space-x-4">
                <button @click="uploadDialogVisible = true" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-lg transition-transform transform hover:scale-105">
                    <i class="fas fa-upload mr-2"></i>
                    {{ appConfig.buttons.upload }}
                </button>
                 <button @click="newFolderDialogVisible = true" class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                    <i class="fas fa-folder-plus mr-2"></i>
                    {{ appConfig.buttons.newFolder }}
                </button>
            </div>
            <div class="relative w-full max-w-xs">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="text" v-model="searchQuery" placeholder="Search files..." class="w-full bg-gray-700 border border-gray-600 rounded-full py-2 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
        </header>

        <!-- File Grid -->
        <div class="flex-1 p-6 overflow-y-auto">
            <h2 v-if="!searchQuery" class="text-xl font-semibold text-white mb-4">{{ currentFolder.name }}</h2>
            <h2 v-else class="text-xl font-semibold text-white mb-4">Search Results for "{{ searchQuery }}"</h2>

            <!-- Breadcrumbs (hidden during search) -->
            <div v-if="!searchQuery" class="flex items-center text-sm text-gray-400 mb-6">
                <div v-for="(crumb, index) in breadcrumbs" :key="crumb.id" class="flex items-center">
                    <button @click="navigateToBreadcrumb(index)" class="hover:text-white">{{ crumb.name }}</button>
                    <i v-if="index < breadcrumbs.length - 1" class="fas fa-chevron-right mx-2 text-xs"></i>
                </div>
            </div>

            <!-- Grid Items -->
            <div v-if="pending && !fileSystem" class="text-center text-gray-400">Loading files...</div>
            <div v-else-if="error" class="text-center text-red-400">Could not load files.</div>
            <div v-else :class="['grid', appConfig.grid.columns, 'gap-6']">
                <!-- Data is now filtered based on the universal displayContent -->
                <div v-for="item in displayContent" :key="item.id">
                    <!-- Folder Item -->
                    <div v-if="item.type === 'folder'" @click="openFolder(item)" class="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-all cursor-pointer group h-52 relative">
                         <div @click.stop class="absolute top-2 right-2 z-20">
                            <button @click="showMenu($event, item)" class="text-white opacity-0 group-hover:opacity-100 hover:text-blue-400 p-2 rounded-full hover:bg-gray-700/80 transition-opacity">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                        <i class="fas fa-folder text-yellow-400 text-5xl mb-3"></i>
                        <h3 class="font-medium text-white truncate w-full">{{ item.name }}</h3>
                        <p class="text-xs text-gray-400">{{ item.children.length }} items</p>
                    </div>

                    <!-- File Item -->
                    <div v-else @click="openFile(item)" class="bg-gray-800 rounded-lg p-4 flex flex-col group relative overflow-hidden h-52 hover:bg-gray-700/50 transition-all cursor-pointer">
                        <div @click.stop class="absolute top-2 right-2 z-20">
                            <button @click="showMenu($event, item)" class="text-white opacity-0 group-hover:opacity-100 hover:text-blue-400 p-2 rounded-full hover:bg-gray-700/80 transition-opacity">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                        
                        <!-- Consistent Height Preview Area -->
                        <div v-if="item.preview === 'image'" class="relative h-24 bg-gray-700 rounded-md mb-3 flex-shrink-0">
                            <img :src="item.url" class="absolute top-0 left-0 w-full h-full object-cover rounded-md" :alt="item.name">
                        </div>
                        
                        <!-- Icon Preview -->
                        <div v-else class="flex items-center justify-center h-24 rounded-md mb-3 text-4xl flex-shrink-0" :class="item.colorClass">
                            <i :class="item.iconClass"></i>
                        </div>

                        <!-- Text content fills remaining space -->
                        <div class="flex flex-col justify-between flex-grow overflow-hidden">
                          <h3 class="font-medium text-white truncate">{{ item.name }}</h3>
                          <p class="text-xs text-gray-400">{{ item.size }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Action Menu -->
    <Menu ref="menu" :model="menuItems" :popup="true" />

    <!-- Dialog for New Folder -->
    <Dialog v-model:visible="newFolderDialogVisible" modal :header="appConfig.dialogs.newFolder.header" :style="{ width: '25rem' }" :pt="dialogStyles">
        <div class="flex flex-col gap-2 mt-4">
            <label for="foldername" class="font-semibold">{{ appConfig.dialogs.newFolder.label }}</label>
            <InputText id="foldername" v-model="newFolderName" autocomplete="off" @keyup.enter="createFolder" />
        </div>
        <template #footer>
            <Button :label="appConfig.buttons.cancel" text severity="secondary" @click="newFolderDialogVisible = false" />
            <Button :label="appConfig.buttons.create" @click="createFolder" />
        </template>
    </Dialog>
    
    <!-- Dialog for Rename Item -->
    <Dialog v-model:visible="renameDialogVisible" modal :header="appConfig.dialogs.rename.header" :style="{ width: '25rem' }" :pt="dialogStyles">
        <div class="flex flex-col gap-2 mt-4">
            <label for="newitemname" class="font-semibold">{{ appConfig.dialogs.rename.label }}</label>
            <InputText id="newitemname" v-model="newItemName" autocomplete="off" @keyup.enter="renameItem" />
        </div>
        <template #footer>
            <Button :label="appConfig.buttons.cancel" text severity="secondary" @click="renameDialogVisible = false" />
            <Button :label="appConfig.buttons.save" @click="renameItem" />
        </template>
    </Dialog>
    
    <!-- Dialog for Move Item -->
    <Dialog v-model:visible="moveDialogVisible" modal :header="appConfig.dialogs.move.header" :style="{ width: '25rem' }" :pt="dialogStyles">
        <div class="mt-4">
            <p class="mb-2">Select a destination for <span class="font-bold">{{ itemToMove?.name }}</span>:</p>
            <div class="border border-gray-600 rounded-lg p-2 h-64 overflow-y-auto">
                 <ul class="space-y-1">
                    <li v-for="folder in folderTree" :key="folder.id">
                        <div @click="selectedDestination = folder.id" class="flex items-center p-2 rounded-md cursor-pointer" :class="{ 'bg-blue-600 text-white': selectedDestination === folder.id, 'hover:bg-gray-700': selectedDestination !== folder.id }" :style="{ 'padding-left': `${folder.depth * 1.5}rem` }">
                            <i class="fas fa-folder text-yellow-400 mr-2"></i>
                            <span>{{ folder.name }}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <template #footer>
            <Button :label="appConfig.buttons.cancel" text severity="secondary" @click="moveDialogVisible = false" />
            <Button :label="appConfig.buttons.move" @click="moveItem" :disabled="!selectedDestination" />
        </template>
    </Dialog>

    <!-- Dialog for Upload -->
    <Dialog v-model:visible="uploadDialogVisible" modal :header="appConfig.dialogs.upload.header" :style="{ width: '40rem' }" :pt="dialogStyles">
      <div class="mt-4">
        <FileUpload name="files" url="/api/upload" :multiple="true" @before-upload="handleBeforeUpload" @upload="onUploadSuccess" :maxFileSize="10000000">
            <template #empty>
                <div class="flex items-center justify-center flex-col">
                    <i class="pi pi-cloud-upload border-2 rounded-full p-5 text-8xl text-gray-400 border-gray-400" />
                    <p class="mt-4 mb-0">{{ appConfig.dialogs.upload.empty }}</p>
                </div>
            </template>
        </FileUpload>
      </div>
    </Dialog>
    
    <!-- Dialog for Deleting Item -->
    <Dialog v-model:visible="deleteDialogVisible" modal :header="appConfig.dialogs.delete.header" :style="{ width: '25rem' }" :pt="dialogStyles">
        <div class="flex items-center gap-4 mt-4">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
            <div>
                <p>{{ appConfig.dialogs.delete.message }}</p>
                <p class="font-bold mt-2 break-all">{{ itemToDelete?.name }}</p>
            </div>
        </div>
        <template #footer>
            <Button :label="appConfig.buttons.cancel" text severity="secondary" @click="deleteDialogVisible = false" />
            <Button :label="appConfig.buttons.delete" severity="danger" @click="deleteItem" />
        </template>
    </Dialog>

    <!-- Dialog for Image Viewer -->
    <Dialog v-model:visible="imageViewerVisible" modal :header="imageToView?.name" :style="{ width: '80vw', 'max-width': '1200px' }" :pt="dialogStyles">
        <div class="flex items-center justify-center p-4 bg-gray-900">
            <img :src="imageToView?.url" class="max-w-full max-h-[80vh] object-contain" :alt="imageToView?.name" />
        </div>
        <template #footer>
            <Button :label="appConfig.buttons.close" icon="pi pi-times" @click="imageViewerVisible = false" text />
        </template>
    </Dialog>
    
    <!-- Dialog for PDF Viewer -->
    <Dialog v-model:visible="pdfViewerVisible" modal :header="pdfToView?.name" :style="{ width: '80vw', 'max-width': '1200px', height: '95vh' }" :pt="dialogStyles">
        <iframe :src="pdfToView?.url" class="w-full h-full border-0"></iframe>
        <template #footer>
            <Button :label="appConfig.buttons.close" icon="pi pi-times" @click="pdfViewerVisible = false" text />
        </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import Menu from 'primevue/menu';

const toast = useToast();

// --- Sidebar State ---
const isSidebarCollapsed = ref(false);

const toggleSidebarCollapse = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
};


// --- Dialog State ---
const newFolderDialogVisible = ref(false);
const uploadDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const renameDialogVisible = ref(false);
const imageViewerVisible = ref(false);
const pdfViewerVisible = ref(false);
const moveDialogVisible = ref(false);
const newFolderName = ref('');
const newItemName = ref('');
const itemToDelete = ref(null);
const itemToRename = ref(null);
const imageToView = ref(null);
const pdfToView = ref(null);
const itemToMove = ref(null);
const selectedDestination = ref(null);


// --- Action Menu State ---
const menu = ref();
const menuItems = ref([]);

// --- Storage Indicator State ---
const usedStorage = ref('0 Bytes');
const totalStorage = ref('0 Bytes');
const totalSizeUsedInBytes = ref(0);
const quotaInBytes = ref(0);

// --- Search State ---
const searchQuery = ref('');

// --- Fetching file data from the new API endpoint ---
const { data: fileSystem, pending, error, refresh } = await useAsyncData('file-list', () => $fetch('/api/files'));

// --- Navigation State ---
const breadcrumbs = ref([]);

// --- Sidebar State ---
const navigationItems = ref([
    { key: 'drive', label: 'My Drive', icon: 'fas fa-hdd', active: true, isOpen: true, children: [] },
    // { key: 'shared', label: 'Shared with me', icon: 'fas fa-users' },
    // { key: 'recent', label: 'Recent', icon: 'far fa-clock' },
    // { key: 'starred', label: 'Starred', icon: 'far fa-star' },
    // { key: 'trash', label: 'Trash', icon: 'fas fa-trash-alt' },
]);

// Helper to format size for display
const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Watch for the data to be loaded from the API and then set the initial state
watch(fileSystem, (newFileSystem) => {
    if (newFileSystem) {
        if (breadcrumbs.value.length === 0) {
            breadcrumbs.value = [newFileSystem];
        }

        const driveItem = navigationItems.value.find(item => item.key === 'drive');
        if (driveItem) {
            driveItem.label = newFileSystem.name;
            driveItem.children = (newFileSystem.children || [])
                .filter(item => item.type === 'folder')
                .map(folder => ({
                    ...folder,
                    key: folder.id,
                    label: folder.name,
                    icon: 'fas fa-folder',
                    isOpen: false
                }));
        }
        
        totalSizeUsedInBytes.value = newFileSystem.totalSizeUsed || 0;
        quotaInBytes.value = newFileSystem.quota || 0;
        usedStorage.value = formatSize(totalSizeUsedInBytes.value);
        totalStorage.value = formatSize(quotaInBytes.value);
    }
}, { immediate: true });

const currentFolder = computed(() => breadcrumbs.value.length > 0 ? breadcrumbs.value[breadcrumbs.value.length - 1] : { name: 'Loading...', children: [] });
const currentFolderContent = computed(() => currentFolder.value.children || []);
const storagePercentage = computed(() => {
    if (quotaInBytes.value === 0) return '0%';
    return `${(totalSizeUsedInBytes.value / quotaInBytes.value) * 100}%`;
});

// --- Computed property for Move Dialog Folder Tree ---
const folderTree = computed(() => {
    const tree = [];
    const buildTree = (nodes, depth = 0) => {
        if (!nodes) return;
        for (const node of nodes) {
            if (node.type === 'folder') {
                if (itemToMove.value && node.id === itemToMove.value.id) {
                    continue;
                }
                tree.push({ ...node, depth });
                if (node.children) {
                    buildTree(node.children, depth + 1);
                }
            }
        }
    };
    if (fileSystem.value) {
      tree.push({ ...fileSystem.value, depth: 0 }); // Add root
      buildTree(fileSystem.value.children, 1);
    }
    return tree;
});

// --- Computed property for universal search and display ---
const displayContent = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) {
        return currentFolderContent.value;
    }
    const results = [];
    const searchInNodes = (nodes) => {
        if (!nodes) return;
        for (const node of nodes) {
            if (node.name.toLowerCase().includes(query)) {
                results.push(node);
            }
            if (node.type === 'folder' && node.children) {
                searchInNodes(node.children);
            }
        }
    };
    searchInNodes(fileSystem.value?.children);
    return results;
});


// --- Navigation Actions ---
const openFolder = (folder) => {
    if (folder.type !== 'folder') return;
    breadcrumbs.value.push(folder);
    searchQuery.value = ''; // Clear search when navigating
};

const openFile = (item) => {
    if (item.type !== 'file' || !item.url) return;
    if (item.iconClass?.includes('fa-file-pdf')) {
        viewPdf(item);
    } else {
        window.open(item.url, '_blank');
    }
};

const navigateToBreadcrumb = (index) => {
    breadcrumbs.value.splice(index + 1);
};


// --- Action Handlers ---
const showMenu = (event, item) => {
    menuItems.value = [];

    const baseActions = [
        { label: appConfig.menuActions.move, icon: 'pi pi-folder-open', command: () => confirmMoveItem(item) },
        { label: appConfig.menuActions.rename, icon: 'pi pi-pencil', command: () => confirmRenameItem(item) },
        { separator: true },
        { label: appConfig.menuActions.delete, icon: 'pi pi-trash', command: () => confirmDeleteItem(item) }
    ];

    if (item.type === 'file') {
        const fileActions = [
            { label: appConfig.menuActions.download, icon: 'pi pi-download', command: () => downloadFile(item) },
            { label: appConfig.menuActions.copyPath, icon: 'pi pi-link', command: () => copyPathToClipboard(item) },
            { label: appConfig.menuActions.copyFile, icon: 'pi pi-clone', command: () => copyItem(item) }
        ];
        
        if (item.preview === 'image' || item.iconClass?.includes('fa-file-pdf')) {
            fileActions.unshift({ label: appConfig.menuActions.view, icon: 'pi pi-eye', command: () => viewFile(item) });
        }
        
        menuItems.value = [...fileActions, { separator: true }, ...baseActions];
    } else {
        menuItems.value = baseActions;
    }

    menu.value.toggle(event);
};

const viewFile = (item) => {
    if (item.preview === 'image') {
        viewImage(item);
    } else if (item.iconClass?.includes('fa-file-pdf')) {
        viewPdf(item);
    }
};

const viewImage = (item) => {
    if (item.preview !== 'image' || !item.url) return;
    imageToView.value = item;
    imageViewerVisible.value = true;
};

const viewPdf = (item) => {
    if (!item.iconClass?.includes('fa-file-pdf') || !item.url) return;
    pdfToView.value = item;
    pdfViewerVisible.value = true;
};

const copyPathToClipboard = async (item) => {
    if (!item || !item.url) return;
    try {
        await navigator.clipboard.writeText(item.url);
        toast.add({ ...appConfig.toasts.copyPath.success, life: 3000 });
    } catch (err) {
        toast.add({ ...appConfig.toasts.copyPath.error, life: 3000 });
    }
};

const copyItem = async (item) => {
    if (item.type !== 'file') {
        toast.add({ ...appConfig.toasts.copyItem.warn, life: 3000 });
        return;
    }
    try {
        await $fetch('/api/copy', {
            method: 'POST',
            body: { path: item.id }
        });
        toast.add({ ...appConfig.toasts.copyItem.success, life: 3000 });
        await onActionSuccess();
    } catch (err) {
        const detail = err.data?.error || appConfig.toasts.copyItem.error.detail;
        toast.add({ ...appConfig.toasts.copyItem.error, detail, life: 3000 });
    }
};

const downloadFile = (item) => {
    if (!item || !item.url) return;
    window.location.href = `/api/download?path=${encodeURIComponent(item.url)}`;
};

const confirmDeleteItem = (item) => {
    itemToDelete.value = item;
    deleteDialogVisible.value = true;
};

const confirmRenameItem = (item) => {
    itemToRename.value = item;
    newItemName.value = item.name;
    renameDialogVisible.value = true;
};

const confirmMoveItem = (item) => {
    itemToMove.value = item;
    selectedDestination.value = null;
    moveDialogVisible.value = true;
};

const deleteItem = async () => {
    if (!itemToDelete.value) return;
    try {
        await $fetch(`/api/files?path=${encodeURIComponent(itemToDelete.value.id)}`, { method: 'DELETE' });
        toast.add({ ...appConfig.toasts.deleteItem.success, life: 3000 });
        await onActionSuccess();
    } catch (err) {
        const detail = err.data?.error || appConfig.toasts.deleteItem.error.detail;
        toast.add({ ...appConfig.toasts.deleteItem.error, detail, life: 3000 });
    } finally {
        deleteDialogVisible.value = false;
        itemToDelete.value = null;
    }
};

const renameItem = async () => {
    if (!itemToRename.value || !newItemName.value.trim()) return;
    try {
        await $fetch(`/api/files`, {
            method: 'PATCH',
            body: {
                path: itemToRename.value.id,
                newName: newItemName.value.trim()
            }
        });
        toast.add({ ...appConfig.toasts.renameItem.success, life: 3000 });
        await onActionSuccess();
    } catch (err) {
        const detail = err.data?.error || appConfig.toasts.renameItem.error.detail;
        toast.add({ ...appConfig.toasts.renameItem.error, detail, life: 3000 });
    } finally {
        renameDialogVisible.value = false;
        itemToRename.value = null;
        newItemName.value = '';
    }
};

const moveItem = async () => {
    if (!itemToMove.value || !selectedDestination.value) return;
    try {
        await $fetch('/api/files', {
            method: 'PUT',
            body: {
                sourcePath: itemToMove.value.id,
                destinationPath: selectedDestination.value
            }
        });
        toast.add({ ...appConfig.toasts.moveItem.success, life: 3000 });
        await onActionSuccess();
    } catch (err) {
        const detail = err.data?.error || appConfig.toasts.moveItem.error.detail;
        toast.add({ ...appConfig.toasts.moveItem.error, detail, life: 3000 });
    } finally {
        moveDialogVisible.value = false;
        itemToMove.value = null;
        selectedDestination.value = null;
    }
};

const onActionSuccess = async () => {
    const currentPathIds = breadcrumbs.value.map(crumb => crumb.id);
    await refresh();

    let currentLevel = fileSystem.value;
    const newBreadcrumbs = [];

    if (currentLevel) {
        for (const id of currentPathIds) {
            const foundNode = (id === currentLevel.id) 
                ? currentLevel 
                : currentLevel.children?.find(child => child.id === id);

            if (foundNode) {
                newBreadcrumbs.push(foundNode);
                currentLevel = foundNode;
            } else {
                breadcrumbs.value = [fileSystem.value];
                return;
            }
        }
        breadcrumbs.value = newBreadcrumbs;
    }

    uploadDialogVisible.value = false;
    newFolderDialogVisible.value = false;
    renameDialogVisible.value = false;
    newFolderName.value = '';
};

const createFolder = async () => {
    const name = newFolderName.value.trim();
    if (!name) return;
    try {
        await $fetch('/api/folders', {
            method: 'POST',
            body: { 
                name: name,
                parentPath: currentFolder.value.id === 'root' ? '/uploads' : currentFolder.value.id
            }
        });
        toast.add({ ...appConfig.toasts.createFolder.success, life: 3000 });
        await onActionSuccess();
    } catch (err) {
        const detail = err.data?.error || appConfig.toasts.createFolder.error.detail;
        toast.add({ ...appConfig.toasts.createFolder.error, detail, life: 3000 });
    }
};

const handleBeforeUpload = (event) => {
    const parentPath = currentFolder.value.id === 'root' ? '/uploads' : currentFolder.value.id;
    event.formData.append('parentPath', parentPath);
};

const onUploadSuccess = async () => {
    toast.add({ ...appConfig.toasts.upload.success, life: 3000 });
    await onActionSuccess();
};

const toggleNode = (item) => {
    if (item.children) {
        item.isOpen = !item.isOpen;
    }
    
    const findFolderById = (nodes, id) => {
        for(const node of nodes) {
            if(node.id === id) return node;
            if(node.children) {
                const found = findFolderById(node.children, id);
                if(found) return found;
            }
        }
        return null;
    };

    if (item.key === 'drive') {
        navigateToBreadcrumb(0);
        return;
    }
    
    const targetFolder = findFolderById(fileSystem.value.children, item.id);
    if (targetFolder) {
        const newCrumbs = [fileSystem.value];
        const pathParts = targetFolder.id.split('/').filter(p => p && p !== 'uploads');
        let currentLevel = fileSystem.value;

        for (const part of pathParts) {
            const nextLevel = currentLevel.children.find(c => c.name === part);
            if (nextLevel) {
                newCrumbs.push(nextLevel);
                currentLevel = nextLevel;
            }
        }
        breadcrumbs.value = newCrumbs;
    }
};

// --- Centralized App Configuration for Text and Styles ---
const appConfig = {
    general: {
        appName: 'Arquivos',
        rootFolderName: 'My Drive'
    },
    grid: {
        columns: 'grid-cols-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    },
    dialogs: {
        newFolder: { header: 'Nova pasta', label: 'Nome da pasta' },
        rename: { header: 'Renomear', label: 'Novo nome' },
        move: { header: 'Move Item' },
        upload: { header: 'Upload Files', empty: 'Drag and drop files to here to upload.' },
        delete: { header: 'Confirm Deletion', message: 'Are you sure you want to delete this item?' }
    },
    buttons: {
        upload: 'Enviar',
        newFolder: 'Nova pasta',
        cancel: 'Cancelar',
        create: 'Criar',
        save: 'Salvar',
        move: 'Mover pra cá',
        delete: 'Excluir',
        close: 'Fechar',
        collapse: 'Fechar'
    },
    toasts: {
        copyPath: {
          success: { severity: 'info', summary: 'Copied', detail: 'File path copied to clipboard' },
          error: { severity: 'error', summary: 'Error', detail: 'Could not copy path.' }
        },
        copyItem: {
            success: { severity: 'success', summary: 'Success', detail: 'File copied successfully' },
            error: { severity: 'error', summary: 'Error', detail: 'Could not copy file.' },
            warn: { severity: 'warn', summary: 'Info', detail: 'Copying folders is not yet supported.' }
        },
        deleteItem: {
            success: { severity: 'success', summary: 'Success', detail: 'Item deleted' },
            error: { severity: 'error', summary: 'Error', detail: 'Could not delete item.' }
        },
        renameItem: {
            success: { severity: 'success', summary: 'Success', detail: 'Item renamed' },
            error: { severity: 'error', summary: 'Error', detail: 'Could not rename item.' }
        },
        moveItem: {
            success: { severity: 'success', summary: 'Success', detail: 'Item moved' },
            error: { severity: 'error', summary: 'Error', detail: 'Could not move item.' }
        },
        createFolder: {
            success: { severity: 'success', summary: 'Success', detail: 'Folder created successfully' },
            error: { severity: 'error', summary: 'Error', detail: 'Could not create folder.' }
        },
        upload: {
            success: { severity: 'success', summary: 'Success', detail: 'File(s) uploaded' }
        }
    },
    menuActions: {
        view: 'Ver',
        download: 'Baixar',
        copyFile: 'Make a Copy',
        copyPath: 'Copy Path',
        move: 'Move',
        rename: 'Rename',
        delete: 'Delete'
    },
    dialogStyles: {
        root: { class: 'border-none rounded-lg shadow-2xl bg-gray-900' },
        header: { class: 'bg-gray-800 text-gray-100 p-4 rounded-t-lg flex items-center justify-between' },
        content: { class: 'bg-gray-900 text-gray-200 p-6' },
        footer: { class: 'bg-gray-800 text-gray-100 p-4 rounded-b-lg text-right' },
        closebutton: { class: 'w-8 h-8 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500' },
        closebuttonicon: { class: 'w-4 h-4' }
    }
};

</script>

<style scoped>
/* You can add component-specific styles here.
  The global styles from the original HTML (like the scrollbar) should be placed
  in a global CSS file (e.g., `assets/css/main.css`) and imported in `nuxt.config.ts`.
*/
</style>
