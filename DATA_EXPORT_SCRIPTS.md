# Data Export Scripts for Frontend

This document contains Python code snippets to run in your Jupyter notebooks to generate real data files for the frontend.

Run these cells in Google Colab after your training is complete to replace the placeholder data with actual metrics.

---

## 1. Knowledge Graph Export

**Run in:** `Llama3.1_(8B)-KG-QA-System.ipynb`

```python
import json
import pickle
import networkx as nx

# Load your NetworkX graph (adjust variable name if different)
# Assuming you have a graph stored as 'kg_graph' or similar
# G = kg_graph  # or whatever your graph variable is named

def export_knowledge_graph_to_json(G, output_path):
    """
    Export NetworkX graph to JSON format compatible with react-force-graph-2d
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
            "id": node_id,
            "label": node_attrs.get('label', node_id),
            "type": node_attrs.get('type', 'unknown'),
        }

        # Add optional attributes based on node type
        if node_attrs.get('type') == 'course':
            node_data['description'] = node_attrs.get('description', '')
            node_data['credits'] = node_attrs.get('credits', '')
            node_data['code'] = node_attrs.get('code', node_id)
        elif node_attrs.get('type') == 'professor':
            node_data['name'] = node_attrs.get('name', node_id)
        elif node_attrs.get('type') == 'topic':
            node_data['topic'] = node_attrs.get('topic', node_id)

        graph_data['nodes'].append(node_data)

    # Export edges
    for edge in G.edges(data=True):
        source, target, attrs = edge
        link_data = {
            "source": source,
            "target": target,
            "type": attrs.get('type', 'unknown'),
            "label": attrs.get('label', attrs.get('type', ''))
        }
        graph_data['links'].append(link_data)

    # Add metadata
    graph_data['_metadata'] = {
        "note": "Real data exported from KG-QA notebook",
        "total_nodes": len(graph_data['nodes']),
        "total_links": len(graph_data['links'])
    }

    # Write to file
    with open(output_path, 'w') as f:
        json.dump(graph_data, f, indent=2)

    print(f"✓ Exported {len(graph_data['nodes'])} nodes and {len(graph_data['links'])} edges")
    print(f"✓ Saved to: {output_path}")
    return graph_data

# Usage - adjust G to your graph variable name
# graph_json = export_knowledge_graph_to_json(G, 'knowledge_graph.json')

# Download the file in Colab
# from google.colab import files
# files.download('knowledge_graph.json')
```

---

## 2. Prerequisites Map Export

**Run in:** `Llama3.1_(8B)-KG-QA-System.ipynb`

```python
import json

def export_prerequisites_map(G, output_path):
    """
    Export course prerequisites as a simple dictionary
    """
    prerequisites_map = {}

    for edge in G.edges(data=True):
        source, target, attrs = edge
        if attrs.get('type') == 'prerequisite':
            # target requires source as prerequisite
            if target not in prerequisites_map:
                prerequisites_map[target] = []
            prerequisites_map[target].append(source)

    # Add metadata
    prerequisites_map['_metadata'] = {
        "note": "Real prerequisites extracted from knowledge graph",
        "total_courses": len(prerequisites_map) - 1  # exclude metadata
    }

    with open(output_path, 'w') as f:
        json.dump(prerequisites_map, f, indent=2)

    print(f"✓ Exported prerequisites for {len(prerequisites_map)-1} courses")
    print(f"✓ Saved to: {output_path}")

# Usage
# export_prerequisites_map(G, 'prerequisites_map.json')
# from google.colab import files
# files.download('prerequisites_map.json')
```

---

## 3. Topics Map Export

**Run in:** `Llama3.1_(8B)-KG-QA-System.ipynb`

```python
import json

def export_topics_map(G, output_path):
    """
    Export course topics as a dictionary
    """
    topics_map = {}

    for edge in G.edges(data=True):
        source, target, attrs = edge
        if attrs.get('type') == 'covers_topic':
            # source course covers target topic
            if source not in topics_map:
                topics_map[source] = []

            # Get topic name from target node
            topic_name = target
            for node in G.nodes(data=True):
                if node[0] == target and node[1].get('type') == 'topic':
                    topic_name = node[1].get('topic', target)
                    break

            topics_map[source].append(topic_name)

    # Add metadata
    topics_map['_metadata'] = {
        "note": "Real topics extracted from knowledge graph",
        "total_courses": len(topics_map) - 1
    }

    with open(output_path, 'w') as f:
        json.dump(topics_map, f, indent=2)

    print(f"✓ Exported topics for {len(topics_map)-1} courses")
    print(f"✓ Saved to: {output_path}")

# Usage
# export_topics_map(G, 'topics_map.json')
# from google.colab import files
# files.download('topics_map.json')
```

---

## 4. Instructors Map Export

**Run in:** `Llama3.1_(8B)-KG-QA-System.ipynb`

```python
import json

def export_instructors_map(G, output_path):
    """
    Export instructor to courses mapping
    """
    instructors_map = {}

    for edge in G.edges(data=True):
        source, target, attrs = edge
        if attrs.get('type') == 'taught_by':
            # source course is taught by target professor
            prof_name = target

            # Get professor name from node attributes
            for node in G.nodes(data=True):
                if node[0] == target and node[1].get('type') == 'professor':
                    prof_name = node[1].get('name', target)
                    break

            if prof_name not in instructors_map:
                instructors_map[prof_name] = []
            instructors_map[prof_name].append(source)

    # Add metadata
    instructors_map['_metadata'] = {
        "note": "Real instructor mappings from knowledge graph",
        "total_professors": len(instructors_map) - 1
    }

    with open(output_path, 'w') as f:
        json.dump(instructors_map, f, indent=2)

    print(f"✓ Exported {len(instructors_map)-1} instructors")
    print(f"✓ Saved to: {output_path}")

# Usage
# export_instructors_map(G, 'instructors_map.json')
# from google.colab import files
# files.download('instructors_map.json')
```

---

## 5. Training Metrics Export

**Run in:** All three training notebooks (standard, optimized, KG-based)

```python
import json

def export_training_metrics(trainer_state, notebook_name, output_path='training_metrics.json'):
    """
    Export training metrics from trainer.state.log_history

    Args:
        trainer_state: The trainer.state object after training
        notebook_name: 'standard', 'optimized', or 'kg_based'
        output_path: Where to save the JSON file
    """

    # Load existing data if file exists
    try:
        with open(output_path, 'r') as f:
            metrics_data = json.load(f)
    except FileNotFoundError:
        metrics_data = {"approaches": {}}

    # Extract epochs data from log history
    epochs_data = []
    for entry in trainer_state.log_history:
        if 'loss' in entry or 'train_loss' in entry:
            epoch_data = {
                "epoch": entry.get('epoch', 0),
                "train_loss": entry.get('loss', entry.get('train_loss', 0)),
                "learning_rate": entry.get('learning_rate', 0)
            }

            # Add validation loss if available
            if 'eval_loss' in entry:
                epoch_data['val_loss'] = entry['eval_loss']

            epochs_data.append(epoch_data)

    # Get final metrics
    final_metrics = {
        "final_loss": epochs_data[-1]['train_loss'] if epochs_data else 0,
        "accuracy": 0,  # You'll need to fill this manually or from eval
        "training_time_minutes": 0  # Fill manually
    }

    if 'val_loss' in epochs_data[-1]:
        final_metrics['val_loss'] = epochs_data[-1]['val_loss']

    # Update the data structure
    metrics_data['approaches'][notebook_name] = {
        "name": notebook_name.replace('_', ' ').title(),
        "epochs": epochs_data,
        "final_metrics": final_metrics
    }

    # Add metadata
    metrics_data['_metadata'] = {
        "note": "Real training metrics from notebooks"
    }

    # Save
    with open(output_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)

    print(f"✓ Exported {len(epochs_data)} epochs for {notebook_name}")
    print(f"✓ Saved to: {output_path}")

# Usage in each notebook:

# In standard fine-tuning notebook:
# export_training_metrics(trainer.state, 'standard', 'training_metrics.json')

# In optimized fine-tuning notebook:
# export_training_metrics(trainer.state, 'optimized', 'training_metrics.json')

# In KG-based notebook:
# export_training_metrics(trainer.state, 'kg_based', 'training_metrics.json')

# Download
# from google.colab import files
# files.download('training_metrics.json')
```

---

## 6. Model Comparison Export

**Run once after all three notebooks are complete**

```python
import json

# Create comparison data manually based on your results
model_comparison = {
    "comparisons": [
        {
            "approach": "Standard Fine-tuning",
            "notebook": "Llama3.1_(8B)-finetuning.ipynb",
            "training_samples": 2828,
            "epochs": 3,
            "lora_rank": 16,
            "learning_rate": 0.0002,
            "final_loss": 0.39,  # UPDATE with your actual values
            "accuracy": 87.5,    # UPDATE
            "training_time_min": 23.69,  # UPDATE
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
            "training_samples": 2828,
            "epochs": 10,
            "lora_rank": 32,
            "learning_rate": 0.0001,
            "final_loss": 0.34,  # UPDATE
            "validation_loss": 0.75,  # UPDATE
            "accuracy": 91.2,  # UPDATE
            "training_time_min": 108.52,  # UPDATE
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
            "training_samples": 200,
            "epochs": 10,
            "lora_rank": 32,
            "learning_rate": 0.0001,
            "final_loss": 0.19,  # UPDATE
            "validation_loss": 0.73,  # UPDATE
            "accuracy": 94.8,  # UPDATE
            "training_time_min": 115.3,  # UPDATE
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
        "note": "Real model comparison data from all three approaches"
    }
}

# Save to file
with open('model_comparison.json', 'w') as f:
    json.dump(model_comparison, f, indent=2)

print("✓ Model comparison data exported")
print("✓ Saved to: model_comparison.json")

# Download
# from google.colab import files
# files.download('model_comparison.json')
```

---

## Quick Export All (Run in KG-QA Notebook)

```python
# Run this cell to export all at once from the KG notebook

def export_all_data(G):
    """Export all data files at once"""

    print("Exporting all data files...\n")

    # 1. Knowledge Graph
    export_knowledge_graph_to_json(G, 'knowledge_graph.json')
    print()

    # 2. Prerequisites
    export_prerequisites_map(G, 'prerequisites_map.json')
    print()

    # 3. Topics
    export_topics_map(G, 'topics_map.json')
    print()

    # 4. Instructors
    export_instructors_map(G, 'instructors_map.json')
    print()

    print("=" * 50)
    print("All exports complete!")
    print("Download these files and place them in:")
    print("public/data/")
    print("=" * 50)

# Usage:
# export_all_data(G)  # Replace G with your graph variable

# Download all files
# from google.colab import files
# files.download('knowledge_graph.json')
# files.download('prerequisites_map.json')
# files.download('topics_map.json')
# files.download('instructors_map.json')
```

---

## Instructions

1. **Run in Google Colab** - Copy the relevant function into your notebook
2. **Adjust variable names** - Change `G` to match your graph variable name
3. **Run the export functions** - Execute the cells
4. **Download the files** - Use `files.download()` in Colab
5. **Place in frontend** - Copy downloaded JSON files to `public/data/`
6. **Restart dev server** - The frontend will automatically load the new data

---

## File Placement

After downloading, place the files here:

```
public/data/
├── knowledge_graph.json        (from export #1)
├── prerequisites_map.json      (from export #2)
├── topics_map.json            (from export #3)
├── instructors_map.json       (from export #4)
├── training_metrics.json      (from export #5)
├── model_comparison.json      (from export #6)
├── course_finetune.jsonl      (synced from data/ - see utils/sync_data_to_public.py)
└── course_finetune_kg_rag.jsonl (synced from data/ - see utils/sync_data_to_public.py)
```

**Note:** CSV files (`bulletin_courses.csv`, `spring_2026_courses.csv`) are NOT needed in `public/data/` - they're only used by Python scripts in the `data/` folder.

The placeholder data is already in place, so the frontend works immediately. Replace with real data when ready!
