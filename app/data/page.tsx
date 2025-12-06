import { Navigation } from "@/components/navigation"
import { DataExplorer } from "@/components/data-explorer"

export default function DataPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <DataExplorer />
    </main>
  )
}
