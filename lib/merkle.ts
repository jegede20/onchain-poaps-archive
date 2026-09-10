// OpenZeppelin compatible Merkle tree (sorted pairs, keccak256(abi.encodePacked(address)))
import { keccak256, encodePacked } from 'viem';

export function leafForAddress(address: string): `0x${string}` {
  return keccak256(encodePacked(['address'], [address as `0x${string}`]));
}

export function buildTree(addresses: string[]) {
  const normalized = [...new Set(addresses.map(a=>a.trim().toLowerCase()))].filter(a=>a.startsWith('0x') && a.length===42);
  const leaves = normalized.map(a => leafForAddress(a)).sort();
  if (leaves.length===0) return { root: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`, leaves: [] as string[], layers: [] as `0x${string}`[][] };
  let layers: `0x${string}`[][] = [leaves as `0x${string}`[]];
  let current = leaves as `0x${string}`[];
  while (current.length > 1) {
    const next: `0x${string}`[] = [];
    for (let i=0;i<current.length;i+=2) {
      const a = current[i];
      const b = current[i+1] || a;
      const [first, second] = a < b ? [a,b] : [b,a];
      const parent = keccak256(encodePacked(['bytes32','bytes32'], [first, second]));
      next.push(parent);
    }
    layers.push(next);
    current = next;
  }
  return { root: current[0], leaves: normalized, layers };
}

export function getProof(address: string, tree: ReturnType<typeof buildTree>): `0x${string}`[] {
  const leaf = leafForAddress(address.toLowerCase());
  const leaves = tree.layers[0] || [];
  let idx = leaves.indexOf(leaf);
  if (idx===-1) return [];
  const proof: `0x${string}`[] = [];
  for (let layerIdx=0; layerIdx<tree.layers.length-1; layerIdx++) {
    const layer = tree.layers[layerIdx];
    const isRight = idx % 2 === 1;
    const pairIdx = isRight ? idx-1 : idx+1;
    if (pairIdx < layer.length) proof.push(layer[pairIdx]);
    else proof.push(layer[idx]); // duplicate if odd
    idx = Math.floor(idx/2);
  }
  return proof;
}

export function verifyProof(leaf: `0x${string}`, proof: `0x${string}`[], root: `0x${string}`): boolean {
  let computed = leaf;
  for (const elem of proof) {
    const [a,b] = computed < elem ? [computed, elem] : [elem, computed];
    computed = keccak256(encodePacked(['bytes32','bytes32'], [a,b]));
  }
  return computed.toLowerCase() === root.toLowerCase();
}

export function parseAddressList(input: string): { addresses: string[], invalid: string[] } {
  const lines = input.split(/[\n,;\s]+/).map(s=>s.trim()).filter(Boolean);
  const addresses: string[] = [];
  const invalid: string[] = [];
  for (const l of lines) {
    if (/^0x[a-fA-F0-9]{40}$/.test(l)) addresses.push(l.toLowerCase());
    else invalid.push(l);
  }
  return { addresses: [...new Set(addresses)], invalid };
}
