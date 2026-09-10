export const POAP_ADDRESS = "0xC3249356a483fbe17d5355D39105D2eA666d9de6" as const;
export const CHAIN_ID = 84532; // Base Sepolia
export const CREATOR_TIMELOCK = 30 * 24 * 60 * 60; // 30 days
export const SIGNATURE_GRACE = 7 * 24 * 60 * 60;

export const POAP_ABI = [
  {
    type: "function",
    name: "registerEvent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "eventDate", type: "uint256" },
      { name: "location", type: "string" },
      { name: "allowlistRoot", type: "bytes32" },
      { name: "svgImage", type: "string" },
      { name: "externalUrl", type: "string" },
      { name: "flags", type: "uint8" },
    ],
    outputs: [{ name: "eventId", type: "uint256" }],
  },
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [{ name: "eventId", type: "uint256" }], outputs: [] },
  { type: "function", name: "allowlistMint", stateMutability: "nonpayable", inputs: [{ name: "eventId", type: "uint256" }, { name: "merkleProof", type: "bytes32[]" }], outputs: [] },
  { type: "function", name: "mintWithSignature", stateMutability: "nonpayable", inputs: [{ name: "eventId", type: "uint256" }, { name: "signature", type: "bytes" }], outputs: [] },
  { type: "function", name: "creatorMint", stateMutability: "nonpayable", inputs: [{ name: "eventId", type: "uint256" }, { name: "recipients", type: "address[]" }], outputs: [] },
  { type: "function", name: "updateAllowlistRoot", stateMutability: "nonpayable", inputs: [{ name: "eventId", type: "uint256" }, { name: "newRoot", type: "bytes32" }], outputs: [] },
  { type: "function", name: "updateEventPublic", stateMutability: "nonpayable", inputs: [{ name: "eventId", type: "uint256" }, { name: "isPublic", type: "bool" }], outputs: [] },
  { type: "function", name: "events", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [
    { name: "name", type: "string" },
    { name: "description", type: "string" },
    { name: "eventDate", type: "bigint" },
    { name: "location", type: "string" },
    { name: "allowlistRoot", type: "bytes32" },
    { name: "svgImage", type: "address" },
    { name: "creator", type: "address" },
    { name: "createdAt", type: "bigint" },
    { name: "externalUrl", type: "string" },
    { name: "isSoulbound", type: "bool" },
    { name: "isPublic", type: "bool" },
  ]},
  { type: "function", name: "totalEvents", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "hasClaimed", stateMutability: "view", inputs: [{ name: "", type: "uint256" }, { name: "", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "uri", stateMutability: "view", inputs: [{ name: "eventId", type: "uint256" }], outputs: [{ type: "string" }] },
  { type: "function", name: "getMultichainEventId", stateMutability: "view", inputs: [{ name: "eventId", type: "uint256" }], outputs: [{ type: "string" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }, { name: "id", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOfBatch", stateMutability: "view", inputs: [{ name: "accounts", type: "address[]" }, { name: "ids", type: "uint256[]" }], outputs: [{ type: "uint256[]" }] },
  { type: "event", name: "NewEvent", inputs: [{ indexed: true, name: "eventId", type: "uint256" }, { name: "name", type: "string" }, { indexed: true, name: "creator", type: "address" }] },
  { type: "event", name: "NewMint", inputs: [{ indexed: true, name: "eventId", type: "uint256" }, { indexed: true, name: "recipient", type: "address" }] },
] as const;

export type PoapEvent = {
  id: number;
  name: string;
  description: string;
  eventDate: bigint;
  location: string;
  allowlistRoot: `0x${string}`;
  svgImage: `0x${string}`;
  creator: `0x${string}`;
  createdAt: bigint;
  externalUrl: string;
  isSoulbound: boolean;
  isPublic: boolean;
};

export function getFlags(isPublic: boolean, isSoulbound: boolean): number {
  if (isPublic && isSoulbound) return 3;
  if (isPublic) return 2;
  if (isSoulbound) return 1;
  return 0;
}

export function decodeFlags(flags: number) {
  return {
    isPublic: flags === 2 || flags === 3,
    isSoulbound: flags === 1 || flags === 3,
  };
}

export const ERROR_MAP: Record<string, string> = {
  'POAP__InvalidValue': 'Invalid parameter — check name (1-128), description (≤512), SVG (non-empty), location/URL (≤128), or flags.',
  'POAP__TimeLockExpired': 'Creator window closed — this action is only allowed within 30 days (37 for signatures).',
  'POAP__OnlyCreator': 'Only the event creator can do this.',
  'POAP__AlreadyClaimed': 'This wallet already holds this POAP — one per wallet.',
  'POAP__EventNotPublic': 'Public minting is disabled for this event.',
  'POAP__AllowlistNotEnabled': 'No allowlist is set for this event.',
  'POAP__RootAlreadySet': 'Allowlist root already set — can only be set once.',
  'POAP__SoulboundNotTransferable': 'This POAP is soulbound and cannot be transferred.',
};

export function decodeContractError(err: any): string {
  const msg = err?.message || err?.toString() || '';
  for (const [k,v] of Object.entries(ERROR_MAP)) {
    if (msg.includes(k) || msg.includes(k.replace('POAP__', ''))) return v;
  }
  if (msg.includes('User rejected')) return 'Transaction rejected in wallet.';
  if (msg.includes('insufficient funds')) return 'Insufficient funds for gas.';
  // shorten viem errors
  const short = msg.split('\n')[0];
  if (short.length < 200) return short;
  return short.slice(0,180) + '…';
}

export function isWithinCreatorWindow(createdAt: bigint, extraDays = 0): boolean {
  const now = BigInt(Math.floor(Date.now()/1000));
  const window = BigInt(CREATOR_TIMELOCK + extraDays*24*60*60);
  return now < createdAt + window;
}
export function secondsRemaining(createdAt: bigint, extraDays = 0): number {
  const now = Math.floor(Date.now()/1000);
  const end = Number(createdAt) + CREATOR_TIMELOCK + extraDays*86400;
  return Math.max(0, end - now);
}
export function formatCountdown(sec: number): string {
  if (sec <= 0) return 'Expired';
  const d = Math.floor(sec/86400);
  const h = Math.floor((sec%86400)/3600);
  const m = Math.floor((sec%3600)/60);
  if (d>0) return `${d}d ${h}h`;
  if (h>0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function sanitizeForJson(s: string): string {
  // Fix the uri() newline break — escape newlines, quotes, backslashes
  return s.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t');
}
export function unsanitizeJsonString(s: string): string {
  try { return JSON.parse(`"${s}"`); } catch { return s; }
}

export function decodeUri(uri: string): { name: string; description: string; image: string; attributes: any[]; external_url: string; raw: any } | null {
  try {
    const b64 = uri.replace('data:application/json;base64,','');
    const jsonStr = typeof window !== 'undefined' ? atob(b64) : Buffer.from(b64,'base64').toString('utf-8');
    // Repair common break: unescaped newlines in description/name
    let fixed = jsonStr;
    // Try parse, if fail attempt to fix control chars
    try {
      const raw = JSON.parse(fixed);
      return { name: raw.name, description: raw.description, image: raw.image, attributes: raw.attributes || [], external_url: raw.external_url || '', raw };
    } catch {
      // Replace literal newlines inside JSON strings with \n
      fixed = fixed.replace(/[\x00-\x1F\x7F]/g, (c) => {
        if (c==='\n') return '\\n';
        if (c==='\r') return '\\r';
        if (c==='\t') return '\\t';
        return '';
      });
      const raw = JSON.parse(fixed);
      return { name: raw.name, description: raw.description, image: raw.image, attributes: raw.attributes || [], external_url: raw.external_url || '', raw };
    }
  } catch (e) {
    return null;
  }
}

export function getBasescanLink(id: number): string {
  return `https://sepolia.basescan.org/address/${POAP_ADDRESS}#code`;
}
export function getMintTxLink(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}
export function getOpenseaLink(id: number): string {
  return `https://opensea.io/assets/base/${POAP_ADDRESS}/${id}`;
}
