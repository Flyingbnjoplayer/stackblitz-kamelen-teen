import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ResponseLogger } from "../components/response-logger";
import { Providers } from "./providers";
import FarcasterWrapper from "../components/FarcasterWrapper";
import { Toaster } from "../components/ui/sonner";
import { FarcasterSdkReady } from "../components/FarcasterSdkReady";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Glitch NFT Studio",
  description: "Create, mint as NFT, and share retro glitch art as NFTs on Base. Real-time effects including RGB split, VHS distortion, and more. Mint your creations and share on farcaster.",
  openGraph: {
    title: "Glitch NFT Studio",
    description: "Create, mint, and share retro glitch art as NFTs on Base",
    images: ['/og-image.png'],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://stackblitz-kamelen-teen.vercel.app/thumbnail.png",
    }),
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <FarcasterSdkReady>
          <Providers>
            <FarcasterWrapper>
              {children}
            </FarcasterWrapper>
          </Providers>
        </FarcasterSdkReady>
        <Toaster />
        <ResponseLogger />
      </body>
    </html>
  );
}