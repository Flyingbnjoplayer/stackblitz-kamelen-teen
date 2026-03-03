import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ResponseLogger } from "../components/response-logger";
import { ReadyNotifier } from "../components/ready-notifier";
import { Providers } from "./providers";
import FarcasterWrapper from "../components/FarcasterWrapper";
import { Toaster } from "../components/ui/sonner";

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
  description: "Create, mint, and share retro glitch art as NFTs on Base. Real-time effects including RGB split, VHS distortion, and more. Mint your creations and share on Warpcast.",
  other: { 
    "fc:frame": JSON.stringify({
      "version": "next",
      "imageUrl": "https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_ae1d2f16-cffb-450f-a2fa-1e4a267b3737-znMJHlnXVSDspmN6lMMSD4iMnQ9wgL",
    })
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
        <ReadyNotifier />
        <Providers>
          <FarcasterWrapper>
            {children}
          </FarcasterWrapper>
        </Providers>
        <Toaster />
        <ResponseLogger />
      </body>
    </html>
  );
}
