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

export const metadata = {
  title: 'CineVerse',
  description: 'Modern streaming platform with multi-server support',
  openGraph: {
    title: 'CineVerse',
    description: 'Stream your favorite movies and TV shows',
    url: 'https://cineverse-your-url.vercel.app',
    siteName: 'CineVerse',
    images: [
      {
        url: '/og-image.png', // Add your preview image in public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineVerse',
    description: 'Stream your favorite movies and TV shows',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}