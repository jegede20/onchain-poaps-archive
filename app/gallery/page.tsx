"use client";
import { useAccount, useReadContracts, useReadContract } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS, decodeUri } from '@/lib/poap';
import Link from 'next/link';
import { useState } from 'react';

export default function GalleryPage() {
  const { address } = useAccount();
  const [tab, setTab] = useState<'all'|'owned'>('all');
  const { data: total } = useReadContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'totalEvents' });
  const totalNum = total ? Number(total) : 0;
  const ids = Array.from({length: Math.min(totalNum, 50)}, (_,i)=> i).reverse();
  const eventContracts = ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'events' as const, args: [BigInt(id)] as const }));
  const uriContracts = ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'uri' as const, args: [BigInt(id)] as const }));
  const { data: eventsData } = useReadContracts({ contracts: eventContracts, query: { enabled: ids.length>0 } as any });
  const { data: uriData } = useReadContracts({ contracts: uriContracts, query: { enabled: ids.length>0 } as any });
  const balanceContracts = address ? ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'balanceOf' as const, args: [address, BigInt(id)] as const })) : [];
  const { data: balances } = useReadContracts({ contracts: balanceContracts, query: { enabled: !!address && ids.length>0 } as any });

  const items = ids.map((id, idx) => {
    const evt = (eventsData as any)?.[idx]?.result;
    const uri = (uriData as any)?.[idx]?.result as string | undefined;
    const decoded = uri ? decodeUri(uri) : null;
    const bal = address ? Number((balances as any)?.[idx]?.result || 0) : 0;
    if (!evt) return null;
    return { id, name: evt[0], description: evt[1], location: evt[3], creator: evt[6], isSoulbound: evt[9], isPublic: evt[10], image: decoded?.image || null, owned: bal>0, decoded };
  }).filter(Boolean) as any[];

  const filtered = tab==='owned' ? items.filter(i=>i.owned) : items;

  return (
    <div className="min-w-0 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            Collection • {items.length} onchain
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl leading-none tracking-tight">Gallery</h1>
          <p className="mt-2 text-sm sm:text-[15px] text-muted leading-6">Every POAP is fully onchain — SVG + metadata via SSTORE2. <span className="text-ink font-medium">Like a real collection.</span></p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-[2px] bg-paper-muted border border-line shrink-0">
          <button onClick={()=>setTab('all')} className={`px-4 py-1.5 rounded-[2px] text-sm font-medium transition-all ${tab==='all' ? 'bg-brand-red text-white shadow-sm' : 'text-muted hover:text-ink'}`}>All ({items.length})</button>
          <button onClick={()=>setTab('owned')} className={`px-4 py-1.5 rounded-[2px] text-sm font-medium transition-all ${tab==='owned' ? 'bg-brand-red text-white shadow-sm' : 'text-muted hover:text-ink'}`}>Owned {address ? `(${items.filter(i=>i.owned).length})` : ''}</button>
        </div>
      </div>

      {!address && tab==='owned' && <div className="mt-6 text-sm text-muted">Connect wallet to see owned POAPs.</div>}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(item=> (
          <Link key={item.id} href={`/event/${item.id}`} className="archive-card overflow-hidden group interactive-card">
            <div className="aspect-[4/3] bg-paper-muted border-b border-line overflow-hidden flex items-center justify-center p-0 relative">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-ink text-paper flex items-center justify-center font-medium mono-num group-hover:scale-105 transition-transform">{String(item.id).padStart(2,'0')}</div>
              )}
              {item.owned && <div className="absolute top-3 left-3 badge badge-success text-xs shadow-sm">Owned</div>}
              {item.isSoulbound && <div className="absolute top-3 right-3 badge badge-neutral text-[10px]">Soulbound</div>}
            </div>
            <div className="p-4">
              <div className="font-medium line-clamp-1 group-hover:text-brand-red transition-colors">{item.name}</div>
              <div className="text-xs text-muted line-clamp-2 mt-1">{item.description || 'No description'}</div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`badge text-[10px] ${item.isPublic ? 'badge-success' : 'badge-neutral'}`}>{item.isPublic?'Public':'Private'}</span>
                <span className="text-xs text-muted mono-num">#{item.id} • {item.location || 'Onchain'}</span>
              </div>
              <div className="mono-num text-[11px] text-muted mt-2 truncate">{item.creator.slice(0,8)}…{item.creator.slice(-6)}</div>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length===0 && <div className="mt-12 archive-card p-12 text-center text-muted">No POAPs in this view. Try Create or switch tab.</div>}
    </div>
  );
}
