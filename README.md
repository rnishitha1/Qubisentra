# Qubisentra Advanced v2.0 — Original Color Theme

The original dark navy / purple / cyan palette is restored. Account login and signup now open from the **top header**, while **Location & privacy** and administrator event access have moved to the **footer**. The advanced four labs remain unchanged.

**Run:** Open the folder containing `package.json`, run `npm install`, then `npm run dev`.

**Privacy:** A visitor is never geolocated just for logging in. The footer's Location & privacy page asks for explicit browser permission before it displays or attempts to save an approximate location. Login is demo-only until you configure Supabase; do not enter real passwords in demo mode.

---

# Qubisentra Advanced — React learning studio

An educational React/Vite website designed for students learning quantum computing from beginner to advanced.

## Quick start (VS Code terminal)

1. Open the `Qubisentra-advanced` folder in VS Code.
2. Install Node.js 20+ if needed.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local address shown in your terminal, typically http://localhost:5173.

To create a production build: `npm run build`.

## What is new in Version 2

- Professional left sidebar, top bar, account panel, responsive design and accessible controls.
- Bloch sphere: X/Y/Z/H/S/T plus parameterized Rx/Ry/Rz rotations; statevector and Bloch coordinates update when gates are applied; live Z-basis measurement probabilities.
- Matrix Explorer: ten gates with **symbolic exact matrix labels** (no long decimal arrays), 3-digit formatted amplitudes, and adjustable rotation angles.
- Circuit Builder: two qubits, gates assigned to either wire; X/Y/Z/H/S/T/Rx/Ry/Rz plus CNOT/CZ/SWAP, interactive circuit diagram, 128–4096 sample shots, state vector, and probability bars.
- Bell-pair demonstration, learning curriculum, applications, quiz.
- Sign in / sign up interface in the left sidebar, **with optional real accounts via Supabase**.
- Optional, consent-based approximate location events and admin-only view when Supabase is configured.

## Important authentication distinction

**Out of the box, the website runs in DEMO MODE.** The sign-in/sign-up form is a UI demonstration only. It does **not** verify emails, save accounts, or persist passwords. Do not enter a real password in demo mode.

For real authentication:

1. Create a Supabase project at https://supabase.com.
2. Copy `.env.example` to `.env`.
3. Add your Supabase project URL and **publishable/anon key** to `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. In Supabase > Authentication, configure the email provider and desired verification settings.
5. If you want opt-in location logs, run `supabase/schema.sql` in Supabase's SQL Editor.
6. Restart Vite (`npm run dev`).
7. Sign up and sign in from the sidebar.

**Never put a Supabase service-role key or secret in `.env` variables prefixed with `VITE_`.** These are bundled into the browser app and are public. Never disable Row Level Security for location tables.

## Opt-in location feature

- The app does **not** learn where users are merely because they sign in.
- Users must click **Share approximate location** on the Location privacy page and explicitly approve the browser's location permission.
- Coordinates are rounded to **1 decimal place** BEFORE uploading (~11 km latitude resolution). They are not a reliable city or address identifier.
- When Supabase is configured, only opt-in rounded coordinates and the authenticated user ID are stored in `login_locations`.
- Visitors can read their own events; the Admin events screen uses a RLS policy to permit an administrator to read all users' opt-in events.
- The admin role must be assigned **server-side by a trusted operator** in Supabase `app_metadata`, NEVER in a public browser interface. Users cannot make themselves admin in this app.
- Demo mode displays coordinates locally only and creates no backend record.
- For a live site, prepare a real privacy notice, retention/deletion process, access policy, and appropriate consent. Your professor may simply want demo data instead of real user location collection.

## Files

- `src/App.jsx`: main navigation and content pages.
- `src/components/Labs.jsx`: 4 quantum interactive labs.
- `src/components/Accounts.jsx`: authentication UI, location opt-in, admin viewer.
- `src/lib/quantum.js`: standalone complex arithmetic and educational 1–2 qubit statevector simulator.
- `src/lib/supabase.js`: optional auth/database configuration.
- `src/styles.css`: responsive dark visual theme.
- `supabase/schema.sql`: secure location event table and Row Level Security policies.

## Accuracy and limitations

The Bloch sphere is a **2D projection**, not a 3D graphics engine. The simulator is educational; it models ideal noiseless gates and measurements, without hardware noise or decoherence. The circuit supports **exactly two qubits**. Complex state amplitudes are rounded only when displayed, not during calculations. In the 2-qubit circuit, q0 is the most significant bit and CNOT uses the selected wire as the control. Repeated measurements are random samples generated in-browser.

## v2 Classic Theme
The original Qubisentra navy, electric blue, violet and cyan glow theme has been restored and polished. All advanced labs, header account entry, and footer privacy links remain. No extra packages or font downloads are needed.

The ZIP has `package.json` at its **root**. Open the extracted folder in VS Code and run `npm install` then `npm run dev`.
