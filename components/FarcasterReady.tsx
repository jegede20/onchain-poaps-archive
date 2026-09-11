"use client";
import { useEffect } from "react";
import { sdk } from "@farcaster/frame-sdk";

export function FarcasterReady() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Tells Warpcast/Base App to hide splash screen — required for Mini App
        await sdk.actions.ready();
        if (!cancelled) {
          // Optional: you can check context
          // const ctx = await sdk.context;
          // console.log("Farcaster context", ctx);
        }
      } catch {
        // Not in Farcaster — silently ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return null;
}

// helper for plain check without sdk
export function isInMiniApp(): boolean {
  if (typeof window === "undefined") return false;
  // Warpcast/BASE injects these
  const ua = navigator.userAgent || "";
  return /Warpcast|Farcaster|Base/i.test(ua) || window.location.search.includes("miniApp");
}
