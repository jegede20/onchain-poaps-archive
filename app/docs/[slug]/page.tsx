import Link from 'next/link';

const CONTENT: Record<string, { title: string, summary: string, body: string }> = {
  "creating-poap": { title: "Creating a POAP", summary: "Register a new event onchain — what is required and what is optional.", body: `Register by calling registerEvent on Base Sepolia.

What you must provide:
• Name — 1 to 128 characters, required. Keep it short and clear.
• SVG image — required. This is the artwork people mint. It is stored onchain via SSTORE2.
• Flags — choose public (anyone can mint) and soulbound (cannot be transferred).

What you can add later (optional):
• Description — up to 512 characters
• Location — up to 128
• Event date — timestamp
• External URL — up to 128
• Allowlist root — leave as 0x0 for now, set later if you need invite-only

In this app: use Create → 3 steps. Step 1 checks name and SVG size, shows live preview and gas estimate. Newlines and quotes are cleaned automatically so the onchain metadata stays valid.`},

  "metadata": { title: "POAP Metadata", summary: "How uri() stores and returns data, and how we read it.", body: `Each POAP has one uri(eventId) that returns:

data:application/json;base64,{ name, description, image, attributes, external_url }

• image is data:image/svg+xml;base64,<your SVG> — fully onchain via SSTORE2 pointer.
• Multichain ID: eip155:84532:0xC3243…:eventId — same ID on any chain (CAIP-2).

How the app reads it: take the base64 part after the comma, atob, JSON.parse, show image and fields. If decoding fails (Event #6 had a raw newline), we repair it and try again.`},

  "svg-requirements": { title: "SVG & Gas", summary: "How large your SVG can be and what it costs.", body: `Aim for under 100KB. In practice Base can hold ~120KB before hitting gas limits.

SSTORE2 saves gas vs normal storage:
• 1KB costs about 50k gas (instead of 200k) — 75% cheaper
• 5KB about 200k (instead of 1M)
• 10KB about 350k (instead of 2M)

Tip in this app: the Stamp Studio designs are 1–3KB — very cheap. If you paste an exported SVG, the optimizer removes comments and whitespace and shows bytes saved. At 0.1 gwei, 10KB is roughly $1–5.`},

  "soulbound": { title: "Soulbound POAPs", summary: "When a proof should stay with the original wallet.", body: `Choose soulbound at creation (flags 1 or 3). The contract blocks any transfer after mint — if from is not zero and to is not zero, it reverts.

Use soulbound for attendance proofs where resale would break trust. Use transferable if you want people to be able to send or trade it.

You cannot change this later. The gallery shows a Soulbound badge.`},

  "public-minting": { title: "Public Minting", summary: "Open minting and how the creator can pause or resume.", body: `If public is on, anyone can call mint(eventId) — no list, no signature.

The creator can flip it with updateEventPublic any number of times, but only within the first 30 days.

In the app:
• The event page shows Public Open / Closed and time left.
• The eligibility box is green when you can mint, amber when closed, red if you already hold 1.
• If you try to mint while closed, the contract returns EventNotPublic.`},

  "allowlists": { title: "Allowlists", summary: "A one-time invite list using a Merkle root.", body: `Use an allowlist when you want invite-only mints.

How it works in plain terms:
• You publish a single root hash onchain. Attendees prove they are on the list with a short proof.
• Leaf = keccak256(address). Tree is built with sortPairs true. Root is set once via updateAllowlistRoot within 30 days.

In this app (Create → Creator Console):
• Paste addresses (any separator, one per line or comma)
• App removes duplicates, warns about bad lines, shows preview root
• Click Set Allowlist Root Onchain, then Download proofs JSON to share with your list.`},

  "proofs": { title: "Allowlist Proofs", summary: "What attendees actually submit.", body: `After the creator publishes a root and shares proofs, an attendee needs to submit their proof array.

Two easy ways:
• If you have the creator’s proofs JSON, the app can load it and find your proof automatically.
• Or paste the raw address list — the app rebuilds the tree locally and derives your proof, no server needed.

The app checks the proof locally before sending. You share the proofs file once, not per person.`},

  "signature-minting": { title: "Signature Minting", summary: "Creator signs per wallet for 37 days — great for QR codes.", body: `Valid for 37 days after creation (30 days + 7 days grace).

Plain flow:
1. Creator builds a message = keccak256(eventId, chainId 84532, recipient address)
2. Creator signs it with personal_sign — no gas, just a wallet signature.
3. The recipient calls mintWithSignature(eventId, signature). The contract checks the signer is the creator and that the wallet has not claimed before.

In the app, the Signature Studio does steps 1–2 in your browser, shows time left, and can create a QR for that one recipient.

Errors you may see: InvalidValue (wrong signer), AlreadyClaimed (1 per wallet), TimeLockExpired (after 37 days).`},

  "qr-distribution": { title: "QR Distribution", summary: "How to use QR codes at real events without breaks.", body: `Important: one signature = one wallet. Do not print a single static QR with one signature — it will only work for that one wallet.

Three patterns that work:
• Per-person QR — batch sign a list before the event, print one QR per person (label them), each attendee scans their own.
• Live table — attendee types their address on a tablet, creator signs on the spot, QR appears for that wallet.
• Signed link — https://archive…/event/id?sig=0x…&recipient=0x… — attendee opens it on their phone.

The app can generate 400px QR PNGs and a zip of per-recipient sheets via the qrcode library.`},

  "permissions": { title: "Creator Permissions", summary: "What only the creator can do, and when that ends.", body: `Creator = the address that called registerEvent.

Within the first 30 days the creator can:
• Set allowlist root — once, only if still 0x0
• Toggle public — any number of times
• Batch mint to up to 101 addresses via creatorMint (skips those who already hold it, no revert)

After 30 days the event is locked except for attendee mints (allowlist and signature within 37 days). All checks enforce onlyCreator and the time window.`},

  "deadlines": { title: "Deadlines", summary: "All time windows at a glance.", body: `• Public toggle, allowlist root, creator batch mint — 30 days from createdAt.
• Signature mint — 37 days from createdAt.
• Allowlist mint and public mint (if open) — no expiry beyond those windows; allowlist stays usable after 30 days if root was set in time.

The app shows live countdowns (e.g., 12d 4h or Expired) in the Creator Analytics card and Eligibility box. Plan invite-only events with allowlist if you need attendance after 37 days.`},

  "verification": { title: "Verification", summary: "How anyone confirms a POAP is real.", body: `• Onchain: balanceOf(account, id) equals 1 means they own it. The gallery uses balanceOfBatch to show Owned.
• Metadata: decode uri(id) base64 JSON to see image data URI.
• Explorer: check totalEvents, hasClaimed, and getMultichainEventId on BaseScan Sepolia.
• Market: OpenSea link is https://opensea.io/assets/base/0xC3249…/id — if not indexed, BaseScan is the source of truth.

NewMint events let the creator see who minted and when.`},
};

const ORDER = Object.keys(CONTENT);

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = CONTENT[slug];
  if (!doc) return <div className="min-w-0 max-w-3xl mx-auto w-full px-4 py-16">Not found. <Link href="/docs" className="underline text-brand-red">Back to Docs</Link></div>;
  const idx = ORDER.indexOf(slug);
  const prev = idx > 0 ? ORDER[idx-1] : null;
  const next = idx < ORDER.length-1 ? ORDER[idx+1] : null;

  const paragraphs = doc.body.split('\n\n');

  return (
    <div className="min-w-0 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/docs" className="hover:text-brand-red">Docs</Link>
        <span className="opacity-40">/</span>
        <span className="text-ink font-medium">{slug}</span>
      </div>

      {/* Header */}
      <div className="mt-4 rounded-[2px] border border-line bg-[#FFFBF0] p-6 sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-[2px] bg-white border border-line px-2.5 py-1 text-[11px] mono-num">
          <span className="w-2 h-2 rounded-full bg-brand-red" /> {slug}
        </div>
        <h1 className="mt-4 font-display text-2xl sm:text-3xl font-medium tracking-tight leading-tight">{doc.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{doc.summary}</p>
      </div>

      {/* Body — organized */}
      <div className="mt-6 rounded-[2px] border border-line bg-white overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="space-y-5">
            {paragraphs.map((block, i) => {
              const isList = block.trim().startsWith('•');
              if (isList) {
                const items = block.split('\n').map(s=> s.replace(/^•\s*/, '').trim()).filter(Boolean);
                return (
                  <ul key={i} className="list-disc pl-5 space-y-2 text-[15px] leading-7 text-ink">
                    {items.map((it, j) => (
                      <li key={j} className="marker:text-brand-red">{it}</li>
                    ))}
                  </ul>
                );
              }
              // code-like block with → or with ` `? keep as paragraph but mono for code lines
              const isCodeish = block.includes('await contract') || block.includes('https://');
              if (isCodeish) {
                return (
                  <pre key={i} className="overflow-x-auto rounded-[2px] bg-ink p-4 text-xs leading-6 text-paper mono-num whitespace-pre-wrap break-words">
                    {block.trim()}
                  </pre>
                );
              }
              return <p key={i} className="text-[15px] leading-7 text-ink">{block.trim()}</p>;
            })}
          </div>

          <div className="mt-8 rounded-[2px] border border-line bg-paper-muted p-4 text-xs leading-6 text-muted">
            Source: Onchain POAPs contract at <span className="mono-num text-ink">0xC3249…9de6</span> on Base Sepolia (84532). Contract is the final source of truth for rules and errors.
          </div>
        </div>

        {/* Prev / Next — simple */}
        <div className="flex items-center justify-between gap-3 border-t border-line bg-paper-muted/40 px-6 py-4">
          {prev ? <Link href={`/docs/${prev}`} className="text-sm font-medium hover:text-brand-red">← {CONTENT[prev].title}</Link> : <span />}
          {next ? <Link href={`/docs/${next}`} className="text-sm font-medium hover:text-brand-red">{CONTENT[next].title} →</Link> : <Link href="/docs" className="text-sm font-medium hover:text-brand-red">Back to Docs →</Link>}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <Link href="/docs" className="rounded-[2px] border border-line bg-white px-3 py-1.5 hover:border-ink">All docs</Link>
        <Link href="/create" className="rounded-[2px] bg-ink text-white px-3 py-1.5">Create POAP →</Link>
      </div>
    </div>
  );
}
