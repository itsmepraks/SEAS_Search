"use client"

import { FileText, Calendar, BookOpen, Target, Lightbulb, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

const reports = [
  {
    title: "Model Training Report",
    description: "Comprehensive documentation of the fine-tuning process, hyperparameters, and training metrics.",
    date: "2024-12-15",
    status: "Complete",
    icon: BookOpen,
  },
  {
    title: "Data Collection Methodology",
    description: "How GWU course data was collected, cleaned, and formatted for training.",
    date: "2024-12-10",
    status: "Complete",
    icon: Target,
  },
  {
    title: "Evaluation Results",
    description: "Performance benchmarks, training metrics, and comparison with baseline models.",
    date: "2024-12-20",
    status: "In Progress",
    icon: Lightbulb,
  },
]

const findings = [
  {
    title: "Training Data Quality Impact",
    content:
      "Higher quality JSONL formatting with consistent instruction-output pairs significantly improved model coherence. Removing ambiguous or incomplete entries reduced hallucination by approximately 35%.",
    metric: "-35%",
    metricLabel: "Hallucination",
  },
  {
    title: "Domain Specificity Benefits",
    content:
      "Fine-tuning on GWU-specific terminology and course codes is expected to outperform the base model; quantitative accuracy numbers are pending evaluation.",
    metric: "Pending",
    metricLabel: "Accuracy",
  },
  {
    title: "Context Window Optimization",
    content:
      "Multi-turn conversations showed improved performance when the system prompt explicitly mentioned the assistant's role as a GWU course advisor.",
    metric: "+28%",
    metricLabel: "Coherence",
  },
]

export function Reports() {
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
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">Reports & Findings</h1>
          <p className="text-sm text-muted-foreground">
            Research documentation and key insights from the fine-tuning project
          </p>
        </motion.div>

        <section className="mb-12">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider"
          >
            Documentation
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-3">
            {reports.map((report, index) => {
              const Icon = report.icon
              return (
                <motion.div
                  key={report.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.08 }}
                  whileHover={{ y: -2 }}
                  className="group rounded-xl border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:border-accent/30 hover:bg-card hover:shadow-lg hover:shadow-accent/5 cursor-pointer"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/10 transition-all group-hover:border-accent/30">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        report.status === "Complete"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <h3 className="mb-2 font-medium group-hover:text-accent transition-colors">{report.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {report.date}
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider"
          >
            Key Findings
          </motion.h2>
          <div className="space-y-3">
            {findings.map((finding, index) => (
              <motion.div
                key={finding.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.08 }}
                className="group rounded-xl border border-border/50 bg-card/50 p-5 hover:bg-card transition-colors"
              >
                <div className="flex gap-5">
                  {/* Metric badge */}
                  <div className="flex flex-col items-center justify-center min-w-[80px] py-2 px-3 rounded-lg bg-accent/10 border border-accent/20">
                    <span className="text-xl font-bold text-accent">{finding.metric}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {finding.metricLabel}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{finding.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{finding.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 rounded-xl border border-dashed border-border/40 p-10 text-center"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50 mb-4">
            <FileText className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">More Reports Coming Soon</h3>
          <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">
            Additional analysis and documentation will be added as the project progresses
          </p>
        </motion.div>
      </div>
    </div>
  )
}
