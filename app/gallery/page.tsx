"use client";
import { useAccount, useReadContracts } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS, decodeUri } from '@/lib/poap';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function GalleryPage() {
  const { address } = useAccount();
  const [tab, setTab] = useState<'all'|'owned'>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'recent'|'name'|'oldest'>('recent');
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
  const ids = Array.from({length: Math.min(totalNum+1, 12)}, (_,i)=> totalNum - i).filter(n=>n>=0);
  const eventContracts = ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'events' as const, args: [BigInt(id)] as const }));
  const { data: eventsData } = useReadContracts({ contracts: eventContracts, query: { enabled: ids.length>0, refetchInterval: 4000 } as any });
  const [uriMap, setUriMap] = useState<Record<number,string>>({});
  useEffect(()=>{
    if(ids.length===0) return;
    let cancelled=false;
    const sel="0x0e89341c";
    const pad=(n:number)=> n.toString(16).padStart(64,'0');
    const fetchOne=async(id:number)=>{
      const data=sel+pad(id);
      try{
        const res=await fetch("https://sepolia.base.org",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{to:POAP_ADDRESS,data},"latest"]})});
        const j=await res.json();
        const hex=j.result as string;
        if(!hex||hex==="0x") return;
        const lenHex=hex.slice(2+64,2+128);
        const len=parseInt(lenHex,16);
        if(!Number.isFinite(len)||len===0) return;
        const dataHex=hex.slice(2+128,2+128+len*2);
        const bytes=Uint8Array.from(dataHex.match(/.{1,2}/g)!.map(b=>parseInt(b,16)));
        const str=new TextDecoder().decode(bytes);
        if(!cancelled) setUriMap(m=>({...m,[id]:str}));
      }catch{}
    };
    (async()=>{
      for(let i=0;i<ids.length;i+=4){
        await Promise.all(ids.slice(i,i+4).map(fetchOne));
        await new Promise(r=>setTimeout(r,120));
      }
    })();
    const iv=setInterval(()=>{ ids.slice(0,8).forEach(fetchOne); },7000);
    return ()=>{cancelled=true; clearInterval(iv);};
  },[ids.join(",")]);
  const balanceContracts = address ? ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'balanceOf' as const, args: [address, BigInt(id)] as const })) : [];
  const { data: balances } = useReadContracts({ contracts: balanceContracts, query: { enabled: !!address && ids.length>0, refetchInterval: 4000 } as any });

  const items = ids.map((id, idx) => {
    const evt = (eventsData as any)?.[idx]?.result;
    const uri = uriMap[id] as string | undefined;
    const decoded = uri ? decodeUri(uri) : null;
    const bal = address ? Number((balances as any)?.[idx]?.result || 0) : 0;
    if (!evt) return null;
    return { id, name: evt[0], description: evt[1], location: evt[3], creator: evt[6], isSoulbound: evt[9], isPublic: evt[10], image: decoded?.image || null, owned: bal>0, decoded };
  }).filter(Boolean) as any[];

  const base = (tab==='owned' ? items.filter(i=>i.owned) : items).filter(i=>{
    if(!q.trim()) return true;
    const s=q.toLowerCase();
    return i.name.toLowerCase().includes(s) || String(i.location).toLowerCase().includes(s) || String(i.creator).toLowerCase().includes(s);
  });
  const filtered = [...base].sort((a,b)=>{
    if(sort==='name') return a.name.localeCompare(b.name);
    if(sort==='oldest') return a.id - b.id;
    return b.id - a.id; // recent
  });

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

      <div className="mt-6 rounded-[2px] border border-line bg-white p-3 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">⌕</span>
          <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search by name, location or creator 0x…" className="w-full rounded-[2px] border-2 border-line bg-white pl-9 pr-9 py-2.5 text-sm focus:border-ink focus:outline-none placeholder:text-muted" />
          {q && <button onClick={()=> setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-[2px] bg-paper-muted border border-line">Clear</button>}
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="text-xs uppercase tracking-widest text-muted">Sort</span>
          <select value={sort} onChange={e=> setSort(e.target.value as any)} className="rounded-[2px] border border-line bg-paper-muted px-3 py-2.5 text-sm focus:border-ink focus:outline-none">
            <option value="recent">Recent first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        <div className="sm:hidden flex gap-2">
          <button onClick={()=> setSort('recent')} className={`flex-1 py-2 rounded-[2px] border text-xs font-medium ${sort==='recent'?'bg-ink text-white border-ink':'bg-white border-line'}`}>Recent</button>
          <button onClick={()=> setSort('oldest')} className={`flex-1 py-2 rounded-[2px] border text-xs font-medium ${sort==='oldest'?'bg-ink text-white border-ink':'bg-white border-line'}`}>Oldest</button>
          <button onClick={()=> setSort('name')} className={`flex-1 py-2 rounded-[2px] border text-xs font-medium ${sort==='name'?'bg-ink text-white border-ink':'bg-white border-line'}`}>A-Z</button>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted">{filtered.length} shown {q ? `for “${q}”` : ''} • sort: <span className="text-ink font-medium">{sort}</span></div>

      {!address && tab==='owned' && <div className="mt-6 text-sm text-muted">Connect wallet to see owned POAPs.</div>}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(item=> (
          <Link key={item.id} href={`/event/${item.id}`} className="rounded-[2px] border border-line bg-white overflow-hidden group hover:border-ink hover:shadow-sm transition-all">
            <div className="aspect-[4/3] bg-paper-muted border-b border-line overflow-hidden flex items-center justify-center p-0 relative">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
              ) : (
                <div className="w-16 h-16 rounded-[2px] bg-ink text-paper flex items-center justify-center font-medium mono-num group-hover:scale-105 transition-transform">{String(item.id).padStart(2,'0')}</div>
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
      {filtered.length===0 && <div className="mt-12 rounded-[2px] border border-dashed border-line bg-paper-muted p-12 text-center text-muted">No POAPs found. Try another search or switch tab.</div>}
    </div>
  );
}
