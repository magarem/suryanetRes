// Save this file as `server/api/files.delete.ts`

import { defineEventHandler, getQuery } from 'h3';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    // 1. Get the file path from the query string (e.g., /api/files?path=/uploads/image.png)
    const query = getQuery(event);
    const relativePath = query.path as string;

    // 2. Validate the input
    if (!relativePath || typeof relativePath !== 'string') {
        event.node.res.statusCode = 400; // Bad Request
        return { error: 'File path is required.' };
    }

    // 3. Define the base path and safely construct the absolute path
    const baseUploadsDir = path.resolve(process.cwd(), '.', 'public');
    const absolutePath = path.join(baseUploadsDir, relativePath);

    // 4. **SECURITY CHECK**: Ensure the path is within the allowed uploads directory
    if (!absolutePath.startsWith(baseUploadsDir)) {
        event.node.res.statusCode = 403; // Forbidden
        return { error: 'Access denied. Invalid path.' };
    }
    
    // Prevent deleting the root /uploads folder itself
    if (absolutePath === path.resolve(baseUploadsDir, 'mydrive')) {
        event.node.res.statusCode = 400;
        return { error: 'Cannot delete the root uploads directory.' };
    }

    try {
        // 5. Use lstat to check if the path is a directory or a file without following symlinks
        const stats = await fs.lstat(absolutePath);

        // 6. Delete the file or folder
        if (stats.isDirectory()) {
            // --- NEW: Safety Check for Folders ---
            // Read the contents of the directory
            const files = await fs.readdir(absolutePath);

            // If the directory is not empty, return an error
            if (files.length > 0) {
                event.node.res.statusCode = 400; // Bad Request
                return { error: 'Folder is not empty. Please delete its contents first.' };
            }

            // If the directory is empty, proceed with deleting it
            await fs.rmdir(absolutePath);
        } else {
            // If it's a file, just delete it
            await fs.unlink(absolutePath);
        }

        // 7. Return success response
        event.node.res.statusCode = 200;
        return { message: 'Item deleted successfully.' };

    } catch (error) {
        if (error.code === 'ENOENT') {
            // File or folder not found
            event.node.res.statusCode = 404;
            return { error: 'Item not found.' };
        }
        
        console.error(`Error deleting item at path: ${absolutePath}`, error);
        event.node.res.statusCode = 500; // Internal Server Error
        return { error: 'An internal server error occurred while deleting the item.' };
    }
});
