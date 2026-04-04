# LeaseIQ — Launch Checklist

## 1. Create GitHub repo

```bash
git init
git add .
git commit -m "Initial commit — LeaseIQ Next.js project"
gh repo create leasecalculator --private --push --source .
```

Or push to an existing repo:
```bash
git remote add origin https://github.com/YOUR_USERNAME/leasecalculator.git
git push -u origin main
```

---

## 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project (e.g. name: `leasecalculator`)
2. Choose a region close to your users (US East or US West)
3. Once created → **SQL Editor** → paste and run `supabase/schema.sql`
4. Then paste and run `supabase/seed_april_2026.sql`
5. Go to **Settings → API** — copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## 3. Get your Anthropic API key

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Create a key → copy it as `ANTHROPIC_API_KEY`

---

## 4. Configure Netlify

1. In [app.netlify.com](https://app.netlify.com), create a new site → **Import from Git**
2. Connect your GitHub repo → branch: `main`
3. Build command: `npm run build` | Publish directory: `.next`
4. **Site settings → Environment variables** — add all four:
   ```
   ANTHROPIC_API_KEY
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```
5. **Domain management** → add custom domain: `leasecalculator.com`
   - Point your domain's nameservers to Netlify (they'll give you the NS records)
   - Or add a CNAME: `leasecalculator.com → [your-site].netlify.app`
   - SSL is provisioned automatically

---

## 5. Add GitHub Secrets (for CI/CD)

In your GitHub repo → **Settings → Secrets → Actions**, add:
```
ANTHROPIC_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NETLIFY_AUTH_TOKEN      ← from Netlify: User Settings → Applications → Personal access tokens
NETLIFY_SITE_ID         ← from Netlify: Site overview → Site ID
```

---

## 6. Local development

```bash
cp .env.local.example .env.local
# Fill in real values

npm install
npm run dev
# → http://localhost:3000
```

---

## 7. Monthly benchmark update (automated)

The Cowork scheduled task **lease-benchmark-monthly-update** runs automatically
on the 1st of each month at 9:00 AM. It:
1. Scrapes Edmunds forums for moderator-confirmed MF/residual data
2. Checks CarsDirect for dealer bulletins
3. Generates `insert_[MONTH]_[YEAR].sql` for your review
4. Generates `lease_update_[MONTH]_[YEAR].txt` summary report

**Your only manual step:** Review the SQL file, then run it in the Supabase SQL editor.

To trigger a manual run: open Claude → Scheduled section → lease-benchmark-monthly-update → Run now.

---

## 8. Google AdSense (after launch)

1. Apply at [adsense.google.com](https://adsense.google.com) once the site has real content and traffic
2. Once approved, replace the placeholder comment in `ReportScreen.tsx`:
   ```tsx
   // <ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" />
   ```
3. Placements per context.md rules: below score card only, no pre-report ads, no interstitials

---

## QA Fixes Applied (vs. original HTML)

| Issue | Fix |
|---|---|
| Fake social proof stats (12,400+ quotes, $847 avg savings, 98%) | Removed entirely — replaced with "Beta · be an early tester" label |
| Legally inaccurate claim: "dealers are required to honor the buy rate" | Corrected to: "many dealers will honor a request… they are under no legal obligation" |
| Score component showing 16/15 (above maximum) | Scoring engine now caps each component at its max; display bar also capped at 100% width |
| "Usually takes under 3 seconds" (unverified) | Changed to "Usually takes under 10 seconds" — conservative until real latency is measured |
