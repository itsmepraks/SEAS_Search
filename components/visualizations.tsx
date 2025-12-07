"use client"

import { useEffect, useState, type ReactNode } from "react"
import { TrendingDown, TrendingUp, Database, Layers } from "lucide-react"
import { motion } from "framer-motion"
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts"

const trainingLossData = [
  { epoch: 1, loss: 2.45 },
  { epoch: 2, loss: 1.82 },
  { epoch: 3, loss: 1.35 },
  { epoch: 4, loss: 1.02 },
  { epoch: 5, loss: 0.78 },
  { epoch: 6, loss: 0.62 },
  { epoch: 7, loss: 0.51 },
  { epoch: 8, loss: 0.43 },
  { epoch: 9, loss: 0.38 },
  { epoch: 10, loss: 0.34 },
]

const categoryDistribution = [
  { name: "Schedule", value: 320, color: "oklch(0.65 0.15 250)" },
  { name: "Prerequisites", value: 180, color: "oklch(0.7 0.15 180)" },
  { name: "Catalog", value: 240, color: "oklch(0.75 0.12 60)" },
  { name: "Faculty", value: 120, color: "oklch(0.6 0.18 340)" },
]

const metrics = [
  { label: "Best Final Loss", value: "0.30", icon: TrendingDown, change: null, positive: null },
  { label: "Evaluation Status", value: "Pending", icon: TrendingUp, change: null, positive: null },
  { label: "Training Samples", value: "2,828", icon: Database, change: null, positive: null },
  { label: "KG-RAG Samples", value: "200", icon: Layers, change: null, positive: null },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export function Visualizations() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const renderChart = (chart: ReactNode) =>
    isClient ? chart : <div className="h-full w-full rounded-lg bg-muted/10" />

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
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">Visualizations</h1>
          <p className="text-sm text-muted-foreground">Training metrics, data distributions, and model performance</p>
        </motion.div>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border/50 bg-card/50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  {metric.change && (
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        metric.positive ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                      }`}
                    >
                      {metric.change}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-semibold tracking-tight">{metric.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{metric.label}</div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Training Loss Chart */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/50 bg-card/50 p-5"
          >
            <div className="mb-4">
              <h3 className="font-medium">Training Loss</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Loss over 10 epochs</p>
            </div>
            <div className="h-56">
              {renderChart(
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trainingLossData}>
                    <defs>
                      <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.65 0.15 250)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.65 0.15 250)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.005 260)" vertical={false} />
                    <XAxis
                      dataKey="epoch"
                      tick={{ fill: "oklch(0.5 0 0)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: "oklch(0.5 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="loss"
                      stroke="oklch(0.65 0.15 250)"
                      strokeWidth={2}
                      fill="url(#lossGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-border/50 bg-card/50 p-5"
          >
            <div className="mb-4">
              <h3 className="font-medium">Data Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Training samples by category</p>
            </div>
            <div className="h-44">
              {renderChart(
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPie>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {categoryDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">
                    {item.name} <span className="text-foreground font-medium">{item.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        {/* Evaluation placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/50 bg-card/50 p-5 lg:col-span-2 flex flex-col items-center justify-center text-center"
        >
          <Layers className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <h3 className="font-medium mb-1">Evaluation Pending</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Quantitative accuracy metrics will be added after the current evaluation pass. Until then, the charts above
            focus on training dynamics and data composition reflected in <code>public/data</code>.
          </p>
        </motion.div>
        </div>

        {/* Coming soon placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl border border-dashed border-border/40 p-10 text-center"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50 mb-4">
            <Layers className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">More Visualizations Coming</h3>
          <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">
            Confusion matrices, attention heatmaps, and embedding projections
          </p>
        </motion.div>
      </div>
    </div>
  )
}
