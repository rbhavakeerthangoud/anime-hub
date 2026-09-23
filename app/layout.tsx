import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://anime-hub-lemon.vercel.app"),

  title: {
    default: "Anime.Hub — Discover Your Next Favorite Anime",
    template: "%s | Anime.Hub",
  },

  description:
    "Anime.Hub is an anime discovery platform where you can search anime, explore characters, browse genres, check ratings, and discover your next favorite anime.",

  keywords: [
    "anime",
    "Anime.Hub",
    "anime search",
    "anime discovery",
    "anime characters",
    "anime genres",
    "anime ratings",
    "anime database",
  ],

  authors: [
    {
      name: "Anime.Hub",
    },
  ],

  creator: "Anime.Hub",
  applicationName: "Anime.Hub",

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    title: "Anime.Hub — Discover Your Next Favorite Anime",
    description:
      "Search anime, explore characters, browse genres, check ratings and discover your next favorite anime.",
    url: "https://anime-hub-lemon.vercel.app",
    siteName: "Anime.Hub",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Anime.Hub — Discover Your Next Favorite Anime",
    description:
      "Discover anime, characters, genres, ratings and more with Anime.Hub.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}