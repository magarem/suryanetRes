// Save this file as `server/api/folders.post.ts`

import { defineEventHandler, readBody } from 'h3';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, parentPath } = body; // Expect 'name' and the 'parentPath' of the directory to create in.

  // 1. Validate inputs
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    event.node.res.statusCode = 400; // Bad Request
    return { error: 'Folder name is required.' };
  }

  // 2. Define the absolute base path for all uploads.
  const baseUploadsDir = path.resolve(process.cwd(), '.', 'public');
  
  // 3. Determine the relative parent path, defaulting to the root '/uploads' folder.
  const relativeParentPath = parentPath && typeof parentPath === 'string' ? parentPath : '/uploads';
  
  // 4. Safely construct the absolute path for the parent directory.
  const parentDir = path.join(baseUploadsDir, relativeParentPath);

  // 5. **SECURITY CHECK**: Ensure the resolved path is within the base uploads directory.
  if (!parentDir.startsWith(baseUploadsDir)) {
      event.node.res.statusCode = 400;
      return { error: 'Invalid path specified.' };
  }

  // 6. Sanitize the new folder name to prevent path traversal and other issues.
  const sanitizedName = name.replace(/[\\/.:]/g, '').trim();
  if (!sanitizedName) {
    event.node.res.statusCode = 400;
    return { error: 'Folder name contains invalid characters.' };
  }

  const newFolderPath = path.join(parentDir, sanitizedName);

  try {
    // 7. Check if the folder already exists.
    await fs.access(newFolderPath);
    // If fs.access doesn't throw, the folder exists.
    event.node.res.statusCode = 409; // Conflict
    return { error: `A folder named '${sanitizedName}' already exists.` };
  } catch (accessError) {
    // This is the expected outcome if the folder does not exist.
    if (accessError.code !== 'ENOENT') {
      throw accessError; // Re-throw unexpected errors.
    }
  }

  // 8. Create the directory.
  try {
    await fs.mkdir(newFolderPath);
    event.node.res.statusCode = 201; // Created
    return { message: 'Folder created successfully.' };
  } catch (mkdirError) {
    console.error('Error creating folder:', mkdirError);
    event.node.res.statusCode = 500;
    return { error: 'An internal server error occurred while creating the folder.' };
  }
});
