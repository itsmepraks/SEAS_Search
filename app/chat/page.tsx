"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { BackToTop } from "@/components/back-to-top"
import { MessageCircle, ExternalLink, Info, Code, Download, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

const models = [
  {
    name: "KG-QA System Model",
    description: "Knowledge Graph-based Question Answering system with multi-hop reasoning capabilities. This model can answer complex queries requiring prerequisite chain traversal and relationship understanding.",
    repo: "itsmepraks/gwcourses_RAG",
    url: "https://huggingface.co/itsmepraks/gwcourses_RAG/tree/main",
    icon: Sparkles,
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/20",
    features: [
      "Multi-hop reasoning",
      "Prerequisite chain traversal",
      "Graph-based retrieval",
      "RAG training format",
    ],
  },
  {
    name: "Optimized Fine-tuning Model",
    description: "Optimized fine-tuned model for simple Q&A tasks. Best for straightforward questions about individual courses, instructors, and schedules.",
    repo: "itsmepraks/gwcoursesfinetuned",
    url: "https://huggingface.co/itsmepraks/gwcoursesfinetuned/tree/main",
    icon: Zap,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/20",
    features: [
      "Simple Q&A",
      "Course information lookup",
      "Instructor queries",
      "Schedule information",
    ],
  },
]

export default function ChatPage(): JSX.Element {
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
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Chat Interface</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Test the fine-tuned models locally on Hugging Face
            </p>
          </motion.div>

          {/* Info Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-amber-500/20 flex-shrink-0">
                  <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Inference Resources Currently Unavailable</h3>
                  <p className="text-sm text-foreground/80 mb-3">
                    We currently don't have the resources to host an inference setup for the model. However, you can test the models locally using Hugging Face. Both models are available on the Hugging Face Hub and can be loaded directly in your environment.
                  </p>
                  <p className="text-sm text-foreground/80">
                    Click on the model cards below to access the repositories and follow the instructions to run inference locally.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Model Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {models.map((model, index) => {
              const Icon = model.icon
              return (
                <motion.div
                  key={model.repo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className={`p-6 bg-gradient-to-br ${model.gradient} border ${model.borderColor} hover:border-opacity-60 transition-all h-full flex flex-col`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${model.gradient}`}>
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{model.name}</h3>
                        <p className="text-sm text-foreground/80 mb-4">{model.description}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Features:</div>
                      <div className="flex flex-wrap gap-2">
                        {model.features.map((feature, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-md bg-background/50 text-xs border border-border/50"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Link
                        href={model.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background/80 hover:bg-background border border-border/50 text-sm font-medium transition-all hover:shadow-md"
                      >
                        <span>View on Hugging Face</span>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Usage Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6 bg-card/40 border-border/40">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-3">How to Use the Models Locally</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Step 1: Install Dependencies
                      </h4>
                      <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto">
                        <code>pip install transformers torch unsloth</code>
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Step 2: Load the Model
                      </h4>
                      <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto">
                        <code>{`from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "itsmepraks/gwcourses_RAG"  # or "itsmepraks/gwcoursesfinetuned"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)`}</code>
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Step 3: Run Inference</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Use the model to answer questions about GWU courses. For the KG-QA model, you'll need to load the knowledge graph files (`kg_graph.pkl` and `graph_retriever.pkl`) from the repository as well.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

