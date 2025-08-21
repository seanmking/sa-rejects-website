/**
 * Email subscription handler for SA REJECTS
 * Stores emails in Cloudflare KV storage
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers for browser requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const honeypot = formData.get('website'); // Hidden field for spam protection
    
    // Check honeypot field (should be empty)
    if (honeypot) {
      return new Response(JSON.stringify({ error: 'Invalid submission' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting - check if this IP has submitted recently
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `ratelimit:${ip}`;
    
    if (env.EMAILS) {
      const lastSubmit = await env.EMAILS.get(rateLimitKey);
      if (lastSubmit) {
        const timeSince = Date.now() - parseInt(lastSubmit);
        if (timeSince < 60000) { // 1 minute cooldown
          return new Response(JSON.stringify({ error: 'Please wait before subscribing again' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Check if email already exists
      const existingEmail = await env.EMAILS.get(`email:${email}`);
      if (existingEmail) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'You\'re already on the list, boet!' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Store email with metadata
      const emailData = {
        email,
        timestamp: new Date().toISOString(),
        source: 'website',
        ip: ip
      };

      // Save to KV
      await env.EMAILS.put(`email:${email}`, JSON.stringify(emailData));
      
      // Update rate limit
      await env.EMAILS.put(rateLimitKey, Date.now().toString(), {
        expirationTtl: 60 // Expires after 60 seconds
      });

      // Optional: Send notification email to admin
      if (env.ADMIN_EMAIL) {
        // Notification can be sent via Cloudflare Email Workers
        // For now, the admin can check the dashboard at /api/admin
        console.log(`New subscriber: ${email}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Welcome to SA REJECTS! Check your inbox soon.' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // KV namespace not configured - for local testing
      console.log('Email submission:', email);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email received (test mode)' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong. Try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET requests (for testing)
export async function onRequestGet(context) {
  return new Response('SA REJECTS Email API - POST to subscribe', {
    headers: { 'Content-Type': 'text/plain' }
  });
}