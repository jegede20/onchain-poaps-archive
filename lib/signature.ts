import { keccak256, encodePacked } from 'viem';

export function makeMessageHash(eventId: number, chainId: number, recipient: string): `0x${string}` {
  return keccak256(encodePacked(['uint256','uint256','address'], [BigInt(eventId), BigInt(chainId), recipient as `0x${string}`]));
}

// The contract uses MessageHashUtils.toEthSignedMessageHash -> signMessage(getBytes(message))
export function getSignableMessage(eventId: number, chainId: number, recipient: string): `0x${string}` {
  return makeMessageHash(eventId, chainId, recipient);
}
