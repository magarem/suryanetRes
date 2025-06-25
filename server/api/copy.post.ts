// Save this file as `server/api/copy.post.ts`

import { defineEventHandler, readBody } from 'h3';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Finds an available filename for a copy to avoid overwrites.
 * e.g., 'image.png' -> 'image (copy).png' -> 'image (copy 2).png'
 * @param filePath The original absolute path of the file.
 * @returns A promise that resolves to an available absolute path for the copy.
 */
async function getAvailableCopyName(filePath: string): Promise<string> {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);

    let copyNum = 1;
    let newName = `${baseName} (copy)${ext}`;
    let newPath = path.join(dir, newName);

    // Loop until we find a name that doesn't exist
    while (true) {
        try {
            await fs.access(newPath); // Check if file exists
            copyNum++;
            newName = `${baseName} (copy ${copyNum})${ext}`;
            newPath = path.join(dir, newName);
        } catch (error) {
            // If the error is ENOENT, the file doesn't exist, so we found our name
            if (error.code === 'ENOENT') {
                return newPath;
            }
            // For any other error, we should stop
            throw error;
        }
    }
}


export default defineEventHandler(async (event) => {
    // 1. Read the source path from the request body.
    const body = await readBody(event);
    const { path: sourceRelativePath } = body;

    // 2. Validate the input.
    if (!sourceRelativePath || typeof sourceRelativePath !== 'string') {
        event.node.res.statusCode = 400; // Bad Request
        return { error: 'Source file path is required.' };
    }

    // 3. Define the base path and construct the absolute path for the source file.
    const baseUploadsDir = path.resolve(process.cwd(), '.', 'public');
    const sourceAbsolutePath = path.join(baseUploadsDir, sourceRelativePath);

    // 4. **SECURITY CHECK**: Ensure the source path is within the allowed uploads directory.
    if (!sourceAbsolutePath.startsWith(baseUploadsDir)) {
        event.node.res.statusCode = 403; // Forbidden
        return { error: 'Access denied. Invalid path.' };
    }
    
    try {
        // 5. Check if the source path points to a file.
        const stats = await fs.stat(sourceAbsolutePath);
        if (!stats.isFile()) {
            event.node.res.statusCode = 400;
            return { error: 'The specified path is not a file and cannot be copied.' };
        }

        // 6. Get a unique name for the new copy.
        const destinationAbsolutePath = await getAvailableCopyName(sourceAbsolutePath);

        // 7. Perform the copy operation.
        await fs.copyFile(sourceAbsolutePath, destinationAbsolutePath);

        // 8. Return a success response.
        return { message: 'File copied successfully.' };

    } catch (error) {
        if (error.code === 'ENOENT') {
            event.node.res.statusCode = 404;
            return { error: 'Source file not found.' };
        }
        console.error('Error copying file:', error);
        event.node.res.statusCode = 500;
        return { error: 'An internal server error occurred while copying the file.' };
    }
});
