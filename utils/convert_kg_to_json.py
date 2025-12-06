#!/usr/bin/env python3
"""
Convert NetworkX knowledge graph pickle to JSON files for frontend
"""

import json
import os
import pickle


def load_graph(pkl_path):
    """Load NetworkX graph from pickle file"""
    print(f"Loading graph from {pkl_path}...")
    with open(pkl_path, 'rb') as f:
        # The pickle contains a KnowledgeGraph object, not a raw NetworkX graph
        # We need to define the class structure to unpickle it
        import types

        # Create a minimal KnowledgeGraph class to unpickle
        class KnowledgeGraph:
            def __init__(self):
                self.graph = None
                self.course_nodes = {}
                self.professor_nodes = {}
                self.topic_nodes = {}
                self.node_features = {}
                self.edge_types = {}
                self.node_id_counter = 0

        # Make it available for unpickling
        import sys
        sys.modules[__name__].KnowledgeGraph = KnowledgeGraph

        kg = pickle.load(f)
        G = kg.graph  # Extract the NetworkX graph from KnowledgeGraph object

    print(f"✓ Loaded graph with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")
    return G

def export_knowledge_graph(G, output_path):
    """Export NetworkX graph to JSON format compatible with react-force-graph-2d"""
    print("\nExporting knowledge graph...")

    graph_data = {
        "nodes": [],
        "links": []
    }

    # Export nodes
    for node_id, node_attrs in G.nodes(data=True):
        # Determine node type from ID prefix or node_type attribute
        node_type = node_attrs.get('node_type', 'unknown')

        # If node_type not found, infer from ID
        if node_type == 'unknown':
            if node_id.startswith('course_'):
                node_type = 'course'
            elif node_id.startswith('prof_'):
                node_type = 'professor'
            elif node_id.startswith('topic_'):
                node_type = 'topic'

        # Clean up label - remove prefix
        label = node_id
        if '_' in node_id:
            label = node_id.split('_', 1)[1]

        node_data = {
            "id": node_id,
            "label": label,
            "type": node_type,
        }

        # Add all other attributes
        for key, value in node_attrs.items():
            if key not in ['id', 'label', 'type', 'node_type']:
                node_data[key] = value

        graph_data['nodes'].append(node_data)

    # Export edges
    for source, target, attrs in G.edges(data=True):
        # Determine edge type from edge_type attribute
        edge_type = attrs.get('edge_type', attrs.get('type', 'unknown'))

        link_data = {
            "source": source,
            "target": target,
            "type": edge_type,
            "label": attrs.get('label', edge_type)
        }

        # Add weight if present
        if 'weight' in attrs:
            link_data['weight'] = attrs['weight']

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

def export_prerequisites_map(G, output_path):
    """Export course prerequisites as a simple dictionary"""
    print("\nExporting prerequisites map...")

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

def export_topics_map(G, output_path):
    """Export course topics as a dictionary"""
    print("\nExporting topics map...")

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

def export_instructors_map(G, output_path):
    """Export instructor to courses mapping"""
    print("\nExporting instructors map...")

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

def main():
    # Paths
    pkl_path = 'kg_graph.pkl'
    output_dir = 'public/data'

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Load graph
    G = load_graph(pkl_path)

    # Export all formats
    export_knowledge_graph(G, os.path.join(output_dir, 'knowledge_graph.json'))
    export_prerequisites_map(G, os.path.join(output_dir, 'prerequisites_map.json'))
    export_topics_map(G, os.path.join(output_dir, 'topics_map.json'))
    export_instructors_map(G, os.path.join(output_dir, 'instructors_map.json'))

    print("\n" + "="*60)
    print("✅ All exports complete!")
    print("="*60)
    print(f"\nFiles saved to: {output_dir}")
    print("\nThe frontend will automatically load the new data on refresh!")

if __name__ == "__main__":
    main()
