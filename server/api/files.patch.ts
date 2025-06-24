// Save this file as `server/api/files.patch.ts`

import { defineEventHandler, readBody } from 'h3';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    // 1. Read the current path and the desired new name from the request body.
    const body = await readBody(event);
    const { path: relativePath, newName } = body;

    // 2. Validate the inputs.
    if (!relativePath || !newName || typeof newName !== 'string' || newName.trim().length === 0) {
        event.node.res.statusCode = 400; // Bad Request
        return { error: 'Both current path and new name are required.' };
    }

    // 3. Sanitize the new name to prevent security issues.
    // This regular expression now allows dots but still removes slashes and colons.
    const sanitizedNewName = newName.replace(/[\\/:]/g, '').trim();
    if (!sanitizedNewName) {
        event.node.res.statusCode = 400;
        return { error: 'New name contains invalid characters.' };
    }

    // 4. Define the base path and construct safe, absolute paths for the old and new locations.
    const baseUploadsDir = path.resolve(process.cwd(), '.', 'public');
    const oldAbsolutePath = path.join(baseUploadsDir, relativePath);
    const newAbsolutePath = path.join(path.dirname(oldAbsolutePath), sanitizedNewName);

    // 5. **SECURITY CHECK**: Ensure both paths are within the allowed uploads directory.
    if (!oldAbsolutePath.startsWith(baseUploadsDir) || !newAbsolutePath.startsWith(baseUploadsDir)) {
        event.node.res.statusCode = 403; // Forbidden
        return { error: 'Access denied. Invalid path.' };
    }

    try {
        // 6. Check if the original item exists.
        await fs.access(oldAbsolutePath);

        // 7. Check if an item with the new name already exists in the same directory.
        try {
            await fs.access(newAbsolutePath);
            event.node.res.statusCode = 409; // Conflict
            return { error: `An item named '${sanitizedNewName}' already exists.` };
        } catch (e) {
            if (e.code !== 'ENOENT') throw e; // Re-throw unexpected errors.
        }

        // 8. Perform the rename operation.
        await fs.rename(oldAbsolutePath, newAbsolutePath);

        // 9. Return a success response.
        return { message: 'Item renamed successfully.' };

    } catch (error) {
        if (error.code === 'ENOENT') {
            event.node.res.statusCode = 404;
            return { error: 'Original item not found.' };
        }
        console.error('Error renaming item:', error);
        event.node.res.statusCode = 500;
        return { error: 'An internal server error occurred while renaming the item.' };
    }
});
