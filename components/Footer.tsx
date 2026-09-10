export function Footer() {
  return (
    <footer className="border-t border-line bg-paper-elevated mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-6 justify-between">
        <div className="text-sm text-muted">
          <div className="font-semibold text-ink">Onchain POAPs — Archive</div>
          <div className="mt-1">Fully onchain ERC-1155 • SSTORE2 SVG • Base Sepolia 0xC3243…9de6</div>
          <div className="mt-2 mono-num text-xs">CAIP-2: eip155:84532:0xC3249356a483fbe17d5355D39105D2eA666d9de6</div>
        </div>
        <div className="flex gap-6 text-sm">
          <a href="https://sepolia.basescan.org/address/0xC3249356a483fbe17d5355D39105D2eA666d9de6#code" target="_blank" className="underline decoration-line hover:text-ink">Contract</a>
          <a href="https://github.com/jvaleskadevs/onchain-poaps" target="_blank" className="underline decoration-line hover:text-ink">Protocol</a>
          <a href="/docs" className="underline decoration-line hover:text-ink">Docs</a>
        </div>
      </div>
    </footer>
  );
}
