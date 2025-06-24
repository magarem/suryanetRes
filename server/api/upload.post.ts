// Save this file as `server/api/upload.post.ts`

import { defineEventHandler, readMultipartFormData } from 'h3';
import path from 'node:path';
import fs from 'node:fs';

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event);

    if (!formData) {
      throw new Error('No form data received.');
    }

    // --- Logic to determine destination path ---
    let relativeParentPath = '/uploads'; // Default to root
    const pathPart = formData.find(p => p.name === 'parentPath');
    
    // The part's data is a buffer, so we convert it to a string.
    if (pathPart && pathPart.data) {
        relativeParentPath = pathPart.data.toString();
    }

    // --- Security and Path Handling ---
    const baseUploadsDir = path.resolve(process.cwd(), '.', 'public');
    const destinationDir = path.join(baseUploadsDir, relativeParentPath);

    // **SECURITY CHECK**: Ensure the destination is within the allowed base directory.
    if (!destinationDir.startsWith(baseUploadsDir)) {
      event.node.res.statusCode = 400;
      return { error: 'Invalid upload path specified.' };
    }

    // Ensure destination directory exists.
     if (!fs.existsSync(destinationDir)) {
          fs.mkdirSync(destinationDir, { recursive: true });
     }
    // --- End Security ---

    const uploadedFileDetails = [];
    for (const part of formData) {
      if (part.filename) {
        const filePath = path.join(destinationDir, part.filename);
        fs.writeFileSync(filePath, part.data);
        
        uploadedFileDetails.push({
          name: part.filename,
          size: part.data.length,
          type: part.type,
          url: `${relativeParentPath}/${part.filename}`
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
