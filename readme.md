# SEAS Search - GWU Course Search System

A fine-tuned LLM-based question-answering system for GWU Computer Science courses, providing information about course schedules, instructors, descriptions, and availability for Spring 2026.

## Overview

This project fine-tunes Llama 3.1 8B to answer questions about GWU Computer Science courses by combining:
- **Real-time schedule data** from GWU's course schedule system
- **Course descriptions** from the GWU Bulletin
- **Fine-tuned language model** for natural language understanding

## Project Structure

```
SEAS_Search/
├── backend/
│   ├── nb/                          # Jupyter notebooks for training
│   │   ├── Llama3.1_(8B)-finetuning-optimized.ipynb  # Curret fine-tuning notebook
│   │   ├── Llama3.1_(8B)-finetuning.ipynb            # Original fine-tuning notebook
│   │   └── Meta_Synthetic_Data_Llama3_2_(3B).ipynb   # Synthetic data generation (optional)
│   ├── data/                        # Training data
│   │   ├── spring_2026_courses.csv      # Course schedule data
│   │   ├── bulletin_courses.csv          # Course descriptions
│   │   └── course_finetune.jsonl         # Formatted training dataset
│   └── utils/                       # Data preparation scripts
│       ├── scrape_courses.py        # Scrapes schedule + bulletin data
│       └── prepare_dataset.py       # Converts CSV to training format
└── frontend/                        # Web interface (work in progress)
```

## Notebooks

### 🎯 `Llama3.1_(8B)-finetuning-optimized.ipynb`

**Purpose:** Optimized fine-tuning with best practices

**Features:**
- Train/Validation split (80/20) to prevent overfitting
- Early stopping based on validation loss
- Optimized hyperparameters (cosine annealing, lower learning rate)
- Evaluation metrics and checkpointing
- Improved inference with proper stopping criteria

**Usage:**
1. Ensure `course_finetune.jsonl` exists in the notebook directory
2. Run all cells sequentially
3. Model saves to `lora_model_optimized/` and `merged_model_optimized/`

### 📝 `Llama3.1_(8B)-finetuning.ipynb` (Original)

**Purpose:** Basic fine-tuning implementation

**Features:**
- Simple training loop
- 3 epochs fixed training
- Basic inference setup

**Note:** Use the optimized version for better results.

### 🔧 `Meta_Synthetic_Data_Llama3_2_(3B).ipynb` (Optional)

**Purpose:** Generate synthetic Q&A pairs from course bulletin

**Features:**
- Uses Llama 3.2 3B to generate additional training data
- Scrapes bulletin descriptions
- Creates question-answer pairs

**Note:** Currently not required - the main pipeline uses real schedule data.

## Quick Start

### 1. Prepare Data

```bash
# Scrape course data
cd backend
python utils/scrape_courses.py

# Generate training dataset
python utils/prepare_dataset.py
```

This creates:
- `data/spring_2026_courses.csv` - Schedule data
- `data/bulletin_courses.csv` - Course descriptions  
- `data/course_finetune.jsonl` - Training dataset

### 2. Fine-tune Model

1. Open `backend/nb/Llama3.1_(8B)-finetuning-optimized.ipynb`
2. Run all cells
3. Model will be saved after training completes

### 3. Test the Model

The notebook includes inference cells that test queries like:
- "Who Teaches Machine Learning?"
- "What courses are available on Tuesdays?"
- "Tell me about CSCI 1012."

## Data Sources

- **Course Schedule:** [GWU Course Schedule](https://my.gwu.edu/mod/pws/courses.cfm?campId=1&termId=202601&subjId=CSCI)
- **Course Descriptions:** [GWU Bulletin - CSCI](https://bulletin.gwu.edu/courses/csci/)

## Current Status

- ✅ Data scraping pipeline (schedule + bulletin)
- ✅ Dataset preparation and formatting
- ✅ Fine-tuning implementation (original + optimized)
- ✅ Model inference and testing
- 🚧 Frontend integration (in progress)

## Team

Anurag Dhungana and Prakriti Bista

Last updated: November 26, 2025
