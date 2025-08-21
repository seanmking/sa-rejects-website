# SA REJECTS Website

## ⚠️ FOR DEVELOPERS ⚠️

This site is deliberately:
- Rough around the edges
- Not perfectly aligned
- Using casual/profane language
- Celebrating imperfection

DO NOT "FIX" THESE THINGS. They're features, not bugs.

If you're about to:
- Clean up the design
- Professional-ize the language  
- Add smooth animations
- Make it "responsive" and "modern"

STOP. Go read the brand guide first.

We're too strong for clean code. Too busy for best practices.
Building anyway.

## 🚀 Deployment to Cloudflare Pages

### Prerequisites
1. A Cloudflare account (free tier works)
2. This repository connected to your GitHub account

### Step 1: Create Cloudflare Resources

#### Create KV Namespaces:
1. Go to Cloudflare Dashboard > Workers & Pages > KV
2. Create namespace: `sa-rejects-emails`
3. Create namespace: `sa-rejects-submissions`
4. Note the IDs for each namespace

#### Create R2 Bucket:
1. Go to Cloudflare Dashboard > R2
2. Create bucket: `sa-rejects-submissions`
3. Optional: Enable public access for the bucket if you want direct file links

### Step 2: Deploy to Cloudflare Pages

#### Option A: GitHub Integration (Recommended)
1. Go to Cloudflare Dashboard > Pages
2. Click "Create a project" > "Connect to Git"
3. Select this repository
4. Configure build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
   - Root directory: `/`
5. Click "Save and Deploy"

#### Option B: Direct Upload with Wrangler
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Update wrangler.toml with your KV and R2 IDs

# Deploy
wrangler pages publish . --project-name=sa-rejects-website
```

### Step 3: Configure Environment Variables

After first deployment, go to your Pages project settings:

1. Settings > Functions > KV namespace bindings:
   - Variable name: `EMAILS` → Select your emails KV namespace
   - Variable name: `SUBMISSIONS_KV` → Select your submissions KV namespace

2. Settings > Functions > R2 bucket bindings:
   - Variable name: `SUBMISSIONS_BUCKET` → Select your R2 bucket

3. Settings > Environment variables:
   - `ADMIN_EMAIL`: Your email for notifications (optional)
   - `R2_PUBLIC_URL`: Your R2 public bucket URL (optional)

### Step 4: Redeploy

After adding bindings, trigger a new deployment:
- Either push a commit to GitHub
- Or manually redeploy from the Cloudflare dashboard

## 📊 Admin Panel

Access the admin panel at: `https://your-site.pages.dev/api/admin`

Default credentials (CHANGE THESE):
- Username: `admin`
- Password: `sarejects2024`

To change credentials, edit `/functions/api/admin.js`

## 🧪 Local Testing

```bash
# Install Wrangler
npm install -g wrangler

# Run locally
wrangler pages dev .

# Site will be available at http://localhost:8788
```

Note: KV and R2 features won't work locally without additional setup.

## 📝 Features

- **Email Collection**: Stores subscriber emails in Cloudflare KV
- **File Uploads**: Accepts templates, screenshots, and stories (max 5MB)
- **Spam Protection**: Honeypot fields and rate limiting
- **Admin Dashboard**: View emails and submissions at `/api/admin`
- **Free Tier Compatible**: Stays within Cloudflare's free limits

## 🛠️ Maintenance

### Backup Emails
1. Go to `/api/admin?view=emails`
2. Click "Export as CSV"

### Monitor Usage
- Free tier limits:
  - Pages Functions: 100,000 requests/day
  - KV: 100,000 reads/day, 1,000 writes/day
  - R2: 10GB storage, 1M Class A operations/month

### Clear Test Data
Use Wrangler CLI:
```bash
wrangler kv:key list --namespace-id=YOUR_NAMESPACE_ID
wrangler kv:key delete --namespace-id=YOUR_NAMESPACE_ID "key_name"
```

## 🐛 Troubleshooting

**Forms not working?**
- Check that KV namespaces and R2 bucket are properly bound in Pages settings
- Verify environment variables are set
- Check browser console for errors

**Admin panel not loading?**
- Ensure you're using the correct credentials
- Check that KV namespaces are bound

**File uploads failing?**
- Verify R2 bucket is created and bound
- Check file size (max 5MB on free tier)
- Ensure file type is allowed (PDF, DOC, DOCX, TXT, PNG, JPG)

---

Built with deliberate roughness by SA REJECTS. Too strong for the system.
