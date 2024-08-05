// src/hooks.js
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ request, resolve }) => {
  const response = await resolve(request);

  // Set CORS headers globally
  response.headers.append('Access-Control-Allow-Origin', '*');
  response.headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.append('Access-Control-Allow-Headers', 'Content-Type');

  return response;
};
