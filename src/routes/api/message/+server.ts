import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();
  console.log('Received message:', message);
  // Handle the message here
  return new Response(JSON.stringify({ message: 'Message received!' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};