export type SvgStats = { original: number; optimized: number; saved: number; savedPct: number };

export function optimizeSvg(svg: string): { optimized: string; stats: SvgStats } {
  const original = new Blob([svg]).size;
  let out = svg;
  // Remove XML prolog
  out = out.replace(/<\?xml[^>]*\?>\s*/g, '');
  // Remove comments
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  // Remove doctype
  out = out.replace(/<!DOCTYPE[^>]*>/g, '');
  // Remove editor metadata
  out = out.replace(/<metadata[^>]*>[\s\S]*?<\/metadata>/g, '');
  out = out.replace(/<sodipodi:[^>]*\/>/g, '');
  out = out.replace(/\s+xmlns:sodipodi="[^"]*"/g, '');
  out = out.replace(/\s+inkscape:[^=]*="[^"]*"/g, '');
  // Collapse whitespace
  out = out.replace(/\s+/g, ' ');
  out = out.replace(/>\s+</g, '><');
  // Remove empty groups
  out = out.replace(/<g>\s*<\/g>/g, '');
  // Round numbers to 2 decimals
  out = out.replace(/(\d+\.\d{3,})/g, (m) => parseFloat(m).toFixed(2));
  // Shorten hex colors #FFFFFF -> #FFF etc.
  out = out.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');
  out = out.trim();
  // Validate parse: try DOMParser if available
  try {
    if (typeof DOMParser !== 'undefined') {
      const p = new DOMParser().parseFromString(out, 'image/svg+xml');
      if (p.querySelector('parsererror')) throw new Error('parse fail');
    }
  } catch {
    return { optimized: svg, stats: { original, optimized: original, saved: 0, savedPct: 0 } };
  }
  const optimized = new Blob([out]).size;
  const saved = original - optimized;
  return { optimized: out, stats: { original, optimized, saved, savedPct: original ? Math.round(saved/original*100) : 0 } };
}

export function estimateGas(svgBytes: number): number {
  // SSTORE2 ~200 gas per byte + 75k overhead (from README table)
  return 75000 + svgBytes * 200;
}

export function formatGasCost(gas: number, gwei = 0.1): string {
  // Base Sepolia: rough USD via ETH ~$3500, gas*price
  const eth = (gas * gwei * 1e-9);
  const usd = eth * 3400;
  return `~${gas.toLocaleString()} gas (~$${usd.toFixed(2)} @ ${gwei} gwei)`;
}
