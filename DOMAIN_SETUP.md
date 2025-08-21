# SA REJECTS - Domain & Email Setup Guide

## Current Status
✅ Website deployed to Cloudflare Pages
✅ Email collection and file upload working
✅ Admin dashboard operational
⏳ Domain connection pending
⏳ Email forwarding pending

## Step 1: Connect Your Domain (sarejects.co.za)

### In Cloudflare Dashboard:
1. Go to your Cloudflare Pages project: `sa-rejects-website`
2. Click on **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter: `sarejects.co.za`
5. Click **Continue**

### DNS Configuration:
Cloudflare will provide you with DNS records to add. You'll need to:

1. Add a CNAME record:
   - Name: `@` (or `sarejects.co.za`)
   - Target: `sa-rejects-website.pages.dev`

2. Add a CNAME record for www (optional):
   - Name: `www`
   - Target: `sa-rejects-website.pages.dev`

### Where to Update DNS:
- If your domain is registered with Cloudflare: DNS updates automatically
- If registered elsewhere: Update at your registrar (e.g., Afrihost, Domains.co.za, etc.)

## Step 2: Email Forwarding Setup

### Option A: Cloudflare Email Routing (Recommended - FREE)
1. In Cloudflare Dashboard, go to **Email** → **Email Routing**
2. Click **Get started**
3. Add your domain: `sarejects.co.za`
4. Verify domain ownership (Cloudflare will add MX records automatically)
5. Set up forwarding rules:
   - Create catch-all rule: `*@sarejects.co.za` → `sean@futuresgroup.co.za`
   - Or specific addresses:
     - `hello@sarejects.co.za` → `sean@futuresgroup.co.za`
     - `admin@sarejects.co.za` → `sean@futuresgroup.co.za`
     - `info@sarejects.co.za` → `sean@futuresgroup.co.za`

### Required DNS Records (added automatically by Cloudflare):
```
Type: MX
Name: @
Priority: 1
Value: route1.mx.cloudflare.net

Type: MX  
Name: @
Priority: 2
Value: route2.mx.cloudflare.net

Type: MX
Name: @
Priority: 3
Value: route3.mx.cloudflare.net

Type: TXT
Name: @
Value: v=spf1 include:_spf.mx.cloudflare.net ~all
```

### Option B: Domain Registrar Email Forwarding
Some registrars offer free email forwarding. Check with your registrar.

## Step 3: SSL Certificate
- SSL certificate is automatically provisioned by Cloudflare
- This happens after domain verification (usually within 15 minutes)
- No action needed from your side

## Step 4: Update Environment Variables

Once domain is connected, update your Cloudflare Pages environment variables:

1. Go to **Settings** → **Environment variables**
2. Update:
   - `SITE_URL`: `https://sarejects.co.za`
   - `ADMIN_EMAIL`: `sean@futuresgroup.co.za` (already set)

## Testing Checklist

After setup, verify:
- [ ] `https://sarejects.co.za` loads the website
- [ ] `https://www.sarejects.co.za` redirects to main domain
- [ ] SSL certificate shows as valid (green padlock)
- [ ] Email to `hello@sarejects.co.za` forwards to `sean@futuresgroup.co.za`
- [ ] Admin panel accessible at `https://sarejects.co.za/api/admin`
- [ ] Email subscription form works
- [ ] File upload form works

## Troubleshooting

### Domain not connecting:
- DNS propagation can take up to 48 hours (usually much faster)
- Check DNS with: `nslookup sarejects.co.za`
- Verify CNAME records are correct

### Email not forwarding:
- Check MX records are properly set
- Verify destination email (`sean@futuresgroup.co.za`) is verified in Cloudflare
- Check spam folder at destination

### SSL certificate issues:
- Wait 15-30 minutes after domain connection
- Ensure domain is proxied through Cloudflare (orange cloud ON)

## Admin Access

Your admin panel will be available at:
- Local: `http://localhost:8788/api/admin`
- Production: `https://sarejects.co.za/api/admin`
- Username: `admin`
- Password: `Kawai@1607`

## Support

If you encounter issues:
1. Check Cloudflare Pages build logs
2. Verify all environment variables are set
3. Check browser console for errors
4. Review function logs in Cloudflare dashboard