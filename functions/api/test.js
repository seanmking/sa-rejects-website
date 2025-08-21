// Simple test endpoint
export async function onRequestGet(context) {
  return new Response('SA REJECTS Functions are working!', {
    headers: { 'Content-Type': 'text/plain' }
  });
}