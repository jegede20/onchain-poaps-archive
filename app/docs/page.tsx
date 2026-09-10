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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
      <p className="mt-2 text-muted">Everything to run Onchain POAPs without asking the bounty creator.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCS.map(d=> (
          <Link key={d.slug} href={`/docs/${d.slug}`} className="archive-card p-5 hover:border-brass/50 hover:shadow-md transition-all">
            <div className="text-xs uppercase tracking-widest text-muted">{d.slug}</div>
            <div className="mt-1 font-semibold">{d.title}</div>
            <div className="mt-1 text-sm text-muted">{d.desc}</div>
            <div className="mt-3 text-xs font-semibold underline decoration-brass">Read →</div>
          </Link>
        ))}
      </div>
      <div className="mt-8 archive-inset p-5">
        <h3 className="font-semibold">Quick start</h3>
        <pre className="mt-3 text-xs mono-num bg-ink text-paper p-4 rounded-xl overflow-x-auto">{`// Base Sepolia 84532
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
await contract.write.mintWithSignature(id, sig)`}</pre>
      </div>
    </div>
  );
}
