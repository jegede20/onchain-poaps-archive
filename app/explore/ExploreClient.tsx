"use client";
import Link from 'next/link';
import { useReadContracts } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS, decodeUri } from '@/lib/poap';
import { decodeFunctionResult } from 'viem';
import { useState, useEffect, useMemo } from 'react';

type Filter = 'all' | 'public' | 'allowlist' | 'signature' | 'mintable';

export default function ExploreClient({ initialTotal = 0, initialEvents = {} as Record<number, any>, initialUris = {} as Record<number, string> }: { initialTotal?: number, initialEvents?: Record<number, any>, initialUris?: Record<number, string> }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [show, setShow] = useState(24);
  const [totalNum, setTotalNum] = useState(initialTotal);
  const ids = Array.from({length: Math.min(totalNum+1, show)}, (_,i)=> totalNum - i).filter(n=>n>=0);
  const contracts = ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'events' as const, args: [BigInt(id)] as const }));
  const { data: eventsData } = useReadContracts({ contracts, query: { enabled: ids.length>0, refetchInterval: 4000 } as any });
  const [eventsMap, setEventsMap] = useState<Record<number, any>>(initialEvents);
  useEffect(()=>{
    if(ids.length===0) return;
    let cancelled=false;
    const sel="0x0b791430";
    const fetchOne=async(id:number)=>{
      if(eventsMap[id]) return;
      const data = sel + id.toString(16).padStart(64,'0');
      try{
        const res=await fetch("https://sepolia.base.org",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{to:POAP_ADDRESS,data},"latest"]})});
        const j=await res.json();
        const hex=j.result as string;
        if(!hex || hex==="0x" || !hex.startsWith("0x") || hex.length < 10) return;
        try{
          const decoded = decodeFunctionResult({ abi: POAP_ABI as any, functionName: 'events', data: hex as `0x${string}` }) as any;
          if(!cancelled && decoded) setEventsMap(m=>({...m,[id]: decoded}));
        }catch{}
      }catch{}
    };
    (async()=>{
      for(let i=0;i<ids.length;i+=6){
        await Promise.all(ids.slice(i,i+6).map(fetchOne));
      }
    })();
    const iv=setInterval(()=> ids.forEach(fetchOne), 7000);
    return ()=>{cancelled=true; clearInterval(iv);};
  },[ids.join(",")]);
  const [uriMap, setUriMap] = useState<Record<number,string>>(initialUris);
  useEffect(()=>{
    if(Object.keys(initialUris).length && Object.keys(uriMap).length===0) setUriMap(initialUris);
  },[initialUris]);
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
    if(initialTotal===0) fetchTotal();
    const iv=setInterval(fetchTotal,3500);
    return ()=>{cancelled=true; clearInterval(iv);};
  },[]);
  useEffect(()=>{
    if(ids.length===0) return;
    let cancelled=false;
    const sel="0x0e89341c";
    const pad=(n:number)=> n.toString(16).padStart(64,'0');
    const fetchOne=async(id:number)=>{
      if(uriMap[id]) return;
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
    (async()=>{ for(let i=0;i<ids.length;i+=6){ await Promise.all(ids.slice(i,i+6).map(fetchOne)); } })();
    const iv=setInterval(()=>{ ids.forEach(fetchOne); },7000);
    return ()=>{cancelled=true; clearInterval(iv);};
  },[ids.join(",")]);

  const items = useMemo(()=> ids.map((id, idx)=>{
    const rDirect = eventsMap[id] as any;
    const rWagmi = (eventsData as any)?.[idx]?.result as any;
    const r = rDirect || rWagmi;
    const uri = uriMap[id] as string|undefined;
    if (!r) return null;
    const arr = Array.isArray(r) ? r : [r.name, r.description, r.eventDate, r.location, r.allowlistRoot, r.svgImage, r.creator, r.createdAt, r.externalUrl, r.isSoulbound, r.isPublic];
    const uriDecoded = uri ? decodeUri(uri) : null;
    return { id, name: arr[0], description: arr[1], location: arr[3], allowlistRoot: arr[4], creator: arr[6], createdAt: arr[7], isSoulbound: arr[9], isPublic: arr[10], image: uriDecoded?.image || null, hasAllowlist: arr[4] !== '0x0000000000000000000000000000000000000000000000000000000000000000' };
  }).filter(Boolean) as any[], [ids, eventsData, uriMap, eventsMap]);

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
        items.length===0 ? (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({length: 8}).map((_,i)=>(
              <div key={i} className="rounded-[10px] bg-white border border-[#E9DDC8] p-4 animate-pulse">
                <div className="h-3 bg-paper-muted rounded w-3/4"></div>
                <div className="mt-3 h-5 bg-paper-muted rounded-full w-16"></div>
                <div className="mt-4 w-[148px] h-[148px] mx-auto bg-paper-muted rounded-full"></div>
                <div className="mt-4 h-4 bg-paper-muted rounded w-1/2 mx-auto"></div>
                <div className="mt-2 h-3 bg-paper-muted rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 archive-card p-12 text-center text-muted">No POAPs for this filter. Try All or Create one.</div>
        )
      ) : (
        <>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((it:any)=> {
              const dateLabel = it.createdAt ? new Date(Number(it.createdAt)*1000).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : it.description ? '' : '';
              const series = String((it.id % 4) + 1).padStart(2,'0');
              const pill = it.hasAllowlist ? 'ALLOWLIST' : it.isPublic ? 'PUBLIC' : 'QR CLAIM';
              const pillStyle = it.hasAllowlist ? 'bg-[#FFF0F0] border-[#E9AAAA] text-[#9B2C2C]' : it.isPublic ? 'bg-white border-line text-muted' : 'bg-[#FFF0F0] border-[#E9AAAA] text-[#9B2C2C]';
              return (
              <Link key={it.id} href={`/event/${it.id}`} className="group relative rounded-[10px] bg-white border border-[#E9DDC8] overflow-hidden flex flex-col p-4 hover:shadow-md hover:border-[#DCCBB0] transition-all">
                <div className="flex items-center justify-between text-[10px] tracking-[0.06em] font-medium text-muted mono-num">
                  <span className="truncate">ONCHAIN POAP_ No. {String(it.id).padStart(4,'0')} · SERIES {series}</span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.08em] border ${pillStyle}`}>{pill}</span>
                </div>
                <div className="relative mt-3 flex justify-center">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-[#E9DDC8] flex items-center justify-center shadow-sm z-10">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9B2C2C" strokeWidth="1.6"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.1" fill="#9B2C2C" stroke="none"/></svg>
                  </div>
                  <div className="w-[148px] h-[148px] flex items-center justify-center">
                    {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-contain drop-shadow-[0_6px_16px_rgba(46,26,15,0.08)] group-hover:scale-[1.02] transition-transform duration-300" /> : <div className="w-14 h-14 rounded-full bg-ink text-paper flex items-center justify-center font-medium mono-num text-sm">{String(it.id).padStart(2,'0')}</div>}
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="font-bold text-ink text-[15px] leading-tight line-clamp-1 group-hover:text-brand-red transition-colors">{it.name}</div>
                  <div className="text-xs text-muted mt-1 line-clamp-1">{dateLabel}{it.location ? ` · ${it.location}` : ''}</div>
                  <div className="text-xs text-muted/80 mt-1 line-clamp-1 min-h-[16px]">{it.description || ''}</div>
                </div>
                <div className="w-full h-px bg-[#EDE6D6] mt-4" />
                <div className="w-full flex items-center justify-between mt-3">
                  <span className="text-[11px] font-bold tracking-[0.14em] text-[#9B2C2C]">MINT STAMP</span>
                  <span className="mono-num text-xs text-muted">{it.creator.slice(0,6)}…{it.creator.slice(-4)}</span>
                </div>
              </Link>
            )})}
          </div>
          {show < totalNum+1 && <button onClick={()=>setShow(s=>s+24)} className="mt-8 mx-auto block ghost-button hover:border-brand-red">Load more</button>}
        </>
      )}
    </div>
  );
}
