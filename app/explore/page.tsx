import { POAP_ABI, POAP_ADDRESS } from '@/lib/poap';
import ExploreClient from './ExploreClient';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const client = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org") });

async function fetchTotal(): Promise<number> {
  // try viem first, then raw fetch fallback — viem handles retries better on Vercel
  try{
    const n = await client.readContract({ address: POAP_ADDRESS, abi: POAP_ABI as any, functionName: 'totalEvents' }) as unknown as bigint;
    return Number(n);
  }catch{
    try{
      const res = await fetch("https://sepolia.base.org",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{to:POAP_ADDRESS,data:"0xba870686"},"latest"]}), cache: 'no-store' as any});
      const j = await res.json();
      const n = parseInt(j.result,16);
      return Number.isFinite(n) ? n : 0;
    }catch{ return 0; }
  }
}

async function fetchEventsMap(ids: number[]): Promise<Record<number, any>> {
  if(ids.length===0) return {};
  try{
    const res = await client.multicall({
      contracts: ids.map(id=> ({ address: POAP_ADDRESS, abi: POAP_ABI as any, functionName: 'events' as const, args: [BigInt(id)] as const })),
      allowFailure: true,
    });
    const out: Record<number, any> = {};
    res.forEach((r, idx)=>{
      const id = ids[idx];
      if(r.status==='success' && r.result) out[id]=r.result as any;
    });
    // if multicall returned nothing (e.g. rate-limit), fallback to individual fetches
    if(Object.keys(out).length===0){
      const { decodeFunctionResult } = await import('viem');
      const sel="0x0b791430";
      await Promise.all(ids.slice(0,12).map(async (id)=>{
        const data = sel + id.toString(16).padStart(64,'0');
        try{
          const res2 = await fetch("https://sepolia.base.org",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{to:POAP_ADDRESS,data},"latest"]}), cache: 'no-store' as any});
          const j2 = await res2.json();
          const hex=j2.result as string;
          if(!hex || hex==="0x" || hex.length<10) return;
          const decoded = decodeFunctionResult({ abi: POAP_ABI as any, functionName: 'events', data: hex as `0x${string}` }) as any;
          if(decoded) out[id]=decoded;
        }catch{}
      }));
    }
    return out;
  }catch{
    return {};
  }
}

async function fetchUrisMap(ids: number[]): Promise<Record<number,string>> {
  const sel="0x0e89341c";
  const out: Record<number,string> = {};
  await Promise.all(ids.map(async (id)=>{
    const data=sel+id.toString(16).padStart(64,'0');
    try{
      const res=await fetch("https://sepolia.base.org",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{to:POAP_ADDRESS,data},"latest"]}), cache: 'no-store'});
      const j=await res.json();
      const hex=j.result as string;
      if(!hex||hex==="0x") return;
      const lenHex=hex.slice(2+64,2+128);
      const len=parseInt(lenHex,16);
      if(!Number.isFinite(len)||len===0) return;
      const dataHex=hex.slice(2+128,2+128+len*2);
      const bytes=Uint8Array.from(dataHex.match(/.{1,2}/g)!.map(b=>parseInt(b,16)));
      const str=new TextDecoder().decode(bytes);
      out[id]=str;
    }catch{}
  }));
  return out;
}

export default async function ExplorePage(){
  const total = await fetchTotal();
  const initialShow = 24;
  const ids = Array.from({length: Math.min(total+1, initialShow)}, (_,i)=> total - i).filter(n=>n>=0);
  const [eventsMap, urisMap] = await Promise.all([fetchEventsMap(ids), fetchUrisMap(ids)]);
  // Pass decoded initial data so client renders instantly without skeletons
  return <ExploreClient initialTotal={total} initialEvents={eventsMap} initialUris={urisMap} />;
}
