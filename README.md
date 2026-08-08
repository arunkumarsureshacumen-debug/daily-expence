# Daily Expense Tracker

A premium, mobile-first Daily Expense Tracker web app built with **React + TypeScript + Vite + Tailwind CSS**, with **Firebase Firestore** cloud sync, **PWA** support, and **LocalStorage** as an offline cache.

No login. No email. No OTP. Just open the app and start tracking — your data syncs to Firestore in the background using an anonymous device ID.

> Your expense data is stored locally on this device and synced to Firestore. Nothing is shared with anyone.

## ✨ Highlights

- **Mobile-first UI** (360–430 px target) with safe-area support
- **Bottom navigation** + **floating Add button** for a native-app feel
- **Add expense in under 10 seconds** with quick-category chips and a numeric-first form
- **Dashboard** with today's spending, monthly total, and budget progress
- **History** with search, date / category / payment-method filters
- **Statistics** with category breakdown and daily trend chart
- **Settings**: currency, monthly budget, theme (Light / Dark / System), data export / import / clear
- **Firebase Firestore** cloud sync — auto, no login required
- **LocalStorage** as offline cache so the app keeps working without internet
- **PWA**: installable to home screen, works offline, standalone display
- **Dark mode** with proper system theme support

## 🧰 Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 3
- Lucide React icons
- React Router 7
- Firebase 12 (Anonymous Auth + Firestore)
- vite-plugin-pwa (Workbox)
- LocalStorage (offline cache)

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure Firebase for cloud sync
cp .env.example .env
#   → paste your Firebase web app credentials
#   → the app works fully without this, but only stores data on this device

# 3. Run the dev server
npm run dev
# → open http://localhost:5173 on your phone or browser

# 4. Build for production
npm run build

# 5. Preview the production build locally
npm run preview
```

> Tip: to test the mobile layout on desktop, open Chrome DevTools → toggle device toolbar (⌘+Shift+M / Ctrl+Shift+M) and pick an iPhone / Pixel preset.

## 🔥 Firebase Setup (Cloud Sync)

The app works offline without any Firebase configuration, but to enable cloud sync you need to create a free Firebase project.

### 1. Create a Firebase project

1. Go to https://console.firebase.google.com/
2. Click **Add project**, give it a name, follow the prompts.
3. In the left sidebar, click **Build → Authentication** → **Get started** → **Sign-in method** tab.
4. ⚠️ **Enable the Anonymous provider.** Even though the user never sees a login screen, Firebase requires this provider to be enabled to issue anonymous IDs. If you skip this you'll see "auth/configuration-not-found" in the console and a yellow banner in the app's Settings page.
5. In the left sidebar, click **Build → Firestore Database** → **Create database** → start in **production mode** → pick a region.

### 2. Get your web app config

1. In **Project settings** (⚙️ gear icon) → **General** → scroll to **Your apps**.
2. Click the **Web** icon `</>` to register a web app, give it a nickname, click **Register app**.
3. Copy the `firebaseConfig` values.

### 3. Add them to `.env` (and Vercel)

Copy `.env.example` to `.env` and paste the values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234:web:abc...
```

For Vercel, add the same keys in **Project Settings → Environment Variables**.

### 4. Recommended Firestore security rules

In the Firebase console → Firestore → **Rules** tab, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Anonymous auth still produces a unique `uid` per device — these rules ensure each device only reads and writes its own data.

### How the no-login sync works

When the app loads, it silently calls `signInAnonymously()`. Firebase generates a unique anonymous ID (e.g. `AbCdEf123456…`) and stores it locally. All your expenses go to `users/{that-anon-id}/expenses/...`. The user never sees a login screen.

If you want to switch devices later, export your data from Settings and import it on the new device.

## ☁️ Deploy to Vercel

The project is fully static and works on Vercel with **zero configuration**.

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. **Import into Vercel**
   - Go to https://vercel.com/new
   - Click **"Import Git Repository"** and select your repo
   - Framework preset: **Vite** (auto-detected)
   - Build command: `npm run build` (auto-filled)
   - Output directory: `dist` (auto-filled)
   - **Important:** add your `VITE_FIREBASE_*` environment variables in this step
   - Click **Deploy**
3. Wait ~30 seconds. Vercel will give you a `https://<project>.vercel.app` URL.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel        # follow prompts, accept defaults
vercel --prod # deploy to production
```

### SPA Routing

`vercel.json` includes a rewrite to `index.html` so client-side routes like `/expenses`, `/add`, and `/expense/:id` always resolve correctly when refreshed directly.

## 📱 Install as a PWA on your phone

After deployment:

- **iPhone (Safari)** → tap the **Share** icon → **Add to Home Screen**.
- **Android (Chrome)** → tap the menu (⋮) → **Add to Home screen** / **Install app**.

The app launches in standalone mode, hides the browser chrome, and works offline thanks to the service worker.

## 🗂️ Project Structure

```
src/
├─ components/         # Reusable UI (ExpenseCard, BudgetCard, charts, etc.)
├─ pages/              # Route-level screens (Home, Expenses, Statistics, Settings, Add, Details)
├─ services/           # storageService · authService · firestoreService · firebase
├─ utils/              # currency, date, calculations
├─ hooks/              # useAuth · useExpenses · useSettings · useTheme
├─ types/              # Expense, Settings, etc.
├─ App.tsx             # Router + layout shell
└─ main.tsx            # Entry point
```

## 💾 Data model

### LocalStorage (offline cache, always present)

- `det.expenses.v1` — array of expenses for the current device
- `det.settings.v1` — `{ currency, monthlyBudget, theme }`

### Firestore (cloud, when configured)

```
users/{anonymousUid}/
  expenses/{expenseId}    ← one document per expense
  settings/main           ← single document with currency / budget / theme
```

Each expense looks like:

```json
{
  "id": "uuid",
  "amount": 180,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-08-08",
  "time": "12:45",
  "paymentMethod": "UPI",
  "createdAt": "2026-08-08T07:15:00.000Z",
  "updatedAt": "<server-timestamp>"
}
```

Corrupted JSON or missing fields are handled gracefully — the app falls back to safe defaults.

## 🔄 How sync works

```
App loads → signInAnonymously() → Firebase returns a unique UID
        ↓
useExpenses pulls from Firestore users/{uid}/expenses
        ↓
Merged with LocalStorage (newer createdAt wins per expense)
        ↓
User taps "Add Expense" → setExpenses(prev => [...prev, new])
        ↓
React re-renders (instant, offline-safe)
        ↓
useEffect saves to LocalStorage           ← always
        ↓
useEffect (debounced 600ms) pushes to Firestore  ← only when configured
        ↓
Firestore SDK queues writes if offline; flushes on reconnect
```

## 🧪 Tested user flows

- ✅ Add expense (under 10 seconds)
- ✅ Edit expense
- ✅ Delete expense (with confirmation)
- ✅ Search / filter by category / payment / date range
- ✅ Budget calculation (Safe / Warning / Exceeded states)
- ✅ Monthly totals + per-day + per-category breakdowns
- ✅ Dark mode (Light / Dark / System)
- ✅ LocalStorage persistence across reloads
- ✅ Cloud sync (push / pull / merge) — anonymous device ID
- ✅ Offline-first behavior (writes are queued, app stays usable)
- ✅ Mobile layout (360–430 px) + safe-area insets
- ✅ PWA installation on iOS / Android
- ✅ Production build (`npm run build`) succeeds

## 🛠️ Available Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR                |
| `npm run build`   | Type-check (`tsc -b`) and produce `dist/`     |
| `npm run preview` | Serve the production build locally            |
| `npm run lint`    | Run oxlint over the codebase                  |

## 🔒 Privacy

This is a personal-finance tool. Your data lives in two places:
1. **Your device** — always, in LocalStorage.
2. **Firestore** — only when configured, scoped to a unique anonymous ID per device. No analytics, no telemetry, no third-party sharing.

When you want to move to a new device, use **Settings → Export Expenses** to download a JSON backup, then **Import Expenses** on the new device.

---

Made with care for mobile. Enjoy tracking your spending! 💸
