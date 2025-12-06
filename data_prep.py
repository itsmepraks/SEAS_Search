import json
import sys
from datetime import datetime

# Fix Windows console encoding issue
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ============================================================================
# STEP 1: Load all three training metrics files
# ============================================================================

print("Loading training metrics files...")

# Load standard (already in training_metrics.json)
with open('public/data/training_metrics.json', 'r', encoding='utf-8') as f:
    merged_metrics = json.load(f)

# Load optimized
with open('public/data/optimized_ft_training_metrics.json', 'r', encoding='utf-8') as f:
    optimized_data = json.load(f)

# Load KG-based
with open('public/data/kg_training_metrics.json', 'r', encoding='utf-8') as f:
    kg_data = json.load(f)

# ============================================================================
# STEP 2: Merge all approaches into one file
# ============================================================================

print("\nMerging training metrics...")

# Update optimized approach (replace if exists, or add if not)
merged_metrics['approaches']['optimized'] = optimized_data['approaches']['optimized']
print(f"[OK] Updated optimized approach: {len(optimized_data['approaches']['optimized']['epochs'])} epochs")

# Update KG-based approach (replace placeholder with real data)
merged_metrics['approaches']['kg_based'] = kg_data['approaches']['kg_based']
print(f"[OK] Updated KG-based approach: {len(kg_data['approaches']['kg_based']['epochs'])} epochs")

# Update metadata
merged_metrics['_metadata'] = {
    "note": "Real training metrics from all three approaches (Standard, Optimized, KG-Based)",
    "exported_at": datetime.now().isoformat(),
    "standard_epochs": len(merged_metrics['approaches']['standard']['epochs']),
    "optimized_epochs": len(merged_metrics['approaches']['optimized']['epochs']),
    "kg_based_epochs": len(merged_metrics['approaches']['kg_based']['epochs'])
}

# Save merged file
with open('public/data/training_metrics.json', 'w', encoding='utf-8') as f:
    json.dump(merged_metrics, f, indent=2, ensure_ascii=False)

print(f"\n[OK] Saved merged training_metrics.json")
print(f"  - Standard: {merged_metrics['approaches']['standard']['final_metrics']['final_loss']:.4f} loss, {merged_metrics['approaches']['standard']['final_metrics']['training_time_minutes']:.2f} min")
print(f"  - Optimized: {merged_metrics['approaches']['optimized']['final_metrics']['final_loss']:.4f} loss, {merged_metrics['approaches']['optimized']['final_metrics']['training_time_minutes']:.2f} min")
print(f"  - KG-Based: {merged_metrics['approaches']['kg_based']['final_metrics']['final_loss']:.4f} loss, {merged_metrics['approaches']['kg_based']['final_metrics']['training_time_minutes']:.2f} min")

# ============================================================================
# STEP 3: Update model_comparison.json with REAL data from notebooks
# ============================================================================

print("\nUpdating model_comparison.json with real data from notebooks...")

# Load existing comparison file
with open('public/data/model_comparison.json', 'r', encoding='utf-8') as f:
    comparison = json.load(f)

# Extract real metrics
standard_metrics = merged_metrics['approaches']['standard']['final_metrics']
optimized_metrics = merged_metrics['approaches']['optimized']['final_metrics']
kg_metrics = merged_metrics['approaches']['kg_based']['final_metrics']

# Count epochs (count unique epoch numbers)
def count_epochs(epochs_data):
    unique_epochs = set()
    for entry in epochs_data:
        unique_epochs.add(entry.get('epoch', 0))
    return len(unique_epochs)

# HYPERPARAMETERS EXTRACTED FROM NOTEBOOKS:
# Standard: r=16, lr=2e-4, epochs=3, samples=2828 (from Llama3.1_(8B)-finetuning.ipynb)
# Optimized: r=32, lr=1e-4, epochs=5, samples=2828 (from Llama3.1_(8B)-finetuning-optimized.ipynb)
# KG: r=32, lr=1e-4, epochs=5, samples=195 (from Llama3.1_(8B)-KG-QA-System.ipynb)

# Update comparison data with REAL values from notebooks
comparison['comparisons'] = [
    {
        "approach": "Standard Fine-tuning",
        "notebook": "Llama3.1_(8B)-finetuning.ipynb",
        "training_samples": 2828,  # From course_finetune.jsonl
        "epochs": count_epochs(merged_metrics['approaches']['standard']['epochs']),
        "lora_rank": 16,  # From notebook: r = 16
        "learning_rate": 0.0002,  # From notebook: learning_rate = 2e-4
        "final_loss": standard_metrics['final_loss'],
        "accuracy": standard_metrics.get('accuracy', 0),
        "training_time_min": standard_metrics['training_time_minutes'],
        "strengths": ["Fast training", "Simple setup", "Good for basic Q&A"],
        "weaknesses": ["Repetition issues", "No multi-hop reasoning", "Simple pattern matching"],
        "use_cases": ["Basic course lookups", "Single-fact queries"]
    },
    {
        "approach": "Optimized Fine-tuning",
        "notebook": "Llama3.1_(8B)-finetuning-optimized.ipynb",
        "training_samples": 2828,  # From course_finetune.jsonl (2262 train + 566 val split)
        "epochs": count_epochs(merged_metrics['approaches']['optimized']['epochs']),
        "lora_rank": 32,  # From notebook: r = 32
        "learning_rate": 0.0001,  # From notebook: learning_rate = 1e-4
        "final_loss": optimized_metrics['final_loss'],
        "validation_loss": optimized_metrics.get('val_loss'),
        "accuracy": optimized_metrics.get('accuracy', 0),
        "training_time_min": optimized_metrics['training_time_minutes'],
        "strengths": ["Better generalization", "Early stopping", "Validation tracking", "Higher capacity"],
        "weaknesses": ["Longer training", "Still no multi-hop reasoning"],
        "use_cases": ["Production deployment", "General Q&A", "Better accuracy needed"]
    },
    {
        "approach": "KG-Based QA System",
        "notebook": "Llama3.1_(8B)-KG-QA-System.ipynb",
        "training_samples": 195,  # From notebook output: "Created RAG dataset with 195 examples"
        "epochs": count_epochs(merged_metrics['approaches']['kg_based']['epochs']),
        "lora_rank": 32,  # From notebook: r=32
        "learning_rate": 0.0001,  # From notebook: learning_rate=1e-4
        "final_loss": kg_metrics['final_loss'],
        "validation_loss": kg_metrics.get('val_loss'),
        "accuracy": kg_metrics.get('accuracy', 0),
        "training_time_min": kg_metrics['training_time_minutes'],
        "strengths": ["Multi-hop reasoning", "Prerequisite chain queries", "Graph-aware context", "Structured knowledge"],
        "weaknesses": ["Requires graph construction", "More complex pipeline"],
        "use_cases": ["Complex reasoning", "Prerequisites planning", "Cross-department queries", "Path finding"]
    }
]

comparison['_metadata'] = {
    "note": "Real comparison data extracted from training metrics and notebook configurations",
    "exported_at": datetime.now().isoformat(),
    "source": "Notebooks: Llama3.1_(8B)-finetuning.ipynb, Llama3.1_(8B)-finetuning-optimized.ipynb, Llama3.1_(8B)-KG-QA-System.ipynb"
}

# Save updated comparison
with open('public/data/model_comparison.json', 'w', encoding='utf-8') as f:
    json.dump(comparison, f, indent=2, ensure_ascii=False)

print("[OK] Updated model_comparison.json with real metrics")
print("\nSummary:")
for comp in comparison['comparisons']:
    print(f"  - {comp['approach']}:")
    print(f"    Loss={comp['final_loss']:.4f}, Time={comp['training_time_min']:.2f}min")
    print(f"    Epochs={comp['epochs']}, LoRA r={comp['lora_rank']}, LR={comp['learning_rate']}")
    print(f"    Samples={comp['training_samples']}")

print("\n" + "="*60)
print("[OK] All data merged and updated with REAL values from notebooks!")
print("="*60)
print("\nFiles updated:")
print("  [OK] public/data/training_metrics.json (merged all 3 approaches)")
print("  [OK] public/data/model_comparison.json (updated with real hyperparameters)")
print("\nThe frontend should now display all accurate training data!")