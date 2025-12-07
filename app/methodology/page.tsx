"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { BackToTop } from "@/components/back-to-top"
import { ArrowRight, FlaskConical, TrendingUp, Network, CheckCircle2, AlertCircle, Route, Lightbulb, BarChart3 } from "lucide-react"

const approaches = [
  {
    number: 1,
    title: "Synthetic Data Generation",
    subtitle: "Using Llama 3.2 3B to auto-generate training pairs",
    notebook: "Meta_Synthetic_Data_Llama3_2_(3B).ipynb",
    status: "explored",
    outcome: "Limited - only 34 pairs generated",
    reason: "Small dataset insufficient for complex course queries",
    icon: FlaskConical,
    color: "orange",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    number: 2,
    title: "Standard Fine-tuning",
    subtitle: "Basic Llama 3.1 8B fine-tuning on 2,828 Q&A pairs",
    notebook: "Llama3.1_(8B)-finetuning.ipynb",
    status: "baseline",
    outcome: "Baseline - final loss 0.46 (accuracy pending)",
    reason: "Repetition issues, simple pattern matching, no multi-hop reasoning",
    icon: TrendingUp,
    color: "blue",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    number: 3,
    title: "Optimized Fine-tuning",
    subtitle: "Enhanced hyperparameters, validation, early stopping",
    notebook: "Llama3.1_(8B)-finetuning-optimized.ipynb",
    status: "improved",
    outcome: "Improved stability - final loss 0.75 (accuracy pending)",
    reason: "Still couldn't handle prerequisite chains or complex multi-hop queries",
    icon: TrendingUp,
    color: "indigo",
    gradient: "from-indigo-500/20 to-purple-500/20",
  },
  {
    number: 4,
    title: "KG-Based QA System",
    subtitle: "Knowledge Graph + Graph-augmented training",
    notebook: "Llama3.1_(8B)-KG-QA-System.ipynb",
    status: "final",
    outcome: "Best loss so far - 0.30 (accuracy pending)",
    reason: "Multi-hop reasoning, prerequisite planning, structured knowledge",
    icon: Network,
    color: "green",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
]

const timeline = [
  { phase: "Problem", text: "Standard fine-tuning couldn't answer 'Which courses do I need before CSCI 6364?'" },
  { phase: "Insight", text: "Course relationships need structured representation (prerequisites, topics, instructors)" },
  { phase: "Solution", text: "Build Knowledge Graph from course data + augment training with graph context" },
  { phase: "Result", text: "Model can now trace prerequisite chains and answer complex multi-hop queries" },
]

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BackToTop />
      <div className="pt-20 pb-12">
        <div className="mx-auto max-w-6xl px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Methodology</h1>
            <p className="text-muted-foreground text-lg">
              Evolution from synthetic data to knowledge graph-based reasoning
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="journey" className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="journey" className="flex items-center gap-2">
                <Route className="h-4 w-4" />
                Journey
              </TabsTrigger>
              <TabsTrigger value="approaches" className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Approaches
              </TabsTrigger>
              <TabsTrigger value="innovation" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Innovation
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Comparison
              </TabsTrigger>
            </TabsList>

            {/* Journey Tab */}
            <TabsContent value="journey" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                  <h3 className="font-semibold text-lg mb-4">The Research Journey</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {timeline.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
                        className="relative"
                      >
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          {step.phase}
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{step.text}</p>
                        {i < timeline.length - 1 && (
                          <ArrowRight className="hidden md:block absolute -right-6 top-8 h-4 w-4 text-muted-foreground/40" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Approaches Tab */}
            <TabsContent value="approaches" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold">Four Approaches Explored</h3>
          <div className="grid gap-6">
            {approaches.map((approach, i) => {
              const Icon = approach.icon
              return (
                <motion.div
                  key={approach.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                >
                  <Card className="p-6 bg-card/50 border-border/50 hover:border-border transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      {/* Number Badge */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${approach.gradient} flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform`}>
                        {approach.number}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-lg">{approach.title}</h4>
                              <Badge
                                variant="secondary"
                                className={
                                  approach.status === "final"
                                    ? "bg-green-500/20 text-green-700 dark:text-green-300"
                                    : approach.status === "improved"
                                    ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                                    : "bg-orange-500/20 text-orange-700 dark:text-orange-300"
                                }
                              >
                                {approach.status === "final" ? "✓ Final Solution" : approach.status === "improved" ? "Improved" : "Explored"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{approach.subtitle}</p>
                          </div>
                          <Icon className={`h-6 w-6 text-${approach.color}-500 flex-shrink-0`} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Outcome</div>
                            <div className="text-sm font-medium flex items-center gap-2">
                              {approach.status === "final" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                              )}
                              {approach.outcome}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {approach.status === "final" ? "Why it works" : "Limitation"}
                            </div>
                            <div className="text-sm text-foreground/80">{approach.reason}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/40">
                          <code className="text-xs bg-secondary/50 px-2 py-1 rounded">
                            {approach.notebook}
                          </code>
                          {approach.status === "final" && (
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              Primary implementation ⭐
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
              </motion.div>
            </TabsContent>

            {/* Innovation Tab */}
            <TabsContent value="innovation" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-500/20">
                      <Network className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Why Knowledge Graphs?</h3>
                      <p className="text-foreground/80 mb-4 leading-relaxed">
                        Even after optimized fine-tuning converged around a <span className="font-semibold">0.75 final loss</span>,
                        the model still couldn't answer questions like <span className="italic">"What prerequisites
                        do I need to take CSCI 6364?"</span> or <span className="italic">"Which courses should I complete
                        after CSCI 2113?"</span>
                      </p>
                      <p className="text-foreground/80 mb-4 leading-relaxed">
                        The problem wasn't the model quality—it was the <span className="font-semibold">lack of
                        structured relationship data</span>. Course prerequisites form a directed graph, not unstructured text.
                      </p>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-background/50 p-3 rounded-lg">
                          <div className="font-medium mb-1">Graph Construction</div>
                          <div className="text-muted-foreground text-xs">
                            Extract prerequisites via regex, topics via NLP, instructors from schedules
                          </div>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg">
                          <div className="font-medium mb-1">Data Augmentation</div>
                          <div className="text-muted-foreground text-xs">
                            Generate 200 multi-hop Q&A pairs with graph context injection
                          </div>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg">
                          <div className="font-medium mb-1">Result</div>
                          <div className="text-muted-foreground text-xs">
                            Lower loss, multi-hop reasoning, prerequisite planning
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-6">Quick Comparison</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-5 bg-card/30 border-border/40">
              <h4 className="font-semibold mb-3">Standard Fine-tuning</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Loss</span>
                  <span className="font-bold">0.46</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training Time</span>
                  <span>44.1 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evaluation</span>
                  <span className="text-muted-foreground">Accuracy pending</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-card/30 border-border/40">
              <h4 className="font-semibold mb-3">Optimized Fine-tuning</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Loss</span>
                  <span className="font-bold">0.75</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training Time</span>
                  <span>33.7 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evaluation</span>
                  <span className="text-muted-foreground">Accuracy pending</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <h4 className="font-semibold mb-3">KG-Based System ⭐</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Loss</span>
                  <span className="font-bold text-green-600 dark:text-green-400">0.30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training Time</span>
                  <span>4.2 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Multi-hop</span>
                  <span className="text-green-500">✓</span>
                </div>
              </div>
            </Card>
          </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
