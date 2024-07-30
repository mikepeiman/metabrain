import { json } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';
import mime from 'mime-types';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { url } = await request.json();

  if (!url) {
    return json({ success: 0, error: 'No URL provided' });
  }

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Detect the file type from the Content-Type header
    const contentType = response.headers.get('content-type');
    const fileType = mime.extension(contentType);

    if (!fileType || !['jpg', 'jpeg', 'png', 'svg', 'webp', 'avif'].includes(fileType)) {
      console.error('Invalid file type');
      return json({ success: 0, error: 'Invalid file type' });
    }

    const filename = `${randomUUID()}.${fileType}`;
    const path = `src/static/uploads/${filename}`;

    await writeFile(path, buffer);

    return json({
      success: 1,
      file: {
        url: `/uploads/${filename}`
      }
    });
  } catch (error) {
    console.error('Error fetching and saving image:', error);
    return json({ success: 0, error: error.message });
  }
}