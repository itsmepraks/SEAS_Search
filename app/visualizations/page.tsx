"use client"

import dynamic from "next/dynamic"
import { Navigation } from "@/components/navigation"

const Visualizations = dynamic(() => import("@/components/visualizations").then((mod) => mod.Visualizations), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="h-10 w-1/4 rounded bg-muted/20 mb-6 animate-pulse" />
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-56 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        ))}
      </div>
    </div>
  ),
})

export default function VisualizationsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Visualizations />
    </main>
  )
}
