"use client";
import Link from 'next/link';
import { useReadContracts } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS, decodeUri } from '@/lib/poap';
import { useState, useEffect, useMemo } from 'react';

type Filter = 'all' | 'public' | 'allowlist' | 'signature' | 'mintable';

export default function ExplorePage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [show, setShow] = useState(24);
  const [totalNum, setTotalNum] = useState(0);
  const ids = Array.from({length: Math.min(totalNum+1, show)}, (_,i)=> totalNum - i).filter(n=>n>=0);
  const contracts = ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'events' as const, args: [BigInt(id)] as const }));
  const { data: eventsData } = useReadContracts({ contracts, query: { enabled: ids.length>0, refetchInterval: 4000 } as any });
  const [uriMap, setUriMap] = useState<Record<number,string>>({});
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
    const iv=setInterval(()=>{ ids.slice(0,12).forEach(fetchOne); },7000);
    return ()=>{cancelled=true; clearInterval(iv);};
  },[ids.join(",")]);

  const items = useMemo(()=> ids.map((id, idx)=>{
    const r = (eventsData as any)?.[idx]?.result;
    const uri = uriMap[id] as string|undefined;
    if (!r) return null;
    const decoded = uri ? decodeUri(uri) : null;
    return { id, name: r[0], description: r[1], location: r[3], allowlistRoot: r[4], creator: r[6], createdAt: r[7], isSoulbound: r[9], isPublic: r[10], image: decoded?.image || null, hasAllowlist: r[4] !== '0x0000000000000000000000000000000000000000000000000000000000000000' };
  }).filter(Boolean) as any[], [ids, eventsData, uriMap]);

  const filtered = useMemo(()=> {
    if (filter==='all') return items;
    if (filter==='public') return items.filter(i=>i.isPublic);
    if (filter==='allowlist') return items.filter(i=>i.hasAllowlist);
    if (filter==='signature') return items.filter(i=> !i.isPublic && !i.hasAllowlist);
    if (filter==='mintable') return items.filter(i=>i.isPublic || i.hasAllowlist);
    return items;
  }, [items, filter]);

  const tabs: { id: Filter, label: string }[] = [
    { id:'all', label:'All' },
    { id:'mintable', label:'Mintable now' },
    { id:'public', label:'Public' },
    { id:'allowlist', label:'Allowlist' },
    { id:'signature', label:'Signature' },
  ];

  return (
    <div className="min-w-0 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            Explore • {totalNum ? totalNum+1 : 0} registered
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl leading-none tracking-tight">Explore POAPs</h1>
          <p className="mt-2 text-sm sm:text-[15px] text-muted leading-6">Newest first — what you see is what calldata holds.</p>
        </div>
        <Link href="/create" className="ink-button text-sm shrink-0">Create a POAP →</Link>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map(t=> (
          <button key={t.id} onClick={()=>setFilter(t.id)} className={`px-4 py-2 rounded-[2px] text-sm font-medium whitespace-nowrap border transition-all ${filter===t.id ? 'bg-brand-red text-white border-brand-red shadow-sm' : 'bg-white border-line text-muted hover:border-brand-red/30 hover:text-ink'}`}>{t.label}</button>
        ))}
      </div>

      {filtered.length===0 ? (
        <div className="mt-8 archive-card p-12 text-center text-muted">No POAPs for this filter. Try All or Create one.</div>
      ) : (
        <>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((it:any)=> (
              <Link key={it.id} href={`/event/${it.id}`} className="archive-card overflow-hidden group interactive-card">
                <div className="relative bg-paper-muted aspect-[4/3] flex items-center justify-center overflow-hidden">
                  {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" /> : <div className="w-20 h-20 rounded-2xl bg-white border border-line flex items-center justify-center font-medium mono-num shadow-sm">{String(it.id).padStart(2,'0')}</div>}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="badge badge-brass text-[10px]">#{String(it.id).padStart(4,'0')}</span>
                    {it.isPublic ? <span className="badge badge-success text-[10px]">Public</span> : it.hasAllowlist ? <span className="badge badge-info text-[10px]">Allowlist</span> : <span className="badge badge-warn text-[10px]">QR claim</span>}
                  </div>
                  {it.isSoulbound && <div className="absolute top-3 right-3 badge badge-neutral text-[10px]">Soulbound</div>}
                </div>
                <div className="p-4">
                  <div className="font-medium leading-tight line-clamp-1 group-hover:text-brand-red transition-colors">{it.name}</div>
                  <div className="text-xs text-muted line-clamp-2 mt-1">{it.description || 'No description'}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted mono-num">
                    <span>{it.location || 'Onchain'}</span><span>•</span><span>{it.creator.slice(0,6)}…{it.creator.slice(-4)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {show < totalNum+1 && <button onClick={()=>setShow(s=>s+24)} className="mt-8 mx-auto block ghost-button hover:border-brand-red">Load more</button>}
        </>
      )}
    </div>
  );
}
