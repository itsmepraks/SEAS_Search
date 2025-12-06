#!/usr/bin/env python3
"""
Quick script to inspect the structure of kg_graph.pkl
"""

import pickle

pkl_path = '/Users/aarekaz/Development/SEAS_Search/kg_graph.pkl'

print(f"Loading pickle from {pkl_path}...")
with open(pkl_path, 'rb') as f:
    obj = pickle.load(f)

print(f"\nType: {type(obj)}")
print(f"\nAttributes: {dir(obj)}")

# Try to access the actual graph if it's wrapped
if hasattr(obj, 'graph'):
    print(f"\n✓ Has 'graph' attribute")
    G = obj.graph
    print(f"Graph type: {type(G)}")
    print(f"Nodes: {G.number_of_nodes()}")
    print(f"Edges: {G.number_of_edges()}")
elif hasattr(obj, 'G'):
    print(f"\n✓ Has 'G' attribute")
    G = obj.G
    print(f"Graph type: {type(G)}")
    print(f"Nodes: {G.number_of_nodes()}")
    print(f"Edges: {G.number_of_edges()}")
else:
    print("\nNo obvious graph attribute found")
    print("Available attributes:")
    for attr in dir(obj):
        if not attr.startswith('_'):
            print(f"  - {attr}")
