import { json } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import mime from 'mime-types';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const data = await request.formData();
    const file = data.get('image');

    if (!file) {
      console.error('No file received');
      return json({ success: 0, error: 'No file received' });
    }

    // Detect the file type
    const fileType = mime.extension(file.type);
    if (!fileType || !['jpg', 'jpeg', 'png', 'svg', 'webp', 'avif'].includes(fileType)) {
      console.error('Invalid file type');
      return json({ success: 0, error: 'Invalid file type' });
    }

    const filename = `${randomUUID()}.${fileType}`;
    const path = `src/static/uploads/${filename}`;

    const contents = await file.arrayBuffer();
    await writeFile(path, Buffer.from(contents));

    console.log('File saved successfully:', filename);
    return json({
      success: 1,
      file: {
        url: `/uploads/${filename}`
      }
    });
  } catch (error) {
    console.error('Error in file upload:', error);
    return json({ success: 0, error: error.message });
  }
}