# Striker's Log ⚽

A tiny personal site for logging your goals and assists by date, and seeing your
career stats, a season timeline, and a scoring chart — built with plain HTML/CSS/JS,
no build step, no backend.

## How it works

- Click **+ Log entry**, pick a date, choose **Goal** or **Assist**, and save.
- The scoreboard at the top always shows your career totals.
- Use the **Season** dropdown to see a month-by-month chart and a match-by-match
  timeline for a single year.
- Filter or search the match log by season, type, opponent, competition, or notes.
- **Export backup** downloads a `.json` file of everything you've logged.
  **Import backup** adds entries back in (e.g. after clearing your browser, or to
  move your data to a different browser/device).

## Where your data lives

All entries are saved in your browser's `localStorage`, under the key
`strikers-log-entries-v1`. There is no server or database — that means:

- Your data stays private to your device and browser.
- It will **not** show up automatically on another device or browser. Use
  **Export backup** / **Import backup** to move it around.
- Clearing your browser's site data for this page will erase your entries, so
  export a backup occasionally.

## Running it locally

No install needed — it's static files. Either:

- Open `index.html` directly in a browser, or
- Serve it locally so relative paths behave the same as in production:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deploying to GitHub + Vercel

### 1. Push to GitHub

```bash
cd goal-tracker
git init
git add .
git commit -m "Initial commit: Striker's Log"
```

Create a new empty repository on GitHub (no README/license, since you already
have one), then:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Deploy on Vercel

**Option A — Vercel dashboard (easiest):**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project**, then select your repository.
3. Vercel will detect it as a static site — no framework preset, no build
   command, no output directory needed. Click **Deploy**.
4. After a few seconds you'll get a live URL like
   `https://your-repo.vercel.app`.

**Option B — Vercel CLI:**

```bash
npm install -g vercel
cd goal-tracker
vercel        # follow the prompts to link/create the project
vercel --prod # promote to your production URL
```

Every future `git push` to `main` will trigger a new deployment automatically
if you used Option A (or Vercel's GitHub integration).

### A note on data after deploying

Because stats are stored in `localStorage`, they're tied to *your browser on
your device* visiting the live URL — not to the deployment itself. If you log
entries on your phone and then open the same Vercel URL on a laptop, you'll see
an empty log until you import a backup you exported from the phone.

## File overview

```
goal-tracker/
├── index.html   # page structure
├── style.css    # design system + layout
├── script.js    # storage, form logic, chart & timeline rendering
└── README.md
```
