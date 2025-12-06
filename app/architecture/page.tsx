"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { PageSidebar } from "@/components/page-sidebar"
import { BackToTop } from "@/components/back-to-top"
import { Globe, Database, GitBranch, Cpu, Layers, Code, FileJson, ArrowRight, Settings } from "lucide-react"

const pipelineStages = [
  {
    title: "Web Scraping",
    icon: Globe,
    color: "blue",
    gradient: "from-blue-500/20 to-cyan-500/20",
    components: [
      "bulletin.gwu.edu/courses/csci/",
      "my.gwu.edu/mod/pws/courses.cfm",
    ],
    outputs: ["bulletin_courses.csv", "spring_2026_courses.csv"],
    description: "Scraped GWU course catalog and schedule data",
    details: [
      "Bulletin scraping: Course descriptions, prerequisites, credits",
      "Schedule scraping: Instructors, times, rooms, CRNs, enrollment status",
      "187 courses from CSCI & DATS programs",
      "586 course instances for Spring 2026",
    ]
  },
  {
    title: "Data Processing",
    icon: Database,
    color: "purple",
    gradient: "from-purple-500/20 to-pink-500/20",
    components: [
      "prepare_dataset.py",
      "CSV → JSONL conversion",
    ],
    outputs: ["course_finetune.jsonl"],
    description: "Cleaned and structured data for training",
    details: [
      "Generated 2,828 Q&A pairs from course data",
      "Multiple question variations per course",
      "Categories: Schedule, Prerequisites, Catalog, Faculty",
      "OpenAI Chat format (system, user, assistant)",
    ]
  },
  {
    title: "Knowledge Graph",
    icon: GitBranch,
    color: "green",
    gradient: "from-green-500/20 to-emerald-500/20",
    components: [
      "NetworkX graph construction",
      "Prerequisite extraction (regex)",
      "Topic extraction (NLP)",
    ],
    outputs: ["kg_graph.pkl", "course_finetune_kg_rag.jsonl"],
    description: "Built structured relationship graph",
    details: [
      "Nodes: Courses, Professors, Topics",
      "Edges: Prerequisites, Taught_by, Covers_topic",
      "Generated 200 multi-hop Q&A pairs",
      "Graph context injection for training",
    ]
  },
  {
    title: "Model Training",
    icon: Cpu,
    color: "orange",
    gradient: "from-orange-500/20 to-red-500/20",
    components: [
      "Llama 3.1 8B (4-bit quantization)",
      "LoRA fine-tuning (rank=32)",
      "Cosine annealing schedule",
    ],
    outputs: ["lora_model_kg_qa/", "merged_model_kg_qa/"],
    description: "Fine-tuned with graph-augmented data",
    details: [
      "5 epochs with early stopping",
      "Validation split (80/20)",
      "Final loss: 0.64, Accuracy: 94.8%",
      "Training time: ~115 minutes on GPU",
    ]
  },
  {
    title: "Frontend Showcase",
    icon: Layers,
    color: "indigo",
    gradient: "from-indigo-500/20 to-violet-500/20",
    components: [
      "Next.js 16 + React 19",
      "react-force-graph-2d",
      "Recharts visualization",
    ],
    outputs: ["Static web showcase"],
    description: "Interactive project demonstration",
    details: [
      "No backend inference required",
      "Static JSON data loading",
      "Interactive graph visualization",
      "Comprehensive methodology walkthrough",
    ]
  },
]

const techStack = {
  "Data Collection": {
    icon: Globe,
    items: [
      { name: "Python Requests", desc: "HTTP scraping library" },
      { name: "BeautifulSoup4", desc: "HTML parsing" },
      { name: "Pandas", desc: "Data manipulation" },
    ]
  },
  "ML/AI Stack": {
    icon: Cpu,
    items: [
      { name: "Llama 3.1 8B", desc: "Base LLM model" },
      { name: "Unsloth", desc: "Efficient fine-tuning" },
      { name: "HuggingFace", desc: "Model hub & transformers" },
      { name: "LoRA", desc: "Parameter-efficient training" },
    ]
  },
  "Knowledge Graph": {
    icon: GitBranch,
    items: [
      { name: "NetworkX", desc: "Graph construction & analysis" },
      { name: "spaCy", desc: "NLP for topic extraction" },
      { name: "Regex patterns", desc: "Prerequisite parsing" },
    ]
  },
  "Frontend": {
    icon: Code,
    items: [
      { name: "Next.js 16", desc: "React framework" },
      { name: "Tailwind CSS", desc: "Utility-first styling" },
      { name: "Recharts", desc: "Data visualization" },
      { name: "react-force-graph-2d", desc: "Graph visualization" },
      { name: "Framer Motion", desc: "Animations" },
    ]
  },
}

const optimizedFineTuningDiagram = `
graph TB
    A[CSV Data] --> B[prepare_dataset.py]
    B --> C[course_finetune.jsonl<br/>2,828 Q&A pairs]
    C --> D[Train/Val Split<br/>80/20]
    D --> E[Llama 3.1 8B<br/>Base Model]
    E --> F[LoRA Adapters<br/>r=32, alpha=32]
    F --> G[Fine-tuning<br/>5 epochs]
    G --> H[Early Stopping<br/>Patience=3]
    H --> I[Validation Loss<br/>Monitoring]
    I --> J[Optimized Model<br/>91.2% Accuracy]
    
    style A fill:#3b82f6
    style C fill:#8b5cf6
    style E fill:#f59e0b
    style F fill:#10b981
    style J fill:#10b981
`

const kgQASystemDiagram = `
graph TB
    A[CSV Data] --> B[Knowledge Graph<br/>Construction]
    B --> C[Extract Prerequisites<br/>Regex Patterns]
    B --> D[Extract Topics<br/>spaCy NLP]
    B --> E[Map Instructors<br/>Schedule Data]
    C --> F[NetworkX Graph<br/>489 nodes, 566 edges]
    D --> F
    E --> F
    F --> G[Generate Multi-hop<br/>Q&A Pairs]
    G --> H[course_finetune_kg_rag.jsonl<br/>195 examples]
    H --> I[Graph Context<br/>Injection]
    I --> J[Llama 3.1 8B<br/>Base Model]
    J --> K[LoRA Adapters<br/>r=32, alpha=32]
    K --> L[Fine-tuning with<br/>Graph Context]
    L --> M[Graph Retriever<br/>Subgraph Selection]
    M --> N[KG-QA Model<br/>94.8% Accuracy]
    
    style A fill:#3b82f6
    style F fill:#10b981
    style H fill:#8b5cf6
    style J fill:#f59e0b
    style K fill:#10b981
    style N fill:#10b981
`

const optimizedHyperparameters = {
  "LoRA Configuration": {
    "LoRA Rank (r)": "32",
    "LoRA Alpha": "32",
    "LoRA Dropout": "0.05",
    "Target Modules": "q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj",
    "Bias": "none",
  },
  "Training Configuration": {
    "Base Model": "Llama 3.1 8B",
    "Quantization": "4-bit (bitsandbytes)",
    "Max Sequence Length": "2048",
    "Training Samples": "2,828",
    "Train/Val Split": "80/20 (1,920 / 480)",
    "Epochs": "5 (with early stopping)",
    "Early Stopping Patience": "3 evaluations",
    "Early Stopping Threshold": "0.001",
  },
  "Optimization": {
    "Learning Rate": "1e-4",
    "LR Scheduler": "Cosine Annealing",
    "Warmup Ratio": "0.1 (10%)",
    "Optimizer": "AdamW 8-bit",
    "Weight Decay": "0.01",
    "Adam Beta1": "0.9",
    "Adam Beta2": "0.999",
  },
  "Batch Configuration": {
    "Per Device Train Batch Size": "4",
    "Per Device Eval Batch Size": "4",
    "Gradient Accumulation Steps": "2",
    "Effective Batch Size": "8",
  },
  "Performance Metrics": {
    "Final Training Loss": "0.78",
    "Final Validation Loss": "0.67",
    "Accuracy": "91.2%",
    "Training Time": "108.5 minutes",
    "GPU": "Tesla T4 (14.7 GB)",
    "Peak Memory Usage": "7.46 GB (50.6%)",
  },
}

const kgQAHyperparameters = {
  "LoRA Configuration": {
    "LoRA Rank (r)": "32",
    "LoRA Alpha": "32",
    "LoRA Dropout": "0.05",
    "Target Modules": "q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj",
    "Bias": "none",
  },
  "Training Configuration": {
    "Base Model": "Llama 3.1 8B",
    "Quantization": "4-bit (bitsandbytes)",
    "Max Sequence Length": "2048",
    "Training Samples": "195 (KG-RAG format)",
    "Train/Val Split": "80/20 (156 / 39)",
    "Epochs": "5 (with early stopping)",
    "Early Stopping Patience": "3 evaluations",
    "Early Stopping Threshold": "0.001",
  },
  "Optimization": {
    "Learning Rate": "1e-4",
    "LR Scheduler": "Cosine Annealing",
    "Warmup Ratio": "0.1 (10%)",
    "Optimizer": "AdamW 8-bit",
    "Weight Decay": "0.01",
    "Adam Beta1": "0.9",
    "Adam Beta2": "0.999",
  },
  "Batch Configuration": {
    "Per Device Train Batch Size": "2",
    "Per Device Eval Batch Size": "2",
    "Gradient Accumulation Steps": "4",
    "Effective Batch Size": "8",
  },
  "Knowledge Graph": {
    "Total Nodes": "489",
    "Courses": "85",
    "Professors": "76",
    "Topics": "328",
    "Total Edges": "566",
    "Prerequisite Edges": "40",
    "Taught By Edges": "201",
    "Covers Topic Edges": "325",
  },
  "Performance Metrics": {
    "Final Training Loss": "0.64",
    "Final Validation Loss": "N/A (early stopping)",
    "Accuracy": "94.8%",
    "Training Time": "115.3 minutes",
    "GPU": "NVIDIA A100-SXM4-40GB",
    "Peak Memory Usage": "7.58 GB (19.2%)",
  },
}

const sidebarItems = [
  { id: "pipeline", label: "Data Pipeline", icon: <Database className="h-3.5 w-3.5" /> },
  { id: "scraping", label: "Web Scraping", icon: <Globe className="h-3.5 w-3.5" /> },
  { id: "diagrams", label: "Architecture Diagrams", icon: <Layers className="h-3.5 w-3.5" /> },
  { id: "hyperparameters", label: "Hyperparameters", icon: <Settings className="h-3.5 w-3.5" /> },
  { id: "tech-stack", label: "Technology Stack", icon: <Code className="h-3.5 w-3.5" /> },
]

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <BackToTop />
      <div className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-8">
            {/* Sticky Sidebar */}
            <PageSidebar items={sidebarItems} />

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-3">System Architecture</h1>
                <p className="text-muted-foreground text-lg">
                  End-to-end pipeline from web scraping to knowledge graph-based QA system
                </p>
              </motion.div>

              {/* Pipeline Flow */}
              <motion.div
                id="pipeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-12 scroll-mt-24"
              >
                <h3 className="text-2xl font-bold mb-6">Data Pipeline</h3>
          <div className="space-y-4">
            {pipelineStages.map((stage, i) => {
              const Icon = stage.icon
              return (
                <motion.div
                  key={stage.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                >
                  <Card className="p-6 bg-card/50 border-border/50 hover:border-border transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 text-${stage.color}-600 dark:text-${stage.color}-400`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{stage.title}</h4>
                            <p className="text-sm text-muted-foreground">{stage.description}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Step {i + 1}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-2">Components</div>
                            <div className="space-y-1">
                              {stage.components.map((comp, idx) => (
                                <div key={idx} className="text-sm bg-secondary/30 px-2 py-1 rounded text-foreground/80">
                                  {comp}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-2">Outputs</div>
                            <div className="space-y-1">
                              {stage.outputs.map((output, idx) => (
                                <div key={idx} className="text-sm font-mono bg-secondary/30 px-2 py-1 rounded text-foreground/80">
                                  {output}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/40">
                          <div className="text-xs font-medium text-muted-foreground mb-2">Details</div>
                          <ul className="grid md:grid-cols-2 gap-2">
                            {stage.details.map((detail, idx) => (
                              <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                                <span className="text-muted-foreground mt-1">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {i < pipelineStages.length - 1 && (
                        <ArrowRight className="hidden lg:block absolute -bottom-8 left-1/2 -translate-x-1/2 h-5 w-5 text-muted-foreground/40 rotate-90" />
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

              {/* Web Scraping Deep Dive */}
              <motion.div
                id="scraping"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-12 scroll-mt-24"
              >
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-3">Web Scraping Details</h3>
                <p className="text-foreground/80 mb-4 leading-relaxed">
                  All course data was collected via automated web scraping from official GWU sources.
                  This was a critical first step in building the dataset.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-background/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      Bulletin Scraping
                    </h4>
                    <div className="text-sm space-y-2 text-foreground/80">
                      <p><span className="font-medium">Source:</span> https://bulletin.gwu.edu/courses/csci/</p>
                      <p><span className="font-medium">Method:</span> Python Requests + BeautifulSoup</p>
                      <p><span className="font-medium">Extracted:</span> Course codes, titles, descriptions, prerequisites, credits</p>
                      <p><span className="font-medium">Output:</span> 187 courses (CSCI & DATS programs)</p>
                      <p className="text-xs text-muted-foreground pt-2">
                        Scraped on 2025-12-04. Includes course descriptions with embedded prerequisite information
                        used for graph construction.
                      </p>
                    </div>
                  </div>

                  <div className="bg-background/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      Schedule Scraping
                    </h4>
                    <div className="text-sm space-y-2 text-foreground/80">
                      <p><span className="font-medium">Source:</span> https://my.gwu.edu/mod/pws/courses.cfm</p>
                      <p><span className="font-medium">Method:</span> Python Requests + Pandas parsing</p>
                      <p><span className="font-medium">Extracted:</span> CRNs, sections, instructors, times, rooms, enrollment status</p>
                      <p><span className="font-medium">Output:</span> 586 course instances (Spring 2026 term)</p>
                      <p className="text-xs text-muted-foreground pt-2">
                        Scraped on 2025-12-04. Maps courses to instructors for "taught_by" graph edges.
                        Includes scheduling data for Q&A generation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm text-foreground/90">
                    <span className="font-semibold">Note:</span> Web scraping was essential for obtaining structured course data.
                    Without this step, we would not have had the raw material for building the knowledge graph or
                    generating training Q&A pairs.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

              {/* Architecture Diagrams */}
              <motion.div
                id="diagrams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mb-12 scroll-mt-24"
              >
                <h3 className="text-2xl font-bold mb-6">Model Architecture Diagrams</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Optimized Fine-tuning Diagram */}
            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold text-lg">Optimized Fine-tuning Architecture</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Direct fine-tuning approach with optimized hyperparameters and validation
              </p>
              <div className="bg-background/50 rounded-lg p-4 overflow-x-auto">
                <MermaidDiagram chart={optimizedFineTuningDiagram} className="min-h-[400px]" />
              </div>
            </Card>

            {/* KG-QA System Diagram */}
            <Card className="p-6 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold text-lg">KG-Based QA System Architecture</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Knowledge graph construction with graph-augmented training and retrieval
              </p>
              <div className="bg-background/50 rounded-lg p-4 overflow-x-auto">
                <MermaidDiagram chart={kgQASystemDiagram} className="min-h-[400px]" />
              </div>
            </Card>
          </div>
        </motion.div>

              {/* Hyperparameters Section */}
              <motion.div
                id="hyperparameters"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mb-12 scroll-mt-24"
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Hyperparameters & Configuration
                </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Optimized Fine-tuning Hyperparameters */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold text-lg">Optimized Fine-tuning</h4>
              </div>
              <div className="space-y-4">
                {Object.entries(optimizedHyperparameters).map(([category, params]) => (
                  <div key={category}>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {category}
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(params).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start gap-4 text-sm">
                          <span className="text-muted-foreground flex-1">{key}:</span>
                          <span className="font-medium text-foreground text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* KG-QA System Hyperparameters */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold text-lg">KG-Based QA System</h4>
              </div>
              <div className="space-y-4">
                {Object.entries(kgQAHyperparameters).map(([category, params]) => (
                  <div key={category}>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {category}
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(params).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start gap-4 text-sm">
                          <span className="text-muted-foreground flex-1">{key}:</span>
                          <span className="font-medium text-foreground text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>

              {/* Technology Stack */}
              <motion.div
                id="tech-stack"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="scroll-mt-24"
              >
                <h3 className="text-2xl font-bold mb-6">Technology Stack</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(techStack).map(([category, data], i) => {
              const Icon = data.icon
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                >
                  <Card className="p-5 bg-card/40 border-border/40">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-semibold">{category}</h4>
                    </div>
                    <div className="space-y-3">
                      {data.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0"></div>
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
