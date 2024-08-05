import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();
  console.log('Received message:', message);
  // Handle the message here
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Allow any origin during development
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Preflight request handling (OPTIONS method)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Actual request handling
  return new Response(JSON.stringify({ message: 'Message received!' }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
};
