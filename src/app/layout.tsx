import { Geist } from "next/font/google";
import "../app/globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

import { JetBrains_Mono } from "next/font/google";

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background w-full h-full text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
