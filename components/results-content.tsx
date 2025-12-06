"use client"

import { useState, useEffect, type ReactNode } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { BackToTop } from "@/components/back-to-top"
import { TrendingDown, TrendingUp, Zap, Clock, Target, AlertCircle, CheckCircle2, BarChart3, LineChart as LineChartIcon, GitCompare } from "lucide-react"

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

export function ResultsContent() {
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null)
  const [modelComparison, setModelComparison] = useState<ModelComparison | null>(null)
  const [isClient, setIsClient] = useState(false)

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

  useEffect(() => {
    setIsClient(true)
  }, [])

  const renderChart = (chart: ReactNode) => (isClient ? chart : <div className="h-full w-full rounded-lg bg-muted/10" />)

  // Create comparison data - sample standard data if it's much larger than others
  const standardEpochs = trainingMetrics?.approaches.standard.epochs || []
  const optimizedEpochs = trainingMetrics?.approaches.optimized.epochs || []
  const kgBasedEpochs = trainingMetrics?.approaches.kg_based.epochs || []
  
  const maxComparisonLength = Math.max(
    optimizedEpochs.length,
    kgBasedEpochs.length,
    Math.min(standardEpochs.length, 100) // Limit to 100 points for comparison
  )

  const combinedLossData = trainingMetrics
    ? Array.from({ length: maxComparisonLength }, (_, index) => {
        // Sample standard data if it's too large
        const standardIndex = standardEpochs.length > maxComparisonLength
          ? Math.floor((index / maxComparisonLength) * standardEpochs.length)
          : index
        
        return {
          epoch: index + 1,
          standard: standardEpochs[standardIndex]?.train_loss || 0,
          optimized: optimizedEpochs[index]?.train_loss || 0,
          kg_based: kgBasedEpochs[index]?.train_loss || 0,
        }
      })
    : []

  // Full standard data for detailed view
  const standardLossData = standardEpochs.map((entry, index) => ({
    step: index + 1,
    loss: entry.train_loss,
    learning_rate: entry.learning_rate,
  }))

  const comparisonData =
    modelComparison?.comparisons.map((c) => ({
      name: c.approach.split(" ")[0],
      accuracy: c.accuracy,
      final_loss: c.final_loss,
      training_time: c.training_time_min,
    })) || []

  return (
    <div className="mx-auto max-w-7xl px-4">
      <BackToTop />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Results & Performance</h1>
        <p className="text-muted-foreground text-lg">Training metrics, model comparisons, and performance analysis across three approaches</p>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        {/* Sticky Tabs Header */}
        <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-6 -mx-4 px-4 pb-2">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Details
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0">
          {modelComparison && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="mt-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold text-lg mb-4">Training Loss Comparison</h3>
              {renderChart(
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={combinedLossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                    <XAxis dataKey="epoch" label={{ value: "Epoch", position: "insideBottom", offset: -5 }} stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis label={{ value: "Loss", angle: -90, position: "insideLeft" }} stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="standard" stroke="#f59e0b" strokeWidth={2} name="Standard" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="optimized" stroke="#3b82f6" strokeWidth={2} name="Optimized" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="kg_based" stroke="#10b981" strokeWidth={2} name="KG-Based" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <p className="text-xs text-muted-foreground/60 mt-4">
                {standardEpochs.length > 100 && "Standard approach data is sampled for comparison. "}
                KG-based approach achieves the lowest training loss, converging faster than other methods.
              </p>
            </Card>
          </motion.div>

          {/* Detailed Standard Training Loss */}
          {standardEpochs.length > 50 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mb-8">
              <Card className="p-6 bg-card/50 border-border/50">
                <h3 className="font-semibold text-lg mb-4">Standard Fine-tuning: Detailed Training Loss ({standardEpochs.length} steps)</h3>
                {renderChart(
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={standardLossData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                      <XAxis 
                        dataKey="step" 
                        label={{ value: "Training Step", position: "insideBottom", offset: -5 }} 
                        stroke="rgba(148, 163, 184, 0.5)"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ value: "Loss", angle: -90, position: "insideLeft" }} 
                        stroke="rgba(148, 163, 184, 0.5)"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          border: "1px solid rgba(100, 116, 139, 0.3)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === "loss") return [value.toFixed(4), "Loss"]
                          if (name === "learning_rate") return [value.toExponential(2), "Learning Rate"]
                          return [value, name]
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="loss" 
                        stroke="#f59e0b" 
                        strokeWidth={2} 
                        name="Training Loss" 
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                <p className="text-xs text-muted-foreground/60 mt-4">
                  Complete training loss curve showing all {standardEpochs.length} training steps from the standard fine-tuning approach.
                  Final loss: {trainingMetrics?.approaches.standard.final_metrics.final_loss.toFixed(4)} | 
                  Training time: {trainingMetrics?.approaches.standard.final_metrics.training_time_minutes.toFixed(2)} minutes
                </p>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Accuracy Comparison</h3>
              {renderChart(
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                    <XAxis type="number" domain={[0, 100]} stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis type="category" dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="accuracy" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Final Loss Comparison</h3>
              {renderChart(
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                    <XAxis type="number" stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis type="category" dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="final_loss" fill="#ef4444" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="mt-0">
          {modelComparison && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
              <Card className="p-6 bg-card/50 border-border/50">
                <h3 className="font-semibold text-lg mb-4">Detailed Approach Comparison</h3>
                <Tabs defaultValue={modelComparison.comparisons[0].approach} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {modelComparison.comparisons.map((approach) => (
                  <TabsTrigger key={approach.approach} value={approach.approach}>
                    {approach.approach}
                  </TabsTrigger>
                ))}
              </TabsList>
              {modelComparison.comparisons.map((approach) => (
                <TabsContent key={approach.approach} value={approach.approach} className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-5 bg-background/60 border-border/60">
                      <h4 className="font-semibold mb-2">Configuration</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>
                          LoRA Rank: <strong>{approach.lora_rank}</strong>
                        </li>
                        <li>
                          Learning Rate: <strong>{approach.learning_rate}</strong>
                        </li>
                        <li>
                          Epochs: <strong>{approach.epochs}</strong>
                        </li>
                        <li>
                          Training Samples: <strong>{approach.training_samples}</strong>
                        </li>
                      </ul>
                    </Card>
                    <Card className="p-5 bg-background/60 border-border/60">
                      <h4 className="font-semibold mb-2">Performance</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Final Loss</span>
                          <span className="font-semibold">{approach.final_loss.toFixed(3)}</span>
                        </div>
                        {approach.validation_loss && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Validation Loss</span>
                            <span>{approach.validation_loss.toFixed(3)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Accuracy</span>
                          <span className="font-semibold">{approach.accuracy}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Training Time</span>
                          <span>{approach.training_time_min} min</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <Card className="p-4 border-border/60 bg-card/40">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <h4 className="font-semibold text-sm">Strengths</h4>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {approach.strengths.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-4 border-border/60 bg-card/40">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <h4 className="font-semibold text-sm">Weaknesses</h4>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {approach.weaknesses.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 text-red-400 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-4 border-border/60 bg-card/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <h4 className="font-semibold text-sm">Best For</h4>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {approach.use_cases.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Target className="h-3 w-3 text-amber-400 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </TabsContent>
              ))}
                </Tabs>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-0">
          {trainingMetrics && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid gap-6 md:grid-cols-2">
              {Object.entries(trainingMetrics.approaches).map(([key, approach]) => (
                <Card key={key} className="p-6 bg-card/30 border-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{approach.name}</h3>
                      <p className="text-xs text-muted-foreground">Epochs: {approach.epochs.length}</p>
                    </div>
                    <Badge variant="outline">
                      Final Loss: <span className="ml-1 font-semibold">{approach.final_metrics.final_loss.toFixed(3)}</span>
                    </Badge>
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Training Time: {approach.final_metrics.training_time_minutes} minutes
                    </div>
                    {approach.final_metrics.val_loss && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Validation Loss: {approach.final_metrics.val_loss.toFixed(3)}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
