"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS, decodeUri } from '@/lib/poap';

function useEvents(limit=6) {
  const [totalNum, setTotalNum] = useState(0);
  useEffect(()=>{
    let cancelled=false;
    const fetchTotal=async()=>{
      try{
        const res=await fetch("https://sepolia.base.org",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{to:POAP_ADDRESS,data:"0xba870686"},"latest"]})});
        const j=await res.json();
        const n=parseInt(j.result,16);
        if(!cancelled && Number.isFinite(n)) setTotalNum(n);
      }catch{}
    };
    fetchTotal();
    const iv=setInterval(fetchTotal,3500);
    return ()=>{cancelled=true; clearInterval(iv);};
  },[]);
  const ids = Array.from({length: Math.min(totalNum, limit)}, (_,i)=> totalNum - 1 - i).filter(n=>n>=0);
  const contracts = ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'events' as const, args: [BigInt(id)] as const }));
  const { data: eventsData } = useReadContracts({ contracts, query: { enabled: ids.length>0, refetchInterval: 5000 } as any });
  const uriContracts = ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'uri' as const, args: [BigInt(id)] as const }));
  const { data: uriData } = useReadContracts({ contracts: uriContracts, query: { enabled: ids.length>0, refetchInterval: 5000 } as any });
  const events = ids.map((id, idx) => {
    const r = (eventsData as any)?.[idx]?.result;
    if (!r) return null;
    const uri = (uriData as any)?.[idx]?.result as string | undefined;
    const decoded = uri ? decodeUri(uri) : null;
    const image = decoded?.image || null;
    return { id, name: r[0], description: r[1], eventDate: r[2], location: r[3], allowlistRoot: r[4], svgImage: r[5], creator: r[6], createdAt: r[7], externalUrl: r[8], isSoulbound: r[9], isPublic: r[10], decoded, image };
  }).filter(Boolean) as any[];
  return { totalNum, events, ids };
}

export default function Home() {
  const { totalNum, events } = useEvents(12);
  const latest = events[0] as any | undefined;
  const marqueeEvents = events.length>0 ? [...events, ...events] : [];
  return (
    <div className="flex-1">
      {/* Hero - Archive lobby - not too tall, heading wide + distinct background */}
      <div className="border-b border-line bg-paper relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
            <div className="flex-1 min-w-0">
              <div className="rounded-[2px] border border-line bg-[#FFFBF0] p-6 sm:p-7 relative overflow-hidden" style={{backgroundColor:'#FFFBF0', backgroundImage:`repeating-linear-gradient(0deg, transparent, transparent 26px, rgba(155,44,44,0.07) 26px, rgba(155,44,44,0.07) 27px)`}}>
                <div className="hero-pill">
                  <span className="hero-pill-dot" />
                  Live on Base Sepolia • {totalNum} events archived
                </div>
                <h1 className="hero-title mt-5 max-w-none w-full">
                  Permanent proof<br />
                  <em>of attendance,</em><br />
                  built around the chain.
                </h1>
                <p className="mt-5 max-w-[560px] text-[15px] leading-7 text-muted-2 font-light">
                  Create an event, store its SVG and metadata entirely onchain via SSTORE2, choose how attendance is distributed, and let attendees mint. <span className="text-ink font-medium">No IPFS. No server.</span>
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/create" className="ink-button text-[15px] px-7 py-3">Create POAP →</Link>
                <Link href="/gallery" className="ghost-button text-[15px] px-6">Open Gallery</Link>
                <Link href="/docs" className="ghost-button text-[15px] px-6">Read Docs</Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3 max-w-[520px]">
                <Link href="/docs/public-minting" className="group rounded-[2px] border border-line bg-white p-4 hover:border-ink hover:shadow-sm transition-all flex flex-col">
                  <div className="w-8 h-8 rounded-[2px] bg-paper-muted border border-line flex items-center justify-center group-hover:bg-ink group-hover:border-ink group-hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-[0.16em] font-medium text-brand-red">Public</div>
                  <div className="mt-1 font-medium text-sm leading-tight group-hover:text-brand-red transition-colors">Anyone can mint</div>
                  <div className="mt-1 text-xs leading-4 text-muted">Pause or resume within 30 days →</div>
                </Link>
                <Link href="/docs/allowlists" className="group rounded-[2px] border border-line bg-white p-4 hover:border-ink hover:shadow-sm transition-all flex flex-col">
                  <div className="w-8 h-8 rounded-[2px] bg-paper-muted border border-line flex items-center justify-center group-hover:bg-ink group-hover:border-ink group-hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 6h10M8 12h10M8 18h10"/><path d="M3 6h0.5M3 12h0.5M3 18h0.5" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-[0.16em] font-medium text-brand-red">Allowlist</div>
                  <div className="mt-1 font-medium text-sm leading-tight group-hover:text-brand-red transition-colors">Invite only</div>
                  <div className="mt-1 text-xs leading-4 text-muted">Set invite list once →</div>
                </Link>
                <Link href="/docs/signature-minting" className="group rounded-[2px] border border-line bg-white p-4 hover:border-ink hover:shadow-sm transition-all flex flex-col">
                  <div className="w-8 h-8 rounded-[2px] bg-paper-muted border border-line flex items-center justify-center group-hover:bg-ink group-hover:border-ink group-hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 18l-4 1 1-4 12.5-11.5z"/><path d="M14 7l3 3"/></svg>
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-[0.16em] font-medium text-brand-red">Signature</div>
                  <div className="mt-1 font-medium text-sm leading-tight group-hover:text-brand-red transition-colors">QR for events</div>
                  <div className="mt-1 text-xs leading-4 text-muted">Signed per wallet, 37 days →</div>
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-[420px] shrink-0 space-y-4">
              {/* 1 — Hero Live Artwork: real SVG from chain, proves SSTORE2 */}
              <div className="rounded-[2px] border-2 border-line bg-white overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-line bg-paper-muted/60">
                  <div className="text-[11px] uppercase tracking-[0.16em] font-medium text-ink flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                    Live artwork
                  </div>
                  <span className="text-xs mono-num text-muted">{latest ? `#${latest.id} • onchain` : 'No events yet'}</span>
                </div>
                <div className="h-[240px] flex items-center justify-center p-4 relative" style={{background:'#FFFBF0'}}>
                  <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, #9B2C2C 1px, transparent 0)', backgroundSize:'16px 16px'}} />
                  {latest?.image ? (
                    <div className="w-[200px] h-[200px] relative flex items-center justify-center">
                      <img src={latest.image} alt={latest.name} className="w-full h-full object-contain" />
                    </div>
                  ) : latest ? (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center mx-auto animate-pulse">{String(latest.id).padStart(2,'0')}</div>
                      <div className="mt-2 text-xs text-muted">Loading art…</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-[2px] bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mx-auto text-brand-red">✦</div>
                      <div className="mt-3 text-sm font-medium">No POAP yet</div>
                      <div className="text-xs text-muted">Create the first one — it will appear here live.</div>
                    </div>
                  )}
                </div>
                {latest ? (
                  <div className="p-4 bg-white border-t border-line">
                    <div className="font-medium leading-tight line-clamp-1">{latest.name}</div>
                    <div className="text-xs text-muted mt-1 line-clamp-1">{latest.location || 'Onchain'} • {latest.isSoulbound ? 'Soulbound' : 'Transferable'}</div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/event/${latest.id}`} className="flex-1 ink-button text-xs py-2 text-center rounded-[2px]">View & mint →</Link>
                      <a href={`https://sepolia.basescan.org/address/0xC3249356a483fbe17d5355D39105D2eA666d9de6#code`} target="_blank" className="px-3 py-2 rounded-[2px] border border-line bg-white text-xs font-medium hover:border-ink transition-colors">BaseScan ↗</a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white border-t border-line">
                    <Link href="/create" className="ink-button w-full text-center text-sm py-2.5 rounded-[2px]">Create the genesis POAP →</Link>
                  </div>
                )}
              </div>

              <div className="rounded-[2px] p-6 text-white relative overflow-hidden shimmer" style={{background:'#2E1A0F', border:'1px solid #2E1A0F'}}>
                <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'20px 20px'}} />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-red/20 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-brass flex items-center gap-2">
                    <span className="w-6 h-px bg-brass/40" /> Archive Principles
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-medium leading-tight text-white">Every byte is the receipt.</h3>
                  <ul className="mt-6 space-y-3.5 text-[13px] text-white/75 leading-6">
                    <li className="flex gap-3"><span className="text-brass mt-px">—</span> SVG stored via SSTORE2, metadata is base64 onchain.</li>
                    <li className="flex gap-3"><span className="text-brass mt-px">—</span> Max 1 per wallet, soulbound optional, non-transferable enforced.</li>
                    <li className="flex gap-3"><span className="text-brass mt-px">—</span> Farcaster Mini App ready — wallet auto-connects inside Warpcast.</li>
                  </ul>
                  <div className="mt-8 p-3.5 rounded-xl bg-white/10 border border-white/10 mono-num text-xs backdrop-blur">
                    <div className="text-white/50 text-[10px] uppercase tracking-widest font-medium">Contract</div>
                    <div className="font-medium text-white mt-0.5">0xC3249…9de6 • eip155:84532</div>
                  </div>
                </div>
              </div>
              <div className="archive-inset p-4 flex items-center justify-between interactive-card">
                <div className="text-xs text-muted">Not sure where to start?</div>
                <Link href="/docs/creating-poap" className="text-sm font-medium text-brand-red hover:underline decoration-2 underline-offset-4">Create in 3 steps →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 — One-Click Trust Ribbon */}
      <div className="border-b border-line bg-ink text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-9 flex items-center gap-2 sm:gap-4 text-xs overflow-hidden">
          <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-brass animate-pulse" />
            <span className="uppercase tracking-[0.14em] font-medium text-brass">Onchain verified</span>
          </span>
          <span className="hidden sm:block w-px h-4 bg-white/15 shrink-0" />
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <a href="https://sepolia.basescan.org/address/0xC3249356a483fbe17d5355D39105D2eA666d9de6#code" target="_blank" className="mono-num hover:text-brass transition-colors truncate">0xC3249…9de6 • verified • SSTORE2</a>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline text-white/70">No IPFS</span>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline text-white/70">Base Sepolia 84532</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0 ml-auto">
            <a href="https://sepolia.basescan.org/address/0xC3249356a483fbe17d5355D39105D2eA666d9de6#code" target="_blank" className="rounded-[2px] border border-white/20 bg-white/10 px-2.5 py-1 font-medium hover:bg-white hover:text-ink transition-colors">BaseScan ↗</a>
            <span className="mono-num text-white/50 hidden lg:inline">eip155:84532</span>
          </div>
        </div>
      </div>

      {/* 3 — 3-Step Path */}
      <div className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-brand-red">How it flows</div>
              <h2 className="mt-1 font-display text-2xl sm:text-[28px] font-medium tracking-tight leading-none">From idea to kept proof</h2>
            </div>
            <span className="text-xs text-muted">3 steps • 2 minutes • 100% onchain</span>
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              {n:'01', title:'Create', desc:'Name + SVG (we keep it tiny), choose soulbound & where it lives.', cta:'Create POAP →', href:'/create', accent:'bg-brand-red'},
              {n:'02', title:'Choose how people get it', desc:'Open to all, invite list, or QR at the door — you can change within 30 days.', cta:'See how →', href:'/docs/allowlists', accent:'bg-ink'},
              {n:'03', title:'Collect & verify', desc:'Attendees mint (1 per wallet), see it in Gallery, check on BaseScan anytime.', cta:'Open Gallery →', href:'/gallery', accent:'bg-brass'},
            ].map(s=> (
              <div key={s.n} className="group rounded-[2px] border-2 border-line bg-white p-5 hover:border-ink hover:shadow-sm transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-line group-hover:bg-brand-red/20 transition-colors" />
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-[2px] ${s.accent} text-white flex items-center justify-center text-sm font-medium mono-num`}>{s.n}</div>
                  <div className="text-[11px] uppercase tracking-[0.16em] font-medium text-muted">{s.n} — STEP</div>
                  <span className="ml-auto text-muted group-hover:text-brand-red transition-colors">→</span>
                </div>
                <div className="mt-4 font-display text-lg font-medium leading-tight">{s.title}</div>
                <div className="mt-2 text-sm leading-6 text-muted">{s.desc}</div>
                <Link href={s.href} className="mt-4 inline-flex text-sm font-medium text-ink hover:text-brand-red transition-colors">{s.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real images — competitive edge */}
      <div className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-brand-red">In the wild</div>
              <h2 className="mt-1 font-display text-2xl sm:text-[28px] font-medium tracking-tight leading-none">Where proof hits the room</h2>
            </div>
            <span className="text-xs text-muted">Real events • real mints • no mock data</span>
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            <div className="archive-card overflow-hidden p-0 group">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src="/landing/event-1.jpg" alt="POAP creation" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="badge bg-white text-ink border-white text-[10px]">Create • SSTORE2</span>
                  <span className="w-8 h-8 rounded-[2px] bg-brand-red text-white flex items-center justify-center text-xs font-medium">01</span>
                </div>
              </div>
              <div className="p-4">
                <div className="font-medium text-sm leading-tight">Create — fully onchain</div>
                <div className="text-xs text-muted mt-1 leading-5">Name, SVG, soulbound, public, allowlist root — stored as calldata, not IPFS.</div>
              </div>
            </div>
            <div className="archive-card overflow-hidden p-0 group">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src="/landing/event-2.jpg" alt="Distribution" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="badge bg-white text-ink border-white text-[10px]">Distribute • 3 ways</span>
                  <span className="w-8 h-8 rounded-[2px] bg-ink text-white flex items-center justify-center text-xs font-medium">02</span>
                </div>
              </div>
              <div className="p-4">
                <div className="font-medium text-sm leading-tight">Distribute — Public / Allowlist / Sig</div>
                <div className="text-xs text-muted mt-1 leading-5">Open public 30d, set invite list once, or sign per-wallet QR (37d).</div>
              </div>
            </div>
            <div className="archive-card overflow-hidden p-0 group">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src="/landing/event-3.jpg" alt="Collect" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="badge bg-white text-ink border-white text-[10px]">Collect • Gallery</span>
                  <span className="w-8 h-8 rounded-[2px] bg-brass text-white flex items-center justify-center text-xs font-medium">03</span>
                </div>
              </div>
              <div className="p-4">
                <div className="font-medium text-sm leading-tight">Collect — Gallery + Verify</div>
                <div className="text-xs text-muted mt-1 leading-5">View owned, see SVG + metadata, verify hasClaimed & open on BaseScan.</div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-[4px] bg-paper-muted border border-line">100% onchain</span>
            <span className="px-2.5 py-1 rounded-[4px] bg-paper-muted border border-line">SSTORE2 • ~$0.05 / mint</span>
            <span className="px-2.5 py-1 rounded-[4px] bg-paper-muted border border-line">No IPFS • No backend</span>
            <span className="px-2.5 py-1 rounded-[4px] bg-brand-red text-white border-brand-red">Base Sepolia • 0xC3249…9de6</span>
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium">Recent Archive Entries</h2>
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
                  {e.image ? (
                    <img src={e.image} alt={e.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center font-medium mono-num text-sm group-hover:scale-105 transition-transform">{String(e.id).padStart(2,'0')}</div>
                  )}
                  <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                </div>
                <div className="mt-4">
                  <div className="font-medium leading-tight group-hover:text-brand-red transition-colors flex items-center gap-2">
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

      {/* 4 — Gallery Marquee: real SVGs, live */}
      <div className="border-y border-line bg-paper-muted/40 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-brand-red">Onchain canvas</div>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-medium tracking-tight leading-none">Art stays onchain — not a link</h2>
            </div>
            <Link href="/gallery" className="text-sm font-medium text-ink border border-line bg-white px-3 py-1.5 rounded-[2px] hover:border-ink transition-colors">Open Gallery →</Link>
          </div>
        </div>
        <div className="relative overflow-hidden pb-8">
          <div className="absolute left-0 top-0 bottom-8 w-12 bg-gradient-to-r from-paper-muted/40 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-paper-muted/40 to-transparent z-10 pointer-events-none" />
          {events.length===0 ? (
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="rounded-[2px] border border-dashed border-line bg-white p-8 text-center text-sm text-muted">No artwork yet — your POAP will be the first tile here.</div>
            </div>
          ) : (
            <div className="flex gap-4 animate-marquee" style={{width:'max-content', animation:'marquee 28s linear infinite'}}>
              {marqueeEvents.map((e:any, idx:number)=> (
                <Link key={`${e.id}-${idx}`} href={`/event/${e.id}`} className="shrink-0 w-[160px] rounded-[2px] border-2 border-line bg-white overflow-hidden hover:border-ink hover:shadow-sm transition-all group">
                  <div className="h-[140px] flex items-center justify-center p-3 relative" style={{background:'#FFFBF0'}}>
                    {e.image ? (
                      <img src={e.image} alt={e.name} className="w-[120px] h-[120px] object-contain" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center mono-num text-xs">{String(e.id).padStart(2,'0')}</div>
                    )}
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-[2px] bg-ink text-white flex items-center justify-center text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">↗</div>
                  </div>
                  <div className="p-2.5 border-t border-line">
                    <div className="text-xs font-medium leading-tight line-clamp-1 group-hover:text-brand-red">{e.name}</div>
                    <div className="text-[11px] text-muted mono-num">#{e.id} • {e.isSoulbound ? 'Soulbound' : 'Transferable'}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } } .animate-marquee:hover { animation-play-state: paused }`}</style>
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
              <div className="text-[10px] tracking-[0.16em] uppercase font-medium text-brand-red">{c.n} — {c.t}</div>
              <div className="mt-2 font-medium text-sm tracking-wide leading-tight">{c.h}</div>
              <div className="mt-1.5 text-sm text-muted leading-6">{c.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
