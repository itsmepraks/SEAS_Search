"use client"

import { useState } from "react"
import { FileJson, MessageSquare, ChevronDown, Search, Copy, Check, Hash, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const sampleJsonlData = [
  {
    id: 1,
    instruction: "What are the prerequisites for CSCI 6221?",
    input: "",
    output:
      "CSCI 6221 (Advanced Software Paradigms) requires CSCI 6212 (Design and Analysis of Algorithms) as a prerequisite. Students should also have proficiency in at least one programming language.",
    course_code: "CSCI 6221",
    category: "prerequisites",
  },
  {
    id: 2,
    instruction: "When does Professor Johnson teach Database Systems?",
    input: "",
    output:
      "Professor Johnson teaches CSCI 6532 (Database Systems) on Tuesdays and Thursdays from 3:30 PM to 4:45 PM in Rome Hall 771.",
    course_code: "CSCI 6532",
    category: "schedule",
  },
  {
    id: 3,
    instruction: "List all graduate CS courses available in Fall 2024",
    input: "",
    output:
      "Graduate CS courses for Fall 2024 include: CSCI 6212 (Algorithms), CSCI 6221 (Software Paradigms), CSCI 6461 (Computer Architecture), CSCI 6532 (Database Systems), CSCI 6511 (AI), and CSCI 6907 (Research Methods).",
    course_code: "multiple",
    category: "catalog",
  },
  {
    id: 4,
    instruction: "What is the credit hour requirement for the MS in CS?",
    input: "",
    output:
      "The Master of Science in Computer Science requires 30 credit hours of coursework, including core courses and electives. Students must maintain a GPA of 3.0 or higher.",
    course_code: "MS-CS",
    category: "requirements",
  },
]

const chatTemplates = [
  {
    name: "System Prompt",
    description: "Base instruction for the model",
    template: `You are a helpful assistant specialized in George Washington University course scheduling. You have been trained on GWU course catalogs, schedules, and academic policies. Provide accurate, helpful information about courses, prerequisites, schedules, and academic requirements.`,
  },
  {
    name: "User Query Format",
    description: "Standard query structure",
    template: `### User:
{user_question}

### Assistant:`,
  },
  {
    name: "Multi-turn Conversation",
    description: "For follow-up questions",
    template: `### System:
You are a GWU course scheduling assistant.

### User:
{first_question}

### Assistant:
{first_response}

### User:
{follow_up_question}

### Assistant:`,
  },
]

export function DataExplorer() {
  const [activeTab, setActiveTab] = useState<"jsonl" | "templates">("jsonl")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItem, setExpandedItem] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredData = sampleJsonlData.filter(
    (item) =>
      item.instruction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.output.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.course_code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const stats = [
    { label: "Total Samples", value: sampleJsonlData.length.toString(), icon: Hash },
    { label: "Categories", value: "4", icon: Tag },
    { label: "Courses", value: "45+", icon: FileJson },
  ]

  return (
    <div className="min-h-screen pt-16">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">Data Explorer</h1>
          <p className="text-sm text-muted-foreground">
            Browse training data and chat templates used to fine-tune the model
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-1 p-1 bg-secondary/50 rounded-xl w-fit"
        >
          {[
            { id: "jsonl", label: "JSONL Data", icon: FileJson },
            { id: "templates", label: "Chat Templates", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "jsonl" | "templates")}
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
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </span>
              </button>
            )
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "jsonl" && (
            <motion.div
              key="jsonl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  placeholder="Search by instruction, output, or course code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-border/50 bg-card/50 focus-visible:ring-accent/30"
                />
              </div>

              <div className="mb-6 grid grid-cols-3 gap-3">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center gap-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="text-xl font-semibold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="space-y-2">
                {filteredData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.03 }}
                    className="overflow-hidden rounded-xl border border-border/50 bg-card/50 transition-colors hover:bg-card"
                  >
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="rounded-md bg-accent/15 text-accent px-2 py-0.5 text-xs font-medium">
                            {item.course_code}
                          </span>
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{item.instruction}</p>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedItem === item.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedItem === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-border/50 overflow-hidden"
                        >
                          <div className="p-4 bg-secondary/30">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                Model Output
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5 text-xs hover:bg-background"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyToClipboard(item.output, item.id.toString())
                                }}
                              >
                                {copiedId === item.id.toString() ? (
                                  <>
                                    <Check className="h-3 w-3 text-green-500" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                            <p className="rounded-lg bg-background/50 border border-border/30 p-3 text-sm leading-relaxed text-muted-foreground">
                              {item.output}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No results found for "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "templates" && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {chatTemplates.map((template, index) => (
                <motion.div
                  key={template.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-xl border border-border/50 bg-card/50 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-border/50 p-4">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => copyToClipboard(template.template, template.name)}
                    >
                      {copiedId === template.name ? (
                        <>
                          <Check className="h-3 w-3 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm font-mono text-muted-foreground bg-secondary/30 leading-relaxed">
                    {template.template}
                  </pre>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
