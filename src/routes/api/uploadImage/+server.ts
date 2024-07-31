import { json } from '@sveltejs/kit';
import { writeFile, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import mime from 'mime-types';
import { pb } from '$utils/pocketbase'; // Adjust the import path as needed

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const data = await request.formData();
    const file = data.get('image');
    const noteId = data.get('noteId');

    if (!file) {
      console.error('No file received');
      return json({ success: 0, error: 'No file received' });
    }

    // Detect the file type
    const fileType = mime.extension(file.type);
    if (!fileType || !['jpg', 'jpeg', 'png', 'svg', 'webp', 'avif', 'ico', 'gif'].includes(fileType)) {
      console.error('Invalid file type');
      return json({ success: 0, error: 'Invalid file type' });
    }

    const filename = `${randomUUID()}.${fileType}`;
    const path = `src/static/uploads/${filename}`;

    // Save file locally
    const contents = await file.arrayBuffer();
    await writeFile(path, Buffer.from(contents));

    // Read the file back for PocketBase upload
    const fileBuffer = await readFile(path);

    // Create a new FormData instance for PocketBase
    const pbFormData = new FormData();
    pbFormData.append('file', new Blob([fileBuffer], { type: file.type }), filename);
    if (noteId) {
      pbFormData.append('note', noteId);
    }

    // Upload the file to PocketBase
    const image = await pb.collection('images').create(pbFormData);

    // Get the file URL from PocketBase
    const fileUrlDb = pb.files.getUrl(image, image.file);

    console.log('File saved successfully:', filename);
    console.log('PocketBase image record:', image);
    console.log('PocketBase file URL:', fileUrlDb);

    return json({
      success: 1,
      file: {
        localUrl: `/uploads/${filename}`,
        url: fileUrlDb,
        id: image.id
      }
    });
  } catch (error) {
    console.error('Error in file upload:', error);
    return json({ success: 0, error: error.message });
  }
}