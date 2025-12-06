"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Network, Users, BookOpen, GitBranch, Sparkles, ArrowRight } from "lucide-react"

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

interface GraphNode {
  id: string
  label: string
  type: "course" | "professor" | "topic"
  description?: string
  credits?: string
  code?: string
  name?: string
  topic?: string
}

interface GraphLink {
  source: string | any
  target: string | any
  type: string
  label: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  _metadata?: {
    note: string
    total_nodes: number
    total_links: number
  }
}

const SAMPLE_QUERIES = [
  {
    query: "If I finished CSCI 6531, which courses remain before CSCI 8531?",
    answer: "After completing CSCI 6531, you are ready to take CSCI 8531.",
    path: "CSCI 6531 → CSCI 8531"
  },
  {
    query: "What courses do I need after CSCI 2461 to enroll in CSCI 3410?",
    answer: "To prepare for CSCI 3410, you should also take: CSCI 1112, CSCI 1111, CSCI 2113, MATH 1221.",
    path: "CSCI 2461 → CSCI 3410"
  },
  {
    query: "Which courses should I take to prepare for CSCI 4345 if I've completed CSCI 4342?",
    answer: "To prepare for CSCI 4345, you should also take: CSCI 2113, MATH 1221.",
    path: "CSCI 4342 → CSCI 4345"
  }
]

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [highlightLinks, setHighlightLinks] = useState(new Set())
  const graphRef = useRef<any>()

  useEffect(() => {
    fetch("/data/knowledge_graph.json")
      .then((res) => res.json())
      .then((data) => setGraphData(data))
      .catch((err) => console.error("Failed to load graph data:", err))
  }, [])

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node)

    // Highlight connected nodes
    if (graphData) {
      const connectedNodes = new Set<string>()
      const connectedLinks = new Set<string>()

      connectedNodes.add(node.id)

      graphData.links.forEach((link) => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id

        if (sourceId === node.id) {
          connectedLinks.add(`${sourceId}-${targetId}`)
          connectedNodes.add(targetId)
        }
        if (targetId === node.id) {
          connectedLinks.add(`${sourceId}-${targetId}`)
          connectedNodes.add(sourceId)
        }
      })

      setHighlightNodes(connectedNodes)
      setHighlightLinks(connectedLinks)
    }
  }, [graphData])

  const getNodeColor = (node: GraphNode) => {
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id)
    const alpha = isHighlighted ? 1 : 0.2

    if (node.type === "course") return `rgba(239, 68, 68, ${alpha})` // red
    if (node.type === "professor") return `rgba(20, 184, 166, ${alpha})` // teal
    if (node.type === "topic") return `rgba(96, 165, 250, ${alpha})` // light blue
    return `rgba(107, 114, 128, ${alpha})` // gray
  }

  const getNodeSize = (node: GraphNode) => {
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id)
    const baseSize = node.type === "course" ? 8 : node.type === "professor" ? 6 : 5
    return isHighlighted ? baseSize : baseSize * 0.5
  }

  const getLinkColor = (link: any) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    const linkKey = `${sourceId}-${targetId}`

    if (highlightLinks.size === 0) {
      // Color by edge type
      if (link.type === 'prerequisite') return 'rgba(239, 68, 68, 0.4)' // red
      if (link.type === 'taught_by') return 'rgba(20, 184, 166, 0.4)' // teal
      if (link.type === 'covers_topic') return 'rgba(96, 165, 250, 0.4)' // blue
      return 'rgba(100, 116, 139, 0.3)'
    }

    return highlightLinks.has(linkKey) ? 'rgba(59, 130, 246, 0.8)' : 'rgba(100, 116, 139, 0.1)'
  }

  const getLinkWidth = (link: any) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    const linkKey = `${sourceId}-${targetId}`

    if (highlightLinks.size === 0) return 1.5
    return highlightLinks.has(linkKey) ? 3 : 0.5
  }

  const filteredData = graphData
    ? {
        nodes: graphData.nodes.filter(
          (node) =>
            searchQuery === "" ||
            node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.name?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        links: graphData.links,
      }
    : null

  const stats = graphData
    ? {
        totalNodes: graphData.nodes.length,
        courses: graphData.nodes.filter((n) => n.type === "course").length,
        professors: graphData.nodes.filter((n) => n.type === "professor").length,
        topics: graphData.nodes.filter((n) => n.type === "topic").length,
        relationships: graphData.links.length,
      }
    : null

  // Get connected nodes and their relationships
  const getConnectedRelationships = () => {
    if (!selectedNode || !graphData) return { prerequisites: [], dependents: [], instructors: [], topics: [] }

    const prerequisites: string[] = []
    const dependents: string[] = []
    const instructors: string[] = []
    const topics: string[] = []

    graphData.links.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id

      if (targetId === selectedNode.id && link.type === 'prerequisite') {
        const sourceNode = graphData.nodes.find(n => n.id === sourceId)
        if (sourceNode) prerequisites.push(sourceNode.label)
      }
      if (sourceId === selectedNode.id && link.type === 'prerequisite') {
        const targetNode = graphData.nodes.find(n => n.id === targetId)
        if (targetNode) dependents.push(targetNode.label)
      }
      if (sourceId === selectedNode.id && link.type === 'taught_by') {
        const targetNode = graphData.nodes.find(n => n.id === targetId)
        if (targetNode) instructors.push(targetNode.label)
      }
      if (sourceId === selectedNode.id && link.type === 'covers_topic') {
        const targetNode = graphData.nodes.find(n => n.id === targetId)
        if (targetNode) topics.push(targetNode.label)
      }
    })

    return { prerequisites, dependents, instructors, topics }
  }

  const relationships = getConnectedRelationships()

  const handleSampleQuery = (courseCode: string) => {
    if (!graphData) return
    const node = graphData.nodes.find(n => n.label.includes(courseCode))
    if (node) {
      handleNodeClick(node)
      // Center on the node
      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 1000)
        graphRef.current.zoom(2, 1000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Knowledge Graph Visualization</h1>
          <p className="text-muted-foreground text-lg">
            Interactive exploration of course relationships, prerequisites, instructors, and topics
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6"
          >
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Network className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Total Nodes</div>
              </div>
              <div className="text-2xl font-bold">{stats.totalNodes}</div>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-red-500" />
                <div className="text-xs text-muted-foreground">Courses</div>
              </div>
              <div className="text-2xl font-bold">{stats.courses}</div>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-teal-500" />
                <div className="text-xs text-muted-foreground">Professors</div>
              </div>
              <div className="text-2xl font-bold">{stats.professors}</div>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <div className="text-xs text-muted-foreground">Topics</div>
              </div>
              <div className="text-2xl font-bold">{stats.topics}</div>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Relationships</div>
              </div>
              <div className="text-2xl font-bold">{stats.relationships}</div>
            </Card>
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, professors, or topics... (e.g., CSCI 6364, Simha, machine learning)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Graph Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Interactive Force-Directed Graph</h3>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-muted-foreground">Courses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                    <span className="text-muted-foreground">Professors</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-muted-foreground">Topics</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-background/50 rounded-lg border border-border/40 overflow-hidden">
                {filteredData ? (
                  <ForceGraph2D
                    ref={graphRef}
                    graphData={filteredData}
                    nodeLabel={(node: any) => `${node.label} (${node.type})`}
                    nodeColor={getNodeColor}
                    nodeRelSize={6}
                    nodeVal={getNodeSize}
                    linkColor={getLinkColor}
                    linkWidth={getLinkWidth}
                    linkDirectionalArrowLength={3}
                    linkDirectionalArrowRelPos={1}
                    linkCurvature={0.2}
                    onNodeClick={handleNodeClick}
                    width={800}
                    height={600}
                    backgroundColor="transparent"
                    nodeCanvasObjectMode={() => "after"}
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                      const label = node.label
                      const fontSize = Math.max(10, 12 / globalScale)
                      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
                      ctx.textAlign = "center"
                      ctx.textBaseline = "middle"

                      // Text shadow for better readability
                      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
                      ctx.shadowBlur = 3

                      ctx.fillStyle = 'rgba(15, 15, 15, 0.9)'
                      ctx.fillText(label, node.x, node.y + 14 / globalScale)

                      ctx.shadowBlur = 0
                    }}
                    d3VelocityDecay={0.3}
                    cooldownTime={3000}
                  />
                ) : (
                  <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                    Loading knowledge graph...
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground/60">
                  Click nodes to view details • Drag to pan • Scroll to zoom • Click background to reset
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setHighlightNodes(new Set())
                    setHighlightLinks(new Set())
                    setSelectedNode(null)
                  }}
                  className="text-xs"
                >
                  Reset View
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Node Details Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-5 bg-card/50 border-border/50 sticky top-24">
              <h3 className="font-semibold mb-4">
                {selectedNode ? "Node Details" : "Graph Legend"}
              </h3>

              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <Badge
                      variant="secondary"
                      className={
                        selectedNode.type === "course"
                          ? "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                          : selectedNode.type === "professor"
                          ? "bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-500/30"
                          : "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30"
                      }
                    >
                      {selectedNode.type.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-1">{selectedNode.label}</h4>
                    {selectedNode.code && (
                      <p className="text-sm text-muted-foreground mb-2">{selectedNode.code}</p>
                    )}
                    {selectedNode.description && (
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {selectedNode.description}
                      </p>
                    )}
                  </div>

                  {selectedNode.credits && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Credits</div>
                      <div className="text-sm font-medium">{selectedNode.credits}</div>
                    </div>
                  )}

                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Connections</div>
                      <div className="text-sm font-semibold">
                        {graphData?.links.filter(
                          (l) => {
                            const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id
                            const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id
                            return sourceId === selectedNode.id || targetId === selectedNode.id
                          }
                        ).length || 0} total relationships
                      </div>
                    </div>

                    {relationships.prerequisites.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">Prerequisites</div>
                        <div className="flex flex-wrap gap-1.5">
                          {relationships.prerequisites.map((prereq, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-red-500/10 border-red-500/30">
                              {prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {relationships.dependents.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1.5">Required For</div>
                        <div className="flex flex-wrap gap-1.5">
                          {relationships.dependents.map((dep, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-orange-500/10 border-orange-500/30">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {relationships.instructors.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1.5">Instructors</div>
                        <div className="flex flex-wrap gap-1.5">
                          {relationships.instructors.map((instructor, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-teal-500/10 border-teal-500/30">
                              {instructor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {relationships.topics.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5">Topics Covered</div>
                        <div className="flex flex-wrap gap-1.5">
                          {relationships.topics.slice(0, 8).map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                              {topic}
                            </Badge>
                          ))}
                          {relationships.topics.length > 8 && (
                            <Badge variant="outline" className="text-xs bg-muted/50">
                              +{relationships.topics.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    This knowledge graph represents relationships between courses, prerequisites,
                    instructors, and topics extracted from GWU course data.
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-foreground text-sm">Course Nodes</div>
                        <div className="text-xs text-muted-foreground/80">Individual courses with prerequisites and topics</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-foreground text-sm">Professor Nodes</div>
                        <div className="text-xs text-muted-foreground/80">Instructors teaching courses</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-foreground text-sm">Topic Nodes</div>
                        <div className="text-xs text-muted-foreground/80">Subject areas covered by courses</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50">
                    <div className="text-xs font-medium text-foreground mb-2">Edge Types</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-red-500/60"></div>
                        <span className="text-xs">Prerequisites</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-teal-500/60"></div>
                        <span className="text-xs">Taught By</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-blue-500/60"></div>
                        <span className="text-xs">Covers Topic</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs pt-2 border-t border-border/50">
                    Click on any node to see detailed information and connected relationships.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Sample Multi-hop Queries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Sample Multi-Hop Queries</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Examples of complex prerequisite chain questions from the KG-based training data
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {SAMPLE_QUERIES.map((sample, i) => (
                <Card key={i} className="p-4 bg-card/50 border-border/40 hover:border-blue-500/40 transition-all">
                  <div className="text-xs font-medium text-muted-foreground mb-2">QUERY {i + 1}</div>
                  <p className="text-sm font-medium mb-3 leading-relaxed">{sample.query}</p>
                  <div className="bg-blue-500/10 rounded px-2 py-1.5 mb-2">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">{sample.path}</div>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3">{sample.answer}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs w-full"
                    onClick={() => {
                      const courseMatch = sample.path.match(/CSCI \d+|DATS \d+|MATH \d+/)
                      if (courseMatch) handleSampleQuery(courseMatch[0])
                    }}
                  >
                    Visualize Path <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Card>
              ))}
            </div>

            <p className="text-xs text-muted-foreground/60 mt-4 italic">
              These queries demonstrate the multi-hop reasoning capability enabled by the knowledge graph structure.
            </p>
          </Card>
        </motion.div>

        {/* Extraction Methodology */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6"
        >
          <Card className="p-6 bg-card/30 border-border/40">
            <h3 className="font-semibold text-lg mb-4">Graph Construction Methodology</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2 text-foreground/90 flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-red-500" />
                  Prerequisites Extraction
                </h4>
                <p className="text-muted-foreground/80 leading-relaxed mb-2">
                  Regex patterns to extract prerequisite relationships from course descriptions:
                </p>
                <code className="text-xs bg-secondary/50 px-2 py-1 rounded block">
                  r"Prerequisites?: ([A-Z]+ \d+)"
                </code>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-foreground/90 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  Topic Extraction
                </h4>
                <p className="text-muted-foreground/80 leading-relaxed mb-2">
                  Keyword matching + spaCy NLP to identify topics from descriptions:
                </p>
                <p className="text-xs text-muted-foreground/70">
                  machine learning, algorithms, databases, security, networks, AI, software engineering, etc.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-foreground/90 flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-500" />
                  Instructor Mapping
                </h4>
                <p className="text-muted-foreground/80 leading-relaxed mb-2">
                  Direct mapping from Spring 2026 schedule data:
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Course sections → Instructors creates taught_by relationships
                </p>
              </div>
            </div>
            {graphData?._metadata && (
              <p className="text-xs text-muted-foreground/60 mt-4 pt-4 border-t border-border/40 italic">
                {graphData._metadata.note}
              </p>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
