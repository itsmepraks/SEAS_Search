import { Navigation } from "@/components/navigation"
import { OutputsShowcase } from "@/components/outputs-showcase"

export default function OutputsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <OutputsShowcase />
    </main>
  )
}
