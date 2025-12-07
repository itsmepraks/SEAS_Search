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
import { TrendingDown, TrendingUp, Zap, Clock, Target, AlertCircle, CheckCircle2, BarChart3, LineChart as LineChartIcon, GitCompare, Info, HelpCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  
  // Use the minimum length to avoid showing zeros for shorter datasets
  const minLength = Math.min(
    optimizedEpochs.length,
    kgBasedEpochs.length,
    Math.min(standardEpochs.length, 100) // Limit to 100 points for comparison
  )

  const combinedLossData = trainingMetrics
    ? Array.from({ length: minLength }, (_, index) => {
        // Sample standard data if it's too large
        const standardIndex = standardEpochs.length > minLength
          ? Math.floor((index / minLength) * standardEpochs.length)
          : index
        
        // For KG-Based, use the actual data point if available, otherwise null (not 0)
        const kgLoss = kgBasedEpochs[index]?.train_loss
        
        return {
          epoch: index + 1,
          standard: standardEpochs[standardIndex]?.train_loss || null,
          optimized: optimizedEpochs[index]?.train_loss || null,
          kg_based: kgLoss !== undefined ? kgLoss : null,
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
      training_samples: c.training_samples,
      f1_score: (c as any).f1_score || 0,
      bleu: (c as any).bleu || 0,
      rouge1: (c as any).rouge1 || 0,
      rouge2: (c as any).rouge2 || 0,
      rougeL: (c as any).rougeL || 0,
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
              {modelComparison.comparisons.map((approach, i) => {
                // Find the approach with highest accuracy for "Best" badge
                const maxAccuracy = Math.max(...modelComparison.comparisons.map(c => c.accuracy))
                const isBest = approach.accuracy === maxAccuracy && approach.accuracy > 0
                
                return (
                <Card key={approach.approach} className="p-6 bg-card/50 border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg">{approach.approach}</h3>
                    {isBest && <Badge variant="default" className="bg-green-500/20 text-green-700 dark:text-green-300">Best Accuracy</Badge>}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-muted-foreground">Accuracy</span>
                        {approach.approach === "KG-Based QA System" && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-muted-foreground hover:text-foreground transition-colors">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 text-sm">
                              <p className="font-semibold mb-2">Multi-Hop Reasoning Evaluation</p>
                              <p className="text-muted-foreground">
                                KG-Based QA accuracy is measured on complex multi-hop reasoning questions (e.g., "What courses do I need after CSCI 2461 to enroll in CSCI 3410?"), 
                                while Standard/Optimized are evaluated on simple fact-based questions. This makes direct comparison challenging, but demonstrates KG-Based's 
                                unique capability for prerequisite chain reasoning.
                              </p>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <span className="text-lg font-bold">
                        {approach.accuracy > 0 ? `${approach.accuracy}%` : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Final Loss</span>
                      <span className="font-semibold">{approach.final_loss.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Training Time</span>
                      <span className="text-sm">{approach.training_time_min.toFixed(1)}m</span>
                    </div>
                    {approach.training_samples < 500 && (
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        Note: Faster training due to smaller dataset and A100 GPU
                      </p>
                    )}
                  </div>
                </Card>
                )
              })}
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
                    <Line 
                      type="monotone" 
                      dataKey="standard" 
                      stroke="#f59e0b" 
                      strokeWidth={2} 
                      name="Standard" 
                      dot={{ r: 4 }} 
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="optimized" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      name="Optimized" 
                      dot={{ r: 4 }} 
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="kg_based" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      name="KG-Based" 
                      dot={{ r: 4 }} 
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground/60">
                  {standardEpochs.length > 100 && "Standard approach data is sampled for comparison. "}
                  KG-based approach achieves the lowest training loss (0.30), converging faster despite using only 195 training samples vs 2,828 for others.
                </p>
                <div className="flex items-start gap-2 text-xs text-muted-foreground/60">
                  <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Note:</strong> KG-Based has only {kgBasedEpochs.length} data points (vs {optimizedEpochs.length} for Optimized, {Math.min(standardEpochs.length, 100)} shown for Standard) 
                    due to its smaller dataset and faster convergence. The graph shows aligned comparison up to the minimum length.
                  </p>
                </div>
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Accuracy Comparison</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 text-sm">
                    <p className="font-semibold mb-2">Evaluation Differences</p>
                    <p className="text-muted-foreground mb-2">
                      <strong>KG-Based QA (34%):</strong> Evaluated on complex multi-hop reasoning questions requiring prerequisite chain analysis.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Standard/Optimized (26%/38%):</strong> Evaluated on simple fact-based questions. Direct comparison should consider the different question complexities.
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
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

          {/* Additional Metrics Graphs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">F1 Score Comparison</h3>
              {renderChart(
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                    <XAxis type="number" domain={[0, 1]} stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis type="category" dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [value.toFixed(3), "F1 Score"]}
                    />
                    <Bar dataKey="f1_score" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Training Samples</h3>
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
                    <Bar dataKey="training_samples" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4 text-sm">BLEU Score</h3>
              {renderChart(
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                    <XAxis type="number" domain={[0, 0.2]} stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis type="category" dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [value.toFixed(3), "BLEU"]}
                    />
                    <Bar dataKey="bleu" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4 text-sm">ROUGE-1</h3>
              {renderChart(
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                    <XAxis type="number" domain={[0, 1]} stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis type="category" dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [value.toFixed(3), "ROUGE-1"]}
                    />
                    <Bar dataKey="rouge1" fill="#ec4899" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4 text-sm">ROUGE-L</h3>
              {renderChart(
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                    <XAxis type="number" domain={[0, 1]} stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis type="category" dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [value.toFixed(3), "ROUGE-L"]}
                    />
                    <Bar dataKey="rougeL" fill="#14b8a6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="mb-8">
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Training Time vs Accuracy</h3>
              {renderChart(
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
                    <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis yAxisId="left" stroke="rgba(148, 163, 184, 0.5)" label={{ value: "Time (min)", angle: -90, position: "insideLeft" }} />
                    <YAxis yAxisId="right" orientation="right" stroke="rgba(148, 163, 184, 0.5)" label={{ value: "Accuracy (%)", angle: 90, position: "insideRight" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(100, 116, 139, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="training_time" fill="#f59e0b" name="Training Time (min)" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="accuracy" fill="#10b981" name="Accuracy (%)" radius={[4, 4, 0, 0]} />
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
                      <span className="font-semibold">
                        {approach.accuracy > 0 ? `${approach.accuracy}%` : "Pending"}
                      </span>
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
