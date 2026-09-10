# Onchain POAPs — Archive

Fully functional open-source frontend for **OnchainPOAPs** (ERC1155 + SSTORE2) on **Base Sepolia** `0xC3249356a483fbe17d5355D39105D2eA666d9de6` — works as standalone website **and** Farcaster Mini App.

Hybrid design: `nimquest` proof flow + `serein` Next/wagmi shell + `obstat` status colors. Archive = ink/paper/brass ledger.

Live: `https://onchain-poaps-archive.vercel.app` (deploy per below)
Protocol: https://github.com/jvaleskadevs/onchain-poaps

## Features

- **Create** — `registerEvent(name, desc, date, location, allowlistRoot, svg, url, flags)` with live SVG preview, SVGO-lite optimizer (bytes saved + gas estimate), validation (128/512), newline sanitization to fix `uri()` JSON break.
- **Mint** — all 3: public `mint`, allowlist `allowlistMint(proof)`, signature `mintWithSignature(sig)` (37d). Eligibility diagnosis before gas, `simulateContract` first, 8 custom errors decoded.
- **Allowlist** — paste list → dedupe → `keccak256(abi.encodePacked(addr))` + `sortPairs:true` tree → preview root → set onchain (once, 30d) → export proofs JSON.
- **Creator** — public toggle (30d countdown), creator batch mint ≤101, Signature Studio (personal_sign → per-recipient QR PNG + link), 30/37d timers.
- **Gallery** — enumerate `totalEvents`, decode `uri()` base64 + repair, `balanceOfBatch` owned filter, artwork + metadata + BaseScan/OpenSea verify.
- **Docs** — 12 topics covering creation, metadata, SVG, soulbound, public, allowlist, proofs, sig, QR, permissions, deadlines, verification.
- **Mini App** — `/.well-known/farcaster.json` + `fc:miniapp`/`fc:frame` meta + `sdk.actions.ready()`, wallet auto-connects in Warpcast. Note: manifest `accountAssociation` requires mobile custody sig to be verified; app is functional unverified.

## Quick Start

```bash
npm ci
npm run dev # http://localhost:3000
```

Env: no secrets. Chain is hardcoded to Base Sepolia (84532). To test, get Sepolia ETH from faucet.

## Deploy (Vercel)

```bash
vercel --prod
# or push to GitHub → Vercel import → framework Next.js → no env needed
```

Static export also works: `npm run build` → deploy `/.well-known` is preserved.

## Tech

Next.js 14 + Tailwind 4 + wagmi 2 + viem 2 + RainbowKit 2 + @farcaster/frame-sdk + merkletreejs/keccak256 + qrcode. No backend/indexer.

## Contract Notes

- `via_ir` note: contract built with `--via-ir` for Foundry
- `uri()` bug: concatenates strings without escaping — newline in description breaks JSON. Archive sanitizes on write and repairs on read (Event #6 known).
- SSTORE2: 100KB recommended, 120KB practical max (30M gas ceiling @200 gas/byte)

## Farcaster Mini App

Manifest at `/.well-known/farcaster.json` (miniapp + frame). Tags required for claim: cast with Mini App + frontend + GitHub links tagging `@jvaleska.eth` and `@kenny`.

## License

MIT
