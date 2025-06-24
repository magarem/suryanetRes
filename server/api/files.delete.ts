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
        return { error: 'Defina o caminho do arquivo' };
    }

    // 3. Define the base path and safely construct the absolute path
    const baseUploadsDir = path.resolve(process.cwd(), '.', 'public');
    const absolutePath = path.join(baseUploadsDir, relativePath);

    // 4. **SECURITY CHECK**: Ensure the path is within the allowed uploads directory
    if (!absolutePath.startsWith(baseUploadsDir)) {
        event.node.res.statusCode = 403; // Forbidden
        return { error: 'Acesso negado.' };
    }
    
    // Prevent deleting the root /uploads folder itself
    if (absolutePath === path.resolve(baseUploadsDir, 'uploads')) {
        event.node.res.statusCode = 400;
        return { error: 'Não é possível excluir a pasta raíz' };
    }

    try {
        // 5. Check if the file or folder exists
        const stats = await fs.stat(absolutePath);

        // 6. Delete the file or folder (recursively for folders)
        if (stats.isDirectory()) {
            await fs.rm(absolutePath); //{ recursive: true, force: true }
        } else {
            await fs.unlink(absolutePath);
        }

        // 7. Return success response
        event.node.res.statusCode = 200;
        return { message: 'Item excluido com sucesso' };

    } catch (error) {
        if (error.code === 'ENOENT') {
            // File or folder not found
            event.node.res.statusCode = 404;
            return { error: 'Item not found.' };
        }
        
        console.error(`Erro: ${absolutePath}`, error);
        event.node.res.statusCode = 500; // Internal Server Error
        return { error: 'Erro.' };
    }
});
