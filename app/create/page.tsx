"use client";
import { useState, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS, getFlags, decodeContractError } from '@/lib/poap';
import { optimizeSvg, estimateGas, formatGasCost } from '@/lib/svg-optimizer';
import { StampStudio } from '@/components/StampStudio';
import Link from 'next/link';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="#FFFBF0"/><circle cx="100" cy="78" r="46" fill="#9B2C2C"/><circle cx="100" cy="78" r="38" fill="none" stroke="white" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.8"/><text x="100" y="146" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#2E1A0F">ARCHIVE 01</text></svg>`;

export default function CreatePage() {
  const { isConnected } = useAccount();
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

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const doOptimize = () => {
    const { optimized: opt, stats: st } = optimizeSvg(svg);
    setOptimized(opt);
    setStats(st);
  };
  const svgToUse = optimized || svg;
  const gas = useMemo(()=> estimateGas(new Blob([svgToUse]).size), [svgToUse]);

  const canStep1 = name.trim().length>=1 && name.length<=128 && svgToUse.trim().length>0;
  const canStep2 = true;
  const canStep3 = description.length<=512 && location.length<=128 && externalUrl.length<=128;

  const handleRegister = async () => {
    setError(null);
    // sanitize newlines to fix uri() bug
    const safeName = name.replace(/\n/g,' ').replace(/"/g,'\'');
    const safeDesc = description.replace(/\n/g,' ').replace(/"/g,'\'');
    const safeLoc = location.replace(/\n/g,' ').replace(/"/g,'\'');
    const safeUrl = externalUrl.replace(/\n/g,'').replace(/"/g,'');
    const safeSvg = svgToUse; // keep as is, but ensure no raw newlines break JSON via sanitization in contract reader repair
    const flags = getFlags(isPublic, isSoulbound);
    let dateVal = 0;
    if (eventDate) dateVal = Math.floor(new Date(eventDate).getTime()/1000);
    try {
      writeContract({
        address: POAP_ADDRESS,
        abi: POAP_ABI,
        functionName: 'registerEvent',
        args: [safeName, safeDesc, BigInt(dateVal), safeLoc, allowlistRoot as `0x${string}`, safeSvg, safeUrl, flags],
      });
    } catch (e:any) { setError(decodeContractError(e)); }
  };

  if (isSuccess && hash) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="archive-card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto">✓</div>
          <h2 className="mt-4 text-2xl font-medium">POAP Registered</h2>
          <p className="mt-2 text-muted">Transaction confirmed on Base Sepolia.</p>
          <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" className="mt-4 inline-block underline">View on BaseScan →</a>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/gallery" className="ink-button">Open Gallery</Link>
            <Link href="/" className="ghost-button">Back to Archive</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 text-sm text-muted">
        <Link href="/" className="hover:text-ink">Archive</Link><span>/</span><span className="text-ink font-medium">Create POAP</span>
      </div>
      <div className="hero-pill mt-4">
        <span className="hero-pill-dot" />
        Create • SSTORE2 • Base Sepolia
      </div>
      <h1 className="mt-4 font-display text-3xl sm:text-4xl font-medium tracking-tight leading-tight">Register a new <em>Onchain POAP</em></h1>
      <p className="mt-2 text-sm sm:text-[15px] text-muted leading-6">All metadata and SVG live 100% onchain via SSTORE2. Optimize your SVG to save gas.</p>

      {/* Steps */}
      <div className="mt-8 flex items-center gap-2">
        {[1,2,3].map(n=> (
          <div key={n} className={`flex items-center gap-2 ${step>=n ? '' : 'opacity-40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${step===n ? 'bg-ink text-paper border-ink' : step>n ? 'bg-brass border-brass' : 'bg-paper border-line'}`}>{n}</div>
            <div className="hidden sm:block text-sm font-medium">{n===1?'Artwork & Name': n===2?'Distribution':'Details & Review'}</div>
            {n<3 && <div className="w-10 h-px bg-line mx-2 hidden sm:block" />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 archive-card p-6">
          {step===1 && (
            <div className="space-y-5">
              <h2 className="font-medium">1 — Artwork & Name</h2>
              <div>
                <label className="text-sm font-medium">POAP name * <span className="text-muted font-normal">(1-128)</span></label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="ETHGlobal Paris 2026" className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20" />
                <div className="text-xs text-muted mt-1">{name.length}/128</div>
              </div>
              <div>
                <div className="flex gap-2 p-1 rounded-[2px] bg-paper-muted border border-line w-fit">
                  <button onClick={()=>setArtMode('studio')} className={`px-4 py-1.5 rounded-[2px] text-xs font-medium ${artMode==='studio'?'bg-brand-red text-white':'text-muted'}`}>🎨 Stamp Studio</button>
                  <button onClick={()=>setArtMode('paste')} className={`px-4 py-1.5 rounded-[2px] text-xs font-medium ${artMode==='paste'?'bg-brand-red text-white':'text-muted'}`}>Upload / paste SVG</button>
                </div>
                {artMode==='studio' ? (
                  <div className="mt-4">
                    <StampStudio value={svg} onUse={(s)=>{setSvg(s); setOptimized(null); setStats(null);}} />
                    <div className="mt-3 text-xs text-muted">Studio SVGs are hand-optimized (~1–3 KB) — cheaper than exported files. Click “Use this design” to load.</div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="text-sm font-medium">SVG artwork *</label>
                    <textarea value={svg} onChange={e=>{setSvg(e.target.value); setOptimized(null);}} rows={8} className="mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-red/20" />
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <button onClick={doOptimize} className="ghost-button text-xs">Optimize SVG (SVGO-lite)</button>
                  {stats && <span className="text-xs text-success">Saved {stats.saved} bytes ({stats.savedPct}%) • {formatGasCost(gas)}</span>}
                  {!stats && <span className="text-xs text-muted">{formatGasCost(gas)}</span>}
                </div>
                {new Blob([svgToUse]).size > 100*1024 && <div className="mt-2 text-xs text-warn bg-warn-bg border border-amber-200 rounded-lg px-3 py-2">Large SVG — recommend &lt;100KB (max ~120KB on Base) to avoid gas limit.</div>}
              </div>
              <div className="flex justify-end">
                <button disabled={!canStep1} onClick={()=>setStep(2)} className="ink-button disabled:opacity-40">Continue →</button>
              </div>
            </div>
          )}
          {step===2 && (
            <div className="space-y-5">
              <h2 className="font-medium">2 — Distribution</h2>
              <div className="grid gap-4">
                <label className="archive-inset p-4 flex items-start gap-3 cursor-pointer hover:border-brass/50">
                  <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} className="mt-1" />
                  <div>
                    <div className="font-medium text-sm">Public mint enabled</div>
                    <div className="text-xs text-muted">Anyone can call <span className="mono-num">mint(id)</span>. You can toggle this within 30 days.</div>
                  </div>
                </label>
                <label className="archive-inset p-4 flex items-start gap-3 cursor-pointer hover:border-brass/50">
                  <input type="checkbox" checked={isSoulbound} onChange={e=>setIsSoulbound(e.target.checked)} className="mt-1" />
                  <div>
                    <div className="font-medium text-sm">Soulbound (non-transferable)</div>
                    <div className="text-xs text-muted">Blocks transfers after mint. Ideal for attendance proofs.</div>
                  </div>
                </label>
                <div className="archive-inset p-4">
                  <div className="font-medium text-sm">Allowlist root <span className="text-muted font-normal">(optional, 0x… = none)</span></div>
                  <input value={allowlistRoot} onChange={e=>setAllowlistRoot(e.target.value)} placeholder="0x000…000" className="mt-2 w-full rounded-lg border border-line px-3 py-2 mono-num text-xs" />
                  <div className="text-xs text-muted mt-2">You can also set this later via the creator console (once, within 30d). See <Link href="/docs/allowlists" className="underline">allowlist docs</Link>.</div>
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={()=>setStep(1)} className="ghost-button">← Back</button>
                <button onClick={()=>setStep(3)} className="ink-button">Continue →</button>
              </div>
            </div>
          )}
          {step===3 && (
            <div className="space-y-5">
              <h2 className="font-medium">3 — Details & Review</h2>
              <div>
                <label className="text-sm font-medium">Description <span className="text-muted">(≤512)</span></label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="Proof of attendance for..." className="mt-1 w-full rounded-xl border border-line bg-paper-elevated px-4 py-3 text-sm" />
                <div className="text-xs text-muted">{description.length}/512</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Location <span className="text-muted">(≤128)</span></label>
                  <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Paris, Onchain" className="mt-1 w-full rounded-xl border border-line bg-paper-elevated px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Event date</label>
                  <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-paper-elevated px-4 py-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">External URL <span className="text-muted">(≤128)</span></label>
                <input value={externalUrl} onChange={e=>setExternalUrl(e.target.value)} placeholder="https://example.com" className="mt-1 w-full rounded-xl border border-line bg-paper-elevated px-4 py-3 text-sm" />
              </div>

              <div className="archive-inset p-4 text-sm">
                <div className="font-medium">Review</div>
                <div className="mt-2 mono-num text-xs leading-6">
                  <div>Name: {name || '—'}</div>
                  <div>Flags: {getFlags(isPublic,isSoulbound)} ({isPublic?'public':'private'} + {isSoulbound?'soulbound':'transferable'})</div>
                  <div>SVG: {new Blob([svgToUse]).size} bytes • {formatGasCost(gas)}</div>
                  <div>Allowlist: {allowlistRoot.slice(0,10)}…</div>
                </div>
                <div className="mt-3 text-xs text-muted">Newlines and quotes in name/description will be sanitized to avoid breaking onchain metadata. SVG is stored Base64 via SSTORE2.</div>
              </div>

              {!isConnected && <div className="text-sm text-warn bg-warn-bg border border-amber-200 rounded-xl px-4 py-3">Connect your wallet to register on Base Sepolia.</div>}
              {error && <div className="text-sm text-danger bg-danger-bg border border-red-200 rounded-xl px-4 py-3">{error}</div>}

              <div className="flex justify-between items-center">
                <button onClick={()=>setStep(2)} className="ghost-button">← Back</button>
                <button onClick={handleRegister} disabled={!isConnected || !canStep3 || isPending || isConfirming} className="ink-button disabled:opacity-40">
                  {isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : 'Register Onchain →'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="archive-card p-4">
            <div className="text-xs uppercase tracking-widest text-muted">Preview</div>
            <div className="mt-3 aspect-square rounded-xl border border-line bg-paper-muted flex items-center justify-center overflow-hidden p-6">
              <div dangerouslySetInnerHTML={{ __html: svgToUse }} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="mt-3 text-xs text-muted mono-num">Flags: {getFlags(isPublic,isSoulbound)} • {isSoulbound ? 'Soulbound' : 'Transferable'} • {isPublic ? 'Public' : 'Private'}</div>
            <div className="mt-2 text-xs text-muted">Before mint, attendees see this exact artwork + metadata. After mint, links to BaseScan & OpenSea.</div>
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
