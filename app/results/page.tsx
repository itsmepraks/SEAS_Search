import dynamic from "next/dynamic"
import { Navigation } from "@/components/navigation"

const ResultsContent = dynamic(() => import("@/components/results-content").then((mod) => mod.ResultsContent), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-7xl px-4 py-20">
      <div className="h-12 w-1/3 rounded bg-muted/20 mb-6 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        ))}
      </div>
    </div>
  ),
})

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-background pt-20 pb-12">
      <Navigation />
      <ResultsContent />
    </main>
  )
}
