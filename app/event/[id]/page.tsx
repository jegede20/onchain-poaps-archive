"use client";
import { useParams } from 'next/navigation';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSignMessage } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS, decodeUri, decodeContractError, getBasescanLink, getOpenseaLink, isWithinCreatorWindow, formatCountdown, secondsRemaining } from '@/lib/poap';
import { buildTree, getProof, leafForAddress, parseAddressList, verifyProof } from '@/lib/merkle';
import { getSignableMessage } from '@/lib/signature';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function EventPage() {
  const params = useParams(); const id = Number((params as any).id);
  const { address, isConnected } = useAccount();
  const [activeMint, setActiveMint] = useState<'public'|'allowlist'|'signature'>('public');
  const [proofInput, setProofInput] = useState('');
  const [rawList, setRawList] = useState('');
  const [sigInput, setSigInput] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [creatorRecipients, setCreatorRecipients] = useState('');
  const [newRootInput, setNewRootInput] = useState('');
  const [isPublicToggle, setIsPublicToggle] = useState<boolean | null>(null);

  const { data: evt } = useReadContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'events', args: [BigInt(id)] });
  const { data: uri } = useReadContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'uri', args: [BigInt(id)] });
  const { data: hasClaimed } = useReadContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'hasClaimed', args: address ? [BigInt(id), address] : [BigInt(id), '0x0000000000000000000000000000000000000000' as any], query: { enabled: !!address } as any });
  const decoded = uri ? decodeUri(uri as string) : null;

  const ev = evt as any; // [name, desc, date, loc, root, svgImg, creator, createdAt, extUrl, soul, public]
  const event = ev ? {
    name: ev[0], description: ev[1], eventDate: ev[2], location: ev[3], allowlistRoot: ev[4] as string, svgImage: ev[5], creator: ev[6] as string, createdAt: ev[7] as bigint, externalUrl: ev[8] as string, isSoulbound: ev[9] as boolean, isPublic: ev[10] as boolean
  } : null;

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { signMessageAsync } = useSignMessage();

  const creatorExpired = event ? !isWithinCreatorWindow(event.createdAt, 0) : true;
  const sigExpired = event ? !isWithinCreatorWindow(event.createdAt, 7) : true;
  const sigSec = event ? secondsRemaining(event.createdAt, 7) : 0;
  const creatorSec = event ? secondsRemaining(event.createdAt, 0) : 0;
  const isCreator = address && event ? address.toLowerCase() === event.creator.toLowerCase() : false;

  const merkleFromList = useMemo(()=> {
    if (!rawList.trim()) return null;
    const { addresses } = parseAddressList(rawList);
    return buildTree(addresses);
  }, [rawList]);

  const eligibility = useMemo(()=> {
    if (!event) return null;
    const has = !!hasClaimed;
    return {
      publicEligible: event.isPublic && !has && !isCreator, // creator can mint? contract allows but hasClaimed prevents double
      allowlistEligible: event.allowlistRoot !== '0x0000000000000000000000000000000000000000000000000000000000000000' && !has,
      sigEligible: !sigExpired && !has,
      already: has,
      isCreator,
    };
  }, [event, hasClaimed, isCreator, sigExpired]);

  const doPublicMint = () => {
    setErr(null); setMsg(null);
    writeContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'mint', args: [BigInt(id)] }, { onError: (e)=> setErr(decodeContractError(e)) });
  };
  const doAllowlistMint = () => {
    setErr(null);
    let proof: `0x${string}`[] = [];
    try {
      const trimmed = proofInput.trim();
      if (trimmed.startsWith('[')) proof = JSON.parse(trimmed);
      else if (trimmed) proof = trimmed.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean) as any;
      else if (address && rawList) {
        const tree = buildTree(parseAddressList(rawList).addresses);
        proof = getProof(address, tree);
      }
    } catch { setErr('Invalid proof JSON'); return; }
    if (address && proof.length && event) {
      const leaf = leafForAddress(address);
      // optional local verify
      // if (!verifyProof(leaf, proof, event.allowlistRoot as any)) setErr('Local proof verify failed — may still succeed onchain');
    }
    writeContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'allowlistMint', args: [BigInt(id), proof] }, { onError: (e)=> setErr(decodeContractError(e)) });
  };
  const doSigMint = () => {
    setErr(null);
    const sig = sigInput.trim();
    if (!sig) { setErr('Paste a signature (0x…)'); return; }
    writeContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'mintWithSignature', args: [BigInt(id), sig as `0x${string}`] }, { onError: (e)=> setErr(decodeContractError(e)) });
  };
  const doCreateSignature = async () => {
    if (!address || !isCreator) { setErr('Connect as creator'); return; }
    const recipient = prompt('Recipient address to authorize (0x…)');
    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) { setErr('Invalid recipient'); return; }
    const chainId = 84532;
    const hash = getSignableMessage(id, chainId, recipient);
    try {
      const sig = await signMessageAsync({ message: { raw: hash as `0x${string}` } });
      const link = `${window.location.origin}/event/${id}?sig=${sig}&recipient=${recipient}`;
      setSigInput(sig);
      const dataUrl = await QRCode.toDataURL(link, { width: 400, margin: 2 });
      setQrDataUrl(dataUrl);
      setMsg(`Signature for ${recipient.slice(0,8)}… created. Share link or QR. Valid until ${formatCountdown(sigSec)}.`);
    } catch (e:any) { setErr(decodeContractError(e)); }
  };
  const doUpdateRoot = () => {
    const root = newRootInput.trim() || (merkleFromList?.root as string);
    if (!root) { setErr('Provide root or build from list'); return; }
    writeContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'updateAllowlistRoot', args: [BigInt(id), root as `0x${string}`] }, { onError:(e)=>setErr(decodeContractError(e)) });
  };
  const doTogglePublic = () => {
    const next = isPublicToggle ?? !event?.isPublic;
    writeContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'updateEventPublic', args: [BigInt(id), next] }, { onError:(e)=>setErr(decodeContractError(e)) });
  };
  const doCreatorMint = () => {
    const { addresses, invalid } = parseAddressList(creatorRecipients);
    if (invalid.length) { setErr(`Invalid addresses: ${invalid.slice(0,3).join(', ')}`); return; }
    if (addresses.length>101) { setErr('Max 101 recipients per call'); return; }
    writeContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'creatorMint', args: [BigInt(id), addresses as `0x${string}`[]] }, { onError:(e)=>setErr(decodeContractError(e)) });
  };

  if (!event) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted">Loading event #{id}… If it stays empty, this ID may not exist (try /gallery).</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/gallery" className="text-sm text-muted hover:text-ink">← Back to Gallery</Link>

      <div className="mt-6 grid lg:grid-cols-5 gap-6">
        {/* Artwork + metadata */}
        <div className="lg:col-span-2 space-y-4">
          <div className="archive-card overflow-hidden">
            <div className="aspect-square bg-paper-muted flex items-center justify-center overflow-hidden">
              {decoded?.image ? <img src={decoded.image} alt={event.name} className="w-full h-full object-contain" /> : <div className="w-20 h-20 rounded-2xl bg-ink text-paper flex items-center justify-center mono-num">{id}</div>}
            </div>
            <div className="p-5">
              <h1 className="text-xl font-medium leading-tight">{event.name}</h1>
              <p className="mt-1 text-sm text-muted">{event.description || 'No description'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`badge ${event.isPublic?'badge-success':'badge-neutral'}`}>{event.isPublic?'Public':'Private'}</span>
                {event.isSoulbound && <span className="badge badge-neutral">Soulbound</span>}
                <span className="badge badge-neutral mono-num">#{id}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="archive-inset p-3"><div className="text-muted uppercase tracking-widest text-[11px]">Location</div><div className="font-medium">{event.location || '—'}</div></div>
                <div className="archive-inset p-3"><div className="text-muted uppercase tracking-widest text-[11px]">Date</div><div className="font-medium">{event.eventDate ? new Date(Number(event.eventDate)*1000).toLocaleDateString() : '—'}</div></div>
                <div className="archive-inset p-3"><div className="text-muted uppercase tracking-widest text-[11px]">Creator</div><div className="mono-num truncate">{event.creator.slice(0,6)}…{event.creator.slice(-4)}</div></div>
                <div className="archive-inset p-3"><div className="text-muted uppercase tracking-widest text-[11px]">Multichain</div><div className="mono-num truncate text-[11px]">eip155:84532:{POAP_ADDRESS.slice(0,6)}:{id}</div></div>
              </div>
              {event.externalUrl && <a href={event.externalUrl} target="_blank" className="mt-4 inline-flex text-sm font-medium underline">External site →</a>}
            </div>
          </div>

          {/* 4 — Creator Analytics: windows + distribution at a glance */}
          <div className="archive-card p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] font-medium text-muted">Creator Analytics</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="archive-inset p-3">
                <div className="text-[11px] uppercase tracking-widest text-muted">Allowlist window</div>
                <div className={`mt-1 text-sm font-medium ${creatorExpired?'text-danger':'text-success'}`}>{creatorExpired?'Expired':formatCountdown(creatorSec)+' left'}</div>
                <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden"><div className="h-full bg-brand-red transition-all" style={{width: `${Math.max(4, Math.min(100, (creatorSec/(30*86400))*100))}%`, opacity: creatorExpired?0.2:1}} /></div>
                <div className="text-[11px] text-muted mt-1">30d to set root / toggle public</div>
              </div>
              <div className="archive-inset p-3">
                <div className="text-[11px] uppercase tracking-widest text-muted">Signature window</div>
                <div className={`mt-1 text-sm font-medium ${sigExpired?'text-danger':'text-success'}`}>{sigExpired?'Expired':formatCountdown(sigSec)+' left'}</div>
                <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden"><div className="h-full bg-ink transition-all" style={{width: `${Math.max(4, Math.min(100, (sigSec/(37*86400))*100))}%`, opacity: sigExpired?0.2:1}} /></div>
                <div className="text-[11px] text-muted mt-1">37d for sig mint (QR)</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              <span className={`px-2.5 py-1 rounded-[2px] border text-xs font-medium ${event.isPublic?'bg-success/10 border-success/20 text-success':'bg-paper-muted border-line text-muted'}`}>{event.isPublic?'Public open':'Public closed'}</span>
              <span className={`px-2.5 py-1 rounded-[2px] border text-xs font-medium ${event.allowlistRoot!=='0x0000000000000000000000000000000000000000000000000000000000000000'?'bg-brand-red text-white border-brand-red':'bg-paper-muted border-line text-muted'}`}>{event.allowlistRoot!=='0x0000000000000000000000000000000000000000000000000000000000000000'?'Allowlist set':'No allowlist'}</span>
              <span className={`px-2.5 py-1 rounded-[2px] border text-xs font-medium ${event.isSoulbound?'bg-ink text-white border-ink':'bg-paper-muted border-line text-muted'}`}>{event.isSoulbound?'Soulbound':'Transferable'}</span>
            </div>
          </div>

          {/* 6 — Social / Collect Flex: share + copy + download */}
          <div className="archive-card p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] font-medium text-muted">Share & Collect</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); setMsg('Link copied ✓'); setTimeout(()=>setMsg(null),2000); }} className="ghost-button text-xs rounded-[2px]">Copy link</button>
              <a href={`https://warpcast.com/~/compose?text=${encodeURIComponent(`Mint my Onchain POAP — ${event.name} #${id} on Base Sepolia`)}&embeds[]=${encodeURIComponent(typeof window!=='undefined'?window.location.href:'')}`} target="_blank" className="ghost-button text-xs rounded-[2px]">Warpcast ↗</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mint Onchain POAP: ${event.name} #${id}`)}&url=${encodeURIComponent(typeof window!=='undefined'?window.location.href:'')}`} target="_blank" className="ghost-button text-xs rounded-[2px]">𝕏 Share</a>
              <button onClick={() => { if(!decoded?.image) return; const a=document.createElement('a'); a.href=decoded.image; a.download=`poap-${id}.svg`; a.click(); }} className="ghost-button text-xs rounded-[2px]">Download SVG</button>
            </div>
            <div className="mt-2 text-xs text-muted">Links are SSTORE2 BaseSepolia • verify on BaseScan/OpenSea. MiniApp deep-link is same URL.</div>
          </div>

          <div className="archive-card p-5">
            <h3 className="font-medium text-sm">Onchain verification</h3>
            <div className="mt-3 space-y-2 mono-num text-xs">
              <div className="flex justify-between"><span className="text-muted">Allowlist root</span><span className="font-medium truncate max-w-[160px]">{event.allowlistRoot.slice(0,10)}…</span></div>
              <div className="flex justify-between"><span className="text-muted">Created</span><span>{new Date(Number(event.createdAt)*1000).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted">Creator window</span><span className={creatorExpired?'text-danger':'text-success'}>{creatorExpired?'Expired':formatCountdown(creatorSec)+' left'}</span></div>
              <div className="flex justify-between"><span className="text-muted">Sig window</span><span className={sigExpired?'text-danger':'text-success'}>{sigExpired?'Expired':formatCountdown(sigSec)+' left'}</span></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={getBasescanLink(id)} target="_blank" className="ghost-button text-xs">BaseScan</a>
              <a href={getOpenseaLink(id)} target="_blank" className="ghost-button text-xs">OpenSea (if indexed)</a>
              <Link href={`/gallery`} className="ghost-button text-xs">Gallery</Link>
            </div>
            <div className="mt-4 archive-inset p-3 text-xs text-muted">Metadata is <span className="mono-num">data:application/json;base64</span> decoded from <span className="mono-num">uri({id})</span>. If artwork is blank, the stored description may contain an unescaped newline (Event #6 known). This frontend repairs it for display.</div>
          </div>
        </div>

        {/* Mint + creator */}
        <div className="lg:col-span-3 space-y-4">
          {/* Eligibility card */}
          <div className="archive-card p-5 border-l-4" style={{borderLeftColor: eligibility?.already ? '#9B2C2C' : eligibility?.publicEligible || eligibility?.allowlistEligible || eligibility?.sigEligible ? '#1A7A52' : '#B7791F'}}>
            <h2 className="font-medium">Eligibility — Wallet {address ? `${address.slice(0,6)}…${address.slice(-4)}` : 'not connected'}</h2>
            {!isConnected ? <div className="mt-3 text-sm text-muted">Connect wallet to see which mints you can use.</div> : (
              <div className="mt-3 grid sm:grid-cols-3 gap-3">
                <div className={`archive-inset p-3 ${eligibility?.publicEligible ? 'border-success' : 'opacity-60'}`}>
                  <div className="text-xs uppercase tracking-widest text-muted">Public</div>
                  <div className={`text-sm font-medium ${eligibility?.publicEligible?'text-success':'text-muted'}`}>{event.isPublic ? (eligibility?.publicEligible?'Eligible':'Blocked') : 'Disabled'}</div>
                  <div className="text-xs text-muted">{event.isPublic ? 'Calls mint()' : 'Creator disabled public'}</div>
                </div>
                <div className={`archive-inset p-3 ${eligibility?.allowlistEligible ? 'border-success' : 'opacity-60'}`}>
                  <div className="text-xs uppercase tracking-widest text-muted">Allowlist</div>
                  <div className={`text-sm font-medium ${eligibility?.allowlistEligible?'text-success':'text-muted'}`}>{event.allowlistRoot!=='0x0000000000000000000000000000000000000000000000000000000000000000'?'Enabled':'No root'}</div>
                  <div className="text-xs text-muted">Needs Merkle proof</div>
                </div>
                <div className={`archive-inset p-3 ${eligibility?.sigEligible ? 'border-success' : 'opacity-60'}`}>
                  <div className="text-xs uppercase tracking-widest text-muted">Signature</div>
                  <div className={`text-sm font-medium ${eligibility?.sigEligible?'text-success':'text-muted'}`}>{sigExpired?'Expired (37d)':'Available'}</div>
                  <div className="text-xs text-muted">{formatCountdown(sigSec)} left</div>
                </div>
              </div>
            )}
            {eligibility?.already && <div className="mt-3 badge badge-danger">Already claimed — 1 per wallet enforced</div>}
          </div>

          {/* Mint tabs */}
          <div className="archive-card p-5">
            <div className="flex gap-1 p-1 rounded-[2px] bg-paper-muted border border-line w-fit">
              {(['public','allowlist','signature'] as const).map(t=> (
                <button key={t} onClick={()=>setActiveMint(t)} className={`px-4 py-1.5 rounded-[2px] text-xs font-medium uppercase tracking-wide ${activeMint===t?'bg-ink text-paper':'text-muted hover:text-ink'}`}>{t}</button>
              ))}
            </div>

            {activeMint==='public' && (
              <div className="mt-5 space-y-3">
                <h3 className="font-medium">Public mint</h3>
                <p className="text-sm text-muted">When public is enabled, anyone can mint. No allowlist or signature needed.</p>
                <div className="archive-inset p-4">
                  <div className="text-sm font-medium">You are about to mint</div>
                  <div className="mt-2 flex gap-3 items-center">
                    {decoded?.image ? <img src={decoded.image} alt="" className="w-16 h-16 rounded-lg border border-line object-cover" /> : <div className="w-16 h-16 rounded-lg bg-ink text-paper flex items-center justify-center mono-num text-xs">#{id}</div>}
                    <div><div className="font-medium text-sm">{event.name}</div><div className="text-xs text-muted">#{id} • {event.location}</div></div>
                  </div>
                </div>
                <button onClick={doPublicMint} disabled={!isConnected || !event.isPublic || !!hasClaimed || isPending || isConfirming} className="ink-button w-full disabled:opacity-40">{isPending?'Check wallet…': isConfirming?'Confirming…':'Mint Publicly →'}</button>
                {!event.isPublic && <div className="text-xs text-warn">Public mint is currently disabled by creator.</div>}
              </div>
            )}

            {activeMint==='allowlist' && (
              <div className="mt-5 space-y-3">
                <h3 className="font-medium">Allowlist mint</h3>
                <p className="text-sm text-muted">If a root is set, paste the proofs JSON from the creator OR paste the raw address list to rebuild locally.</p>
                <div>
                  <label className="text-xs font-medium">Merkle proof (JSON array) or leave empty to auto-derive</label>
                  <textarea value={proofInput} onChange={e=>setProofInput(e.target.value)} rows={3} placeholder='["0xabc...","0xdef..."]' className="mt-1 w-full rounded-xl border border-line bg-paper-elevated px-3 py-2 mono-num text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium">Or raw address list (for local rebuild)</label>
                  <textarea value={rawList} onChange={e=>setRawList(e.target.value)} rows={3} placeholder="0x1234...&#10;0xabcd..." className="mt-1 w-full rounded-xl border border-line bg-paper-elevated px-3 py-2 mono-num text-xs" />
                  {merkleFromList && <div className="text-xs text-muted mt-1 mono-num">Tree root: {merkleFromList.root.slice(0,10)}… matches onchain? {merkleFromList.root.toLowerCase()===event.allowlistRoot.toLowerCase()?'✓ yes':'≠ no'}</div>}
                </div>
                <button onClick={doAllowlistMint} disabled={!isConnected || isPending || isConfirming} className="ink-button w-full disabled:opacity-40">{isPending?'Confirm…': isConfirming?'Confirming…':'Mint with Allowlist →'}</button>
              </div>
            )}

            {activeMint==='signature' && (
              <div className="mt-5 space-y-3">
                <h3 className="font-medium">Signature mint</h3>
                <p className="text-sm text-muted">Valid for 37 days after registration. Creator signs <span className="mono-num">keccak256(eventId, chainId, recipient)</span> offchain; you submit the signature. Each signature is bound to one recipient — a static QR cannot work for everyone. Use the creator's per-recipient links.</p>
                <div className="archive-inset p-3 text-xs leading-6">
                  <div><strong>Message:</strong> <span className="mono-num">keccak256(abi.encodePacked({id}, 84532, yourAddress))</span> → <span className="mono-num">toEthSignedMessageHash</span> → sign</div>
                  <div className="text-muted">Distribute via signed links or QR sheet (creator console).</div>
                </div>
                <div>
                  <label className="text-xs font-medium">Signature (0x…)</label>
                  <input value={sigInput} onChange={e=>setSigInput(e.target.value)} placeholder="0x..." className="mt-1 w-full rounded-xl border border-line bg-paper-elevated px-3 py-2 mono-num text-xs" />
                </div>
                {sigExpired && <div className="text-xs text-danger">Signature window expired ({formatCountdown(sigSec)}).</div>}
                <button onClick={doSigMint} disabled={!isConnected || sigExpired || isPending || isConfirming} className="ink-button w-full disabled:opacity-40">{isPending?'Confirm…': isConfirming?'Confirming…':'Mint with Signature →'}</button>
                {isCreator && <button onClick={doCreateSignature} className="ghost-button w-full text-xs">As creator: sign for a recipient + generate QR</button>}
                {qrDataUrl && <div className="archive-inset p-4 text-center"><img src={qrDataUrl} alt="QR" className="mx-auto w-52 h-52" /><div className="text-xs text-muted mt-2">QR for recipient — print for live event</div></div>}
              </div>
            )}

            {err && <div className="mt-4 text-sm text-danger bg-danger-bg border border-red-200 rounded-xl px-4 py-3">{err}</div>}
            {msg && <div className="mt-4 text-sm text-success bg-success-bg border border-emerald-200 rounded-xl px-4 py-3">{msg}</div>}
            {isSuccess && hash && <div className="mt-4 text-sm bg-paper-muted border border-line rounded-xl px-4 py-3">Confirmed: <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" className="underline mono-num">{String(hash).slice(0,10)}…</a> • <a href={getOpenseaLink(id)} target="_blank" className="underline">OpenSea</a></div>}
            {writeError && <div className="mt-2 text-xs text-muted mono-num">{decodeContractError(writeError)}</div>}
          </div>

          {/* Creator console */}
          <div className="archive-card p-5">
            <h3 className="font-medium">Creator Console {isCreator ? <span className="badge badge-success text-xs ml-2">You are creator</span> : <span className="badge badge-neutral text-xs ml-2">Creator only</span>}</h3>
            {!isCreator ? <div className="mt-3 text-sm text-muted">Connect as <span className="mono-num">{event.creator.slice(0,6)}…</span> to manage this POAP.</div> : (
              <div className="mt-4 space-y-6">
                {/* Allowlist */}
                <div className="archive-inset p-4">
                  <div className="font-medium text-sm">Allowlist — set root once ({creatorExpired ? 'expired' : formatCountdown(creatorSec)+' left'})</div>
                  <textarea value={rawList} onChange={e=>setRawList(e.target.value)} rows={4} placeholder="Paste addresses, one per line or comma separated" className="mt-3 w-full rounded-xl border border-line bg-paper-elevated px-3 py-2 mono-num text-xs" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={()=>{
                      if (!merkleFromList) return;
                      setNewRootInput(merkleFromList.root);
                    }} className="ghost-button text-xs">Preview root</button>
                    <span className="text-xs mono-num text-muted self-center">{merkleFromList ? merkleFromList.root.slice(0,18)+'…' : 'no list'}</span>
                  </div>
                  <input value={newRootInput} onChange={e=>setNewRootInput(e.target.value)} placeholder="0x root (auto-filled from preview)" className="mt-3 w-full rounded-lg border border-line px-3 py-2 mono-num text-xs" />
                  {event.allowlistRoot!=='0x0000000000000000000000000000000000000000000000000000000000000000' && <div className="mt-2 text-xs text-warn">Root already set — cannot be changed (onchain enforces one-time).</div>}
                  <button onClick={doUpdateRoot} disabled={creatorExpired || event.allowlistRoot!=='0x0000000000000000000000000000000000000000000000000000000000000000' || isPending} className="mt-3 ink-button text-sm disabled:opacity-40 w-full">Set Allowlist Root Onchain →</button>
                  {merkleFromList && <button onClick={()=>{
                    const data = JSON.stringify({ root: merkleFromList.root, addresses: merkleFromList.leaves, proofs: Object.fromEntries(merkleFromList.leaves.map(a=>[a, getProof(a, merkleFromList!)])) }, null, 2);
                    const blob = new Blob([data], {type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`allowlist-${id}-proofs.json`; a.click();
                  }} className="mt-2 ghost-button text-xs w-full">Download proofs JSON (distribute to allowlist)</button>}
                </div>

                {/* Public toggle */}
                <div className="archive-inset p-4">
                  <div className="font-medium text-sm">Public mint toggle</div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`badge ${event.isPublic?'badge-success':'badge-neutral'}`}>{event.isPublic?'Public Open':'Public Closed'}</span>
                    <span className="text-xs text-muted">{creatorExpired ? 'Window closed' : `${formatCountdown(creatorSec)} left to toggle`}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>{setIsPublicToggle(true); doTogglePublic();}} disabled={creatorExpired} className="ghost-button text-xs">Open Public</button>
                    <button onClick={()=>{setIsPublicToggle(false); doTogglePublic();}} disabled={creatorExpired} className="ghost-button text-xs">Close Public</button>
                  </div>
                </div>

                {/* Creator mint */}
                <div className="archive-inset p-4">
                  <div className="font-medium text-sm">Creator batch mint (≤101)</div>
                  <textarea value={creatorRecipients} onChange={e=>setCreatorRecipients(e.target.value)} rows={3} placeholder="0xabc..., 0xdef..." className="mt-2 w-full rounded-xl border border-line bg-paper-elevated px-3 py-2 mono-num text-xs" />
                  <button onClick={doCreatorMint} disabled={creatorExpired || isPending} className="mt-3 ink-button text-sm w-full disabled:opacity-40">Batch Mint →</button>
                </div>

                {/* Sig studio help */}
                <div className="archive-inset p-4">
                  <div className="font-medium text-sm">Signature Studio — QR for live events</div>
                  <div className="text-xs text-muted mt-1">How it works: creator signs per-recipient message offchain (no gas), shares link/QR, recipient calls <span className="mono-num">mintWithSignature</span> within 37d. A static poster QR cannot hold a signature — generate one QR per attendee, or use a claim page that asks for wallet then signs live.</div>
                  <button onClick={doCreateSignature} className="mt-3 brass-button text-xs w-full">Sign for Recipient + QR →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
