import { Navigation } from "@/components/navigation"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <ChatInterface />
    </main>
  )
}
