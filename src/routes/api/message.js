import type { RequestHandler } from './$types';

// Function to set CORS headers
function setCORSHeaders(request, response) {
  // Replace '*' with your specific origins or keep it for development/testing
  const allowedOrigin = request.headers.get('origin') || '*';
  
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
}

export const POST: RequestHandler = async ({ request }) => {
  setCORSHeaders(request, new Response());
  
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

export const OPTIONS: RequestHandler = () => {
  // Preflight request handler
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Adjust as necessary
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
