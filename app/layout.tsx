import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const notoSans = Noto_Sans({ 
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-noto-sans',
});

export const metadata: Metadata = {
  title: 'Tutlayt Translations',
  description: 'Professional Translation Services',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/images/tutlayt-icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
