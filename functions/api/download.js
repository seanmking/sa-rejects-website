/**
 * File download endpoint for SA REJECTS
 * Serves files from R2 bucket with authentication
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Get file key from query parameter
  const fileKey = url.searchParams.get('file');
  
  if (!fileKey) {
    return new Response('File not specified', { status: 400 });
  }
  
  // BASIC AUTH - Same as admin panel
  const AUTH_USER = 'admin';
  const AUTH_PASS = 'Kawai@1607'; // CHANGE THIS!
  
  // Check basic auth
  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="SA REJECTS Admin"'
      }
    });
  }
  
  const [scheme, encoded] = authorization.split(' ');
  if (scheme !== 'Basic') {
    return new Response('Invalid authentication', { status: 401 });
  }
  
  const decoded = atob(encoded);
  const [user, pass] = decoded.split(':');
  
  if (user !== AUTH_USER || pass !== AUTH_PASS) {
    return new Response('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="SA REJECTS Admin"'
      }
    });
  }
  
  try {
    // Get file from R2
    if (!env.SUBMISSIONS_BUCKET) {
      return new Response('Storage not configured', { status: 500 });
    }
    
    const object = await env.SUBMISSIONS_BUCKET.get(fileKey);
    
    if (!object) {
      return new Response('File not found', { status: 404 });
    }
    
    // Return file with appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${fileKey.split('/').pop()}"`);
    
    return new Response(object.body, { headers });
    
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Error downloading file', { status: 500 });
  }
}