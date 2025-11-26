"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Sparkles, Bot, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedQueries = [
  "What CS courses are available on Mondays?",
  "Show me Professor Smith's office hours",
  "Which courses have prerequisites for CSCI 6221?",
  "Find evening classes for working students",
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I encountered an error. Please ensure your Hugging Face Space is running and try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (query: string) => {
    setInput(query)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex min-h-screen flex-col pt-16">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4">
        {/* Empty State */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-1 flex-col items-center justify-center py-16"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 blur-2xl bg-accent/20 rounded-full scale-150" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
                <Sparkles className="h-9 w-9 text-accent" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-10"
            >
              <h1 className="mb-3 text-3xl font-semibold tracking-tight text-balance">GWU Course Assistant</h1>
              <p className="max-w-sm text-muted-foreground text-balance leading-relaxed">
                Fine-tuned on George Washington University course data. Ask about schedules, prerequisites, and more.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="grid w-full max-w-md gap-2"
            >
              {suggestedQueries.map((query, index) => (
                <motion.button
                  key={index}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(query)}
                  className="group flex items-center justify-between rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-left text-sm text-muted-foreground transition-all duration-200 hover:border-accent/40 hover:bg-card hover:text-foreground"
                >
                  <span>{query}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-accent" />
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="flex-1 py-8">
            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn("flex gap-3 mb-6", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20"
                    >
                      <Bot className="h-4 w-4 text-accent" />
                    </motion.div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      message.role === "user" ? "bg-accent text-accent-foreground" : "bg-card border border-border/50",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 border border-accent/20"
                    >
                      <User className="h-4 w-4 text-accent" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mb-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-border/50 bg-card px-4 py-3">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-accent/60"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-4">
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="relative"
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg shadow-background/50 transition-all duration-300 focus-within:border-accent/50 focus-within:shadow-accent/5 focus-within:shadow-xl">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about GWU courses..."
                rows={1}
                className="w-full resize-none bg-transparent px-4 py-3.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <div className="flex items-center justify-between border-t border-border/30 px-3 py-2.5">
                <span className="text-xs text-muted-foreground/60">Enter to send · Shift+Enter for new line</span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className="h-8 gap-1.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40 transition-all"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span className="sr-only sm:not-sr-only">Send</span>
                </Button>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  )
}
