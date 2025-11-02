import type { Metadata } from "next";
import { Geist, Geist_Mono, Asap } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tree Component BaseUI",
  description: "Tree component made using BaseUI components",
};

const asap = Asap({
  variable: "--font-asap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${asap.variable} max-w-full font-sans antialiased`}
      >
        <Providers>
          <div className="root" data-vaul-drawer-wrapper>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
