/**
 * Admin endpoint for SA REJECTS
 * View emails and submissions
 * IMPORTANT: Add authentication before production use!
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // BASIC AUTH - Replace with your own credentials
  const AUTH_USER = 'admin';
  const AUTH_PASS = 'sarejects2024'; // CHANGE THIS!
  
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
  
  // Get query parameter for what to show
  const view = url.searchParams.get('view') || 'dashboard';
  
  try {
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>SA REJECTS Admin</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f2ed;
            padding: 20px;
            color: #1a1a1a;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border: 3px solid #1a1a1a;
            box-shadow: 5px 5px 0 #1a1a1a;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 20px;
            transform: rotate(-0.5deg);
        }
        .nav {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1a1a1a;
        }
        .nav a {
            margin-right: 20px;
            padding: 10px 20px;
            background: #1a1a1a;
            color: white;
            text-decoration: none;
            font-weight: bold;
        }
        .nav a:hover {
            background: #ff3333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f5f2ed;
            font-weight: bold;
        }
        .export-btn {
            background: #25D366;
            color: white;
            padding: 10px 20px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f5f2ed;
            padding: 20px;
            border: 2px solid #1a1a1a;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #ff3333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>SA REJECTS Admin Dashboard</h1>
        
        <div class="nav">
            <a href="?view=dashboard">Dashboard</a>
            <a href="?view=emails">Emails</a>
            <a href="?view=submissions">Submissions</a>
        </div>
`;
    
    if (view === 'dashboard') {
      // Get stats
      let emailCount = 0;
      let submissionCount = 0;
      
      if (env.EMAILS) {
        const emailsList = await env.EMAILS.list({ prefix: 'email:' });
        emailCount = emailsList.keys.length;
      }
      
      if (env.SUBMISSIONS_KV) {
        const submissionsList = await env.SUBMISSIONS_KV.list({ prefix: 'submission:' });
        submissionCount = submissionsList.keys.length;
      }
      
      html += `
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${emailCount}</div>
                <div>Email Subscribers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${submissionCount}</div>
                <div>Submissions</div>
            </div>
        </div>
        <p>Use the navigation above to view details.</p>
      `;
      
    } else if (view === 'emails' && env.EMAILS) {
      // List emails
      const emailsList = await env.EMAILS.list({ prefix: 'email:' });
      
      html += `
        <h2>Email Subscribers (${emailsList.keys.length})</h2>
        <table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Date Subscribed</th>
                    <th>Source</th>
                </tr>
            </thead>
            <tbody>
      `;
      
      for (const key of emailsList.keys) {
        const data = await env.EMAILS.get(key.name);
        if (data) {
          const emailData = JSON.parse(data);
          html += `
            <tr>
                <td>${emailData.email}</td>
                <td>${new Date(emailData.timestamp).toLocaleDateString()}</td>
                <td>${emailData.source || 'website'}</td>
            </tr>
          `;
        }
      }
      
      html += `
            </tbody>
        </table>
        <button class="export-btn" onclick="exportEmails()">Export as CSV</button>
        <script>
        function exportEmails() {
            // Simple CSV export
            const rows = document.querySelectorAll('tbody tr');
            let csv = 'Email,Date Subscribed,Source\\n';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                csv += cells[0].textContent + ',' + cells[1].textContent + ',' + cells[2].textContent + '\\n';
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sa-rejects-emails.csv';
            a.click();
        }
        </script>
      `;
      
    } else if (view === 'submissions' && env.SUBMISSIONS_KV) {
      // List submissions
      const submissionsList = await env.SUBMISSIONS_KV.list({ prefix: 'submission:' });
      
      html += `
        <h2>Submissions (${submissionsList.keys.length})</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>File</th>
                </tr>
            </thead>
            <tbody>
      `;
      
      for (const key of submissionsList.keys) {
        const data = await env.SUBMISSIONS_KV.get(key.name);
        if (data) {
          const submission = JSON.parse(data);
          html += `
            <tr>
                <td>${new Date(submission.timestamp).toLocaleDateString()}</td>
                <td>${submission.name}</td>
                <td>${submission.email}</td>
                <td>${submission.type}</td>
                <td>${submission.description}</td>
                <td>${submission.fileKey ? `<a href="${submission.fileUrl || '#'}" target="_blank">View</a>` : 'No file'}</td>
            </tr>
          `;
        }
      }
      
      html += `
            </tbody>
        </table>
      `;
      
    } else {
      html += '<p>No data available or service not configured.</p>';
    }
    
    html += `
    </div>
</body>
</html>
    `;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
    
  } catch (error) {
    console.error('Admin error:', error);
    return new Response('Error loading admin panel', { status: 500 });
  }
}