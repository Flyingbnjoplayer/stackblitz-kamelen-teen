import type { Metadata } from "next";
import localFont from "next/font/local";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import { ResponseLogger } from "@/components/response-logger";
import { ReadyNotifier } from "@/components/ready-notifier";
import { Providers } from "./providers";
import FarcasterWrapper from "@/components/FarcasterWrapper";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en">
          <head></head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
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

export const metadata: Metadata = {
        title: "Glitch NFT Studio",
        description: "Create, mint, and share retro glitch art as NFTs on Base. Real-time effects including RGB split, VHS distortion, and more. Mint your creations and share on Warpcast.",
        other: { "fc:frame": JSON.stringify({"version":"next","imageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_ae1d2f16-cffb-450f-a2fa-1e4a267b3737-znMJHlnXVSDspmN6lMMSD4iMnQ9wgL","button":{"title":"Open with Ohara","action":{"type":"launch_frame","name":"Glitch Photo Editor","url":"https://push-entirely-836.app.ohara.ai","splashImageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg","splashBackgroundColor":"#ffffff"}}}
        ) }
    };
