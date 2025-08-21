/**
 * File upload and sharing handler for SA REJECTS
 * Handles templates, screenshots, and story submissions
 * Stores files in Cloudflare R2
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if R2 bucket is configured
    if (!env.SUBMISSIONS_BUCKET) {
      return new Response(JSON.stringify({ 
        error: 'Storage not configured. Contact admin.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('name');
    const email = formData.get('email');
    const type = formData.get('type'); // 'template', 'screenshot', 'story'
    const description = formData.get('description');
    const file = formData.get('file');
    const honeypot = formData.get('website'); // Spam protection
    
    // Check honeypot
    if (honeypot) {
      return new Response(JSON.stringify({ error: 'Invalid submission' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!name || !email || !type || !description) {
      return new Response(JSON.stringify({ 
        error: 'Please fill in all fields' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email address' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `share_ratelimit:${ip}`;
    
    if (env.SUBMISSIONS_KV) {
      const lastSubmit = await env.SUBMISSIONS_KV.get(rateLimitKey);
      if (lastSubmit) {
        const timeSince = Date.now() - parseInt(lastSubmit);
        if (timeSince < 300000) { // 5 minute cooldown
          return new Response(JSON.stringify({ 
            error: 'Please wait 5 minutes between submissions' 
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    let fileKey = null;
    let fileUrl = null;

    // Handle file upload if present
    if (file && file.size > 0) {
      // Validate file size (5MB max for free tier)
      if (file.size > 5 * 1024 * 1024) {
        return new Response(JSON.stringify({ 
          error: 'File too large. Maximum 5MB allowed.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];

      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({ 
          error: 'Invalid file type. Allowed: PDF, DOC, DOCX, TXT, PNG, JPG' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      fileKey = `${type}/${timestamp}_${sanitizedName}`;

      // Upload to R2
      try {
        const arrayBuffer = await file.arrayBuffer();
        await env.SUBMISSIONS_BUCKET.put(fileKey, arrayBuffer, {
          httpMetadata: {
            contentType: file.type,
          },
          customMetadata: {
            submitter: name,
            email: email,
            type: type,
            description: description,
            timestamp: new Date().toISOString()
          }
        });

        // If bucket is public, generate URL
        if (env.R2_PUBLIC_URL) {
          fileUrl = `${env.R2_PUBLIC_URL}/${fileKey}`;
        }
      } catch (uploadError) {
        console.error('R2 upload error:', uploadError);
        return new Response(JSON.stringify({ 
          error: 'Failed to upload file. Please try again.' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Store submission metadata in KV
    const submissionData = {
      id: crypto.randomUUID(),
      name,
      email,
      type,
      description,
      fileKey,
      fileUrl,
      timestamp: new Date().toISOString(),
      ip
    };

    if (env.SUBMISSIONS_KV) {
      // Save submission metadata
      await env.SUBMISSIONS_KV.put(
        `submission:${submissionData.id}`,
        JSON.stringify(submissionData)
      );

      // Update rate limit
      await env.SUBMISSIONS_KV.put(rateLimitKey, Date.now().toString(), {
        expirationTtl: 300 // Expires after 5 minutes
      });

      // Add to submissions list (for admin view)
      const listKey = `submissions_list:${new Date().toISOString().split('T')[0]}`;
      const currentList = await env.SUBMISSIONS_KV.get(listKey);
      const submissions = currentList ? JSON.parse(currentList) : [];
      submissions.push(submissionData.id);
      await env.SUBMISSIONS_KV.put(listKey, JSON.stringify(submissions));
    }

    // Success response
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Thanks for sharing! Your submission helps other SA REJECTS.',
      id: submissionData.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Share submission error:', error);
    return new Response(JSON.stringify({ 
      error: 'Something went wrong. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET requests (for testing)
export async function onRequestGet(context) {
  return new Response('SA REJECTS Share API - POST to submit', {
    headers: { 'Content-Type': 'text/plain' }
  });
}