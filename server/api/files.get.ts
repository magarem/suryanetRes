// Save this file as `server/api/files.get.ts`
// This version recursively scans `server/mydrive` for all folders and files.

import { defineEventHandler } from 'h3';
import fs from 'node:fs/promises';
import path from 'node:path';

// Helper to format file size into a readable string
const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to determine the file type and icon based on its extension
const getFileTypeInfo = (extension) => {
    const ext = extension.toLowerCase();
    
    if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
        return { preview: 'image' };
    }
    if (['.doc', '.docx'].includes(ext)) {
        return { preview: 'icon', iconClass: 'far fa-file-word', colorClass: 'bg-blue-500/20 text-blue-400' };
    }
    if (['.pdf'].includes(ext)) {
        return { preview: 'icon', iconClass: 'far fa-file-pdf', colorClass: 'bg-red-500/20 text-red-400' };
    }
    if (['.xls', '.xlsx', '.csv'].includes(ext)) {
        return { preview: 'icon', iconClass: 'far fa-file-excel', colorClass: 'bg-green-500/20 text-green-400' };
    }
    return { preview: 'icon', iconClass: 'far fa-file', colorClass: 'bg-gray-500/20 text-gray-400' };
};


/**
 * Recursively scans a directory.
 * @returns An object containing the children and the total size in bytes.
 */
async function scanDirectory(dirPath, publicPath) {
    let totalSize = 0;
    const dirents = await fs.readdir(dirPath, { withFileTypes: true });

    const childPromises = dirents.map(async (dirent) => {
        const fullPath = path.join(dirPath, dirent.name);
        const currentPublicPath = `${publicPath}/${dirent.name}`;

        if (dirent.isDirectory()) {
            const subDirInfo = await scanDirectory(fullPath, currentPublicPath);
            totalSize += subDirInfo.size; // Add size from subdirectory
            return {
                id: currentPublicPath,
                type: 'folder',
                name: dirent.name,
                children: subDirInfo.children,
            };
        } else if (dirent.isFile()) {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size; // Add file size
            return {
                id: currentPublicPath,
                type: 'file',
                name: dirent.name,
                size: formatSize(stats.size),
                url: currentPublicPath,
                ...getFileTypeInfo(path.extname(dirent.name)),
            };
        }
        return null;
    });

    const children = (await Promise.all(childPromises)).filter(Boolean);
    return { children, size: totalSize };
}


export default defineEventHandler(async (event) => {
    // This now points directly to the `mydrive` folder.
    const {user} = await requireUserSession(event);
    const myDrivePath = path.resolve(process.cwd(), 'server', 'mydrive', user.domain);
console.log('Scanning My Drive at:', myDrivePath);
    try {
        // Check if the base directory exists
        await fs.access(myDrivePath);
        
        // Scan the directory and get its contents and total size
        const { children, size } = await scanDirectory(myDrivePath, '');

        // Example Quota: 100 GB in bytes.
        const quota = 100 * 1024 * 1024 * 1024; 

        return {
            id: 'root',
            name: 'My Drive',
            type: 'folder',
            children: children,
            totalSizeUsed: size,
            quota: quota,
        };

    } catch (error) {
        // If the `mydrive` directory doesn't exist, create it and return an empty state.
        if (error.code === 'ENOENT') {
            await fs.mkdir(myDrivePath, { recursive: true });
            return { 
                id: 'root', 
                name: 'My Drive', 
                type: 'folder', 
                children: [], 
                totalSizeUsed: 0, 
                quota: 100 * 1024 * 1024 * 1024 
            };
        }
        
        // Handle other potential errors
        console.error('Error reading mydrive directory:', error);
        event.node.res.statusCode = 500;
        return { error: 'Could not list files from the server.' };
    }
});