import { Navigation } from "@/components/navigation"
import { DataExplorer } from "@/components/data-explorer"
import { BackToTop } from "@/components/back-to-top"

export default function DataPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <BackToTop />
      <DataExplorer />
    </main>
  )
}
