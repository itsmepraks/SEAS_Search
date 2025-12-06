"use client"

import { useEffect, useRef, useState } from "react"

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!ref.current || !isClient) return

    let isMounted = true

    // Load mermaid dynamically
    import("mermaid").then((mermaid) => {
      if (!isMounted) return

      mermaid.default.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#3b82f6",
          primaryTextColor: "#fff",
          primaryBorderColor: "#1e40af",
          lineColor: "#64748b",
          secondaryColor: "#1e293b",
          tertiaryColor: "#0f172a",
          background: "transparent",
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
      })

      // Clear previous content
      const container = ref.current!
      container.innerHTML = ""

      // Create a unique ID for this diagram
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Render the diagram
      mermaid.default.render(id, chart).then(({ svg }) => {
        if (isMounted && container) {
          container.innerHTML = svg
        }
      }).catch((err) => {
        console.error("Mermaid rendering error:", err)
        if (isMounted && container) {
          container.innerHTML = `<div class="text-red-500 text-sm p-4">Error rendering diagram: ${err.message}</div>`
        }
      })
    })

    return () => {
      isMounted = false
    }
  }, [chart, isClient])

  if (!isClient) {
    return <div className={`${className} bg-muted/10 rounded-lg flex items-center justify-center min-h-[400px]`}>
      <div className="text-muted-foreground text-sm">Loading diagram...</div>
    </div>
  }

  return <div ref={ref} className={className} />
}

