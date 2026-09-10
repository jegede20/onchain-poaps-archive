import Link from 'next/link';

const DOCS = [
  { slug: 'creating-poap', title: 'Creating a POAP', desc: 'RegisterEvent flow, flags, validation' },
  { slug: 'metadata', title: 'POAP Metadata', desc: 'ERC1155 uri() + Base64 JSON + attributes' },
  { slug: 'svg-requirements', title: 'SVG Requirements & Optimization', desc: 'SSTORE2, SVGO-lite, gas table' },
  { slug: 'soulbound', title: 'Soulbound POAPs', desc: 'Non-transferable enforcement' },
  { slug: 'public-minting', title: 'Public Minting', desc: 'Toggle within 30d, pause/resume' },
  { slug: 'allowlists', title: 'Allowlists', desc: 'Merkle tree, sortPairs, proof distribution' },
  { slug: 'proofs', title: 'Generating Allowlist Proofs', desc: 'Paste list → tree → proof' },
  { slug: 'signature-minting', title: 'Signature Minting', desc: '37d window, personal_sign' },
  { slug: 'qr-distribution', title: 'QR-Code Distribution', desc: 'Per-recipient links, printable sheets' },
  { slug: 'permissions', title: 'Creator Permissions', desc: '30d timelock, one-time root' },
  { slug: 'deadlines', title: 'Minting Deadlines', desc: '30d creator / 37d signature' },
  { slug: 'verification', title: 'How to Verify Minted POAPs', desc: 'BaseScan, OpenSea, uri decode' },
];

export default function DocsPage() {
  return (
    <div className="min-w-0 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-3xl">
        <div className="hero-pill">
          <span className="hero-pill-dot" />
          Documentation • 100% onchain
        </div>
        <h1 className="hero-title mt-4" style={{fontSize: 'clamp(1.9rem, 5vw, 2.5rem)'}}>
          Documentation<br /><em>for builders</em>
        </h1>
        <p className="mt-3 text-sm sm:text-[15px] text-muted leading-6">
          Everything to run Onchain POAPs without asking the bounty creator. Plain language, copy-paste ready.
        </p>
      </div>

      <div className="mt-8 docs-grid">
        {DOCS.map(d=> (
          <Link key={d.slug} href={`/docs/${d.slug}`} className="docs-card archive-card p-5 hover:border-brand-red/20 hover:shadow-md transition-all interactive-card group block">
            <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-brand-red">{d.slug}</div>
            <div className="mt-1.5 font-semibold leading-tight group-hover:text-brand-red transition-colors">{d.title}</div>
            <div className="mt-1 text-sm text-muted leading-5">{d.desc}</div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-brand-red">
              Read <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 archive-card p-0 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-line bg-paper-muted/50 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Quick start</h3>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-muted hidden sm:inline">Base Sepolia • 84532</span>
        </div>
        <div className="p-4 sm:p-6 overflow-x-auto">
          <pre className="text-xs mono-num bg-ink text-paper p-4 rounded-xl overflow-x-auto leading-6 whitespace-pre-wrap break-words sm:whitespace-pre sm:break-normal">
{`// Base Sepolia 84532
import { keccak256, encodePacked } from 'viem'
// 1. Register
await contract.write.registerEvent(name, desc, date, loc, root, svg, url, flags)
// 2. Mint (public)
await contract.write.mint(eventId)
// 3. Allowlist
const leaf = keccak256(encodePacked(['address'],[user]))
const proof = tree.getProof(leaf) // sortPairs:true
await contract.write.allowlistMint(id, proof)
// 4. Signature (creator)
const msg = keccak256(encodePacked(['uint256','uint256','address'],[id, 84532, user]))
const sig = await wallet.signMessage({ message: { raw: msg } })
await contract.write.mintWithSignature(id, sig)`}
          </pre>
        </div>
      </div>
    </div>
  );
}
