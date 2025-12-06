"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Hash } from "lucide-react"

interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
}

interface PageSidebarProps {
  items: SidebarItem[]
  className?: string
}

export function PageSidebar({ items, className }: PageSidebarProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "")

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <aside
      className={cn(
        "hidden lg:block w-64 flex-shrink-0",
        "sticky top-20 self-start",
        "h-[calc(100vh-5rem)] overflow-y-auto",
        className
      )}
    >
      <div className="pr-4">
        <div className="bg-card/50 border border-border/50 rounded-lg p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quick Navigation
          </div>
          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all",
                    "hover:bg-accent/50",
                    isActive
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {item.icon || <Hash className="h-3.5 w-3.5" />}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}

