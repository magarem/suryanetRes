// Save this file as `server/api/upload.post.ts`

import { defineEventHandler, readMultipartFormData } from 'h3';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Sanitizes a filename by removing special characters and normalizing spaces.
 * @param filename The original filename (e.g., "My File (2025)!.jpg")
 * @returns A clean, URL-friendly filename (e.g., "my-file-2025.jpg")
 */
function sanitizeFilename(filename: string): string {
  const name = path.basename(filename, path.extname(filename));
  const extension = path.extname(filename);

  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove all characters that are not letters, numbers, spaces, or hyphens
    .trim()
    .replace(/\s+/g, '-'); // Replace one or more spaces with a single hyphen

  return sanitizedName + extension.toLowerCase();
}


export default defineEventHandler(async (event) => {
  const {user} = await requireUserSession(event);
  try {
    const formData = await readMultipartFormData(event);

    if (!formData) {
      throw new Error('No form data received.');
    }

    let relativeParentPath = ''; // Start with an empty path for the root of the user's drive
    const pathPart = formData.find(p => p.name === 'parentPath');
    
    if (pathPart && pathPart.data) {
        relativeParentPath = pathPart.data.toString();
    }

    const baseUploadsDir = path.resolve(process.cwd(), 'server', 'mydrive', user.domain);
    // We join the user's domain and the relative path to get the final destination
    const destinationDir = path.join(baseUploadsDir, relativeParentPath);

    if (!destinationDir.startsWith(path.join(baseUploadsDir))) {
      event.node.res.statusCode = 400;
      return { error: 'Invalid upload path specified.' };
    }

     if (!fs.existsSync(destinationDir)) {
          fs.mkdirSync(destinationDir, { recursive: true });
     }

    const uploadedFileDetails = [];
    for (const part of formData) {
      if (part.filename) {
        
        // --- CHANGE 1: Sanitize the filename ---
        const sanitizedFilename = sanitizeFilename(part.filename);

        // --- CHANGE 2: Use the sanitized filename to create the file path ---
        const filePath = path.join(destinationDir, sanitizedFilename);
        fs.writeFileSync(filePath, part.data);
        
        uploadedFileDetails.push({
          name: sanitizedFilename, // Return the new name
          size: part.data.length,
          type: part.type,
          // --- CHANGE 3: Use the sanitized filename for the URL ---
          url: `${relativeParentPath}/${sanitizedFilename}`
        });
      }
    }

    if (uploadedFileDetails.length === 0) {
      event.node.res.statusCode = 400;
      return { error: 'No files were uploaded.' };
    }

    event.node.res.statusCode = 200;
    return {
      message: `Successfully uploaded ${uploadedFileDetails.length} file(s).`,
      files: uploadedFileDetails
    };

  } catch (error) {
    console.error('Error handling file upload:', error);
    event.node.res.statusCode = 500;
    return { error: 'An internal server error occurred.' };
  }
});