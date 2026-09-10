# Onchain POAPs — Warm Upgrade Summary (2026-09-10)

## Fixes implemented locally (need push + deploy)

### 1. Wallet modal — now shows all wallets
- `providers/wagmi.tsx` switched from `createConfig(http)` to `getDefaultConfig({
  appName: 'Onchain POAPs — Archive',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'c4f79cc...',
  chains: [baseSepolia],
  transports: { [baseSepolia.id]: http('https://sepolia.base.org') },
  ssr: true
})`
- `Web3Providers` now wraps with `<WagmiProvider><QueryClientProvider><RainbowKitProvider modalSize="wide" initialChain={baseSepolia} showRecentTransactions>`
- Fix: RainbowKit now lists WalletConnect, Coinbase, MetaMask, etc. — not just injected.

### 2. Palette — light white / brown / red (warm archive)
- `app/globals.css` replaced dark ink/brass with:
  - `--paper: #FFFBF0` (warm white)
  - `--paper-elevated: #FFF1E0`
  - `--ink: #2E1A0F` (warm brown)
  - `--brand-red: #9B2C2C` / `--brand-red-strong: #7F1D1D`
  - `--brass: #C46A3D` (terracotta) / `#9B3D1F`
  - `--line: #F0DDC8`
  - New utilities: `.archive-warm`, `.bottom-nav`, `.wax-seal`
- Buttons: `.ink-button` now brand-red bg `#9B2C2C` with shadow.

### 3. Logo
- `components/Header.tsx` replaced dark circle with perforated stamp SVG + wax-seal radial gradient (cream #FFFBF0, brass dot #C46A3D, red seal)
- Active nav underline now `bg-brand-red` (red) not brass.

### 4. Mobile responsiveness — bottom tab bar
- `components/BottomNav.tsx` NEW: `md:hidden` grid 5 tabs: Archive / Create / Explore / Gallery / Docs with inline SVG icons, active = brand-red bg.
- `app/layout.tsx` added `import BottomNav` + `main` now `pb-20 md:pb-0` + renders `<BottomNav />`.
- `components/Header.tsx` quick bar kept `hidden lg:flex` (desktop), bottom nav handles mobile.

### 5. Competitive improvements (stay within poidh 1334 scope, no structure copy)
Audited https://onchain-poaps-frontend-one.vercel.app/ (cream passport, vermilion seal, studio ~1-3KB, filters, kiosk, verify):

- `components/StampStudio.tsx` NEW: scallop / classic / gear shapes, 3 palettes (cream-red / brown-cream / ink-brass), 23 emojis, top/bottom text, generates inline SVG data-URI. Integrated into `app/create/page.tsx` with `artMode` toggle studio/paste. SAMPLE_SVG updated to warm paper + red seal.
- `app/explore/page.tsx` NEW: 5 filters (All / Mintable now / Public / Allowlist / Signature), newest-first IDs, decoded `uri()` images, badge public/allowlist/QR, Load more 12.
- `app/verify/page.tsx` NEW: dedicated verifier reads `hasClaimed` + `events`, ENS, BaseScan link.
- `app/event/[id]/kiosk/page.tsx` NEW: fullscreen kiosk — client-side `signMessage` (personal_sign), QR per attendee (claim url), counter, offline note.

All stay within bounty: no new contract features, just better UX for existing flags (isPublic, allowlistRoot, signature mint window).

### 6. Files changed
- providers/wagmi.tsx
- app/globals.css
- components/Header.tsx
- components/BottomNav.tsx (new)
- components/StampStudio.tsx (new)
- app/layout.tsx
- app/create/page.tsx
- app/explore/page.tsx (new)
- app/verify/page.tsx (new)
- app/event/[id]/kiosk/page.tsx (new)

### 7. Current status
- Local `npm install --legacy-peer-deps` re-ran (890 packages) — wagmi 2.19.5 / viem 2.56.3 / qrcode 1.5.4 / @types/qrcode 1.5.6 present.
- Dev server previously `archive-website-96e2d283` on port 3000, but `npx next build` hung (Turbopack) and now sandbox bash is timing out (deadline_exceeded) for any `bash` or `start_process` call. `read_file` and `web_search` still work — files are persisted.
- Build verification pending: need `npx next build` to succeed locally, then `npx vercel --prod` and `git push`.

### 8. Manual steps to finish (run in your terminal inside /home/user/onchain-poaps-archive)
```bash
# kill any hanging next
pkill -f next || true
rm -rf .next

# ensure deps
npm install --legacy-peer-deps

# build (Turbopack)
npx next build
# if build still complains about next/package.json missing, try:
# echo '{ \"turbopack\": { \"root\": \".\" } }' > next.config.json  # not needed — next.config.ts already at root

# deploy
npx vercel --prod --yes
# or push to GitHub (Vercel auto-deploys)
git add .
git commit -m "warm palette + wallet fix + bottom nav + studio + explore/verify/kiosk"
git push origin main
```

### 9. Vercel env
- Ensure `NEXT_PUBLIC_WC_PROJECT_ID` is set in Vercel dashboard (fallback c4f79cc... works for dev but use your own for prod).

### 10. Design research pending (per new task)
- Inspect https://github.com/mystiquemide?tab=repositories and https://github.com/winsznx?tab=repositories for fit — not yet fetched (bash blocked). Web search available but direct repo fetch needs bash/curl. Will complete once bash recovers.
- Competitor design already audited via fetch of onchain-poaps-frontend-one.vercel.app (see above) — we built better without copying structure.

---
Generated 2026-09-10 Africa/Lagos — local files are ready, push via manual bash once sandbox recovers.
