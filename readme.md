# SEAS Search - Repository Guide

**Live site:** https://seas-search.vercel.app/

This repo contains the full pipeline for the GWU SEAS course-search project: notebooks, datasets, exported JSON used by the frontend, and the Next.js showcase. The frontend itself is an interactive project report that reads static JSON exports, renders methodology/results/architecture, and provides a data explorer plus chat demo. Use the map below to jump directly to the artifacts you need.

## Where Things Live

| Type | Path | Notes |
|------|------|-------|
| **Notebooks** | `notebooks/` | Each `.ipynb` file is the canonical experiment record. The folder also includes `README.md` summarizing status per notebook. |
| **Raw & Prepared Data** | `data/` | CSVs scraped from GW systems plus JSONL training datasets (`course_finetune*.jsonl`). Edit these before re-exporting to the app. |
| **Frontend Data Exports** | `public/data/` | Everything the Next.js site renders: merged training metrics, comparison tables, KG JSON, prerequisite/topic/instructor maps, and synced copies of the JSONL/CSV files. |
| **Model + Frontend Code** | `app/`, `components/`, `lib/`, `styles/` | Next.js App Router UI, Recharts visualizations, data explorer, and shared helpers. |
| **Utility Scripts** | `utils/` | `scrape_courses.py`, `prepare_dataset.py`, `convert_kg_to_json.py`, and sync helpers that copy `data/` assets into `public/data/`. |

## Notebook Reference

| Notebook | Purpose | Key Outputs |
|----------|---------|-------------|
| `notebooks/Llama3.1_(8B)-finetuning.ipynb` | Baseline LoRA fine-tuning on 2,828 Q&A pairs. | Produces `lora_model_standard/` (if saved) and `public/data/standard_training_metrics.json`. |
| `notebooks/Llama3.1_(8B)-finetuning-optimized.ipynb` | Adds train/val split, cosine schedule, early stopping. | Generates `optimized_ft_training_metrics.json`, optional `lora_model_optimized/`. Final merged checkpoint hosted at [itsmepraks/gwcoursesfinetuned](https://huggingface.co/itsmepraks/gwcoursesfinetuned). |
| `notebooks/Llama3.1_(8B)-KG-QA-System.ipynb` | Builds the knowledge graph, creates multi-hop QA data, and fine-tunes with graph context. | Exports `kg_training_metrics.json`, `knowledge_graph.json`, `course_finetune_kg_rag.jsonl`, derived maps, and pushes the graph-aware checkpoint to [itsmepraks/gwcourses_RAG](https://huggingface.co/itsmepraks/gwcourses_RAG). |
| `notebooks/Meta_Synthetic_Data_Llama3_2_(3B).ipynb` | Optional synthetic data generation from bulletin text. | Produces intermediate JSONL files under `data/` if you choose to augment datasets. |

> **Model checkpoints:** When you run any notebook in Colab, models save locally (e.g., `lora_model_kg_qa/`, `merged_model_kg_qa/`). Upload them to cloud storage manually if you want to keep them—git ignores those directories.

## Data & Exported JSON

1. **Raw CSVs (`data/`):**
   - `spring_2026_courses.csv` – schedule instances (586 rows).
   - `bulletin_courses.csv` – CSCI/DATS bulletin entries (187 rows).

2. **Training JSONL (`data/`):**
   - `course_finetune.jsonl` – 2,828 single-hop Q&A pairs.
   - `course_finetune_kg_rag.jsonl` – 200 multi-hop examples emitted by the KG notebook.

3. **Frontend JSON (`public/data/`):**
   - `training_metrics.json` – merged standard, optimized, and KG metrics.
   - `model_comparison.json` – hyperparameters + summary stats for the Results tab.
   - `knowledge_graph.json`, `topics_map.json`, `prerequisites_map.json`, `instructors_map.json` – NetworkX exports consumed by the visualization and data explorer.
   - Synced copies of the CSV/JSONL files so the UI can render raw data tables without a backend.

Run `python utils/sync_data_to_public.py` after regenerating anything in `data/` to keep `public/data/` aligned.

## Frontend & API

- **Next.js App Router:** `app/` contains all routes (`/results`, `/knowledge-graph`, `/methodology`, etc.). The UI acts as an interactive project report: it visualizes metrics, shows the knowledge graph, walks through methodology/architecture, and embeds the chat interface—everything runs client-side over the static JSON snapshots.
- **Data Explorer:** `components/data-explorer.tsx` fetches the JSONL/CSV files, so make sure they exist locally before running `pnpm dev`.
- **Chat API:** `app/api/chat/route.ts` proxies either a Hugging Face Inference Endpoint or a Gradio Space; configure `HF_SPACE_ID` or `HF_MODEL_ENDPOINT` in environment variables to enable live chat.

## Running Locally

```bash
pnpm install          # install dependencies
pnpm dev              # start Next.js on http://localhost:3000
pnpm lint             # run ESLint checks (TypeScript + hooks rules)
pnpm build && pnpm start   # production build preview
```

For data regeneration:
```bash
python utils/scrape_courses.py
python utils/prepare_dataset.py
python utils/sync_data_to_public.py
```
Then re-run the notebooks as needed to refresh training metrics or KG exports.

## Deployment & Status

- **Live site:** https://seas-search.vercel.app/ (served from the `public/data` JSON snapshots).
- **Team:** Anurag Dhungana · Prakriti Bista  
- **Last major update:** December 2025 
