# Todo List

- [ ] Run notebooks in Colab and export all data using DATA_EXPORT_SCRIPTS.md instructions
- [ ] Verify dataset generation process (`Meta_Synthetic_Data_Llama3_2_(3B).ipynb`)
- [ ] Verify fine-tuning process (`Llama3.1_(8B)-finetuning.ipynb`)
- [ ] Document the pipeline from data collection to fine-tuning

## Completed

- [x] Fixed codebase structure after flattening (removed backend/frontend folders)
- [x] Updated all path references to match new structure
- [x] Removed duplicate hook files (use-toast.ts, use-mobile.tsx)
- [x] Fixed data directory duplication issue
  - Removed unnecessary CSV files from public/data/ (not used by frontend)
  - Created sync script (utils/sync_data_to_public.py) to keep JSONL files in sync
  - Updated prepare_dataset.py to auto-sync files to public/data/
  - Created documentation (utils/README_DATA_SYNC.md) explaining data structure
- [x] Updated folder name from `nb` to `notebooks` and fixed all references
- [x] Comprehensive DATA_EXPORT_SCRIPTS.md documentation
  - Documented all currently displayed vs missing metrics
  - Created step-by-step export instructions for all 3 notebooks
  - Added export functions for: training metrics, knowledge graph, prerequisites, topics, instructors
  - Added export functions for: evaluation metrics (EM, F1, BLEU, ROUGE), graph retrieval stats
  - Created model comparison export function
  - Added troubleshooting section and complete checklist

