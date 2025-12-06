"use client"

import { useState, useEffect } from "react"
import { FileJson, MessageSquare, ChevronDown, Search, Copy, Check, Hash, Tag, BookOpen, Sparkles, FileSpreadsheet, Calendar, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  role: string
  content: string
}

interface StandardTrainingItem {
  messages: Message[]
}

interface KGTrainingItem {
  messages: Message[]
  graph_context?: string
  reasoning_path?: string
  query_type?: string
}

interface CSVRow {
  [key: string]: string | number
}

// Simple CSV parser that handles quoted fields
function parseCSV(text: string): { headers: string[], rows: CSVRow[] } {
  try {
    const lines = text.trim().split('\n').filter(line => line.trim())
    if (lines.length === 0) return { headers: [], rows: [] }
    
    function parseLine(line: string): string[] {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result.map(v => {
        const trimmed = v.trim()
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return trimmed.slice(1, -1)
        }
        return trimmed
      })
    }
    
    const headers = parseLine(lines[0])
    const rows = lines.slice(1).map(line => {
      const values = parseLine(line)
      const row: CSVRow = {}
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })
      return row
    })
    
    return { headers, rows }
  } catch (error) {
    console.error('CSV parsing error:', error)
    return { headers: [], rows: [] }
  }
}

export function DataExplorer() {
  const [activeTab, setActiveTab] = useState<"standard" | "kg" | "schedule" | "bulletin">("standard")
  const [standardData, setStandardData] = useState<StandardTrainingItem[]>([])
  const [kgData, setKGData] = useState<KGTrainingItem[]>([])
  const [scheduleData, setScheduleData] = useState<CSVRow[]>([])
  const [bulletinData, setBulletinData] = useState<CSVRow[]>([])
  const [scheduleColumns, setScheduleColumns] = useState<string[]>([])
  const [bulletinColumns, setBulletinColumns] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItem, setExpandedItem] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    let loadingCount = 0
    const totalLoads = 4

    const checkAllLoaded = () => {
      loadingCount++
      if (loadingCount >= totalLoads) {
        setLoading(false)
      }
    }

    // Load standard fine-tuning data
    fetch("/data/course_finetune.jsonl")
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n').filter(line => line.trim())
        const parsed = lines.map(line => JSON.parse(line))
        setStandardData(parsed)
        checkAllLoaded()
      })
      .catch(err => {
        console.error("Failed to load standard training data:", err)
        checkAllLoaded()
      })

    // Load KG-based training data
    fetch("/data/course_finetune_kg_rag.jsonl")
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n').filter(line => line.trim())
        const parsed = lines.map(line => JSON.parse(line))
        setKGData(parsed)
        checkAllLoaded()
      })
      .catch(err => {
        console.error("Failed to load KG training data:", err)
        checkAllLoaded()
      })

    // Load schedule CSV data (only if tab is active or will be used)
    const loadScheduleCSV = async () => {
      try {
        const res = await fetch("/data/spring_2026_courses.csv")
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const text = await res.text()
        if (text && typeof text === 'string') {
          const { headers, rows } = parseCSV(text)
          setScheduleColumns(headers)
          setScheduleData(rows)
        }
      } catch (err) {
        console.error("Failed to load schedule data:", err)
      } finally {
        checkAllLoaded()
      }
    }

    // Load bulletin CSV data (only if tab is active or will be used)
    const loadBulletinCSV = async () => {
      try {
        const res = await fetch("/data/bulletin_courses.csv")
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const text = await res.text()
        if (text && typeof text === 'string') {
          const { headers, rows } = parseCSV(text)
          setBulletinColumns(headers)
          setBulletinData(rows)
        }
      } catch (err) {
        console.error("Failed to load bulletin data:", err)
      } finally {
        checkAllLoaded()
      }
    }

    // Load CSV files
    loadScheduleCSV()
    loadBulletinCSV()
  }, [])

  const currentData = activeTab === "standard" ? standardData : activeTab === "kg" ? kgData : activeTab === "schedule" ? scheduleData : bulletinData
  const currentColumns = activeTab === "schedule" ? scheduleColumns : activeTab === "bulletin" ? bulletinColumns : []

  const filteredData = (activeTab === "schedule" || activeTab === "bulletin")
    ? (currentData as CSVRow[]).filter((row) => {
        if (!searchQuery) return true
        const searchLower = searchQuery.toLowerCase()
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchLower)
        )
      })
    : (currentData as (StandardTrainingItem | KGTrainingItem)[]).filter((item) => {
        if (!item.messages || item.messages.length === 0) return false

        const userMessage = item.messages.find(m => m.role === "user")
        const assistantMessage = item.messages.find(m => m.role === "assistant")
        const systemMessage = item.messages.find(m => m.role === "system")

        const searchLower = searchQuery.toLowerCase()

        return (
          userMessage?.content.toLowerCase().includes(searchLower) ||
          assistantMessage?.content.toLowerCase().includes(searchLower) ||
          systemMessage?.content.toLowerCase().includes(searchLower) ||
          (activeTab === "kg" && (
            (item as KGTrainingItem).graph_context?.toLowerCase().includes(searchLower) ||
            (item as KGTrainingItem).reasoning_path?.toLowerCase().includes(searchLower)
          ))
        )
      })

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Extract actual chat template from the data (for JSONL tabs only)
  const getChatTemplate = () => {
    if (activeTab !== "standard" && activeTab !== "kg") return null
    const sample = (currentData as (StandardTrainingItem | KGTrainingItem)[])[0]
    if (!sample || !sample.messages) return null

    const systemMsg = sample.messages.find(m => m.role === "system")
    return systemMsg?.content || ""
  }

  const systemTemplate = getChatTemplate()

  const stats = activeTab === "standard"
    ? [
        { label: "Total Samples", value: standardData.length.toString(), icon: Hash },
        { label: "Type", value: "Simple Q&A", icon: Tag },
        { label: "Format", value: "Messages", icon: FileJson },
      ]
    : activeTab === "kg"
    ? [
        { label: "Total Samples", value: kgData.length.toString(), icon: Hash },
        { label: "Type", value: "Multi-hop", icon: Sparkles },
        { label: "With Graph Context", value: kgData.filter(d => d.graph_context).length.toString(), icon: BookOpen },
      ]
    : activeTab === "schedule"
    ? [
        { label: "Total Courses", value: scheduleData.length.toString(), icon: Calendar },
        { label: "Columns", value: scheduleColumns.length.toString(), icon: Hash },
        { label: "Format", value: "CSV", icon: FileSpreadsheet },
      ]
    : [
        { label: "Total Courses", value: bulletinData.length.toString(), icon: GraduationCap },
        { label: "Columns", value: bulletinColumns.length.toString(), icon: Hash },
        { label: "Format", value: "CSV", icon: FileSpreadsheet },
      ]

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Data Explorer</h1>
          <p className="text-muted-foreground text-lg">
            Browse training datasets and source CSV files ({standardData.length + kgData.length} training samples, {scheduleData.length + bulletinData.length} source records)
          </p>
        </motion.div>

        {/* Stats */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-6"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <Card key={i} className="p-4 bg-card/50 border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </Card>
              )
            })}
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex gap-1 p-1 bg-secondary/50 rounded-xl w-fit"
        >
          {[
            { id: "standard", label: "Standard Fine-tuning", icon: FileJson, count: standardData.length },
            { id: "kg", label: "KG-Based System", icon: Sparkles, count: kgData.length },
            { id: "schedule", label: "Course Schedule", icon: Calendar, count: scheduleData.length },
            { id: "bulletin", label: "Course Bulletin", icon: GraduationCap, count: bulletinData.length },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "standard" | "kg" | "schedule" | "bulletin")}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDataTab"
                    className="absolute inset-0 rounded-lg bg-background border border-border/50 shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
                <Badge variant="secondary" className="relative z-10 text-xs">
                  {tab.count}
                </Badge>
              </button>
            )
          })}
        </motion.div>

        {/* Sticky Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="sticky top-20 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-6 -mx-4 px-4 pb-4 pt-2"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === "schedule" || activeTab === "bulletin"
                  ? "Search courses, instructors, descriptions..."
                  : "Search questions, answers, graph context, or reasoning paths..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Found {filteredData.length} of {currentData.length} {activeTab === "schedule" || activeTab === "bulletin" ? "records" : "samples"}
          </p>
        </motion.div>

        {/* Chat Template Info - Only show for JSONL tabs */}
        {systemTemplate && (activeTab === "standard" || activeTab === "kg") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <Card className="p-5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">System Prompt Template</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeTab === "standard" ? "Standard Q&A format - simple course information queries" : "KG-enhanced format with graph context for multi-hop reasoning"}
                  </p>
                </div>
              </div>
              <div className="bg-secondary/50 rounded p-3 text-xs text-foreground/80 leading-relaxed font-mono">
                {systemTemplate.slice(0, 300)}{systemTemplate.length > 300 && "..."}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Data Items */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading data...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No {activeTab === "schedule" || activeTab === "bulletin" ? "records" : "samples"} match your search
              </div>
            ) : (activeTab === "schedule" || activeTab === "bulletin") ? (
              // CSV Table View
              <Card className="overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        {currentColumns.map((col) => (
                          <TableHead key={col} className="font-semibold">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.slice(0, 100).map((row, index) => (
                        <TableRow key={index}>
                          {currentColumns.map((col) => (
                            <TableCell key={col} className="max-w-[200px] truncate">
                              {String(row[col] || '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredData.length > 100 && (
                  <div className="p-4 border-t text-center text-sm text-muted-foreground">
                    Showing first 100 of {filteredData.length} records. Use search to filter.
                  </div>
                )}
              </Card>
            ) : (
              // JSONL Card View
              filteredData.slice(0, 50).map((item, index) => {
                const userMessage = item.messages.find(m => m.role === "user")
                const assistantMessage = item.messages.find(m => m.role === "assistant")
                const kgItem = item as KGTrainingItem
                const isExpanded = expandedItem === index
                const itemId = `item-${index}`

                // Extract question from user message (remove "Graph Context:" prefix if present)
                let question = userMessage?.content || ""
                if (activeTab === "kg" && question.includes("Question:")) {
                  const parts = question.split("Question:")
                  question = parts[parts.length - 1].trim()
                }

                return (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.5) }}
                  >
                    <Card className="overflow-hidden bg-card/50 border-border/50 hover:border-border transition-all">
                      <button
                        onClick={() => setExpandedItem(isExpanded ? null : index)}
                        className="w-full p-4 text-left hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                Sample {index + 1}
                              </Badge>
                              {activeTab === "kg" && kgItem.query_type && (
                                <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30">
                                  {kgItem.query_type}
                                </Badge>
                              )}
                              {activeTab === "kg" && kgItem.reasoning_path && (
                                <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
                                  Multi-hop
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium leading-relaxed line-clamp-2">
                              {question}
                            </p>
                          </div>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 mt-1",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border/50 p-4 space-y-4 bg-secondary/20">
                              {/* User Question */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs font-medium text-muted-foreground">User Question</div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(question, `${itemId}-question`)}
                                    className="h-7 text-xs"
                                  >
                                    {copiedId === `${itemId}-question` ? (
                                      <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copy
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <div className="bg-background/50 rounded-lg p-3 text-sm leading-relaxed border border-border/30">
                                  {question}
                                </div>
                              </div>

                              {/* Graph Context (KG only) */}
                              {activeTab === "kg" && kgItem.graph_context && (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs font-medium text-green-600 dark:text-green-400">Graph Context</div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(kgItem.graph_context!, `${itemId}-context`)}
                                      className="h-7 text-xs"
                                    >
                                      {copiedId === `${itemId}-context` ? (
                                        <>
                                          <Check className="h-3 w-3 mr-1" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3 w-3 mr-1" />
                                          Copy
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="bg-green-500/5 rounded-lg p-3 text-xs leading-relaxed border border-green-500/20 font-mono max-h-32 overflow-y-auto">
                                    {kgItem.graph_context}
                                  </div>
                                </div>
                              )}

                              {/* Reasoning Path (KG only) */}
                              {activeTab === "kg" && kgItem.reasoning_path && (
                                <div>
                                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">Reasoning Path</div>
                                  <div className="bg-purple-500/5 rounded-lg p-3 text-sm border border-purple-500/20">
                                    <code className="text-purple-700 dark:text-purple-400">{kgItem.reasoning_path}</code>
                                  </div>
                                </div>
                              )}

                              {/* Assistant Answer */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs font-medium text-muted-foreground">Assistant Response</div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(assistantMessage?.content || "", `${itemId}-answer`)}
                                    className="h-7 text-xs"
                                  >
                                    {copiedId === `${itemId}-answer` ? (
                                      <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copy
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <div className="bg-blue-500/5 rounded-lg p-3 text-sm leading-relaxed border border-blue-500/20">
                                  {assistantMessage?.content}
                                </div>
                              </div>

                              {/* Full JSON */}
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2 flex items-center gap-2">
                                  <FileJson className="h-3 w-3" />
                                  View Full JSON Structure
                                </summary>
                                <div className="bg-background/80 rounded-lg p-3 font-mono overflow-x-auto border border-border/30 max-h-64 overflow-y-auto">
                                  <pre className="text-[10px]">{JSON.stringify(item, null, 2)}</pre>
                                </div>
                              </details>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>

          {!loading && filteredData.length > 50 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Showing first 50 of {filteredData.length} samples. Use search to find specific items.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
