"use client";
import Link from 'next/link';
import { useState } from 'react';

const DOCS = [
  { slug: 'creating-poap', title: 'Creating a POAP', desc: 'How to register — name, SVG, flags and checks', group: 'Create' },
  { slug: 'metadata', title: 'POAP Metadata', desc: 'What uri() returns and how we decode it', group: 'Create' },
  { slug: 'svg-requirements', title: 'SVG & Gas', desc: 'Size limits, SSTORE2 costs and when to optimize', group: 'Create' },
  { slug: 'soulbound', title: 'Soulbound', desc: 'When a POAP cannot be transferred', group: 'Create' },
  { slug: 'public-minting', title: 'Public Minting', desc: 'Open to anyone and how to pause or resume', group: 'Distribute' },
  { slug: 'allowlists', title: 'Allowlists', desc: 'One-time Merkle root for invite-only mints', group: 'Distribute' },
  { slug: 'proofs', title: 'Allowlist Proofs', desc: 'How attendees prove they are on the list', group: 'Distribute' },
  { slug: 'signature-minting', title: 'Signature Minting', desc: 'Creator signs for 37 days — per-wallet QR', group: 'Distribute' },
  { slug: 'qr-distribution', title: 'QR Distribution', desc: 'Practical ways to hand out POAPs at events', group: 'Distribute' },
  { slug: 'permissions', title: 'Creator Permissions', desc: 'What only the creator can do and when', group: 'Manage' },
  { slug: 'deadlines', title: 'Deadlines', desc: '30-day and 37-day windows at a glance', group: 'Manage' },
  { slug: 'verification', title: 'Verification', desc: 'How anyone verifies a minted POAP', group: 'Verify' },
];

const GROUPS = ['Create', 'Distribute', 'Manage', 'Verify'] as const;

export default function DocsPage() {
  const [q, setQ] = useState('');
  const filtered = DOCS.filter(d=> !q.trim() || d.title.toLowerCase().includes(q.toLowerCase()) || d.desc.toLowerCase().includes(q.toLowerCase()) || d.slug.includes(q.toLowerCase()));
  return (
    <div className="min-w-0 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      {/* Header — clean */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-[2px] border border-line bg-paper-muted px-3 py-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
          <span className="font-medium tracking-wide text-ink">Documentation</span>
          <span className="text-muted">• 100% onchain • Base Sepolia 84532</span>
        </div>
        <h1 className="mt-5 font-display text-3xl sm:text-4xl font-medium tracking-tight leading-none">
          Onchain POAPs <span className="font-light text-muted">—</span> <em>Docs</em>
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-[15px] leading-6 text-muted">
          Simple, plain-language guides. No Solidity or Merkle jargon where it can be avoided. Copy, paste and run.
        </p>
        <div className="mt-5 relative max-w-xl">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">⌕</span>
          <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search guides — e.g. allowlist, signature, svg…" className="w-full rounded-[2px] border-2 border-line bg-white pl-9 pr-9 py-2.5 text-sm focus:border-ink focus:outline-none placeholder:text-muted" />
          {q && <button onClick={()=> setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-[2px] bg-paper-muted border border-line">Clear</button>}
        </div>
        {q && <div className="mt-2 text-xs text-muted">{filtered.length} guides found for “{q}”</div>}
      </div>

      {/* Cards — grouped, simple 2px borders — filtered */}
      <div className="mt-10 space-y-8">
        {GROUPS.map(group => {
          const list = filtered.filter(d=>d.group===group);
          if(list.length===0) return null;
          return (
          <div key={group}>
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{group}</h2>
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs text-muted">{list.length} guides</span>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map(d=> (
                <Link key={d.slug} href={`/docs/${d.slug}`} className="group relative flex flex-col rounded-[2px] border border-line bg-white p-5 hover:border-ink hover:shadow-sm transition-all">
                  <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-brand-red">{d.slug}</div>
                  <div className="mt-2 font-medium leading-tight group-hover:text-brand-red transition-colors">{d.title}</div>
                  <div className="mt-1.5 text-sm leading-5 text-muted flex-1">{d.desc}</div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-ink">
                    Read <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-[2px] bg-paper-muted border border-line flex items-center justify-center text-[10px] font-medium text-muted group-hover:bg-ink group-hover:text-white group-hover:border-ink transition-colors">↗</div>
                </Link>
              ))}
            </div>
          </div>
        )})}
        {filtered.length===0 && <div className="rounded-[2px] border border-dashed border-line bg-paper-muted p-8 text-center text-sm text-muted">No guides found for “{q}” — try another word.</div>}
      </div>

      {/* Quick start — organized, no heavy box */}
      <div className="mt-10 rounded-[2px] border border-line bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-line bg-paper-muted/60 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium">Quick start — copy & paste</h3>
          <span className="text-xs mono-num text-muted">Base Sepolia • viem • 4 calls</span>
        </div>
        <div className="p-5 sm:p-6">
          <pre className="overflow-x-auto rounded-[2px] bg-ink p-4 text-xs leading-6 text-paper mono-num">
{`// 1. Register
await contract.write.registerEvent(name, desc, date, loc, root, svg, url, flags)
// 2. Public mint
await contract.write.mint(eventId)
// 3. Allowlist
const proof = tree.getProof(leaf) // sortPairs: true
await contract.write.allowlistMint(id, proof)
// 4. Signature (creator signs per-wallet)
const sig = await wallet.signMessage({ message: { raw: hash } })
await contract.write.mintWithSignature(id, sig)`}
          </pre>
          <div className="mt-3 text-xs leading-5 text-muted">
            All calls are real Base Sepolia transactions. Verify via <span className="text-ink font-medium">BaseScan</span> or <span className="text-ink font-medium">OpenSea</span>. See each guide for checks and errors.
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <span className="rounded-[2px] border border-line bg-paper-muted px-2.5 py-1">No IPFS</span>
        <span className="rounded-[2px] border border-line bg-paper-muted px-2.5 py-1">No backend</span>
        <span className="rounded-[2px] bg-brand-red text-white border border-brand-red px-2.5 py-1">Contract 0xC3249…9de6</span>
      </div>
    </div>
  );
}
