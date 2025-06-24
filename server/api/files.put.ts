// Save this file as `server/api/files.put.ts`

import { defineEventHandler, readBody } from 'h3';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    // 1. Read the source item's path and the destination folder's path.
    const body = await readBody(event);
    const { sourcePath, destinationPath } = body;

    // 2. Validate inputs.
    if (!sourcePath || !destinationPath) {
        event.node.res.statusCode = 400;
        return { error: 'Source and destination paths are required.' };
    }

    // 3. Define the base path and construct safe, absolute paths.
    const baseUploadsDir = path.resolve(process.cwd(), '.', 'public');
    const oldAbsolutePath = path.join(baseUploadsDir, sourcePath);
    const destinationAbsolutePath = path.join(baseUploadsDir, destinationPath);

    // 4. **SECURITY CHECK**: Ensure all paths are within the allowed uploads directory.
    if (!oldAbsolutePath.startsWith(baseUploadsDir) || !destinationAbsolutePath.startsWith(baseUploadsDir)) {
        event.node.res.statusCode = 403;
        return { error: 'Access denied. Invalid path.' };
    }

    // 5. Construct the final new path for the item.
    const itemName = path.basename(oldAbsolutePath);
    const newAbsolutePath = path.join(destinationAbsolutePath, itemName);

    // Prevent moving a folder into itself
    if (newAbsolutePath.startsWith(oldAbsolutePath + path.sep)) {
        event.node.res.statusCode = 400;
        return { error: 'Cannot move a folder into itself.' };
    }

    try {
        // 6. Check if the source item exists.
        await fs.access(oldAbsolutePath);

        // 7. Check if the destination is a directory.
        const destStats = await fs.stat(destinationAbsolutePath);
        if (!destStats.isDirectory()) {
            event.node.res.statusCode = 400;
            return { error: 'Destination must be a folder.' };
        }

        // 8. Check if an item with the same name already exists at the destination.
        try {
            await fs.access(newAbsolutePath);
            event.node.res.statusCode = 409; // Conflict
            return { error: `An item named '${itemName}' already exists in the destination.` };
        } catch (e) {
            if (e.code !== 'ENOENT') throw e;
        }

        // 9. Perform the move operation.
        await fs.rename(oldAbsolutePath, newAbsolutePath);

        // 10. Return a success response.
        return { message: 'Item moved successfully.' };

    } catch (error) {
        if (error.code === 'ENOENT') {
            event.node.res.statusCode = 404;
            return { error: 'Source item or destination folder not found.' };
        }
        console.error('Error moving item:', error);
        event.node.res.statusCode = 500;
        return { error: 'An internal server error occurred while moving the item.' };
    }
});
