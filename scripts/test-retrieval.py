#!/usr/bin/env python3
"""
Test retrieval accuracy against precomputed kural-embeddings.bin and kurals.json.
"""

import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT_DIR, "public", "kurals.json")
BIN_PATH = os.path.join(ROOT_DIR, "public", "kural-embeddings.bin")
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

def main():
    print("[*] Loading kurals.json...")
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        kurals = json.load(f)
    
    print("[*] Loading kural-embeddings.bin...")
    with open(BIN_PATH, "rb") as f:
        matrix = np.frombuffer(f.read(), dtype=np.float32).reshape(1330, 384)
    
    print(f"[✓] Loaded {len(kurals)} kurals and embedding matrix shape {matrix.shape}")
    
    print(f"[*] Loading model {MODEL_NAME} for test inference...")
    model = SentenceTransformer(MODEL_NAME)

    test_queries = [
        ("feeling sad because friend cheated", "Friendship / False Friends"),
        ("முயற்சி செய்தும் தோல்வி", "Effort / Perseverance"),
        ("how to handle anger when someone insults me", "Anger / Forbearance"),
        ("xyzabc123 random gibberish 98765", "Low confidence / Gibberish"),
    ]

    for query, expected in test_queries:
        print(f"\n==================================================")
        print(f"Query: \"{query}\" (Expected Category: {expected})")
        q_vec = model.encode([query], normalize_embeddings=True, convert_to_numpy=True)[0]
        
        # Dot product against all 1330 kurals
        scores = np.dot(matrix, q_vec)
        top3_indices = np.argsort(scores)[::-1][:3]
        
        for rank, idx in enumerate(top3_indices, 1):
            k = kurals[idx]
            score = scores[idx]
            print(f"  #{rank} [Score: {score:.4f}] Kural #{k['id']} - Chapter: {k['athikaram_ta']} ({k['athikaram_en']})")
            print(f"      Verse: {k['line1']} / {k['line2']}")
            print(f"      Mu.Va: {k['urais']['mu_va'][:60]}...")
            print(f"      English: {k['translation_en'][:60]}...")

if __name__ == "__main__":
    main()
