"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Network, Database, FileText, BarChart3, GraduationCap, Layers, MessageCircle, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const navItems = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/data", label: "Data", icon: Database },
  { href: "/knowledge-graph", label: "Graph", icon: Network },
  { href: "/methodology", label: "Method", icon: FileText },
  { href: "/architecture", label: "Arch", icon: Layers },
  { href: "/results", label: "Results", icon: BarChart3 },
  { href: "/outputs", label: "Outputs", icon: Sparkles },
  { href: "/chat", label: "Chat", icon: MessageCircle },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5 transition-all duration-200">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent/25 to-accent/5 border border-accent/20 transition-all group-hover:border-accent/40 group-hover:shadow-lg group-hover:shadow-accent/10">
            <GraduationCap className="h-4 w-4 text-accent transition-transform group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight leading-none">SEAS Search</span>
            <span className="text-[10px] text-muted-foreground/60 leading-none mt-0.5">KG-Based Course QA</span>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5 rounded-xl bg-secondary/50 p-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-background border border-border/50 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </motion.header>
  )
}
