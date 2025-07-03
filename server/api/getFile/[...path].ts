// File: server/api/getFile/[...path].ts

import { defineEventHandler, setHeader, sendStream, createError } from 'h3';
import { createReadStream, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import mime from 'mime';

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event);
  // 1. Get the path from the URL. It will be a string like "folderA/image.png".
  const filePathFromUrl = event.context.params?.path;

  if (!filePathFromUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: No file path provided.' });
  }

  // 2. Define a secure, absolute path to your base "mydrive" directory.
  const myDriveRoot = resolve(process.cwd(), 'server', 'mydrive', user.domain);

  // 3. Create the full, absolute path to the requested file.
  const requestedFilePath = join(myDriveRoot, filePathFromUrl);

  // 4. SECURITY CHECK: Ensure the requested path is still inside your "mydrive" folder.
  // This prevents users from accessing files outside the intended directory (e.g., using `../../...`).
  if (!requestedFilePath.startsWith(myDriveRoot)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Access is denied.' });
  }

  try {
    // 5. Check if the file exists and get its stats.
    const stats = statSync(requestedFilePath);
    if (!stats.isFile()) {
        throw new Error('Path is not a file');
    }

    // 6. Determine the content type using the `mime` library for accuracy.
    const contentType = mime.getType(requestedFilePath) || 'application/octet-stream';
    setHeader(event, 'Content-Type', contentType);
    setHeader(event, 'Content-Length', stats.size);

    // 7. Stream the file back to the user. This is more memory-efficient than readFile.
    return sendStream(event, createReadStream(requestedFilePath));

  } catch (error) {
    // If statSync or createReadStream fails, the file likely doesn't exist.
    throw createError({ statusCode: 404, statusMessage: 'File not found.' });
  }
});