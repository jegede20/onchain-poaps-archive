"use client";
import { useState, useMemo, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { POAP_ABI, POAP_ADDRESS, getFlags, decodeContractError } from '@/lib/poap';
import { optimizeSvg, estimateGas, formatGasCost } from '@/lib/svg-optimizer';
import { StampStudio } from '@/components/StampStudio';
import Link from 'next/link';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">
  <rect width="200" height="200" rx="22" fill="#FFFBF0"/>
  
  <defs>
    <path id="topArc" d="M 42 78 A 64 64 0 0 1 158 78"/>
    <path id="bannerPath" d="M 58 121.5 H 142"/>
    <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.2" stdDeviation="1.3" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M 100.0 10.0 Q 109.4 5.0 117.6 11.7 Q 127.7 8.6 134.4 16.9 Q 145.0 15.8 150.0 25.2 Q 160.6 26.2 163.6 36.4 Q 173.8 39.4 174.8 50.0 Q 184.2 55.0 183.1 65.6 Q 191.4 72.3 188.3 82.4 Q 195.0 90.6 190.0 100.0 Q 195.0 109.4 188.3 117.6 Q 191.4 127.7 183.1 134.4 Q 184.2 145.0 174.8 150.0 Q 173.8 160.6 163.6 163.6 Q 160.6 173.8 150.0 174.8 Q 145.0 184.2 134.4 183.1 Q 127.7 191.4 117.6 188.3 Q 109.4 195.0 100.0 190.0 Q 90.6 195.0 82.4 188.3 Q 72.3 191.4 65.6 183.1 Q 55.0 184.2 50.0 174.8 Q 39.4 173.8 36.4 163.6 Q 26.2 160.6 25.2 150.0 Q 15.8 145.0 16.9 134.4 Q 8.6 127.7 11.7 117.6 Q 5.0 109.4 10.0 100.0 Q 5.0 90.6 11.7 82.4 Q 8.6 72.3 16.9 65.6 Q 15.8 55.0 25.2 50.0 Q 26.2 39.4 36.4 36.4 Q 39.4 26.2 50.0 25.2 Q 55.0 15.8 65.6 16.9 Q 72.3 8.6 82.4 11.7 Q 90.6 5.0 100.0 10.0 Z" fill="#C8AD73" stroke="#A88A4A" stroke-width="0.75"/>
  <circle cx="100" cy="100" r="75.5" fill="#0F2B26" stroke="#C8AD73" stroke-width="1.55"/>
  <circle cx="100" cy="100" r="73.2" fill="none" stroke="#EADDC0" stroke-width="0.55" opacity="0.40"/>
  <circle cx="100" cy="100" r="57.2" fill="none" stroke="#C8AD73" stroke-width="0.55" stroke-dasharray="1.9 4" opacity="0.52"/>
  <circle cx="100" cy="100" r="52.5" fill="none" stroke="#EADDC0" stroke-width="0.45" stroke-dasharray="0.9 5.5" opacity="0.24"/>
  <text fill="#EADDC0" font-family="Cormorant Garamond, Georgia, serif" font-size="13.2" font-weight="700" letter-spacing="2.1" text-anchor="middle">
    <textPath href="#topArc" startOffset="50%" dominant-baseline="middle">MY EVENT 2026</textPath>
  </text>
  <g transform="translate(100 56)"><path d="M0 -2.6 L0.9 -0.9 L2.6 0 L0.9 0.9 L0 2.6 L-0.9 0.9 L-2.6 0 L-0.9 -0.9 Z" fill="#EADDC0"/></g>
  <g transform="translate(76 68)"><path d="M0 -3 L0.95 -0.95 L3 0 L0.95 0.95 L0 3 L-0.95 0.95 L-3 0 L-0.95 -0.95 Z" fill="#EADDC0" opacity="1"/><circle cx="0" cy="0" r="0.45" fill="#A88A4A" opacity="0.95"/></g><g transform="translate(124 68)"><path d="M0 -3 L0.95 -0.95 L3 0 L0.95 0.95 L0 3 L-0.95 0.95 L-3 0 L-0.95 -0.95 Z" fill="#EADDC0" opacity="1"/><circle cx="0" cy="0" r="0.45" fill="#A88A4A" opacity="0.95"/></g><g transform="translate(86 73)"><path d="M0 -3 L0.95 -0.95 L3 0 L0.95 0.95 L0 3 L-0.95 0.95 L-3 0 L-0.95 -0.95 Z" fill="#EADDC0" opacity="1"/><circle cx="0" cy="0" r="0.45" fill="#A88A4A" opacity="0.95"/></g><g transform="translate(114 73)"><path d="M0 -3 L0.95 -0.95 L3 0 L0.95 0.95 L0 3 L-0.95 0.95 L-3 0 L-0.95 -0.95 Z" fill="#EADDC0" opacity="1"/><circle cx="0" cy="0" r="0.45" fill="#A88A4A" opacity="0.95"/></g><g transform="translate(72 96)"><path d="M0 -3 L0.95 -0.95 L3 0 L0.95 0.95 L0 3 L-0.95 0.95 L-3 0 L-0.95 -0.95 Z" fill="#EADDC0" opacity="1"/><circle cx="0" cy="0" r="0.45" fill="#A88A4A" opacity="0.95"/></g><g transform="translate(128 96)"><path d="M0 -3 L0.95 -0.95 L3 0 L0.95 0.95 L0 3 L-0.95 0.95 L-3 0 L-0.95 -0.95 Z" fill="#EADDC0" opacity="1"/><circle cx="0" cy="0" r="0.45" fill="#A88A4A" opacity="0.95"/></g><g transform="translate(83 108)"><path d="M0 -3 L0.95 -0.95 L3 0 L0.95 0.95 L0 3 L-0.95 0.95 L-3 0 L-0.95 -0.95 Z" fill="#EADDC0" opacity="1"/><circle cx="0" cy="0" r="0.45" fill="#A88A4A" opacity="0.95"/></g><g transform="translate(117 108)"><path d="M0 -3 L0.95 -0.95 L3 0 L0.95 0.95 L0 3 L-0.95 0.95 L-3 0 L-0.95 -0.95 Z" fill="#EADDC0" opacity="1"/><circle cx="0" cy="0" r="0.45" fill="#A88A4A" opacity="0.95"/></g>
  <g transform="translate(68 88) rotate(-16) scale(1.15)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55" stroke-linejoin="round"/><path d="M0 0 L 6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g><g transform="translate(67.5 95) rotate(-13) scale(1.0899999999999999)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55" stroke-linejoin="round"/><path d="M0 0 L 6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g><g transform="translate(67 103) rotate(-10) scale(1.0299999999999998)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55" stroke-linejoin="round"/><path d="M0 0 L 6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g><g transform="translate(66.5 111) rotate(-7) scale(0.97)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55" stroke-linejoin="round"/><path d="M0 0 L 6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g><g transform="translate(66 118) rotate(-4) scale(0.9099999999999999)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55" stroke-linejoin="round"/><path d="M0 0 L 6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g>
  <g transform="translate(132 88) rotate(16) scale(1.15)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55"/><path d="M0 0 L -6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g><g transform="translate(132.5 95) rotate(13) scale(1.0899999999999999)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55"/><path d="M0 0 L -6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g><g transform="translate(133 103) rotate(10) scale(1.0299999999999998)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55"/><path d="M0 0 L -6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g><g transform="translate(133.5 111) rotate(7) scale(0.97)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55"/><path d="M0 0 L -6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g><g transform="translate(134 118) rotate(4) scale(0.9099999999999999)"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="#EADDC0" stroke="#A88A4A" stroke-width="0.55"/><path d="M0 0 L -6.5 1.1" stroke="#A88A4A" stroke-width="0.45" opacity="0.95"/></g>
  <text x="100" y="98.5" text-anchor="middle" dominant-baseline="middle" font-size="36" style="filter: drop-shadow(0 1.2px 0 rgba(0,0,0,0.5))">🏆</text>
  <g filter="url(#goldShadow)">
    <rect x="44" y="118.5" width="112" height="15.2" rx="1.6" fill="none" stroke="#C8AD73" stroke-width="1.15"/>
    <rect x="44" y="118.5" width="112" height="15.2" rx="1.6" fill="#0F2B26" />
    <rect x="45.2" y="119.7" width="109.6" height="12.8" rx="1" fill="none" stroke="#EADDC0" stroke-width="0.4" opacity="0.55"/>
  </g>
  <text x="100" y="128.8" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="7.2" font-weight="700" letter-spacing="1.45" fill="#EADDC0">ONCHAIN • POAP • BASE</text>
  <text x="100" y="142.8" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="6.4" font-weight="600" letter-spacing="2.2" fill="#EADDC0" opacity="0.92">PARTICIPANT</text>
  <g transform="translate(100 149)"><path d="M0 -2.4 L0.8 -0.8 L2.4 0 L0.8 0.8 L0 2.4 L-0.8 0.8 L-2.4 0 L-0.8 -0.8 Z" fill="#EADDC0"/><circle cx="0" cy="0" r="0.4" fill="#0F2B26"/></g>
</svg>`;

export default function CreatePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [step, setStep] = useState(1);
  const [artMode, setArtMode] = useState<'studio'|'paste'>('studio');
  const [name, setName] = useState('');
  const [svg, setSvg] = useState(SAMPLE_SVG);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [isSoulbound, setIsSoulbound] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [allowlistRoot, setAllowlistRoot] = useState('0x0000000000000000000000000000000000000000000000000000000000000000');
  const [optimized, setOptimized] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [justUsed, setJustUsed] = useState(false);
  const [fallbackEventId, setFallbackEventId] = useState<number | null>(null);

  const { data: hash, writeContractAsync, isPending, error: writeError } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess: receiptIsSuccess, isError: receiptIsError, error: receiptError } = useWaitForTransactionReceipt({ hash, chainId: baseSepolia.id, query: { enabled: !!hash } } as any);

  // surface wagmi errors via our banner (without breaking UI)
  useEffect(() => {
    if (writeError) setError(decodeContractError(writeError));
  }, [writeError]);
  useEffect(() => {
    if (receiptIsError && receiptError) setError(decodeContractError(receiptError));
    if (receipt && (receipt as any).status === 'reverted') setError('Transaction reverted onchain — check name/description/flags or gas. View on BaseScan for details.');
  }, [receiptIsError, receiptError, receipt]);

  // fallback: if wagmi polling stalls (rate-limited RPC), poll eth_getTransactionReceipt ourselves and parse NewEvent id
  useEffect(() => {
    if (!hash) return;
    if (receiptIsSuccess) return;
    let cancelled = false;
    let tries = 0;
    const iv = setInterval(async () => {
      if (cancelled || tries++ > 25) { clearInterval(iv); return; }
      try {
        const r = await fetch('https://sepolia.base.org', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [hash] }) });
        const j = await r.json();
        const rec = j.result;
        if (rec && rec.status === '0x1') {
          // parse NewEvent log to get eventId (only reliable if contract emitted)
          try {
            const newEventTopic = '0x6919a91d7b24adca72543da0d0d1d5836bfbe1014d3d8b6652f3dd7ef3f3c0b0' as string; // keccak may differ; fallback to first log
            const logs: any[] = rec.logs || [];
            // fallback: take eventId from log data if possible, else use totalEvents
            for (const log of logs) {
              if (log.address?.toLowerCase() === POAP_ADDRESS.toLowerCase() && log.topics?.length >= 2) {
                const idHex = log.topics[1];
                const id = parseInt(idHex, 16);
                if (Number.isFinite(id) && id > 0) { if (!cancelled) setFallbackEventId(id); break; }
              }
            }
          } catch {}
          if (!cancelled) clearInterval(iv);
        }
      } catch {}
    }, 3000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [hash, receiptIsSuccess]);

  // detect first POAP for this creator (for differentiated success copy)
  const [isFirst, setIsFirst] = useState<boolean | null>(null);
  useEffect(() => {
    if (!address) { setIsFirst(null); return; }
    let cancelled = false;
    (async () => {
      try {
        // quick check: fetch total then scan last 12 events for creator match
        const res = await fetch('https://sepolia.base.org', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: POAP_ADDRESS, data: '0xba870686' }, 'latest'] }) });
        const j = await res.json();
        const total = parseInt(j.result || '0x0', 16);
        if (!total) { if (!cancelled) setIsFirst(true); return; }
        const sel = '0x0b791430';
        let found = false;
        const checkIds = Array.from({ length: Math.min(total + 1, 20) }, (_, i) => total - i).filter((n) => n > 0);
        for (let i = 0; i < checkIds.length; i += 6) {
          const slice = checkIds.slice(i, i + 6);
          const results = await Promise.all(slice.map(async (id) => {
            const data = sel + id.toString(16).padStart(64, '0');
            try {
              const rr = await fetch('https://sepolia.base.org', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: POAP_ADDRESS, data }, 'latest'] }) });
              const jj = await rr.json();
              const hex = jj.result as string;
              if (!hex || hex === '0x') return null;
              // creator is 7th output (index 6) — decode loosely: hex contains address at known offset
              // fallback: simple contains check for address in hex
              return hex.toLowerCase().includes(address.toLowerCase().slice(2));
            } catch { return null; }
          }));
          if (results.some(Boolean)) { found = true; break; }
        }
        if (!cancelled) setIsFirst(!found);
      } catch { if (!cancelled) setIsFirst(null); }
    })();
    return () => { cancelled = true; };
  }, [address]);

  // parse eventId from receipt logs when wagmi succeeds
  const successEventId = useMemo(() => {
    if (fallbackEventId) return fallbackEventId;
    if (!receipt || !(receipt as any).logs) return null;
    try {
      const logs: any[] = (receipt as any).logs;
      for (const log of logs) {
        if (log.address?.toLowerCase() === POAP_ADDRESS.toLowerCase() && log.topics?.length >= 2) {
          const id = parseInt(log.topics[1], 16);
          if (Number.isFinite(id) && id > 0) return id;
        }
      }
    } catch {}
    return null;
  }, [receipt, fallbackEventId]);

  const svgToUse = optimized || svg;
  const gas = useMemo(()=> estimateGas(new Blob([svgToUse]).size), [svgToUse]);

  const canStep1 = name.trim().length>=1 && name.length<=128 && svgToUse.trim().length>0;
  const canStep3 = description.length<=512 && location.length<=128 && externalUrl.length<=128;

  const handleRegister = async () => {
    setError(null);
    // enforce Base Sepolia chain
    if (chainId !== baseSepolia.id) {
      try {
        await switchChainAsync({ chainId: baseSepolia.id });
      } catch (e: any) {
        setError('Please switch to Base Sepolia (chain 84532) in your wallet and try again.');
        return;
      }
    }
    const safeName = name.replace(/\n/g,' ').replace(/"/g,"'");
    const safeDesc = description.replace(/\n/g,' ').replace(/"/g,"'");
    const safeLoc = location.replace(/\n/g,' ').replace(/"/g,"'");
    const safeUrl = externalUrl.replace(/\n/g,'').replace(/"/g,'');
    const flags = getFlags(isPublic, isSoulbound);
    let dateVal = 0;
    if (eventDate) dateVal = Math.floor(new Date(eventDate).getTime()/1000);
    // pre-validate
    if (!safeName.trim() || safeName.length > 128) { setError('Name must be 1-128 characters.'); return; }
    if (safeDesc.length > 512) { setError('Description must be ≤512 characters.'); return; }
    if (safeLoc.length > 128) { setError('Location must be ≤128 characters.'); return; }
    if (safeUrl.length > 128) { setError('External URL must be ≤128 characters.'); return; }
    if (!svgToUse.trim()) { setError('SVG artwork is required.'); return; }
    if (new Blob([svgToUse]).size > 120 * 1024) { setError('SVG too large (>120KB) — optimize or shrink before registering.'); return; }
    try {
      await writeContractAsync({
        address: POAP_ADDRESS,
        abi: POAP_ABI,
        functionName: 'registerEvent',
        args: [safeName, safeDesc, BigInt(dateVal), safeLoc, allowlistRoot as `0x${string}`, svgToUse, safeUrl, flags],
        chainId: baseSepolia.id,
      } as any);
    } catch (e:any) {
      // writeContractAsync throws on user reject or validation
      if (e?.message?.includes('User rejected') || e?.message?.includes('rejected')) return; // silent on cancel
      setError(decodeContractError(e));
    }
  };

  const isTxSuccess = (receiptIsSuccess && (receipt as any)?.status === 'success') || (fallbackEventId !== null);
  const showSuccess = (isTxSuccess && !!hash) || (receiptIsSuccess && !!hash && (receipt as any)?.status !== 'reverted');

  if (showSuccess && hash) {
    const first = isFirst === true;
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        {/* Minted badge — our build design, large centered */}
        <div className="mx-auto w-[300px] sm:w-[360px] aspect-square flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full opacity-[0.04]" style={{background:'radial-gradient(circle at center, #9B2C2C 1px, transparent 1px)', backgroundSize:'14px 14px'}} />
          <div dangerouslySetInnerHTML={{ __html: svgToUse }} className="w-full h-full relative drop-shadow-[0_8px_24px_rgba(46,26,15,0.12)]" />
        </div>
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFBF0] border border-[#E9DDC8] text-xs font-medium text-[#2E1A0F]"><span className="w-2 h-2 rounded-full bg-[#2ecc71] animate-pulse" /> Onchain confirmed</div>
        <h2 className="mt-4 font-display text-[26px] sm:text-[30px] font-bold tracking-[-0.015em] leading-tight text-ink">
          {first ? 'You created your first POAP — welcome!' : `“${name || 'FIST'}” is live onchain`} <span className="inline-block translate-y-[1px]">🎉</span>
        </h2>
        <p className="mt-3 text-[14px] sm:text-[15px] text-muted leading-6 max-w-xl mx-auto">
          {first ? 'Your first proof is registered forever on Base Sepolia. Artwork and metadata are 100% onchain via SSTORE2.' : 'POAP is registered forever on Base Sepolia. Artwork and metadata are stored fully onchain.'}
        </p>
        {successEventId ? <p className="mt-2 text-xs mono-num text-muted">Event #{successEventId} • tx {hash.slice(0,10)}…{hash.slice(-8)}</p> : <p className="mt-2 text-xs mono-num text-muted/70 break-all">tx {hash.slice(0,10)}…{hash.slice(-8)}</p>}
        {successEventId ? <p className="mt-1 text-xs text-muted">View your POAP design and details below — now discoverable in Explore & Gallery.</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/gallery" className="px-6 py-3 rounded-[2px] bg-[#9B2C2C] text-white text-sm font-medium shadow-[0_4px_14px_rgba(155,44,44,0.35)] hover:bg-[#7a2222] transition-colors border border-[#9B2C2C]">
            View in Gallery
          </Link>
          {successEventId ? <Link href={`/event/${successEventId}`} className="px-6 py-3 rounded-[2px] bg-white border-2 border-line text-sm font-medium hover:border-ink hover:bg-paper-muted transition-colors text-ink">Open event page →</Link> : null}
          <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-[2px] bg-white border-2 border-line text-sm font-medium hover:border-brand-red/30 hover:bg-paper-muted transition-colors text-ink">
            Check on BaseScan →
          </a>
        </div>
        <div className="mt-8 archive-inset p-4 text-left max-w-xl mx-auto">
          <div className="text-xs uppercase tracking-[0.12em] font-medium text-muted">Your POAP details</div>
          <div className="mt-3 grid gap-2.5 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted">Name</span><span className="font-medium text-ink truncate">{name || '—'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted">Description</span><span className="text-ink truncate max-w-[60%]">{description || '—'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted">Location</span><span className="text-ink">{location || '—'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted">Flags</span><span className="mono-num text-ink">{getFlags(isPublic,isSoulbound)} • {isPublic ? 'Public' : 'Private'} • {isSoulbound ? 'Soulbound' : 'Transferable'}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted">SVG</span><span className="mono-num text-ink">{new Blob([svgToUse]).size.toLocaleString()} bytes</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      {/* Header — organized, wide */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-brand-red">Archive</Link><span className="opacity-40">/</span><span className="text-ink font-medium">Create POAP</span>
      </div>
      <div className="hero-pill mt-4">
        <span className="hero-pill-dot" />
        Create • SSTORE2 • 100% onchain
      </div>
      <h1 className="mt-4 font-display text-3xl sm:text-[36px] font-medium tracking-[-0.01em] leading-[0.95]">Register a new <em>Onchain POAP</em></h1>
      <p className="mt-2 max-w-2xl text-[14px] sm:text-[15px] text-muted leading-6">All metadata and SVG live onchain via SSTORE2. Optimize your SVG to save gas — no IPFS, no server.</p>

      {/* 1 Guided Create Wizard — fancy, plain explanations, fits build */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {n:1, label:'Artwork & Name', desc:'Pick tiny, clear art', plain:'Choose or paste SVG. Keep under 100KB.'},
          {n:2, label:'Distribution', desc:'Who can mint?', plain:'Public, invite list, or per-wallet QR.'},
          {n:3, label:'Details & Review', desc:'Final check', plain:'Add story, location, date and mint.'},
        ].map(({n,label,desc,plain})=> (
          <button key={n} onClick={()=> n < step && setStep(n)} disabled={n>step} className={`text-left rounded-[2px] border-2 p-3 flex gap-3 items-start transition-all ${step===n ? 'bg-white border-ink shadow-sm' : step>n ? 'bg-white border-brand-red/30' : 'bg-paper-muted border-line opacity-60'}`}>
            <div className={`w-8 h-8 shrink-0 flex items-center justify-center text-sm font-medium border-2 rounded-[2px] ${step===n ? 'bg-ink text-white border-ink' : step>n ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-muted border-line'}`}>{step>n ? '✓' : n}</div>
            <div className="min-w-0">
              <div className={`text-sm font-medium leading-none ${step===n ? 'text-ink' : step>n ? 'text-brand-red' : 'text-muted'}`}>{label}</div>
              <div className="text-xs font-medium text-muted mt-1">{desc}</div>
              <div className="text-xs text-muted leading-4 mt-1 hidden sm:block">{plain}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-5 gap-6 items-start">
        {/* Form — left, organized cards */}
        <div className="lg:col-span-3 space-y-5">
          <div className="archive-card p-5 sm:p-6">
            {step===1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-medium">1 — Artwork & Name</h2>
                  <p className="text-xs text-muted mt-1">This is what attendees will mint. Keep it under 100KB.</p>
                </div>
                <div>
                  <label className="text-sm font-medium">POAP name * <span className="text-muted font-normal">(1-128)</span></label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="ETHGlobal Paris 2026" className="mt-1.5 w-full rounded-[2px] border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" />
                  <div className="text-xs text-muted mt-1.5 flex justify-between"><span>{name.length}/128</span><span className={name.length>120 ? 'text-warn' : 'text-muted'}>{128-name.length} left</span></div>
                </div>
                <div>
                  <div className="flex gap-2 p-1 rounded-[2px] bg-paper-muted border border-line w-fit">
                    <button onClick={()=>setArtMode('studio')} className={`px-4 py-1.5 rounded-[2px] text-xs font-medium ${artMode==='studio'?'bg-brand-red text-white shadow-sm':'text-muted hover:text-ink'}`}>🎨 Stamp Studio</button>
                    <button onClick={()=>setArtMode('paste')} className={`px-4 py-1.5 rounded-[2px] text-xs font-medium ${artMode==='paste'?'bg-brand-red text-white shadow-sm':'text-muted hover:text-ink'}`}>Paste SVG</button>
                  </div>
                  {artMode==='studio' ? (
                    <div className="mt-4">
                      <StampStudio value={svg} onUse={(s)=>{setSvg(s); setOptimized(null); setStats(null); setJustUsed(true); setTimeout(()=>setJustUsed(false),2500); setStep(2); window.scrollTo({top:0, behavior:'smooth'});}} />
                      {justUsed && <div className="mt-3 text-xs font-medium text-success bg-success/10 border border-success/20 rounded-[2px] px-3 py-2 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-[10px]">✓</span> Design applied — viewing in next step. SVG is now on the right preview, continue to distribution.</div>}
                      <div className="mt-3 text-xs text-muted bg-paper-muted border border-line rounded-[2px] px-3 py-2">Studio SVGs are hand-optimized (~1–3 KB) — cheaper than exported files. Click the badge or “Use this design” to load — auto-advances to next step to view & continue.</div>
                      {/* Live Size & Cost Meter — fancy, fits build */}
                      <div className="mt-3 rounded-[2px] border border-line bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium tracking-wide flex items-center gap-2">
                            <span className="w-7 h-7 rounded-[2px] bg-ink text-white flex items-center justify-center text-[10px]">◈</span>
                            Live Size & Cost
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-[2px] border font-medium ${new Blob([svgToUse]).size<3000?'bg-success/10 border-success/20 text-success':new Blob([svgToUse]).size<8000?'bg-paper-muted border-line text-ink':'bg-warn-bg border-amber-200 text-warn'}`}>{new Blob([svgToUse]).size<3000?'tiny':new Blob([svgToUse]).size<8000?'gas-friendly':'large'}</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mono-num">
                            <span className="text-muted">{new Blob([svgToUse]).size.toLocaleString()} bytes</span>
                            <span className="text-muted">100KB max</span>
                          </div>
                          <div className="mt-1.5 h-2 rounded-full bg-paper-muted border border-line overflow-hidden p-0.5">
                            <div className="h-full bg-brand-red transition-all" style={{width: `${Math.min(100, (new Blob([svgToUse]).size/(100*1024))*100)}%`}} />
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-xs">
                          <span className="mono-num text-muted">{formatGasCost(gas)}</span>
                          <span className="text-muted">SSTORE2 • ~75% cheaper</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className="text-sm font-medium">SVG artwork *</label>
                      <textarea value={svg} onChange={e=>{setSvg(e.target.value); setOptimized(null);}} rows={7} className="mt-1.5 w-full rounded-[2px] border border-line bg-white px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-red/20" />
                      <div className="mt-3 rounded-[2px] border border-line bg-white p-3">
                        <div className="text-xs font-medium">Live Size & Cost</div>
                        <div className="mt-2 h-2 rounded-full bg-paper-muted border border-line overflow-hidden p-0.5"><div className="h-full bg-brand-red" style={{width: `${Math.min(100, (new Blob([svgToUse]).size/(100*1024))*100)}%`}} /></div>
                        <div className="mt-2 text-xs mono-num text-muted flex justify-between"><span>{new Blob([svgToUse]).size.toLocaleString()} bytes</span><span>{formatGasCost(gas)}</span></div>
                      </div>
                    </div>
                  )}
                  {new Blob([svgToUse]).size > 100*1024 && <div className="mt-4 text-xs text-warn bg-warn-bg border border-amber-200 rounded-[2px] px-3 py-2">Large SVG — recommend &lt;100KB (max ~120KB on Base) to avoid gas limit.</div>}
                </div>
                <div className="flex justify-end pt-2 border-t border-line/60">
                  <button disabled={!canStep1} onClick={()=>setStep(2)} className="ink-button disabled:opacity-40 rounded-[2px]">Continue →</button>
                </div>
              </div>
            )}
            {step===2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-medium">2 — Distribution</h2>
                  <p className="text-xs text-muted mt-1">Who can mint, and how the proof transfers.</p>
                </div>
                <div className="grid gap-3">
                  <label className="archive-inset p-4 flex items-start gap-3 cursor-pointer hover:border-brand-red/30 transition-colors">
                    <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} className="mt-1 accent-brand-red" />
                    <div>
                      <div className="font-medium text-sm">Public mint enabled</div>
                      <div className="text-xs text-muted mt-1">Anyone can call <span className="mono-num">mint(id)</span>. You can toggle this within 30 days. Disable for invite-only.</div>
                    </div>
                  </label>
                  <label className="archive-inset p-4 flex items-start gap-3 cursor-pointer hover:border-brand-red/30 transition-colors">
                    <input type="checkbox" checked={isSoulbound} onChange={e=>setIsSoulbound(e.target.checked)} className="mt-1 accent-brand-red" />
                    <div>
                      <div className="font-medium text-sm">Soulbound (non-transferable)</div>
                      <div className="text-xs text-muted mt-1">Blocks transfers after mint. Ideal for attendance proofs. Can’t be changed later.</div>
                    </div>
                  </label>
                  <div className="archive-inset p-4">
                    <div className="font-medium text-sm">Allowlist root <span className="text-muted font-normal text-xs">(optional, 0x… = none)</span></div>
                    <input value={allowlistRoot} onChange={e=>setAllowlistRoot(e.target.value)} placeholder="0x000…000" className="mt-2 w-full rounded-[2px] border border-line px-3 py-2.5 mono-num text-xs focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20" />
                    <div className="text-xs text-muted mt-2">You can also set this later via the creator console (once, within 30d). See <Link href="/docs/allowlists" className="underline text-brand-red">allowlist docs</Link>.</div>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-line/60">
                  <button onClick={()=>setStep(1)} className="ghost-button rounded-[2px]">← Back</button>
                  <button onClick={()=>setStep(3)} className="ink-button rounded-[2px]">Continue →</button>
                </div>
              </div>
            )}
            {step===3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-medium">3 — Details & Review</h2>
                  <p className="text-xs text-muted mt-1">Final metadata — still 100% onchain.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Description <span className="text-muted text-xs">(≤512)</span></label>
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="Proof of attendance for..." className="mt-1.5 w-full rounded-[2px] border border-line bg-white px-4 py-3 text-sm focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20" />
                    <div className="text-xs text-muted mt-1">{description.length}/512</div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Location <span className="text-muted text-xs">(≤128)</span></label>
                      <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Paris, Onchain" className="mt-1.5 w-full rounded-[2px] border border-line bg-white px-4 py-3 text-sm focus:border-brand-red focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Event date</label>
                      <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} className="mt-1.5 w-full rounded-[2px] border border-line bg-white px-4 py-3 text-sm focus:border-brand-red focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">External URL <span className="text-muted text-xs">(≤128)</span></label>
                    <input value={externalUrl} onChange={e=>setExternalUrl(e.target.value)} placeholder="https://example.com" className="mt-1.5 w-full rounded-[2px] border border-line bg-white px-4 py-3 text-sm focus:border-brand-red focus:outline-none" />
                  </div>
                  <div className="archive-inset p-4">
                    <div className="font-medium text-sm">Review</div>
                    <div className="mt-2 mono-num text-xs leading-6 space-y-1">
                      <div><span className="text-muted">Name:</span> {name || '—'}</div>
                      <div><span className="text-muted">Flags:</span> {getFlags(isPublic,isSoulbound)} ({isPublic?'public':'private'} + {isSoulbound?'soulbound':'transferable'})</div>
                      <div><span className="text-muted">SVG:</span> {new Blob([svgToUse]).size.toLocaleString()} bytes • {formatGasCost(gas)}</div>
                      <div><span className="text-muted">Allowlist:</span> {allowlistRoot.slice(0,10)}…</div>
                    </div>
                    <div className="mt-3 text-xs text-muted border-t border-line pt-3">Newlines and quotes in name/description will be sanitized to avoid breaking onchain metadata. SVG is stored Base64 via SSTORE2.</div>
                  </div>
                  {chainId !== baseSepolia.id && isConnected && <div className="text-sm text-warn bg-warn-bg border border-amber-200 rounded-[2px] px-4 py-3">Wrong network — you’re on chain {chainId}. We’ll switch to Base Sepolia (84532) when you click Register, or <button onClick={() => switchChainAsync({ chainId: baseSepolia.id }).catch(()=>{})} className="underline font-medium">switch now</button>.</div>}
                  {!isConnected && <div className="text-sm text-warn bg-warn-bg border border-amber-200 rounded-[2px] px-4 py-3">Connect your wallet to register on Base Sepolia.</div>}
                  {hash && !isTxSuccess && (
                    <div className="text-sm bg-[#FFFBF0] border border-[#E9DDC8] rounded-[2px] px-4 py-3">
                      <div className="font-medium text-ink flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Transaction sent — confirming…</div>
                      <div className="text-xs mono-num text-muted mt-1.5 break-all">tx {hash.slice(0,10)}…{hash.slice(-8)} • <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noreferrer" className="underline">view on BaseScan</a></div>
                      <div className="text-xs text-muted mt-1.5">If this hangs, check BaseScan — your POAP may already be confirmed and will appear in Gallery/Explore within seconds.</div>
                    </div>
                  )}
                  {error && <div className="text-sm text-danger bg-danger-bg border border-red-200 rounded-[2px] px-4 py-3">{error}</div>}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-line/60">
                  <button onClick={()=>setStep(2)} className="ghost-button rounded-[2px]">← Back</button>
                  <button onClick={handleRegister} disabled={!isConnected || !canStep3 || isPending || isConfirming} className="ink-button disabled:opacity-40 rounded-[2px]">
                    {isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming onchain…' : chainId !== baseSepolia.id ? 'Switch & Register →' : 'Register Onchain →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20">
          <div className="archive-card overflow-hidden" style={{borderRadius:'2px'}}>
            <div className="px-4 pt-4 flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.16em] font-medium text-brand-red">Preview</div>
              <span className="text-xs mono-num text-muted">{new Blob([svgToUse]).size.toLocaleString()} bytes</span>
            </div>
            <div className={`mt-3 h-[270px] sm:h-[290px] flex items-center justify-center p-3 relative overflow-hidden border-t transition-all ${justUsed ? 'border-success bg-success/5 ring-1 ring-success/20' : 'border-line'}`} style={{background: justUsed ? '#F0FDF4' : '#FFFBF0'}}>
              <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, #9B2C2C 1px, transparent 0)', backgroundSize:'16px 16px'}} />
              <div className="w-full max-w-[240px] sm:max-w-[250px] aspect-square flex items-center justify-center relative">
                <div dangerouslySetInnerHTML={{ __html: svgToUse }} className="w-full h-full" />
              </div>
            </div>
            <div className="p-4 border-t border-line bg-white">
              <div className="text-xs text-muted mono-num">Flags: {getFlags(isPublic,isSoulbound)} • {isSoulbound ? 'Soulbound' : 'Transferable'} • {isPublic ? 'Public' : 'Private'}</div>
              <div className="mt-2 text-xs text-muted leading-5">Before mint, attendees see this exact artwork + metadata. After mint, links to BaseScan & OpenSea.</div>
            </div>
          </div>
          <div className="archive-inset p-4">
            <div className="text-sm font-medium">Creator permissions (30d)</div>
            <ul className="mt-2 text-xs text-muted leading-6 list-disc pl-4">
              <li>Toggle public mint</li>
              <li>Set allowlist root once</li>
              <li>Batch mint ≤101 (creatorMint)</li>
              <li>Signature mints work for 37d</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
