"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Database, GitBranch, Cpu, Layers, Code, FileJson, ArrowRight } from "lucide-react"

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
      "10 epochs with early stopping",
      "Validation split (80/20)",
      "Final loss: 0.19, Accuracy: 94.8%",
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

export default function ArchitecturePage() {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-3">System Architecture</h1>
          <p className="text-muted-foreground text-lg">
            End-to-end pipeline from web scraping to knowledge graph-based QA system
          </p>
        </motion.div>

        {/* Pipeline Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12"
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

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
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
  )
}
