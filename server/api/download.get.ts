// Save this file as `server/api/download.get.ts`

import { defineEventHandler, getQuery, setHeader, sendStream } from 'h3';
import fs from 'node:fs';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    // 1. Get the file path from the query string
    const query = getQuery(event);
    const relativePath = query.path as string;

    // 2. Validate input
    if (!relativePath || typeof relativePath !== 'string') {
        event.node.res.statusCode = 400;
        return { error: 'File path is required.' };
    }

    // 3. Define base path and construct absolute path
    const baseUploadsDir = path.resolve(process.cwd(), '.', 'public');
    const absolutePath = path.join(baseUploadsDir, relativePath);

    // 4. **SECURITY CHECK**: Ensure path is within the allowed directory
    if (!absolutePath.startsWith(baseUploadsDir)) {
        event.node.res.statusCode = 403;
        return { error: 'Access denied. Invalid path.' };
    }

    try {
        // 5. Check if the file exists and is actually a file
        const stats = fs.statSync(absolutePath);
        if (!stats.isFile()) {
            event.node.res.statusCode = 400;
            return { error: 'The specified path is not a file.' };
        }

        // 6. Set headers for file download
        setHeader(event, 'Content-Disposition', `attachment; filename="${path.basename(absolutePath)}"`);
        setHeader(event, 'Content-Type', 'application/octet-stream');
        setHeader(event, 'Content-Length', stats.size.toString());

        // 7. Stream the file back to the client
        return sendStream(event, fs.createReadStream(absolutePath));

    } catch (error){
        if (error.code === 'ENOENT') {
            event.node.res.statusCode = 404;
            return { error: 'File not found.' };
        }

        console.error(`Error streaming file at path: ${absolutePath}`, error);
        event.node.res.statusCode = 500;
        return { error: 'An internal server error occurred while preparing the download.' };
    }
});
