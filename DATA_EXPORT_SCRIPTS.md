# Data Export Scripts for Frontend

This document provides **complete instructions** for extracting all data and metrics from your training notebooks to populate the frontend with real results.

## 📊 Current Frontend Status

### ✅ **Currently Displayed (with placeholder data):**
- **Training Loss Curves** - Loss over epochs for all 3 approaches (`training_metrics.json`)
- **Model Comparison** - Accuracy, training time, final loss (`model_comparison.json`)
- **Knowledge Graph** - Interactive graph visualization (`knowledge_graph.json`)
- **Prerequisites Map** - Course prerequisite relationships (`prerequisites_map.json`)
- **Topics Map** - Course topic mappings (`topics_map.json`)
- **Instructors Map** - Instructor-to-course mappings (`instructors_map.json`)
- **Training Data** - JSONL files for data explorer (`course_finetune.jsonl`, `course_finetune_kg_rag.jsonl`)

### ❌ **Missing / Not Yet Implemented:**
- **Evaluation Metrics** - EM, F1, BLEU, ROUGE scores from KG-QA notebook
- **Graph Retrieval Statistics** - Subgraph sizes, entities extracted per query
- **Category-based Accuracy** - Accuracy breakdown by query type (currently hardcoded in `visualizations.tsx`)
- **Training Data Distribution** - Distribution of samples by category (currently hardcoded)
- **Per-Query Evaluation Results** - Individual query predictions vs ground truth
- **Validation Loss Curves** - Separate validation loss tracking (partially shown)
- **Learning Rate Schedules** - Learning rate decay visualization

---

## 🚀 Quick Start Guide

### **Step 1: Run Training Notebooks**
Complete training in all three notebooks:
1. `Llama3.1_(8B)-finetuning.ipynb` (Standard)
2. `Llama3.1_(8B)-finetuning-optimized.ipynb` (Optimized)
3. `Llama3.1_(8B)-KG-QA-System.ipynb` (KG-Based)

### **Step 2: Export Data from Each Notebook**
Follow the sections below for each notebook. Copy the code cells into your Colab notebook and run them.

### **Step 3: Download Files**
After running export functions, download the JSON files using:
```python
from google.colab import files
files.download('filename.json')
```

### **Step 4: Place Files in Frontend**
Copy downloaded files to `public/data/` directory in your project.

---

## 📝 Export Instructions by Notebook

---

## **Notebook 1: Standard Fine-tuning**
**File:** `Llama3.1_(8B)-finetuning.ipynb`

### **What to Export:**
- Training metrics (loss, learning rate per epoch)
- Training time
- Final accuracy (if evaluated)

### **Export Code:**

```python
import json
from datetime import datetime

def export_standard_metrics(trainer, output_path='training_metrics_standard.json'):
    """
    Export training metrics from standard fine-tuning notebook
    
    Args:
        trainer: HuggingFace Trainer object after training
        output_path: Output file path
    """
    # Load existing metrics file if it exists
    try:
        with open(output_path, 'r') as f:
            metrics_data = json.load(f)
    except FileNotFoundError:
        metrics_data = {"approaches": {}}
    
    # Extract epoch data from log history
    epochs_data = []
    for entry in trainer.state.log_history:
        if 'loss' in entry and 'epoch' in entry:
            epoch_data = {
                "epoch": int(entry['epoch']),
                "train_loss": float(entry['loss']),
                "learning_rate": float(entry.get('learning_rate', 0))
            }
            epochs_data.append(epoch_data)
    
    # Get training time from trainer stats
    training_time_seconds = trainer.state.metrics.get('train_runtime', 0)
    training_time_minutes = training_time_seconds / 60 if training_time_seconds > 0 else 0
    
    # Get final loss
    final_loss = epochs_data[-1]['train_loss'] if epochs_data else 0
    
    # Update metrics data
    metrics_data['approaches']['standard'] = {
        "name": "Standard Fine-tuning",
        "epochs": epochs_data,
        "final_metrics": {
            "final_loss": final_loss,
            "accuracy": 0,  # Fill manually if you have evaluation results
            "training_time_minutes": round(training_time_minutes, 2)
        }
    }
    
    metrics_data['_metadata'] = {
        "note": "Real training metrics from standard fine-tuning",
        "exported_at": datetime.now().isoformat()
    }
    
    # Save
    with open(output_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    
    print(f"✓ Exported {len(epochs_data)} epochs")
    print(f"✓ Training time: {training_time_minutes:.2f} minutes")
    print(f"✓ Final loss: {final_loss:.4f}")
    print(f"✓ Saved to: {output_path}")
    
    return metrics_data

# Usage - Run this after training completes
# export_standard_metrics(trainer, 'training_metrics.json')

# Download
# from google.colab import files
# files.download('training_metrics.json')
```

**Note:** If you have evaluation results with accuracy, update the `accuracy` field manually or add evaluation code to calculate it.

---

## **Notebook 2: Optimized Fine-tuning**
**File:** `Llama3.1_(8B)-finetuning-optimized.ipynb`

### **What to Export:**
- Training metrics (loss, validation loss, learning rate per epoch)
- Training time
- Final accuracy from validation set
- Early stopping information (if used)

### **Export Code:**

```python
import json
from datetime import datetime

def export_optimized_metrics(trainer, output_path='training_metrics.json'):
    """
    Export training metrics from optimized fine-tuning notebook
    
    Args:
        trainer: HuggingFace Trainer object after training
        output_path: Output file path (will merge with existing data)
    """
    # Load existing metrics file if it exists
    try:
        with open(output_path, 'r') as f:
            metrics_data = json.load(f)
    except FileNotFoundError:
        metrics_data = {"approaches": {}}
    
    # Extract epoch data from log history
    epochs_data = []
    for entry in trainer.state.log_history:
        if 'loss' in entry and 'epoch' in entry:
            epoch_data = {
                "epoch": int(entry['epoch']),
                "train_loss": float(entry['loss']),
                "learning_rate": float(entry.get('learning_rate', 0))
            }
            
            # Add validation loss if available
            if 'eval_loss' in entry:
                epoch_data['val_loss'] = float(entry['eval_loss'])
            
            epochs_data.append(epoch_data)
    
    # Get training time
    training_time_seconds = trainer.state.metrics.get('train_runtime', 0)
    training_time_minutes = training_time_seconds / 60 if training_time_seconds > 0 else 0
    
    # Get final metrics
    final_loss = epochs_data[-1]['train_loss'] if epochs_data else 0
    final_val_loss = epochs_data[-1].get('val_loss', 0) if epochs_data else 0
    
    # Check for evaluation metrics
    eval_accuracy = 0
    for entry in trainer.state.log_history:
        if 'eval_accuracy' in entry:
            eval_accuracy = float(entry['eval_accuracy']) * 100  # Convert to percentage
            break
    
    # Update metrics data
    metrics_data['approaches']['optimized'] = {
        "name": "Optimized Fine-tuning",
        "epochs": epochs_data,
        "final_metrics": {
            "final_loss": final_loss,
            "val_loss": final_val_loss if final_val_loss > 0 else None,
            "accuracy": eval_accuracy if eval_accuracy > 0 else 0,  # Fill manually if needed
            "training_time_minutes": round(training_time_minutes, 2)
        }
    }
    
    metrics_data['_metadata'] = {
        "note": "Real training metrics from optimized fine-tuning",
        "exported_at": datetime.now().isoformat()
    }
    
    # Save
    with open(output_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    
    print(f"✓ Exported {len(epochs_data)} epochs")
    print(f"✓ Training time: {training_time_minutes:.2f} minutes")
    print(f"✓ Final train loss: {final_loss:.4f}")
    if final_val_loss > 0:
        print(f"✓ Final val loss: {final_val_loss:.4f}")
    print(f"✓ Saved to: {output_path}")
    
    return metrics_data

# Usage - Run this after training completes
# export_optimized_metrics(trainer, 'training_metrics.json')

# Download
# from google.colab import files
# files.download('training_metrics.json')
```

---

## **Notebook 3: KG-QA System**
**File:** `Llama3.1_(8B)-KG-QA-System.ipynb`

This notebook generates the most data. Export everything in order:

### **3.1 Knowledge Graph Export**

```python
import json
import networkx as nx

def export_knowledge_graph_to_json(G, output_path='knowledge_graph.json'):
    """
    Export NetworkX graph to JSON format for react-force-graph-2d
    
    Args:
        G: NetworkX graph object (usually named 'kg_graph' or 'G')
        output_path: Output file path
    """
    graph_data = {
        "nodes": [],
        "links": []
    }
    
    # Export nodes
    for node in G.nodes(data=True):
        node_id = node[0]
        node_attrs = node[1]
        
        node_data = {
            "id": str(node_id),
            "label": node_attrs.get('label', str(node_id)),
            "type": node_attrs.get('type', 'unknown'),
        }
        
        # Add type-specific attributes
        if node_attrs.get('type') == 'course':
            node_data['description'] = node_attrs.get('description', '')
            node_data['credits'] = node_attrs.get('credits', '')
            node_data['code'] = node_attrs.get('code', str(node_id))
        elif node_attrs.get('type') == 'professor':
            node_data['name'] = node_attrs.get('name', str(node_id))
        elif node_attrs.get('type') == 'topic':
            node_data['topic'] = node_attrs.get('topic', str(node_id))
        
        graph_data['nodes'].append(node_data)
    
    # Export edges
    for edge in G.edges(data=True):
        source, target, attrs = edge
        link_data = {
            "source": str(source),
            "target": str(target),
            "type": attrs.get('type', 'unknown'),
            "label": attrs.get('label', attrs.get('type', ''))
        }
        graph_data['links'].append(link_data)
    
    # Add metadata
    graph_data['_metadata'] = {
        "note": "Real data exported from KG-QA notebook",
        "total_nodes": len(graph_data['nodes']),
        "total_links": len(graph_data['links']),
        "node_types": {}
    }
    
    # Count node types
    for node in graph_data['nodes']:
        node_type = node['type']
        graph_data['_metadata']['node_types'][node_type] = \
            graph_data['_metadata']['node_types'].get(node_type, 0) + 1
    
    # Write to file
    with open(output_path, 'w') as f:
        json.dump(graph_data, f, indent=2)
    
    print(f"✓ Exported {len(graph_data['nodes'])} nodes and {len(graph_data['links'])} edges")
    print(f"✓ Saved to: {output_path}")
    return graph_data

# Usage - Replace 'kg_graph' with your actual graph variable name
# export_knowledge_graph_to_json(kg_graph, 'knowledge_graph.json')
# from google.colab import files
# files.download('knowledge_graph.json')
```

### **3.2 Prerequisites Map Export**

```python
import json

def export_prerequisites_map(G, output_path='prerequisites_map.json'):
    """Export course prerequisites as a dictionary"""
    prerequisites_map = {}
    
    for edge in G.edges(data=True):
        source, target, attrs = edge
        if attrs.get('type') == 'prerequisite':
            # target course requires source as prerequisite
            if target not in prerequisites_map:
                prerequisites_map[str(target)] = []
            prerequisites_map[str(target)].append(str(source))
    
    # Add metadata
    prerequisites_map['_metadata'] = {
        "note": "Real prerequisites extracted from knowledge graph",
        "total_courses": len([k for k in prerequisites_map.keys() if k != '_metadata'])
    }
    
    with open(output_path, 'w') as f:
        json.dump(prerequisites_map, f, indent=2)
    
    print(f"✓ Exported prerequisites for {prerequisites_map['_metadata']['total_courses']} courses")
    print(f"✓ Saved to: {output_path}")

# Usage
# export_prerequisites_map(kg_graph, 'prerequisites_map.json')
# from google.colab import files
# files.download('prerequisites_map.json')
```

### **3.3 Topics Map Export**

```python
import json

def export_topics_map(G, output_path='topics_map.json'):
    """Export course topics as a dictionary"""
    topics_map = {}
    
    for edge in G.edges(data=True):
        source, target, attrs = edge
        if attrs.get('type') == 'covers_topic':
            # source course covers target topic
            if source not in topics_map:
                topics_map[str(source)] = []
            
            # Get topic name from target node
            topic_name = str(target)
            for node in G.nodes(data=True):
                if node[0] == target and node[1].get('type') == 'topic':
                    topic_name = node[1].get('topic', str(target))
                    break
            
            topics_map[str(source)].append(topic_name)
    
    # Add metadata
    topics_map['_metadata'] = {
        "note": "Real topics extracted from knowledge graph",
        "total_courses": len([k for k in topics_map.keys() if k != '_metadata'])
    }
    
    with open(output_path, 'w') as f:
        json.dump(topics_map, f, indent=2)
    
    print(f"✓ Exported topics for {topics_map['_metadata']['total_courses']} courses")
    print(f"✓ Saved to: {output_path}")

# Usage
# export_topics_map(kg_graph, 'topics_map.json')
# from google.colab import files
# files.download('topics_map.json')
```

### **3.4 Instructors Map Export**

```python
import json

def export_instructors_map(G, output_path='instructors_map.json'):
    """Export instructor to courses mapping"""
    instructors_map = {}
    
    for edge in G.edges(data=True):
        source, target, attrs = edge
        if attrs.get('type') == 'taught_by':
            # source course is taught by target professor
            prof_name = str(target)
            
            # Get professor name from node attributes
            for node in G.nodes(data=True):
                if node[0] == target and node[1].get('type') == 'professor':
                    prof_name = node[1].get('name', str(target))
                    break
            
            if prof_name not in instructors_map:
                instructors_map[prof_name] = []
            instructors_map[prof_name].append(str(source))
    
    # Add metadata
    instructors_map['_metadata'] = {
        "note": "Real instructor mappings from knowledge graph",
        "total_professors": len([k for k in instructors_map.keys() if k != '_metadata'])
    }
    
    with open(output_path, 'w') as f:
        json.dump(instructors_map, f, indent=2)
    
    print(f"✓ Exported {instructors_map['_metadata']['total_professors']} instructors")
    print(f"✓ Saved to: {output_path}")

# Usage
# export_instructors_map(kg_graph, 'instructors_map.json')
# from google.colab import files
# files.download('instructors_map.json')
```

### **3.5 Training Metrics Export (KG-Based)**

```python
import json
from datetime import datetime

def export_kg_metrics(trainer, output_path='training_metrics.json'):
    """
    Export training metrics from KG-QA notebook
    
    Args:
        trainer: HuggingFace Trainer object after training
        output_path: Output file path (will merge with existing data)
    """
    # Load existing metrics file
    try:
        with open(output_path, 'r') as f:
            metrics_data = json.load(f)
    except FileNotFoundError:
        metrics_data = {"approaches": {}}
    
    # Extract epoch data
    epochs_data = []
    for entry in trainer.state.log_history:
        if 'loss' in entry and 'epoch' in entry:
            epoch_data = {
                "epoch": int(entry['epoch']),
                "train_loss": float(entry['loss']),
                "learning_rate": float(entry.get('learning_rate', 0))
            }
            
            if 'eval_loss' in entry:
                epoch_data['val_loss'] = float(entry['eval_loss'])
            
            epochs_data.append(epoch_data)
    
    # Get training time
    training_time_seconds = trainer.state.metrics.get('train_runtime', 0)
    training_time_minutes = training_time_seconds / 60 if training_time_seconds > 0 else 0
    
    # Get final metrics
    final_loss = epochs_data[-1]['train_loss'] if epochs_data else 0
    final_val_loss = epochs_data[-1].get('val_loss', 0) if epochs_data else 0
    
    # Check for evaluation metrics
    eval_accuracy = 0
    for entry in trainer.state.log_history:
        if 'eval_accuracy' in entry:
            eval_accuracy = float(entry['eval_accuracy']) * 100
            break
    
    # Update metrics data
    metrics_data['approaches']['kg_based'] = {
        "name": "KG-Based QA System",
        "epochs": epochs_data,
        "final_metrics": {
            "final_loss": final_loss,
            "val_loss": final_val_loss if final_val_loss > 0 else None,
            "accuracy": eval_accuracy if eval_accuracy > 0 else 0,
            "training_time_minutes": round(training_time_minutes, 2)
        }
    }
    
    metrics_data['_metadata'] = {
        "note": "Real training metrics from KG-QA system",
        "exported_at": datetime.now().isoformat()
    }
    
    # Save
    with open(output_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    
    print(f"✓ Exported {len(epochs_data)} epochs")
    print(f"✓ Training time: {training_time_minutes:.2f} minutes")
    print(f"✓ Final train loss: {final_loss:.4f}")
    if final_val_loss > 0:
        print(f"✓ Final val loss: {final_val_loss:.4f}")
    print(f"✓ Saved to: {output_path}")
    
    return metrics_data

# Usage
# export_kg_metrics(trainer, 'training_metrics.json')
# from google.colab import files
# files.download('training_metrics.json')
```

### **3.6 Evaluation Metrics Export (EM, F1, BLEU, ROUGE)**

**Important:** This requires running the evaluation section of the KG-QA notebook. Make sure you have:
- Test queries with ground truth answers
- Predictions from your model
- Evaluation results from `evaluate_qa_predictions()` function

```python
import json
from datetime import datetime

def export_evaluation_metrics(evaluation_results, output_path='evaluation_metrics.json'):
    """
    Export evaluation metrics (EM, F1, BLEU, ROUGE) from KG-QA notebook
    
    Args:
        evaluation_results: Dictionary with evaluation metrics
            Should contain: 'exact_match', 'f1', 'bleu', 'rouge_l'
        output_path: Output file path
    """
    # Structure the evaluation data
    eval_data = {
        "overall_metrics": {
            "exact_match": evaluation_results.get('exact_match', 0),
            "f1_score": evaluation_results.get('f1', 0),
            "bleu_score": evaluation_results.get('bleu', 0),
            "rouge_l": evaluation_results.get('rouge_l', 0)
        },
        "per_query_results": evaluation_results.get('per_query', []),
        "_metadata": {
            "note": "Evaluation metrics from KG-QA system",
            "exported_at": datetime.now().isoformat(),
            "total_queries": len(evaluation_results.get('per_query', []))
        }
    }
    
    with open(output_path, 'w') as f:
        json.dump(eval_data, f, indent=2)
    
    print(f"✓ Exported evaluation metrics")
    print(f"  Exact Match: {eval_data['overall_metrics']['exact_match']:.2%}")
    print(f"  F1 Score: {eval_data['overall_metrics']['f1_score']:.4f}")
    print(f"  BLEU Score: {eval_data['overall_metrics']['bleu_score']:.4f}")
    print(f"  ROUGE-L: {eval_data['overall_metrics']['rouge_l']:.4f}")
    print(f"✓ Saved to: {output_path}")
    
    return eval_data

# Usage - After running evaluation in notebook
# Assuming you have results from evaluate_qa_predictions()
# eval_results = {
#     'exact_match': 0.85,  # Overall EM score
#     'f1': 0.92,           # Overall F1 score
#     'bleu': 0.78,        # Overall BLEU score
#     'rouge_l': 0.88,     # Overall ROUGE-L score
#     'per_query': [...]    # List of per-query results
# }
# export_evaluation_metrics(eval_results, 'evaluation_metrics.json')
# from google.colab import files
# files.download('evaluation_metrics.json')
```

### **3.7 Graph Retrieval Statistics Export**

```python
import json
from datetime import datetime

def export_graph_retrieval_stats(retrieval_stats, output_path='graph_retrieval_stats.json'):
    """
    Export graph retrieval statistics from KG-QA notebook
    
    Args:
        retrieval_stats: Dictionary with retrieval statistics
            Should contain: total_queries, queries_with_graph_context, 
                          avg_subgraph_size, entities_extracted, etc.
        output_path: Output file path
    """
    stats_data = {
        "summary": {
            "total_queries": retrieval_stats.get('total_queries', 0),
            "queries_with_graph_context": retrieval_stats.get('queries_with_graph_context', 0),
            "avg_subgraph_size": retrieval_stats.get('avg_subgraph_size', 0),
            "total_entities_extracted": retrieval_stats.get('entities_extracted', 0),
            "avg_entities_per_query": retrieval_stats.get('entities_extracted', 0) / max(retrieval_stats.get('total_queries', 1), 1)
        },
        "detailed_stats": retrieval_stats,
        "_metadata": {
            "note": "Graph retrieval statistics from KG-QA system",
            "exported_at": datetime.now().isoformat()
        }
    }
    
    with open(output_path, 'w') as f:
        json.dump(stats_data, f, indent=2)
    
    print(f"✓ Exported graph retrieval statistics")
    print(f"  Total queries: {stats_data['summary']['total_queries']}")
    print(f"  Queries with context: {stats_data['summary']['queries_with_graph_context']}")
    print(f"  Avg subgraph size: {stats_data['summary']['avg_subgraph_size']:.2f}")
    print(f"✓ Saved to: {output_path}")
    
    return stats_data

# Usage - After running performance monitoring in notebook
# Assuming you have graph_retrieval_stats dictionary from the notebook
# export_graph_retrieval_stats(graph_retrieval_stats, 'graph_retrieval_stats.json')
# from google.colab import files
# files.download('graph_retrieval_stats.json')
```

---

## **4. Model Comparison Export**

**Run this AFTER all three notebooks are complete** to create a comprehensive comparison file.

```python
import json
from datetime import datetime

def create_model_comparison(
    standard_metrics,
    optimized_metrics,
    kg_metrics,
    output_path='model_comparison.json'
):
    """
    Create comprehensive model comparison from all three approaches
    
    Args:
        standard_metrics: Final metrics dict from standard notebook
        optimized_metrics: Final metrics dict from optimized notebook
        kg_metrics: Final metrics dict from KG notebook
        output_path: Output file path
    """
    
    model_comparison = {
        "comparisons": [
            {
                "approach": "Standard Fine-tuning",
                "notebook": "Llama3.1_(8B)-finetuning.ipynb",
                "training_samples": 2828,  # Update if different
                "epochs": len(standard_metrics.get('epochs', [])),
                "lora_rank": 16,  # Update with actual value
                "learning_rate": 0.0002,  # Update with actual value
                "final_loss": standard_metrics['final_metrics']['final_loss'],
                "accuracy": standard_metrics['final_metrics'].get('accuracy', 0),
                "training_time_min": standard_metrics['final_metrics']['training_time_minutes'],
                "strengths": [
                    "Fast training",
                    "Simple setup",
                    "Good for basic Q&A"
                ],
                "weaknesses": [
                    "Repetition issues",
                    "No multi-hop reasoning",
                    "Simple pattern matching"
                ],
                "use_cases": [
                    "Basic course lookups",
                    "Single-fact queries"
                ]
            },
            {
                "approach": "Optimized Fine-tuning",
                "notebook": "Llama3.1_(8B)-finetuning-optimized.ipynb",
                "training_samples": 2828,  # Update if different
                "epochs": len(optimized_metrics.get('epochs', [])),
                "lora_rank": 32,  # Update with actual value
                "learning_rate": 0.0001,  # Update with actual value
                "final_loss": optimized_metrics['final_metrics']['final_loss'],
                "validation_loss": optimized_metrics['final_metrics'].get('val_loss'),
                "accuracy": optimized_metrics['final_metrics'].get('accuracy', 0),
                "training_time_min": optimized_metrics['final_metrics']['training_time_minutes'],
                "strengths": [
                    "Better generalization",
                    "Early stopping",
                    "Validation tracking",
                    "Higher capacity"
                ],
                "weaknesses": [
                    "Longer training",
                    "Still no multi-hop reasoning"
                ],
                "use_cases": [
                    "Production deployment",
                    "General Q&A",
                    "Better accuracy needed"
                ]
            },
            {
                "approach": "KG-Based QA System",
                "notebook": "Llama3.1_(8B)-KG-QA-System.ipynb",
                "training_samples": 200,  # Update if different
                "epochs": len(kg_metrics.get('epochs', [])),
                "lora_rank": 32,  # Update with actual value
                "learning_rate": 0.0001,  # Update with actual value
                "final_loss": kg_metrics['final_metrics']['final_loss'],
                "validation_loss": kg_metrics['final_metrics'].get('val_loss'),
                "accuracy": kg_metrics['final_metrics'].get('accuracy', 0),
                "training_time_min": kg_metrics['final_metrics']['training_time_minutes'],
                "strengths": [
                    "Multi-hop reasoning",
                    "Prerequisite chain queries",
                    "Graph-aware context",
                    "Structured knowledge"
                ],
                "weaknesses": [
                    "Requires graph construction",
                    "More complex pipeline"
                ],
                "use_cases": [
                    "Complex reasoning",
                    "Prerequisites planning",
                    "Cross-department queries",
                    "Path finding"
                ]
            }
        ],
        "_metadata": {
            "note": "Real model comparison data from all three approaches",
            "exported_at": datetime.now().isoformat()
        }
    }
    
    with open(output_path, 'w') as f:
        json.dump(model_comparison, f, indent=2)
    
    print("✓ Model comparison data exported")
    print(f"✓ Saved to: {output_path}")
    
    return model_comparison

# Usage - After exporting metrics from all three notebooks
# Load the metrics files first
# import json
# with open('training_metrics.json', 'r') as f:
#     all_metrics = json.load(f)
# 
# create_model_comparison(
#     all_metrics['approaches']['standard'],
#     all_metrics['approaches']['optimized'],
#     all_metrics['approaches']['kg_based'],
#     'model_comparison.json'
# )
# from google.colab import files
# files.download('model_comparison.json')
```

---

## **5. Quick Export All (KG-QA Notebook)**

Run this single function to export all graph-related data at once:

```python
def export_all_kg_data(G, trainer=None):
    """
    Export all data files from KG-QA notebook at once
    
    Args:
        G: NetworkX graph object
        trainer: Optional Trainer object for metrics
    """
    print("=" * 60)
    print("Exporting all KG-QA data files...")
    print("=" * 60)
    
    # 1. Knowledge Graph
    print("\n[1/5] Exporting knowledge graph...")
    export_knowledge_graph_to_json(G, 'knowledge_graph.json')
    
    # 2. Prerequisites
    print("\n[2/5] Exporting prerequisites map...")
    export_prerequisites_map(G, 'prerequisites_map.json')
    
    # 3. Topics
    print("\n[3/5] Exporting topics map...")
    export_topics_map(G, 'topics_map.json')
    
    # 4. Instructors
    print("\n[4/5] Exporting instructors map...")
    export_instructors_map(G, 'instructors_map.json')
    
    # 5. Training metrics (if trainer provided)
    if trainer:
        print("\n[5/5] Exporting training metrics...")
        export_kg_metrics(trainer, 'training_metrics.json')
    
    print("\n" + "=" * 60)
    print("All exports complete!")
    print("=" * 60)
    print("\nDownload these files:")
    print("  - knowledge_graph.json")
    print("  - prerequisites_map.json")
    print("  - topics_map.json")
    print("  - instructors_map.json")
    if trainer:
        print("  - training_metrics.json")
    print("\nPlace them in: public/data/")

# Usage
# export_all_kg_data(kg_graph, trainer)
# 
# Then download all files:
# from google.colab import files
# files.download('knowledge_graph.json')
# files.download('prerequisites_map.json')
# files.download('topics_map.json')
# files.download('instructors_map.json')
# files.download('training_metrics.json')
```

---

## 📋 Complete Export Checklist

Use this checklist to ensure you export everything:

### **From Standard Fine-tuning Notebook:**
- [ ] Training metrics (`training_metrics.json` - standard approach)

### **From Optimized Fine-tuning Notebook:**
- [ ] Training metrics (`training_metrics.json` - optimized approach)

### **From KG-QA System Notebook:**
- [ ] Knowledge graph (`knowledge_graph.json`)
- [ ] Prerequisites map (`prerequisites_map.json`)
- [ ] Topics map (`topics_map.json`)
- [ ] Instructors map (`instructors_map.json`)
- [ ] Training metrics (`training_metrics.json` - kg_based approach)
- [ ] Evaluation metrics (`evaluation_metrics.json`) - **If you ran evaluation**
- [ ] Graph retrieval stats (`graph_retrieval_stats.json`) - **If you ran performance monitoring**

### **After All Notebooks Complete:**
- [ ] Model comparison (`model_comparison.json`)

---

## 📁 File Placement

After downloading all files from Colab, place them in:

```
public/data/
├── knowledge_graph.json           (from KG-QA notebook)
├── prerequisites_map.json         (from KG-QA notebook)
├── topics_map.json               (from KG-QA notebook)
├── instructors_map.json          (from KG-QA notebook)
├── training_metrics.json          (from all 3 notebooks - merged)
├── model_comparison.json         (created after all notebooks)
├── evaluation_metrics.json        (from KG-QA notebook - optional)
├── graph_retrieval_stats.json    (from KG-QA notebook - optional)
├── course_finetune.jsonl         (synced from data/ - see utils/sync_data_to_public.py)
└── course_finetune_kg_rag.jsonl   (synced from data/ - see utils/sync_data_to_public.py)
```

**Note:** CSV files (`bulletin_courses.csv`, `spring_2026_courses.csv`) are NOT needed in `public/data/` - they're only used by Python scripts in the `data/` folder.

---

## 🔧 Troubleshooting

### **Issue: Variable name not found**
- **Solution:** Check your notebook for the actual variable names. Common names:
  - Graph: `kg_graph`, `G`, `knowledge_graph`
  - Trainer: `trainer`, `model_trainer`

### **Issue: File already exists error**
- **Solution:** The export functions will merge with existing data. If you want to start fresh, delete the file first or use a different filename.

### **Issue: Missing evaluation metrics**
- **Solution:** Evaluation metrics are only available if you ran the evaluation section in the KG-QA notebook. If you didn't run evaluation, skip that export.

### **Issue: Accuracy is 0**
- **Solution:** Accuracy needs to be calculated from evaluation results. Either:
  1. Run evaluation in your notebook and extract accuracy from results
  2. Manually update the accuracy field in the JSON file after export

---

## 📝 Notes

1. **Training Time:** The export functions automatically extract training time from `trainer.state.metrics['train_runtime']`. If this is not available, you'll need to fill it manually.

2. **Accuracy:** Most notebooks don't automatically calculate accuracy. You'll need to:
   - Run evaluation on a test set
   - Extract accuracy from evaluation results
   - Update the JSON file manually, OR
   - Modify the export function to include your evaluation code

3. **Validation Loss:** Only available in optimized and KG-based notebooks that use validation sets.

4. **Evaluation Metrics:** Only available if you ran the evaluation section in the KG-QA notebook with test queries and ground truth answers.

---

## ✅ Next Steps

After exporting all data:

1. **Download all JSON files** from Colab
2. **Place them in `public/data/`** directory
3. **Restart your dev server** (`npm run dev` or `pnpm dev`)
4. **Check the frontend** - All visualizations should now show real data!

The placeholder data will be automatically replaced with your real metrics.
