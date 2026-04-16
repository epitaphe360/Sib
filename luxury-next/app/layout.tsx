import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lumière Absolue — Architecture d\'Élite',
  description:
    'Maison d\'architecture de prestige fondée en 1994. Nous concevons des espaces qui transcendent le temps — résidentiel, commercial, institutionnel.',
  keywords: ['architecture', 'luxe', 'prestige', 'construction', 'design'],
  authors: [{ name: 'Lumière Architecture' }],
  openGraph: {
    title: 'Lumière Absolue — Architecture d\'Élite',
    description: 'Maison d\'architecture de prestige. Espaces qui transcendent le temps.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumière Absolue — Architecture d\'Élite',
    description: 'Maison d\'architecture de prestige.',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body className="bg-white text-[#4A4A4A] antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
