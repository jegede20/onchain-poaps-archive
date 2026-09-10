const CONTENT: Record<string, { title: string, body: string }> = {
  "creating-poap": { title: "Creating a POAP", body: `
Register via registerEvent(name, description, eventDate, location, allowlistRoot, svgImage, externalUrl, flags).

Validation (onchain reverts POAP__InvalidValue):
- name 1–128 (required)
- description ≤512 (optional, sanitize newlines)
- svgImage non-empty (required) — stored Base64 via SSTORE2
- location ≤128, externalUrl ≤128
- flags 0–3: 0 private+transferable, 1 soulbound, 2 public, 3 public+soulbound
- allowlistRoot 0x0 = none, else set once within 30d

Flow in Archive: Create wizard → 3 steps (artwork/name → distribution → details) with live SVG preview + SVGO-lite savings + gas estimate (200 gas/byte + 75k). Newlines sanitized to avoid uri() break.
`},
  "metadata": { title: "POAP Metadata", body: `
uri(eventId) returns data:application/json;base64 with:
{ name, description, image: data:image/svg+xml;base64,<svg>, attributes: [{trait_type:Event},{Location},{Date},{EventId},{Multichain EventId},{Creator},{Soulbound}], external_url }

Multichain EventId: eip155:84532:0xC3243...:eventId (CAIP-2). SVG is read from SSTORE2 pointer and Base64 encoded onchain.

Archive decodes with atob + JSON.parse, repairing literal newlines if present (Event #6 bug).
`},
  "svg-requirements": { title: "SVG Requirements / Optimization", body: `
Keep SVG <100KB recommended, theoretical max ~149KB at 30M gas (200 gas/byte + overhead).

SSTORE2 table (Base):
- 1KB ~50k gas (vs 200k vanilla) 75%
- 5KB ~200k (vs 1M) 80%
- 10KB ~350k (vs 2M) 82%

SVGO-lite in Archive: strip <?xml, comments, <metadata>, empty <g>, collapse whitespace, round 2 decimals, shorten #FFFFFF→#FFF. If result fails to parse, original is kept. Shows bytes saved + cost at 0.1 gwei (~$4.8 for 10KB).
`},
  "soulbound": { title: "Soulbound POAPs", body: `
Set flags 1 or 3 to make soulbound. Contract overrides _update to revert POAP__SoulboundNotTransferable for any from!=0 && to!=0.

Use for attendance proofs where transfer would dilute meaning. Gallery shows Soulbound badge. Not toggleable after creation.
`},
  "public-minting": { title: "Public Minting", body: `
When isPublic=true, anyone can call mint(eventId) (no timelock). Creator can toggle via updateEventPublic within 30d.

Archive: toggle shows current status + countdown. Eligibility card is green when eligible, amber when disabled, red when already claimed.

Error POAP__EventNotPublic if attempting mint while closed.
`},
  "allowlists": { title: "Allowlists", body: `
Merkle root approach: creator publishes root, attendees prove membership.

Creation: leaf = keccak256(abi.encodePacked(address)). Tree = MerkleTree(leaves, keccak256, {sortPairs:true}). Root set via updateAllowlistRoot once within 30d.

Archive builder: paste addresses (any separator) → dedupe → bad-line report → preview root → verify sample proof using contract fold → export proofs JSON/CSV.
`},
  "proofs": { title: "Generating Allowlist Proofs", body: `
Creator exports ONE public JSON: { root, addresses, proofs: {address: proof[]} }

Attendee either:
- Loads creator proofs JSON, browser derives its own proof, or
- Pastes raw list → app rebuilds tree locally and finds proof automatically (no server).

Verification: MerkleProof.verify(proof, root, leaf). Archive verifies locally before onchain.

Share proofs via file, not per-email, to keep it simple.
`},
  "signature-minting": { title: "Signature Minting", body: `
Valid for 37 days (30 + 7 grace) after createdAt.

Steps:
1. Creator: message = keccak256(abi.encodePacked(eventId, chainId, recipient))
2. Creator: signature = signMessage(toEthSignedMessageHash(message)) via personal_sign (no gas)
3. Recipient: call mintWithSignature(eventId, signature) — contract recovers signer and checks == creator + hasClaimed false + timelock.

Archive Signature Studio does in-browser signing, shows countdown, exports JSON/CSV + per-recipient QR.

Reverts: POAP__InvalidValue("signer") if wrong signer, AlreadyClaimed if dup, TimeLockExpired if >37d.
`},
  "qr-distribution": { title: "QR-Code Distribution", body: `
For live events: DO NOT put a static QR with a pre-signed signature — recipient is inside the hash, so one signature works for only one wallet.

Working arrangements:
1. Per-attendee QR: creator batches signs list pre-event → prints one QR per person (labeled) → attendee scans own QR
2. Live claim table: attendee enters address on tablet → creator signs on the spot → QR shown for that wallet
3. Claim link: signed link https://archive.../event/id?sig=...&recipient=0x… → attendee opens on phone

Archive generates printable QR PNGs (400px) + per-ATM sheets via qrcode lib.
`},
  "permissions": { title: "Creator Permissions", body: `
Creator = msg.sender of registerEvent. Controls within 30d:

- updateAllowlistRoot: once, if root==0
- updateEventPublic: toggle bool any times
- creatorMint: batch ≤101, skips alreadyClaimed without revert

All guarded by onlyCreator + onlyBeforeLock(createdAt+30d). After window, event is immutable except allowlistMint (no timelock) and mintWithSignature (37d).
`},
  "deadlines": { title: "Minting Deadlines", body: `
- Public toggle / allowlist root / creatorMint: 30 days after createdAt (block.timestamp checked)
- Signature mint: 37 days (30 + 7)
- Allowlist mint & public mint (if enabled): no expiry (allowlist always available per README table)

Archive shows countdowns: Dd Hh or Expired. Eligibility card respects all.

Plan ahead for events with late distribution — use allowlist for permanent, sig for live.
`},
  "verification": { title: "How to Verify Minted POAPs", body: `
- Onchain: balanceOf(account, id) ==1 means owns. Archive does balanceOfBatch for gallery.
- Metadata: decode uri(id) base64 JSON, view image data URI.
- Explorer: BaseScan Sepolia transaction + contract read events totalEvents / hasClaimed / getMultichainEventId.
- Market: OpenSea link https://opensea.io/assets/base/0xC3243.../id (if indexed, otherwise BaseScan is source of truth).

Creator can verify attendees via NewMint events.
`},
};

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = CONTENT[slug];
  if (!doc) return <div className="min-w-0 max-w-3xl mx-auto w-full px-4 py-16">Not found. <a href="/docs" className="underline text-brand-red">Docs</a></div>;
  return (
    <div className="min-w-0 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <a href="/docs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-red transition-colors">← Docs</a>
      <div className="mt-4">
        <div className="hero-pill text-[10px] px-3 py-1">
          <span className="hero-pill-dot" />
          {slug}
        </div>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl leading-tight tracking-tight">{doc.title}</h1>
      </div>
      <div className="mt-6 sm:mt-8 archive-card p-5 sm:p-8 overflow-hidden">
        <pre className="whitespace-pre-wrap break-words text-[14px] leading-7 text-ink font-sans">{doc.body.trim()}</pre>
        <div className="mt-8 archive-inset p-4 text-xs text-muted leading-6">Source: OnchainPOAPs contract (Poap.sol) + README + BaseScan. Contract is source of truth for types, reverts, and windows.</div>
      </div>
    </div>
  );
}
