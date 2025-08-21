# SA REJECTS - Complete Setup Guide

## Current Status
✅ Website code deployed to GitHub
✅ Admin panel created with authentication
✅ File download endpoint configured
✅ Email notifications via MailChannels (FREE with Cloudflare)
⏳ Email forwarding setup needed
⏳ Domain connection needed
⏳ KV and R2 configuration needed

---

## STEP 1: Configure Cloudflare KV and R2 Storage

### 1.1 Create KV Namespaces
1. Go to Cloudflare Dashboard → Workers & Pages → KV
2. Click "Create namespace"
3. Create TWO namespaces:
   - Name: `sa-rejects-emails`
   - Name: `sa-rejects-submissions`
4. Note down the IDs for each namespace

### 1.2 Create R2 Bucket
1. Go to Cloudflare Dashboard → R2
2. Click "Create bucket"
3. Name: `sa-rejects-submissions`
4. Location: Automatic
5. Click "Create bucket"

### 1.3 Update Cloudflare Pages Environment Variables
1. Go to your Cloudflare Pages project: `sa-rejects-website`
2. Go to Settings → Environment variables
3. Add these Production variables:
   ```
   ADMIN_EMAIL = sean@futuresgroup.co.za
   SITE_URL = https://sarejects.co.za
   ```

### 1.4 Bind KV and R2 to Pages
1. In Pages project settings → Functions → KV namespace bindings
2. Add bindings:
   - Variable name: `EMAILS` → Select your emails KV namespace
   - Variable name: `SUBMISSIONS_KV` → Select your submissions KV namespace
3. In Functions → R2 bucket bindings:
   - Variable name: `SUBMISSIONS_BUCKET` → Select your R2 bucket

---

## STEP 2: Email System (Two Parts)

### Part A: Email Notifications (Already Configured!)
When someone signs up or uploads a file, you'll automatically receive an email notification at `sean@futuresgroup.co.za` using Cloudflare's FREE MailChannels integration. No setup needed - it just works!

**You'll receive:**
- 🔥 Email when someone subscribes (with their email address)
- 📎 Email when someone uploads a file (with file details)
- Direct link to admin dashboard in each notification

### Part B: Email Forwarding (For receiving emails at @sarejects.co.za)

### In Cloudflare Dashboard:
1. Go to **Email** → **Email Routing**
2. Click **Get started**
3. Enter domain: `sarejects.co.za`
4. Cloudflare will add MX records automatically

### Configure Forwarding Rules:
1. **Verify destination email first:**
   - Add `sean@futuresgroup.co.za` as a destination
   - Cloudflare will send a verification email
   - Click the link in that email to verify

2. **Create forwarding rules:**
   - Rule 1: `hello@sarejects.co.za` → `sean@futuresgroup.co.za`
   - Rule 2: `admin@sarejects.co.za` → `sean@futuresgroup.co.za`
   - Rule 3: `info@sarejects.co.za` → `sean@futuresgroup.co.za`
   - OR create catch-all: `*@sarejects.co.za` → `sean@futuresgroup.co.za`

### DNS Records Added Automatically:
```
MX    @    1    route1.mx.cloudflare.net
MX    @    2    route2.mx.cloudflare.net
MX    @    3    route3.mx.cloudflare.net
TXT   @         v=spf1 include:_spf.mx.cloudflare.net ~all
```

---

## STEP 3: Connect Custom Domain

### 3.1 Add Domain to Pages
1. Go to your Pages project: `sa-rejects-website`
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter: `sarejects.co.za`
5. Click **Continue**

### 3.2 Configure DNS
**If domain is with Cloudflare:**
- DNS records will be added automatically
- SSL certificate will be provisioned automatically

**If domain is elsewhere (e.g., Afrihost):**
1. Add at your registrar:
   ```
   CNAME    @       sa-rejects-website.pages.dev
   CNAME    www     sa-rejects-website.pages.dev
   ```
2. OR change nameservers to Cloudflare (recommended)

### 3.3 Wait for Propagation
- DNS changes: 5 minutes - 48 hours
- SSL certificate: 15-30 minutes after domain verification

---

## STEP 4: Access Admin Panel & Downloads

### Admin Dashboard
Once domain is connected:
- URL: `https://sarejects.co.za/api/admin`
- Username: `admin`
- Password: `Kawai@1607`

### Features in Admin Panel:
1. **View Email Subscribers**
   - List of all email addresses
   - Timestamp of subscription
   - Source (website)

2. **View Submissions**
   - List of all uploaded files
   - File names and sizes
   - Upload timestamps
   - Submitter emails

3. **Download Files**
   - Click on any file in the admin panel
   - Authentication required (same credentials)
   - Files download directly from R2 storage

---

## STEP 5: Testing Checklist

After setup, test these features:

### Domain & SSL
- [ ] `https://sarejects.co.za` loads the website
- [ ] SSL padlock shows as secure
- [ ] `www.sarejects.co.za` redirects to main domain

### Email System
- [ ] Send test email to `hello@sarejects.co.za`
- [ ] Verify it forwards to `sean@futuresgroup.co.za`
- [ ] Check spam folder if not received

### Website Functions
- [ ] Email subscription form works
- [ ] Success message appears after subscribing
- [ ] File upload modal works
- [ ] Files under 5MB upload successfully

### Admin Panel
- [ ] Access `/api/admin` with credentials
- [ ] View list of email subscribers
- [ ] View list of submissions
- [ ] Download uploaded files

---

## Troubleshooting

### "Site can't be reached"
- Wait for DNS propagation (up to 48 hours)
- Check DNS with: `nslookup sarejects.co.za`
- Verify CNAME records are correct

### Email not forwarding
- Verify destination email in Cloudflare Email Routing
- Check MX records are set correctly
- Check spam/junk folder
- Wait 5-10 minutes for changes to propagate

### Admin panel not working
- Check KV namespaces are bound correctly
- Verify environment variables are set
- Check browser console for errors
- Try incognito/private browsing mode

### Files not uploading
- Check file size (max 5MB)
- Verify R2 bucket is bound correctly
- Check browser console for errors
- Ensure JavaScript is enabled

### Downloads not working
- Verify you're logged into admin panel
- Check R2 bucket has the files
- Try different browser
- Clear browser cache

---

## Important URLs

- **Live Site**: https://sarejects.co.za
- **Admin Panel**: https://sarejects.co.za/api/admin
- **GitHub Repo**: https://github.com/seanmking/sa-rejects-website
- **Cloudflare Pages**: https://dash.cloudflare.com/pages/project/sa-rejects-website

---

## Security Notes

1. **Change default password** in production if needed
2. **Keep credentials secure** - don't share admin URL publicly
3. **Regular backups** - Export email list monthly
4. **Monitor R2 storage** - Check usage in Cloudflare dashboard

---

## Next Steps After Setup

1. Test all features thoroughly
2. Share the website URL with your community
3. Monitor submissions in admin panel
4. Export email list regularly for backup
5. Create email campaigns to engage subscribers

Need help? Check:
- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Cloudflare Email Routing: https://developers.cloudflare.com/email-routing/
- R2 Storage docs: https://developers.cloudflare.com/r2/