# My Money website: setup guide

What you're putting online:

| Address | Page |
|---|---|
| `/` | Homepage (landing page) |
| `/app.html` | The app, with sign-in and sync |
| `/privacy.html` | Privacy policy |
| `/support.html` | Support page |

Everything is free: **GitHub Pages** hosts the site and **Supabase** stores accounts and data. Allow about 30 minutes the first time.

---

## Step 1 – Put the site on GitHub Pages
1. Sign in at **github.com** (create a free account if needed).
2. Click **+** (top right) > **New repository**. Name it `my-money`, choose **Public**, and click **Create repository**.
3. Click **uploading an existing file**.
4. Unzip `my-money-website.zip`. Open the `mymoney-site` folder, select **everything inside it**, and drag it onto the page. Click **Commit changes**.
5. Go to **Settings > Pages**. Under *Build and deployment* choose **Deploy from a branch**, **main**, **/ (root)**, and click **Save**.
6. Wait 1–2 minutes. Your site is live at:
   `https://YOUR-GITHUB-NAME.github.io/my-money/`

At this point the app already works in "no account" mode, with data saved in each person's browser. Steps 2–4 turn on sign-in and sync.

## Step 2 – Create the database (Supabase)
1. Go to **supabase.com**, sign up (free), and click **New project**.
2. Name it `my-money`, create a strong database password and save it somewhere safe, and pick the region closest to you (for example *East US*).
3. When the project is ready, open **SQL Editor > New query**.
4. Open `supabase-setup.sql` from this folder, copy everything, paste it in, and click **Run**. You should see "Success".

## Step 3 – Set up sign-in
1. In Supabase, go to **Authentication > URL Configuration**:
   * **Site URL:** `https://YOUR-GITHUB-NAME.github.io/my-money/app.html`
   * **Redirect URLs:** add the same address.
2. **Email sending (important):** Supabase's built-in email only sends to your own team's addresses and only a few per hour. That's fine for testing, but before other people sign up, connect a free email service:
   * Create a free account at **resend.com** (3,000 emails a month free) and get an SMTP password (API key).
   * In Supabase, go to **Authentication > Emails > SMTP Settings**, turn on **Custom SMTP**, and enter:
     * Host `smtp.resend.com`
     * Port `465`
     * Username `resend`
     * Password: your Resend API key
     * Sender email: an address on a domain you've verified in Resend
   * Just testing on your own? You can skip this and turn off **Authentication > Sign In / Providers > Email > Confirm email**, so accounts work right away. Turn it back on before you share the site.

## Step 4 – Connect the app to Supabase
1. In Supabase, go to **Project Settings > API Keys** (or **Data API**). Copy:
   * the **Project URL**, which looks like `https://abcd1234.supabase.co`
   * the **anon / publishable** key. Never use the `service_role` or secret key.
2. On GitHub, open `config.js`, click the pencil icon, and replace the two placeholder values. Click **Commit changes**.
3. Wait a minute, then open `https://YOUR-GITHUB-NAME.github.io/my-money/app.html`. You should see **Welcome back** with Sign in and Create account.

The anon key is designed to be public. Your data is protected by the security rules in `setup.sql`, which let each person read and change only their own rows.

## Step 5 – Final touches
1. On GitHub, edit `privacy.html` and `support.html` and replace `REPLACE-WITH-YOUR-EMAIL` with your contact email.
2. Test the whole flow:
   1. Create an account.
   2. Confirm your email.
   3. Add a transaction on your phone and check it appears on your computer.
   4. Reset your password.
   5. Delete a test account.
3. Install it on your phone. On iPhone, tap Share in Safari, then **Add to Home Screen**. On Android, tap the Chrome menu, then **Install app**.

---

## Good to know
* **Free plan limits:** Supabase free projects pause after about 7 days with no activity. If that happens, open the Supabase dashboard and click **Restore**. Once people use the site regularly, it stays awake. The paid plan ($25 a month) never pauses and adds daily backups.
* **Updating the site:** edit or upload files on GitHub. Changes go live in about a minute. If you change `app.html`, also change `my-money-v3` in `sw.js` to `v4` (and so on), so phones pick up the new version.
* **Your own domain (optional, about $12 a year):** buy a domain (for example at Cloudflare or Namecheap). Then on GitHub go to **Settings > Pages > Custom domain**. Afterwards, update the Site URL and Redirect URLs in Supabase to the new address.
* **Your responsibility:** once other people sign up, you're holding their financial information. Keep your Supabase and GitHub passwords strong, turn on two-factor sign-in for both, and never share the `service_role` key.

## What's in this folder
All files sit in one folder (no subfolders), so they upload in a single drag.
| File | What it is |
|---|---|
| `index.html` | Homepage |
| `app.html` | The app |
| `config.js` | Your Supabase settings |
| `privacy.html`, `support.html` | Policy and help pages |
| `supabase-setup.sql` | Database tables and security rules (paste into Supabase, not needed on the website) |
| `.woff2`, `.png`, `.webp` files | Fonts, icons and screenshots |
| `sw.js`, `manifest.webmanifest`, `supabase.js` | Offline support, home-screen install, sign-in library |
