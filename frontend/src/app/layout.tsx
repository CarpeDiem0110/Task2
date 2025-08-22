import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { ReduxProvider } from '@/providers/ReduxProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Commerce App',
  description: 'Modern e-commerce application built with Next.js',
}

type Props = {
  children: ReactNode
}

export default function RootLayout({
  children
}: Props) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
