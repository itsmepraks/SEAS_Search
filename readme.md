# Knowledge Graph Question Answering System for GW Courses

Team: Anurag Dhungana and Prakriti Bista

We plan to build an intelligent question-answering system over a custom knowledge graph of
GW courses initially focusing on SEAS, including prerequisites, topics, professors, and
degree requirements.

Courses naturally form a graph structure where nodes represent courses, professors, and
topics, connected by relationships like "prerequisite," "taught_by," and "covers_topic.
Through this project, we aim to explore Graph Attention Networks for multi-hop reasoning,
LoRA fine-tuning for domain adaptation, knowledge graph construction, and querying, and
hybrid architectures combining structured retrieval with language generation. We also plan to
touch on evals and QA for the fine-tuned LLM.

The system will combine graph-based retrieval with LLM-based answer generation. Example
queries that we plan to answer might be something like "Which courses should I take to
prepare for computer vision research if I've completed CSCI 6212?", “Which professors teach
courses that are prerequisites for both Computer Vision and Natural Language Processing?”,
etc, where it goes through multiple hop reasoning too.

## Data

We are gathering the data from [GW's Course Schedule](https://my.gwu.edu/mod/pws/courses.cfm?campId=1&termId=202601&subjId=CSCI)

We have an initial version of the data in `combined_courses.csv`

We are tracking the tasks in a make-shift task tracker, which we are trying to update. [Link](https://nn-task-tracker.vercel.app/)\

Last updated on Nov 21, 2025
