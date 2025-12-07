"""
Final Model Evaluation Script for Google Colab
Evaluates KG-QA and Optimized Fine-tuning models with accuracy metrics
"""

# ============================================================================
# SETUP - IMPORT UNSLOTH FIRST!
# ============================================================================
import unsloth  # MUST be imported before transformers!
from unsloth import FastLanguageModel
from unsloth.chat_templates import get_chat_template

print("="*70)
print("Model Evaluation Script - Final Version")
print("="*70)

# Install dependencies
print("\n[1/6] Installing dependencies...")
!pip install -q transformers huggingface_hub evaluate rouge-score datasets accelerate networkx

import json
import numpy as np
import torch
import pickle
import re
import gc
from datetime import datetime
import networkx as nx
from collections import defaultdict
import urllib.request

# Check GPU
print(f"\nGPU Available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

# ============================================================================
# DEFINE CLASSES FOR PICKLE LOADING
# ============================================================================
print("\n[2/6] Defining KnowledgeGraph and GraphRetriever classes...")

class KnowledgeGraph:
    """Knowledge Graph for GW Courses with nodes and edges."""
    def __init__(self):
        self.graph = nx.DiGraph()
        self.course_nodes = {}
        self.professor_nodes = {}
        self.topic_nodes = {}
        self.node_features = {}
        self.edge_types = {}
        self.node_id_counter = 0

    def add_node(self, node_type: str, node_id: str, features: dict = None):
        if node_id not in self.graph:
            self.graph.add_node(node_id, node_type=node_type, **{**(features or {})})
            self.node_features[node_id] = features or {}
            return True
        return False

    def add_edge(self, source: str, target: str, edge_type: str, weight: float = 1.0):
        if source in self.graph and target in self.graph:
            self.graph.add_edge(source, target, edge_type=edge_type, weight=weight)
            self.edge_types[(source, target)] = edge_type
            return True
        return False

    def get_subgraph(self, start_nodes: list, max_hops: int = 2) -> nx.DiGraph:
        subgraph_nodes = set(start_nodes)
        for _ in range(max_hops):
            new_nodes = set()
            for node in subgraph_nodes:
                new_nodes.update(self.graph.successors(node))
                new_nodes.update(self.graph.predecessors(node))
            subgraph_nodes.update(new_nodes)
        return self.graph.subgraph(subgraph_nodes)

    def find_paths(self, source: str, target: str, max_length: int = 3) -> list:
        try:
            return list(nx.all_simple_paths(self.graph, source, target, cutoff=max_length))
        except:
            return []


class GraphRetriever:
    """Retriever that finds relevant graph subgraphs for queries."""
    def __init__(self, knowledge_graph: KnowledgeGraph):
        self.kg = knowledge_graph

    def retrieve_subgraph(self, query: str, query_entities: list, max_hops: int = 2) -> nx.DiGraph:
        start_nodes = []
        for entity in query_entities:
            if entity in self.kg.course_nodes:
                start_nodes.append(self.kg.course_nodes[entity])
            for prof_name, node_id in self.kg.professor_nodes.items():
                if entity.lower() in prof_name.lower() or prof_name.lower() in entity.lower():
                    start_nodes.append(node_id)
            for topic, node_id in self.kg.topic_nodes.items():
                if entity.lower() in topic.lower():
                    start_nodes.append(node_id)
        if not start_nodes:
            return nx.DiGraph()
        return self.kg.get_subgraph(start_nodes, max_hops=max_hops)

    def format_subgraph_context(self, subgraph: nx.DiGraph) -> str:
        if subgraph.number_of_nodes() == 0:
            return "No relevant graph information found."
        context_parts = []
        edges_by_type = defaultdict(list)
        for u, v, data in subgraph.edges(data=True):
            edge_type = data.get('edge_type', 'unknown')
            edges_by_type[edge_type].append((u, v))
        if 'prerequisite' in edges_by_type:
            prereqs = []
            for u, v in edges_by_type['prerequisite']:
                course_u = subgraph.nodes[u].get('code', u)
                course_v = subgraph.nodes[v].get('code', v)
                prereqs.append(f"{course_v} is a prerequisite for {course_u}")
            if prereqs:
                context_parts.append("Prerequisites: " + "; ".join(prereqs[:10]))
        if 'taught_by' in edges_by_type:
            taught_by = []
            for u, v in edges_by_type['taught_by']:
                course = subgraph.nodes[u].get('code', u)
                prof = subgraph.nodes[v].get('name', v)
                taught_by.append(f"{course} is taught by {prof}")
            if taught_by:
                context_parts.append("Instructors: " + "; ".join(taught_by[:10]))
        if 'covers_topic' in edges_by_type:
            topics = []
            for u, v in edges_by_type['covers_topic']:
                course = subgraph.nodes[u].get('code', u)
                topic = subgraph.nodes[v].get('name', v)
                topics.append(f"{course} covers {topic}")
            if topics:
                context_parts.append("Topics: " + "; ".join(topics[:10]))
        return "\n".join(context_parts) if context_parts else "Graph context available."

print("✓ Classes defined")

# ============================================================================
# EVALUATION FUNCTIONS
# ============================================================================
print("\n[3/6] Setting up evaluation functions...")

def exact_match(prediction: str, reference: str) -> bool:
    return prediction.strip().lower() == reference.strip().lower()

def f1_score(prediction: str, reference: str) -> float:
    pred_tokens = set(prediction.lower().split())
    ref_tokens = set(reference.lower().split())
    if len(pred_tokens) == 0 or len(ref_tokens) == 0:
        return 0.0
    intersection = pred_tokens.intersection(ref_tokens)
    if len(intersection) == 0:
        return 0.0
    precision = len(intersection) / len(pred_tokens)
    recall = len(intersection) / len(ref_tokens)
    if precision + recall == 0:
        return 0.0
    return 2 * (precision * recall) / (precision + recall)

def evaluate_qa_predictions(predictions: list, references: list) -> dict:
    import evaluate
    em_scores = [exact_match(p, r) for p, r in zip(predictions, references)]
    f1_scores = [f1_score(p, r) for p, r in zip(predictions, references)]
    try:
        bleu_metric = evaluate.load("bleu")
        rouge_metric = evaluate.load("rouge")
        bleu_results = bleu_metric.compute(predictions=predictions, references=[[ref] for ref in references])
        rouge_results = rouge_metric.compute(predictions=predictions, references=references)
    except Exception as e:
        print(f"Warning: Could not compute BLEU/ROUGE: {e}")
        bleu_results = {"bleu": 0.0}
        rouge_results = {"rouge1": 0.0, "rouge2": 0.0, "rougeL": 0.0}
    return {
        "exact_match": float(np.mean(em_scores)),
        "f1": float(np.mean(f1_scores)),
        "bleu": float(bleu_results.get("bleu", 0.0)),
        "rouge1": float(rouge_results.get("rouge1", 0.0)),
        "rouge2": float(rouge_results.get("rouge2", 0.0)),
        "rougeL": float(rouge_results.get("rougeL", 0.0)),
    }

# ============================================================================
# LOAD TEST DATA FROM GITHUB
# ============================================================================
print("\n[4/6] Loading test data from GitHub...")

GITHUB_USER = "itsmepraks"
REPO_NAME = "SEAS_Search"
BRANCH = "main"

def load_test_data_from_github(filename: str, max_samples: int = 50):
    """Load test data from GitHub raw URL."""
    url = f"https://raw.githubusercontent.com/{GITHUB_USER}/{REPO_NAME}/{BRANCH}/data/{filename}"
    print(f"  Loading {filename} from GitHub...")
    try:
        with urllib.request.urlopen(url) as f:
            content = f.read().decode('utf-8')
        
        queries = []
        references = []
        lines = content.strip().split('\n')
        
        for i, line in enumerate(lines):
            if i >= max_samples:
                break
            try:
                data = json.loads(line.strip())
                messages = data.get("messages", [])
                
                query = None
                for msg in messages:
                    if msg.get("role") == "user":
                        user_content = msg.get("content", "")
                        if "Question:" in user_content:
                            query = user_content.split("Question:")[-1].strip()
                        elif "Graph Context:" in user_content:
                            parts = user_content.split("Question:")
                            query = parts[-1].strip() if len(parts) > 1 else user_content.replace("Graph Context:", "").strip()
                        else:
                            query = user_content.strip()
                        break
                
                for msg in messages:
                    if msg.get("role") == "assistant":
                        content = msg.get("content", "")
                        ref_answer = content.split("Answer:")[-1].strip() if "Answer:" in content else content.strip()
                        if ref_answer and query:
                            references.append(ref_answer)
                            queries.append(query)
                        break
            except:
                continue
        
        return queries, references
    except Exception as e:
        print(f"  Error loading {filename}: {e}")
        return [], []

standard_queries, standard_refs = load_test_data_from_github("course_finetune.jsonl", 50)
kg_queries, kg_refs = load_test_data_from_github("course_finetune_kg_rag.jsonl", 50)

print(f"✓ Loaded {len(standard_queries)} standard test examples")
print(f"✓ Loaded {len(kg_queries)} KG-RAG test examples")

# ============================================================================
# LOAD MODELS FROM HUGGING FACE
# ============================================================================
print("\n[5/6] Loading models from Hugging Face...")

# Get HF token
try:
    from google.colab import userdata
    HF_TOKEN = userdata.get('HF_TOKEN')
    print("✓ HF_TOKEN loaded from Colab secrets")
except:
    import os
    HF_TOKEN = os.getenv('HF_TOKEN')
    if not HF_TOKEN:
        HF_TOKEN = input("Enter your Hugging Face token: ")

from huggingface_hub import hf_hub_download, login
if HF_TOKEN:
    login(token=HF_TOKEN)

KG_REPO = "itsmepraks/gwcourses_RAG"
OPTIMIZED_REPO = "itsmepraks/gwcoursesfinetune"

# ============================================================================
# EVALUATE KG-QA MODEL
# ============================================================================
print("\n[6/6] Evaluating KG-QA Model...")
print("="*70)

kg_metrics = None
if len(kg_queries) > 0:
    try:
        print(f"Loading KG-QA model from {KG_REPO}...")
        kg_model, kg_tokenizer = FastLanguageModel.from_pretrained(
            model_name=KG_REPO, max_seq_length=2048, dtype=None, load_in_4bit=True
        )
        kg_tokenizer = get_chat_template(kg_tokenizer, chat_template="llama-3.1")
        FastLanguageModel.for_inference(kg_model)
        
        print("Downloading knowledge graph files...")
        kg_path = hf_hub_download(repo_id=KG_REPO, filename="kg_graph.pkl", token=HF_TOKEN)
        retriever_path = hf_hub_download(repo_id=KG_REPO, filename="graph_retriever.pkl", token=HF_TOKEN)
        
        with open(kg_path, 'rb') as f:
            kg_graph = pickle.load(f)
        with open(retriever_path, 'rb') as f:
            kg_retriever = pickle.load(f)
        
        print("✓ KG-QA model loaded")
        
        def extract_entities(query: str):
            entities = []
            entities.extend(re.findall(r'[A-Z]{2,4}\s+\d{4}', query))
            for topic in ['machine learning', 'deep learning', 'neural networks', 'computer vision']:
                if topic.lower() in query.lower():
                    entities.append(topic)
            return entities
        
        def clean_output(text: str) -> str:
            text = text.replace('\xa0', ' ').replace('\u00a0', ' ')
            text = re.sub(r'[\u0400-\u04FF]+', '', text)
            text = re.sub(r'[\u00C0-\u00FF]+', '', text)
            for artifact in ['assistant', 'user', 'system', '<|assistant|>', '<|user|>', 
                            '<|eot_id|>', 'Question:', 'Answer:', 'Reasoning Path:']:
                text = text.replace(artifact, '')
            return text.strip()
        
        print(f"Running inference on {len(kg_queries)} queries...")
        kg_predictions = []
        for i, query in enumerate(kg_queries):
            if (i + 1) % 10 == 0:
                print(f"  {i+1}/{len(kg_queries)}...")
            try:
                entities = extract_entities(query)
                subgraph = kg_retriever.retrieve_subgraph(query, entities, max_hops=3)
                graph_context = kg_retriever.format_subgraph_context(subgraph)
                
                system_content = """You are a helpful assistant providing information about GWU Computer Science and Data Science courses for Spring 2026.
You have access to a knowledge graph with course relationships, prerequisites, instructors, and topics.
Use the provided graph context to answer questions accurately. Provide concise, direct answers."""
                
                user_content = f"""Graph Context:
{graph_context}

Question: {query}""" if graph_context != "No relevant graph information found." else f"Question: {query}"
                
                messages = [{"role": "system", "content": system_content}, {"role": "user", "content": user_content}]
                inputs = kg_tokenizer.apply_chat_template(messages, tokenize=True, add_generation_prompt=True, return_tensors="pt").to("cuda")
                
                with torch.no_grad():
                    outputs = kg_model.generate(
                        input_ids=inputs, max_new_tokens=256, temperature=0.1, do_sample=True,
                        pad_token_id=kg_tokenizer.eos_token_id, eos_token_id=kg_tokenizer.eos_token_id, repetition_penalty=1.2
                    )
                
                answer = kg_tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=False)
                answer = clean_output(answer)
                if "Answer:" in answer:
                    answer = answer.split("Answer:")[-1].strip()
                kg_predictions.append(answer.strip())
            except Exception as e:
                print(f"  Error on query {i+1}: {e}")
                kg_predictions.append("")
        
        kg_metrics = evaluate_qa_predictions(kg_predictions, kg_refs)
        print(f"\n✅ KG-QA Results:")
        print(f"  Exact Match: {kg_metrics['exact_match']:.4f} ({kg_metrics['exact_match']*100:.2f}%)")
        print(f"  F1 Score: {kg_metrics['f1']:.4f}")
        print(f"  BLEU: {kg_metrics['bleu']:.4f}")
        print(f"  ROUGE-L: {kg_metrics['rougeL']:.4f}")
        
        del kg_model, kg_tokenizer, kg_graph, kg_retriever
        gc.collect()
        torch.cuda.empty_cache()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

# ============================================================================
# EVALUATE OPTIMIZED MODEL
# ============================================================================
print("\n[6b/6] Evaluating Optimized Fine-tuning Model...")
print("="*70)

opt_metrics = None
if len(standard_queries) > 0:
    try:
        print(f"Loading optimized model from {OPTIMIZED_REPO}...")
        opt_model, opt_tokenizer = FastLanguageModel.from_pretrained(
            model_name=OPTIMIZED_REPO, max_seq_length=2048, dtype=None, load_in_4bit=True
        )
        opt_tokenizer = get_chat_template(opt_tokenizer, chat_template="llama-3.1")
        FastLanguageModel.for_inference(opt_model)
        print("✓ Optimized model loaded")
        
        def clean_output(text: str) -> str:
            text = text.replace('\xa0', ' ').replace('\u00a0', ' ')
            text = re.sub(r'[\u0400-\u04FF]+', '', text)
            text = re.sub(r'[\u00C0-\u00FF]+', '', text)
            for artifact in ['assistant', 'user', 'system', '<|assistant|>', '<|user|>', '<|eot_id|>']:
                text = text.replace(artifact, '')
            return text.strip()
        
        print(f"Running inference on {len(standard_queries)} queries...")
        opt_predictions = []
        for i, query in enumerate(standard_queries):
            if (i + 1) % 10 == 0:
                print(f"  {i+1}/{len(standard_queries)}...")
            try:
                messages = [
                    {"role": "system", "content": "You are a helpful assistant providing information about GWU Computer Science and Data Science courses for Spring 2026."},
                    {"role": "user", "content": query}
                ]
                inputs = opt_tokenizer.apply_chat_template(messages, tokenize=True, add_generation_prompt=True, return_tensors="pt").to("cuda")
                
                with torch.no_grad():
                    outputs = opt_model.generate(
                        input_ids=inputs, max_new_tokens=256, temperature=0.1, do_sample=True,
                        pad_token_id=opt_tokenizer.eos_token_id, eos_token_id=opt_tokenizer.eos_token_id
                    )
                
                answer = opt_tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=False)
                opt_predictions.append(clean_output(answer).strip())
            except Exception as e:
                print(f"  Error on query {i+1}: {e}")
                opt_predictions.append("")
        
        opt_metrics = evaluate_qa_predictions(opt_predictions, standard_refs)
        print(f"\n✅ Optimized Fine-tuning Results:")
        print(f"  Exact Match: {opt_metrics['exact_match']:.4f} ({opt_metrics['exact_match']*100:.2f}%)")
        print(f"  F1 Score: {opt_metrics['f1']:.4f}")
        print(f"  BLEU: {opt_metrics['bleu']:.4f}")
        print(f"  ROUGE-L: {opt_metrics['rougeL']:.4f}")
        
        del opt_model, opt_tokenizer
        gc.collect()
        torch.cuda.empty_cache()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

# ============================================================================
# SAVE RESULTS
# ============================================================================
print("\n[7/7] Saving results...")
print("="*70)

results = {
    "evaluation_date": datetime.now().isoformat(),
    "models_evaluated": [],
    "metrics": {}
}

if kg_metrics:
    results["models_evaluated"].append("KG-Based QA System")
    results["metrics"]["KG-Based QA System"] = kg_metrics

if opt_metrics:
    results["models_evaluated"].append("Optimized Fine-tuning")
    results["metrics"]["Optimized Fine-tuning"] = opt_metrics

with open('evaluation_results.json', 'w') as f:
    json.dump(results, f, indent=2)

comparison_update = {"comparisons": []}

if kg_metrics:
    comparison_update["comparisons"].append({
        "approach": "KG-Based QA System",
        "accuracy": kg_metrics['exact_match'] * 100,
        "f1_score": kg_metrics['f1'],
        "bleu": kg_metrics['bleu'],
        "rouge1": kg_metrics['rouge1'],
        "rouge2": kg_metrics['rouge2'],
        "rougeL": kg_metrics['rougeL'],
    })

if opt_metrics:
    comparison_update["comparisons"].append({
        "approach": "Optimized Fine-tuning",
        "accuracy": opt_metrics['exact_match'] * 100,
        "f1_score": opt_metrics['f1'],
        "bleu": opt_metrics['bleu'],
        "rouge1": opt_metrics['rouge1'],
        "rouge2": opt_metrics['rouge2'],
        "rougeL": opt_metrics['rougeL'],
    })

with open('model_comparison_update.json', 'w') as f:
    json.dump(comparison_update, f, indent=2)

from google.colab import files
files.download('evaluation_results.json')
files.download('model_comparison_update.json')

print("\n" + "="*70)
print("✅ Evaluation Complete!")
print("="*70)
print("\nFiles downloaded:")
print("  - evaluation_results.json")
print("  - model_comparison_update.json")
