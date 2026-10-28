import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Toaster } from '@sisfo-remake/ui'
import './styles.css'

const robotoSans = Roboto({
  variable: '--font-roboto-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Sistem Uji Berbasis Komputer | Badiklat',
  description: 'The UI component for Badiklat Sisfo (Remake)',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${robotoSans.className} text-base antialiased`}>
        <Toaster />
        {children}
      </body>
    </html>
  )
}
