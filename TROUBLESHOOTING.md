# Troubleshooting Network Error

## The Issue
Getting "Network error" when submitting forms means the Functions aren't being recognized by Cloudflare Pages.

## Quick Fix Steps

### 1. Verify Functions are Deployed
1. Go to Cloudflare Dashboard → Your Pages Project
2. Click on latest deployment
3. Click "Functions" tab
4. You should see routes like:
   - `/api/subscribe`
   - `/api/share`
   - `/api/admin`
   - `/api/download`

If you DON'T see these, the functions aren't deploying.

### 2. Check Build Configuration
In Cloudflare Pages settings:
1. Go to Settings → Builds & deployments
2. Check "Build configuration":
   - Build command: (leave empty)
   - Build output directory: (leave empty or `/`)
   - Root directory: (leave empty)

### 3. Verify Directory Structure
Your repo should have this EXACT structure:
```
/
├── index.html
├── functions/
│   └── api/
│       ├── subscribe.js
│       ├── share.js
│       ├── admin.js
│       └── download.js
└── (other files)
```

### 4. Force Redeploy
1. Make a small change to trigger rebuild:
   ```bash
   git commit --allow-empty -m "Force rebuild"
   git push
   ```
2. Or in Cloudflare: Deployments → Retry deployment

### 5. Test Functions Directly
After deployment, test in browser:
- Go to: `https://sa-rejects-website.pages.dev/api/test`
- Should see: "Functions are working!"

If that works but forms don't, it's a frontend issue.

## Common Issues & Solutions

### Issue: Functions not showing in Cloudflare
**Solution:** Cloudflare Pages looks for functions in `/functions` directory. Make sure:
- Directory is named exactly `functions` (lowercase)
- Files export named functions like `onRequestPost`, `onRequestGet`
- Files are `.js` not `.ts`

### Issue: CORS errors
**Solution:** Already handled in our code with CORS headers.

### Issue: KV/R2 not bound
**Solution:** Functions will still deploy but won't save data. Check:
1. Settings → Functions → KV namespace bindings
2. Settings → Functions → R2 bucket bindings

### Issue: Environment variables missing
**Solution:** Add in Settings → Environment variables:
- `ADMIN_EMAIL`: sean@futuresgroup.co.za
- `SITE_URL`: https://sarejects.co.za

## Testing Locally
You can test locally using Wrangler:
```bash
# Install wrangler globally
npm install -g wrangler

# Run locally
wrangler pages dev .

# Access at http://localhost:8788
```

## Alternative: Quick Test Function
To verify Functions are working, we have a test endpoint:
- URL: `/api/test`
- Should return: "Functions are working!"

## If Nothing Works
1. Check Cloudflare Pages logs:
   - Deployments → Click on deployment → View logs
   
2. Check browser console:
   - Open DevTools (F12)
   - Go to Network tab
   - Submit form
   - Look for red failed requests
   - Check Console for JavaScript errors

3. Verify domain is working:
   - Try: `https://sa-rejects-website.pages.dev` (default domain)
   - If that works but custom domain doesn't, it's a domain issue

## Contact Support
If functions still don't work:
1. Check Cloudflare Status: https://www.cloudflarestatus.com/
2. Check GitHub Actions (if using)
3. Cloudflare Discord: https://discord.gg/cloudflaredev