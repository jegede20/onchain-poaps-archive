"use client";
import Link from 'next/link';
import { useReadContract, useReadContracts } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS } from '@/lib/poap';
import { useState, useEffect } from 'react';

function useEvents(limit=12) {
  const { data: total } = useReadContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'totalEvents' });
  const totalNum = total ? Number(total) : 0;
  const ids = Array.from({length: Math.min(totalNum, limit)}, (_,i)=> totalNum - i).filter(n=>n>=0);
  const contracts = ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'events' as const, args: [BigInt(id)] as const }));
  const { data: eventsData } = useReadContracts({ contracts, query: { enabled: ids.length>0 } as any });
  const events = ids.map((id, idx) => {
    const r = (eventsData as any)?.[idx]?.result;
    if (!r) return null;
    return { id, name: r[0], description: r[1], eventDate: r[2], location: r[3], allowlistRoot: r[4], svgImage: r[5], creator: r[6], createdAt: r[7], externalUrl: r[8], isSoulbound: r[9], isPublic: r[10] };
  }).filter(Boolean);
  return { totalNum, events, ids };
}

export default function Home() {
  const { totalNum, events } = useEvents(9);
  return (
    <div className="flex-1">
      {/* Hero - Archive lobby */}
      <div className="border-b border-line bg-gradient-to-b from-paper-elevated to-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-muted border border-line rounded-full px-3 py-1 bg-paper-elevated">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live on Base Sepolia • {totalNum} events archived
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
                Permanent proof<br />
                <span className="italic font-light">of attendance,</span><br />
                built around the chain.
              </h1>
              <p className="mt-4 max-w-xl text-muted leading-7">
                Create an event, store its SVG and metadata entirely onchain via SSTORE2, choose how attendance is distributed, and let attendees mint. No IPFS. No server.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/create" className="ink-button">Create POAP →</Link>
                <Link href="/gallery" className="ghost-button">Open Gallery</Link>
                <Link href="/docs" className="ghost-button">Read Docs</Link>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <div className="archive-card p-4">
                  <div className="text-xs uppercase tracking-widest text-muted">Public</div>
                  <div className="font-semibold">Pause / Resume</div>
                  <div className="text-xs text-muted">30d creator window</div>
                </div>
                <div className="archive-card p-4">
                  <div className="text-xs uppercase tracking-widest text-muted">Allowlist</div>
                  <div className="font-semibold">Merkle</div>
                  <div className="text-xs text-muted">One-time root</div>
                </div>
                <div className="archive-card p-4">
                  <div className="text-xs uppercase tracking-widest text-muted">Signature</div>
                  <div className="font-semibold">37d</div>
                  <div className="text-xs text-muted">QR for events</div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-[420px] shrink-0">
              <div className="archive-card p-6 bg-ink text-paper border-ink relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'20px 20px'}} />
                <div className="relative">
                  <div className="text-xs tracking-widest uppercase text-brass">Archive Principles</div>
                  <h3 className="mt-3 text-xl font-semibold leading-tight">Every byte is the receipt.</h3>
                  <ul className="mt-6 space-y-3 text-sm text-white/80 leading-6">
                    <li className="flex gap-3"><span className="text-brass">—</span> SVG stored via SSTORE2, metadata is base64 onchain.</li>
                    <li className="flex gap-3"><span className="text-brass">—</span> Max 1 per wallet, soulbound optional, non-transferable enforced.</li>
                    <li className="flex gap-3"><span className="text-brass">—</span> Farcaster Mini App ready — wallet auto-connects inside Warpcast.</li>
                  </ul>
                  <div className="mt-8 p-3 rounded-xl bg-white/10 border border-white/10 mono-num text-xs">
                    <div className="text-white/60">Contract</div>
                    <div className="font-semibold">0xC3249…9de6 • eip155:84532</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 archive-inset p-4 flex items-center justify-between">
                <div className="text-xs text-muted">Not sure where to start?</div>
                <Link href="/docs/creating-poap" className="text-sm font-semibold underline decoration-brass">Create in 3 steps →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Archive Entries</h2>
          <Link href="/gallery" className="text-sm font-medium text-muted hover:text-ink">View all →</Link>
        </div>
        {events.length===0 ? (
          <div className="mt-6 archive-card p-12 text-center">
            <div className="text-muted">No events yet. Be the first to archive attendance.</div>
            <Link href="/create" className="inline-flex mt-4 brass-button">Create the genesis entry</Link>
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e:any)=> (
              <Link key={e.id} href={`/event/${e.id}`} className="archive-card p-4 hover:shadow-lg hover:border-brass/50 transition-all group">
                <div className="aspect-[4/3] rounded-lg bg-paper-muted border border-line overflow-hidden flex items-center justify-center p-4">
                  <div className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center font-bold mono-num text-sm">{String(e.id).padStart(2,'0')}</div>
                </div>
                <div className="mt-4">
                  <div className="font-semibold leading-tight group-hover:text-ink flex items-center gap-2">
                    {e.name}
                    {e.isSoulbound && <span className="badge badge-neutral text-[10px] px-2 py-0.5">Soulbound</span>}
                  </div>
                  <div className="text-xs text-muted mt-1 line-clamp-2">{e.description || 'No description'}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className={`badge text-[10px] ${e.isPublic ? 'badge-success' : 'badge-neutral'}`}>{e.isPublic ? 'Public' : 'Private'}</span>
                    <span className="text-muted mono-num">#{e.id} • {e.location || 'Onchain'}</span>
                  </div>
                  <div className="mono-num text-[11px] text-muted mt-2 truncate">{e.creator.slice(0,10)}…{e.creator.slice(-6)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Education */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="archive-card p-6 sm:p-8 grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-xs tracking-widest uppercase text-muted">01 — Soulbound</div>
            <div className="mt-2 font-semibold">Non-transferable when enabled</div>
            <div className="mt-1 text-sm text-muted leading-6">Soulbound POAPs cannot be moved after minting. Ideal for attendance proofs.</div>
          </div>
          <div>
            <div className="text-xs tracking-widest uppercase text-muted">02 — Public</div>
            <div className="mt-2 font-semibold">Anyone can claim, pausable</div>
            <div className="mt-1 text-sm text-muted leading-6">Toggle within 30d. When disabled, only allowlist/signature work.</div>
          </div>
          <div>
            <div className="text-xs tracking-widest uppercase text-muted">03 — Allowlist</div>
            <div className="mt-2 font-semibold">Merkle root, one-time</div>
            <div className="mt-1 text-sm text-muted leading-6">Paste addresses → tree → root onchain. Each minter supplies their proof.</div>
          </div>
          <div>
            <div className="text-xs tracking-widest uppercase text-muted">04 — Signature</div>
            <div className="mt-2 font-semibold">Creator signs, 37d window</div>
            <div className="mt-1 text-sm text-muted leading-6">Perfect for QR at live events — but each QR must be per-recipient.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
