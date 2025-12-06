import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

export const metadata: Metadata = {
  title: "SEAS Search | Knowledge Graph-Based Course QA",
  description: "Research project showcasing fine-tuned LLMs with knowledge graphs for GWU course search and prerequisite planning",
  keywords: ["GWU", "SEAS", "Knowledge Graph", "LLM", "course search", "fine-tuning", "research"],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <body className="font-sans antialiased min-h-screen">
        <Navigation />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
