"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, Lightbulb, TrendingUp, AlertTriangle, Rocket } from "lucide-react"

const whatWorked = [
  {
    title: "Knowledge Graphs for Structured Data",
    insight: "Graph representation dramatically improved multi-hop reasoning compared to unstructured text fine-tuning",
    impact: "+7.3% accuracy gain, enabled prerequisite chain queries",
  },
  {
    title: "Validation & Early Stopping",
    insight: "Train/val split (80/20) with early stopping prevented overfitting and improved generalization",
    impact: "Optimized approach converged better than standard fine-tuning",
  },
  {
    title: "Higher LoRA Rank",
    insight: "Increasing LoRA rank from 16 to 32 provided better model capacity for complex relationships",
    impact: "Improved accuracy without significantly increasing training time",
  },
  {
    title: "Cosine Annealing Schedule",
    insight: "Cosine annealing learning rate schedule provided smoother convergence than linear decay",
    impact: "More stable training, better final loss",
  },
  {
    title: "Graph Context Augmentation",
    insight: "Injecting prerequisite chains and topic relationships into training data taught structured reasoning",
    impact: "Model learned to trace paths through the knowledge graph",
  },
]

const whatDidntWork = [
  {
    title: "Synthetic Data Generation (Small Scale)",
    reason: "Llama 3.2 3B generated only 34 Q&A pairs - insufficient for robust training",
    lesson: "Small synthetic datasets can't replace diverse, curated training data for complex domains",
  },
  {
    title: "Standard Fine-tuning for Multi-hop Queries",
    reason: "Despite 87.5% accuracy, model couldn't answer 'What prerequisites lead to CSCI 6364?'",
    lesson: "High accuracy on simple Q&A doesn't guarantee complex reasoning abilities",
  },
  {
    title: "Text-only Prerequisite Understanding",
    reason: "Embedding prerequisites as plain text didn't capture the directed graph structure",
    lesson: "Some relationships need explicit structural representation (graphs, trees, etc.)",
  },
]

const keyInsights = [
  {
    icon: Lightbulb,
    title: "Structured Data > Unstructured Text",
    description: "For factual QA with inherent structure (prerequisites, taxonomies), knowledge graphs outperform text-only approaches",
    color: "yellow",
  },
  {
    icon: TrendingUp,
    title: "Graph Context Reduces Hallucination",
    description: "Providing explicit graph context in prompts grounds the model in real relationships, reducing made-up prerequisite chains",
    color: "green",
  },
  {
    icon: AlertTriangle,
    title: "Validation is Critical",
    description: "Without validation, you can't detect overfitting. Early stopping based on validation loss prevents wasted training epochs",
    color: "orange",
  },
  {
    icon: CheckCircle2,
    title: "Multi-hop Questions Need Explicit Paths",
    description: "Training data must include examples that trace through multiple relationship hops, not just single-step lookups",
    color: "blue",
  },
]

const futureWork = [
  "Expand to all SEAS departments (Engineering, Applied Science, not just CS/Data Science)",
  "Add temporal reasoning for course scheduling across multiple semesters",
  "Integrate with live GWU systems for real-time course availability",
  "Deploy as production chatbot with GraphRAG backend for real student queries",
  "Experiment with graph neural networks (GNNs) for even better graph representation",
  "Add degree planning features (suggest optimal course sequences toward graduation)",
]

const bestPractices = [
  {
    practice: "Start with Data Quality",
    tip: "Web scraping + careful cleaning is 50% of success. Bad data = bad model, regardless of architecture.",
  },
  {
    practice: "Use Validation Early",
    tip: "Split your data before first training run. Validation loss tells you what accuracy can't.",
  },
  {
    practice: "Graph for Relationships",
    tip: "If your domain has natural relationships (prerequisites, taxonomies), build a knowledge graph.",
  },
  {
    practice: "Document Your Journey",
    tip: "Track what didn't work. Failed approaches teach as much as successful ones.",
  },
  {
    practice: "Hyperparameter Tuning Matters",
    tip: "LR schedule, LoRA rank, warmup - these aren't just knobs. They significantly impact results.",
  },
]

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Key Learnings & Insights</h1>
          <p className="text-muted-foreground text-lg">
            What worked, what didn't, and lessons for future projects
          </p>
        </motion.div>

        {/* What Worked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            What Worked
          </h3>
          <div className="grid gap-4">
            {whatWorked.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
              >
                <Card className="p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 transition-all">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-foreground/80 mb-2">{item.insight}</p>
                      <div className="text-xs font-medium text-green-600 dark:text-green-400">
                        Impact: {item.impact}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What Didn't Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <XCircle className="h-6 w-6 text-orange-500" />
            What Didn't Work
          </h3>
          <div className="grid gap-4">
            {whatDidntWork.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
              >
                <Card className="p-5 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-foreground/80 mb-2">
                        <span className="font-medium">Why:</span> {item.reason}
                      </p>
                      <div className="text-xs font-medium text-orange-600 dark:text-orange-400">
                        Lesson: {item.lesson}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6">Key Insights</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {keyInsights.map((insight, i) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                >
                  <Card className="p-5 bg-card/40 border-border/40 hover:bg-card/60 transition-all h-full">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-${insight.color}-500/20`}>
                        <Icon className={`h-5 w-5 text-${insight.color}-600 dark:text-${insight.color}-400`} />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground/90 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6">Best Practices for Similar Projects</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {bestPractices.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.1 + i * 0.05 }}
              >
                <Card className="p-4 bg-card/30 border-border/40">
                  <div className="font-medium text-sm mb-1.5">{item.practice}</div>
                  <div className="text-sm text-muted-foreground/90">{item.tip}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Future Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Rocket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-3">Future Work & Extensions</h3>
                <ul className="space-y-2">
                  {futureWork.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 1.4 + i * 0.05 }}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="text-blue-500 mt-0.5">→</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
