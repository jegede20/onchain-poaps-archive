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
  const canStep3 = description.length<=512 && location.length<=128 && externalUrl.length<=128;

  const handleRegister = async () => {
    setError(null);
    const safeName = name.replace(/\n/g,' ').replace(/"/g,"'");
    const safeDesc = description.replace(/\n/g,' ').replace(/"/g,"'");
    const safeLoc = location.replace(/\n/g,' ').replace(/"/g,"'");
    const safeUrl = externalUrl.replace(/\n/g,'').replace(/"/g,'');
    const flags = getFlags(isPublic, isSoulbound);
    let dateVal = 0;
    if (eventDate) dateVal = Math.floor(new Date(eventDate).getTime()/1000);
    try {
      writeContract({
        address: POAP_ADDRESS,
        abi: POAP_ABI,
        functionName: 'registerEvent',
        args: [safeName, safeDesc, BigInt(dateVal), safeLoc, allowlistRoot as `0x${string}`, svgToUse, safeUrl, flags],
      });
    } catch (e:any) { setError(decodeContractError(e)); }
  };

  if (isSuccess && hash) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="archive-card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto">✓</div>
          <h2 className="mt-4 font-display text-2xl font-medium">POAP Registered</h2>
          <p className="mt-2 text-muted">Transaction confirmed on Base Sepolia.</p>
          <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" className="mt-4 inline-block underline text-brand-red">View on BaseScan →</a>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/gallery" className="ink-button">Open Gallery</Link>
            <Link href="/" className="ghost-button">Back to Archive</Link>
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
                      <StampStudio value={svg} onUse={(s)=>{setSvg(s); setOptimized(null); setStats(null);}} />
                      <div className="mt-3 text-xs text-muted bg-paper-muted border border-line rounded-[2px] px-3 py-2">Studio SVGs are hand-optimized (~1–3 KB) — cheaper than exported files. Click “Use this design” to load.</div>
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
                  {!isConnected && <div className="text-sm text-warn bg-warn-bg border border-amber-200 rounded-[2px] px-4 py-3">Connect your wallet to register on Base Sepolia.</div>}
                  {error && <div className="text-sm text-danger bg-danger-bg border border-red-200 rounded-[2px] px-4 py-3">{error}</div>}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-line/60">
                  <button onClick={()=>setStep(2)} className="ghost-button rounded-[2px]">← Back</button>
                  <button onClick={handleRegister} disabled={!isConnected || !canStep3 || isPending || isConfirming} className="ink-button disabled:opacity-40 rounded-[2px]">
                    {isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : 'Register Onchain →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20">
          <div className="archive-card p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] font-medium text-brand-red">Preview</div>
            <div className="mt-3 aspect-square rounded-[2px] border border-line bg-paper-muted flex items-center justify-center overflow-hidden p-6">
              <div dangerouslySetInnerHTML={{ __html: svgToUse }} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="mt-3 text-xs text-muted mono-num">Flags: {getFlags(isPublic,isSoulbound)} • {isSoulbound ? 'Soulbound' : 'Transferable'} • {isPublic ? 'Public' : 'Private'}</div>
            <div className="mt-2 text-xs text-muted leading-5">Before mint, attendees see this exact artwork + metadata. After mint, links to BaseScan & OpenSea.</div>
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
