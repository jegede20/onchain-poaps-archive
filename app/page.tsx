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
      {/* Hero - Archive lobby - screenshot inspired */}
      <div className="border-b border-line bg-gradient-to-b from-white via-paper to-paper relative overflow-hidden">
        {/* subtle paper texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:`repeating-linear-gradient(0deg, transparent, transparent 24px, #9B2C2C 24px, #9B2C2C 25px)`}} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
            <div className="flex-1 min-w-0">
              {/* Pill — same color as create button, small, aligned with heading */}
              <div className="hero-pill">
                <span className="hero-pill-dot" />
                Live on Base Sepolia • {totalNum} events archived
              </div>
              {/* Heading — Instrument Serif like screenshot */}
              <h1 className="hero-title mt-6">
                Permanent proof<br />
                <em>of attendance,</em><br />
                built around the chain.
              </h1>
              <p className="mt-6 max-w-[560px] text-[15px] leading-7 text-muted-2 font-light">
                Create an event, store its SVG and metadata entirely onchain via SSTORE2, choose how attendance is distributed, and let attendees mint. <span className="text-ink font-medium">No IPFS. No server.</span>
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/create" className="ink-button text-[15px] px-7 py-3">Create POAP →</Link>
                <Link href="/gallery" className="ghost-button text-[15px] px-6">Open Gallery</Link>
                <Link href="/docs" className="ghost-button text-[15px] px-6">Read Docs</Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3 max-w-[520px]">
                <div className="archive-card p-4 interactive-card group">
                  <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-brand-red">Public</div>
                  <div className="mt-1 font-bold text-sm tracking-wide">Pause / Resume</div>
                  <div className="text-xs text-muted group-hover:text-muted-2 transition-colors">30d creator window</div>
                </div>
                <div className="archive-card p-4 interactive-card group">
                  <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-brand-red">Allowlist</div>
                  <div className="mt-1 font-bold text-sm tracking-wide">Merkle</div>
                  <div className="text-xs text-muted group-hover:text-muted-2 transition-colors">One-time root</div>
                </div>
                <div className="archive-card p-4 interactive-card group">
                  <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-brand-red">Signature</div>
                  <div className="mt-1 font-bold text-sm tracking-wide">37d</div>
                  <div className="text-xs text-muted group-hover:text-muted-2 transition-colors">QR for events</div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-[420px] shrink-0">
              <div className="rounded-2xl p-6 text-white relative overflow-hidden shimmer" style={{background:'#2E1A0F', border:'1px solid #2E1A0F'}}>
                <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'20px 20px'}} />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-red/20 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-[10px] tracking-[0.16em] uppercase font-semibold text-brass flex items-center gap-2">
                    <span className="w-6 h-px bg-brass/40" /> Archive Principles
                  </div>
                  <h3 className="mt-4 font-display text-2xl leading-tight text-white">Every byte is the receipt.</h3>
                  <ul className="mt-6 space-y-3.5 text-[13px] text-white/75 leading-6">
                    <li className="flex gap-3"><span className="text-brass mt-px">—</span> SVG stored via SSTORE2, metadata is base64 onchain.</li>
                    <li className="flex gap-3"><span className="text-brass mt-px">—</span> Max 1 per wallet, soulbound optional, non-transferable enforced.</li>
                    <li className="flex gap-3"><span className="text-brass mt-px">—</span> Farcaster Mini App ready — wallet auto-connects inside Warpcast.</li>
                  </ul>
                  <div className="mt-8 p-3.5 rounded-xl bg-white/10 border border-white/10 mono-num text-xs backdrop-blur">
                    <div className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">Contract</div>
                    <div className="font-semibold text-white mt-0.5">0xC3249…9de6 • eip155:84532</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 archive-inset p-4 flex items-center justify-between interactive-card">
                <div className="text-xs text-muted">Not sure where to start?</div>
                <Link href="/docs/creating-poap" className="text-sm font-semibold text-brand-red hover:underline decoration-2 underline-offset-4">Create in 3 steps →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent Archive Entries</h2>
          <Link href="/gallery" className="text-sm font-medium text-brand-red hover:text-brand-red-strong transition-colors">View all →</Link>
        </div>
        {events.length===0 ? (
          <div className="mt-6 archive-card p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red text-xl">✦</div>
            <div className="mt-3 font-display text-lg">No events yet</div>
            <div className="text-sm text-muted">Be the first to archive attendance.</div>
            <Link href="/create" className="inline-flex mt-5 ink-button">Create the genesis entry</Link>
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e:any)=> (
              <Link key={e.id} href={`/event/${e.id}`} className="archive-card p-4 hover:shadow-lg hover:border-brand-red/20 transition-all group interactive-card">
                <div className="aspect-[4/3] rounded-xl bg-paper-muted border border-line overflow-hidden flex items-center justify-center p-4 relative">
                  <div className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center font-bold mono-num text-sm group-hover:scale-105 transition-transform">{String(e.id).padStart(2,'0')}</div>
                  <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                </div>
                <div className="mt-4">
                  <div className="font-semibold leading-tight group-hover:text-brand-red transition-colors flex items-center gap-2">
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

      {/* Education - catchy */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="archive-card p-6 sm:p-8 grid md:grid-cols-4 gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-red/[0.03] via-transparent to-brass/[0.03] pointer-events-none" />
          {[
            {n:"01", t:"Soulbound", h:"Non-transferable when enabled", d:"Soulbound POAPs cannot be moved after minting. Ideal for attendance proofs."},
            {n:"02", t:"Public", h:"Anyone can claim, pausable", d:"Toggle within 30d. When disabled, only allowlist/signature work."},
            {n:"03", t:"Allowlist", h:"Merkle root, one-time", d:"Paste addresses → tree → root onchain. Each minter supplies their proof."},
            {n:"04", t:"Signature", h:"Creator signs, 37d window", d:"Perfect for QR at live events — but each QR must be per-recipient."},
          ].map(c=> (
            <div key={c.n} className="relative interactive-card p-2 -m-2 rounded-xl">
              <div className="text-[10px] tracking-[0.16em] uppercase font-bold text-brand-red">{c.n} — {c.t}</div>
              <div className="mt-2 font-bold text-sm tracking-wide leading-tight">{c.h}</div>
              <div className="mt-1.5 text-sm text-muted leading-6">{c.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
