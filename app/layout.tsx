import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mario's Humidor",
  description: "The Cigar Lifestyle Platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mario's Humidor",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#120a02"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Mario's Humidor"/>
        <link rel="manifest" href="/manifest.json"/>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{
        margin: 0,
        padding: 0,
        background: "#120a02",
        display: "flex",
        justifyContent: "center",
        overflowX: "hidden",
      }}>
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          minHeight: "100vh",
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}
