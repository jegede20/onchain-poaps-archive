export function Footer() {
  return (
    <footer className="border-t border-line bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 justify-between">
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold tracking-tight">Onchain POAPs — Archive</div>
            <div className="mt-1.5 text-sm text-muted leading-6">
              Fully onchain <span className="font-medium text-ink">ERC-1155</span> • SSTORE2 SVG • Base Sepolia
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-paper-muted border border-line text-xs mono-num font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                0xC3243…9de6
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-ink text-white text-xs mono-num font-medium">
                eip155:84532
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12 text-sm">
            <div>
              <div className="font-bold text-xs uppercase tracking-[0.14em] text-muted">Protocol</div>
              <div className="mt-3 flex flex-col gap-2">
                <a href="https://sepolia.basescan.org/address/0xC3249356a483fbe17d5355D39105D2eA666d9de6#code" target="_blank" className="hover:text-brand-red transition-colors">Contract on BaseScan →</a>
                <a href="https://github.com/jvaleskadevs/onchain-poaps" target="_blank" className="hover:text-brand-red transition-colors">Protocol repo →</a>
                <a href="/docs" className="hover:text-brand-red transition-colors">Read Docs →</a>
              </div>
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-[0.14em] text-muted">Archive</div>
              <div className="mt-3 flex flex-col gap-2 text-muted">
                <span>Live on Base Sepolia</span>
                <span>No IPFS • No backend</span>
                <span className="mono-num text-xs">CAIP-2: eip155:84532:0xC3249…66d9de6</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center text-xs text-muted">
          <span>Built for the Onchain POAPs bounty • 100% open-source • MIT</span>
          <span className="mono-num">© 2026 Archive</span>
        </div>
      </div>
    </footer>
  );
}
