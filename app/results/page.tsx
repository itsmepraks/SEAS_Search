"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingDown, TrendingUp, Zap, Clock, Target, AlertCircle, CheckCircle2 } from "lucide-react"

interface TrainingMetrics {
  approaches: {
    [key: string]: {
      name: string
      epochs: Array<{ epoch: number; train_loss: number; val_loss?: number; learning_rate: number }>
      final_metrics: {
        final_loss: number
        val_loss?: number
        accuracy: number
        training_time_minutes: number
      }
    }
  }
}

interface ModelComparison {
  comparisons: Array<{
    approach: string
    notebook: string
    training_samples: number
    epochs: number
    lora_rank: number
    learning_rate: number
    final_loss: number
    validation_loss?: number
    accuracy: number
    training_time_min: number
    strengths: string[]
    weaknesses: string[]
    use_cases: string[]
  }>
}

export default function ResultsPage() {
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null)
  const [modelComparison, setModelComparison] = useState<ModelComparison | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/data/training_metrics.json").then((r) => r.json()),
      fetch("/data/model_comparison.json").then((r) => r.json()),
    ])
      .then(([metrics, comparison]) => {
        setTrainingMetrics(metrics)
        setModelComparison(comparison)
      })
      .catch((err) => console.error("Failed to load data:", err))
  }, [])

  // Prepare combined loss data for overlay chart
  const combinedLossData = trainingMetrics
    ? trainingMetrics.approaches.standard.epochs.map((_, index) => ({
        epoch: index + 1,
        standard: trainingMetrics.approaches.standard.epochs[index]?.train_loss || 0,
        optimized: trainingMetrics.approaches.optimized.epochs[index]?.train_loss || 0,
        kg_based: trainingMetrics.approaches.kg_based.epochs[index]?.train_loss || 0,
      }))
    : []

  // Prepare comparison bar chart data
  const comparisonData = modelComparison?.comparisons.map((c) => ({
    name: c.approach.split(" ")[0],
    accuracy: c.accuracy,
    final_loss: c.final_loss,
    training_time: c.training_time_min,
  })) || []

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
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Results & Performance</h1>
          <p className="text-muted-foreground text-lg">
            Training metrics, model comparisons, and performance analysis across three approaches
          </p>
        </motion.div>

        {/* Key Metrics Overview */}
        {modelComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            {modelComparison.comparisons.map((approach, i) => (
              <Card key={approach.approach} className="p-6 bg-card/50 border-border/50">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg">{approach.approach}</h3>
                  {i === 2 && <Badge variant="default" className="bg-green-500/20 text-green-700 dark:text-green-300">Best</Badge>}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Accuracy</span>
                    <span className="text-lg font-bold">{approach.accuracy}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Final Loss</span>
                    <span className="font-semibold">{approach.final_loss.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Training Time</span>
                    <span className="text-sm">{approach.training_time_min.toFixed(1)}m</span>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Training Loss Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="font-semibold text-lg mb-4">Training Loss Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                <XAxis
                  dataKey="epoch"
                  label={{ value: "Epoch", position: "insideBottom", offset: -5 }}
                  stroke="rgba(148, 163, 184, 0.5)"
                />
                <YAxis
                  label={{ value: "Loss", angle: -90, position: "insideLeft" }}
                  stroke="rgba(148, 163, 184, 0.5)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="standard"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Standard"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="optimized"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Optimized"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="kg_based"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="KG-Based"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground/60 mt-4">
              KG-based approach achieves the lowest training loss, converging faster than other methods.
            </p>
          </Card>
        </motion.div>

        {/* Performance Metrics Bar Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="font-semibold mb-4">Accuracy Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                <XAxis type="number" domain={[0, 100]} stroke="rgba(148, 163, 184, 0.5)" />
                <YAxis type="category" dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="accuracy" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="font-semibold mb-4">Final Loss Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                <XAxis type="number" stroke="rgba(148, 163, 184, 0.5)" />
                <YAxis type="category" dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="final_loss" fill="#ef4444" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Detailed Comparison Table */}
        {modelComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold text-lg mb-4">Detailed Approach Comparison</h3>
              <Tabs defaultValue={modelComparison.comparisons[0].approach} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {modelComparison.comparisons.map((approach) => (
                    <TabsTrigger key={approach.approach} value={approach.approach}>
                      {approach.approach.split(" ")[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {modelComparison.comparisons.map((approach) => (
                  <TabsContent key={approach.approach} value={approach.approach} className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Configuration */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Configuration
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Training Samples</span>
                              <span className="font-medium">{approach.training_samples.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Epochs</span>
                              <span className="font-medium">{approach.epochs}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">LoRA Rank</span>
                              <span className="font-medium">{approach.lora_rank}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Learning Rate</span>
                              <span className="font-mono text-xs">{approach.learning_rate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Notebook</span>
                              <span className="text-xs font-mono">{approach.notebook}</span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Metrics
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Final Loss</span>
                              <span className="font-bold">{approach.final_loss.toFixed(2)}</span>
                            </div>
                            {approach.validation_loss && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Validation Loss</span>
                                <span className="font-medium">{approach.validation_loss.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Accuracy</span>
                              <span className="font-bold text-green-600 dark:text-green-400">{approach.accuracy}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Training Time
                              </span>
                              <span className="font-medium">{approach.training_time_min.toFixed(1)} min</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Strengths
                          </h4>
                          <ul className="space-y-2">
                            {approach.strengths.map((strength, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span className="text-foreground/80">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            Weaknesses
                          </h4>
                          <ul className="space-y-2">
                            {approach.weaknesses.map((weakness, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-orange-500 mt-0.5">⚠</span>
                                <span className="text-muted-foreground">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 text-sm">Best Use Cases</h4>
                          <div className="flex flex-wrap gap-2">
                            {approach.use_cases.map((useCase, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {useCase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          </motion.div>
        )}

        {/* Key Findings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Key Findings
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-foreground/90">
                  <span className="font-semibold">KG-based approach outperforms</span> standard fine-tuning by <span className="font-bold text-green-600 dark:text-green-400">7.3%</span> in accuracy
                </p>
                <p className="text-foreground/90">
                  Training loss reduced by <span className="font-bold">51%</span> (0.39 → 0.19) with graph augmentation
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-foreground/90">
                  Validation-based early stopping prevents overfitting in optimized approach
                </p>
                <p className="text-foreground/90">
                  Higher LoRA rank (32 vs 16) improves model capacity for complex reasoning
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
