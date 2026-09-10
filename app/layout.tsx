import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Web3Providers } from "@/providers/wagmi";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Onchain POAPs — Archive",
  description: "Create, distribute, mint and collect fully onchain POAPs on Base Sepolia. Archive by Onchain POAPs.",
  openGraph: {
    title: "Onchain POAPs — Archive",
    description: "Permanent proof of attendance, built entirely around the chain.",
    images: ["/og.png"],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://onchain-poaps-archive.vercel.app/og.png",
      button: { title: "Open Archive", action: { type: "launch_frame", name: "Onchain POAPs", url: "https://onchain-poaps-archive.vercel.app", splashImageUrl: "https://onchain-poaps-archive.vercel.app/icon.png", splashBackgroundColor: "#FDFCF8" } }
    }),
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://onchain-poaps-archive.vercel.app/og.png",
      button: { title: "Open Archive", action: { type: "launch_miniapp", name: "Onchain POAPs", url: "https://onchain-poaps-archive.vercel.app", splashImageUrl: "https://onchain-poaps-archive.vercel.app/icon.png", splashBackgroundColor: "#FDFCF8" } }
    }),
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Web3Providers>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Web3Providers>
      </body>
    </html>
  );
}
