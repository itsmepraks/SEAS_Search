"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { BackToTop } from "@/components/back-to-top"
import { Network, Database, FileText, BarChart3, Layers, Lightbulb, ArrowRight, BookOpen, Zap, Target, MessageCircle } from "lucide-react"

const statsData = [
  { label: "Bulletin Courses", value: "187", subtext: "CSCI & DATS" },
  { label: "Schedule Instances", value: "586", subtext: "Spring 2026" },
  { label: "Training Samples", value: "2,828", subtext: "Q&A pairs" },
  { label: "Final Accuracy", value: "94.8%", subtext: "KG-based model" },
]

const explorationCards = [
  {
    title: "Raw Data",
    description: "Explore course catalogs, schedules, and training datasets",
    href: "/data",
    icon: Database,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Knowledge Graph",
    description: "Interactive visualization of course relationships and prerequisites",
    href: "/knowledge-graph",
    icon: Network,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Methodology",
    description: "4 approaches from synthetic data to KG-based QA system",
    href: "/methodology",
    icon: FileText,
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    title: "Results",
    description: "Training metrics, model comparisons, and performance analysis",
    href: "/results",
    icon: BarChart3,
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Architecture",
    description: "System design and technical stack overview",
    href: "/architecture",
    icon: Layers,
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
  {
    title: "Key Learnings",
    description: "Insights, challenges, and future work",
    href: "/learning",
    icon: Lightbulb,
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
]

const objectives = [
  { icon: Target, text: "Fine-tune LLMs for GWU course search and question answering" },
  { icon: Network, text: "Build knowledge graph from course prerequisites and relationships" },
  { icon: Zap, text: "Enable multi-hop reasoning for complex prerequisite queries" },
  { icon: BookOpen, text: "Create reproducible research pipeline for academic course data" },
]

const techStack = [
  { category: "ML/AI", items: "Llama 3.1 8B, LoRA, Unsloth, HuggingFace" },
  { category: "Backend", items: "Python, Jupyter, NetworkX, spaCy" },
  { category: "Frontend", items: "Next.js 16, React 19, Tailwind CSS, Recharts" },
  { category: "Visualization", items: "react-force-graph-2d, Framer Motion" },
]

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BackToTop />
      <div className="pt-20 pb-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block rounded-full bg-accent/10 px-4 py-1.5 mb-6"
          >
            <span className="text-sm font-medium text-foreground/80">Research Project Showcase</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            SEAS Search
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-6">
            Knowledge Graph-Based Course QA System
          </h2>
          <p className="text-lg text-muted-foreground/80 max-w-3xl mx-auto">
            Fine-tuning Large Language Models on GWU course data with graph-augmented reasoning
            for prerequisite planning and multi-hop question answering
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {statsData.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
            >
              <Card className="p-6 bg-card/50 border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground mb-0.5">{stat.label}</div>
                <div className="text-xs text-muted-foreground/60">{stat.subtext}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Project Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold mb-6">Project Objectives</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {objectives.map((obj, i) => {
              const Icon = obj.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                >
                  <Card className="p-4 bg-card/30 border-border/40 hover:bg-card/50 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 mt-0.5">
                        <Icon className="h-5 w-5 text-foreground/70" />
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed pt-0.5">{obj.text}</p>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Exploration Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold mb-6">Explore the Project</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {explorationCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                >
                  <Link href={card.href}>
                    <Card className="p-6 h-full bg-card/40 border-border/40 hover:border-border hover:bg-card/60 transition-all duration-300 group cursor-pointer hover:shadow-lg">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2 group-hover:text-foreground transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-sm text-muted-foreground/80 mb-4 leading-relaxed">
                        {card.description}
                      </p>
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground group-hover:gap-2 transition-all">
                        Explore
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <h3 className="text-2xl font-bold mb-6">Technology Stack</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.3 + i * 0.1 }}
              >
                <Card className="p-5 bg-card/30 border-border/40">
                  <div className="font-semibold text-sm mb-2 text-foreground/90">{tech.category}</div>
                  <div className="text-sm text-muted-foreground/80">{tech.items}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  )
}
