#!/usr/bin/env python3
"""
prepare-data.py
Ingests Thirukkural datasets, generates enriched cross-lingual metadata,
computes 384-dimensional dense vectors using paraphrase-multilingual-MiniLM-L12-v2,
and exports public/kurals.json and public/kural-embeddings.bin.
"""

import json
import os
import sys
import numpy as np
import requests
from sentence_transformers import SentenceTransformer

KURAL_DATA_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json"
DETAIL_DATA_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/detail.json"

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")
OUTPUT_JSON_PATH = os.path.join(PUBLIC_DIR, "kurals.json")
OUTPUT_BIN_PATH = os.path.join(PUBLIC_DIR, "kural-embeddings.bin")

MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
EXPECTED_KURAL_COUNT = 1330
EMBEDDING_DIM = 384
EXPECTED_BYTE_SIZE = EXPECTED_KURAL_COUNT * EMBEDDING_DIM * 4  # 2,042,880 bytes


def fetch_json(url: str, description: str) -> dict | list:
    print(f"[*] Fetching {description} from {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()


def parse_detail_hierarchy(detail_data: list) -> dict[int, dict]:
    """
    Parses detail.json to construct mapping from Kural number -> section/iyal/chapter info.
    """
    kural_map = {}
    
    # Detail root contains sections (Paal)
    for section_block in detail_data:
        sections = section_block.get("section", {}).get("detail", [])
        for sec in sections:
            pal_ta = sec.get("name", "")
            pal_en = sec.get("translation", "")
            pal_trans = sec.get("transliteration", "")
            
            chapter_groups = sec.get("chapterGroup", {}).get("detail", [])
            for group in chapter_groups:
                iyal_ta = group.get("name", "")
                iyal_en = group.get("translation", "")
                iyal_trans = group.get("transliteration", "")
                
                chapters = group.get("chapters", {}).get("detail", [])
                for ch in chapters:
                    athikaram_num = ch.get("number", 0)
                    athikaram_ta = ch.get("name", "")
                    athikaram_en = ch.get("translation", "")
                    athikaram_trans = ch.get("transliteration", "")
                    start_kural = ch.get("start", 1)
                    end_kural = ch.get("end", 10)
                    
                    for k_num in range(start_kural, end_kural + 1):
                        kural_map[k_num] = {
                            "pal_ta": pal_ta,
                            "pal_en": pal_en,
                            "pal_trans": pal_trans,
                            "iyal_ta": iyal_ta,
                            "iyal_en": iyal_en,
                            "iyal_trans": iyal_trans,
                            "athikaram_num": athikaram_num,
                            "athikaram_ta": athikaram_ta,
                            "athikaram_en": athikaram_en,
                            "athikaram_trans": athikaram_trans,
                        }
    return kural_map


def build_search_context(k: dict) -> str:
    """
    Forms rich multi-lingual searchable text payload to maximize semantic overlap.
    """
    parts = [
        f"Chapter {k['athikaram_num']}: {k['athikaram_ta']} ({k['athikaram_en']}).",
        f"Section: {k['pal_ta']} ({k['pal_en']}) - Subdivision: {k['iyal_ta']} ({k['iyal_en']}).",
        f"Verse: {k['line1']} {k['line2']}.",
        f"English Translation: {k['translation_en']}.",
        f"Explanation: {k['explanation_en']}.",
        f"Commentary by Mu. Varadarajan: {k['urais']['mu_va']}.",
        f"Commentary by Solomon Pappaiah: {k['urais']['pappaiah']}.",
        f"Commentary by Kalaignar Karunanidhi: {k['urais']['karunanidhi']}."
    ]
    return " ".join(parts)


def main():
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    
    # 1. Fetch raw datasets
    kural_raw = fetch_json(KURAL_DATA_URL, "Thirukkural couplets and commentaries")
    detail_raw = fetch_json(DETAIL_DATA_URL, "Chapter and Section hierarchy")
    
    kurals_list = kural_raw.get("kural", [])
    if len(kurals_list) != EXPECTED_KURAL_COUNT:
        print(f"[!] Warning: Expected {EXPECTED_KURAL_COUNT} kurals, got {len(kurals_list)}")
    
    # 2. Parse hierarchy
    hierarchy_map = parse_detail_hierarchy(detail_raw)
    
    # 3. Clean and merge
    processed_kurals = []
    search_contexts = []
    
    for item in kurals_list:
        k_num = item.get("Number")
        hier = hierarchy_map.get(k_num, {})
        
        record = {
            "id": k_num,
            "line1": item.get("Line1", "").strip(),
            "line2": item.get("Line2", "").strip(),
            "translation_en": item.get("Translation", "").strip(),
            "explanation_en": item.get("explanation", "").strip(),
            "couplet_en": item.get("couplet", "").strip(),
            "transliteration1": item.get("transliteration1", "").strip(),
            "transliteration2": item.get("transliteration2", "").strip(),
            "pal_ta": hier.get("pal_ta", ""),
            "pal_en": hier.get("pal_en", ""),
            "pal_trans": hier.get("pal_trans", ""),
            "iyal_ta": hier.get("iyal_ta", ""),
            "iyal_en": hier.get("iyal_en", ""),
            "iyal_trans": hier.get("iyal_trans", ""),
            "athikaram_num": hier.get("athikaram_num", 0),
            "athikaram_ta": hier.get("athikaram_ta", ""),
            "athikaram_en": hier.get("athikaram_en", ""),
            "athikaram_trans": hier.get("athikaram_trans", ""),
            "urais": {
                "mu_va": item.get("mv", "").strip(),
                "pappaiah": item.get("sp", "").strip(),
                "karunanidhi": item.get("mk", "").strip(),
            }
        }
        processed_kurals.append(record)
        search_contexts.append(build_search_context(record))
    
    # 4. Save JSON dataset
    print(f"[*] Writing {len(processed_kurals)} Kurals to {OUTPUT_JSON_PATH}...")
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(processed_kurals, f, ensure_ascii=False, indent=2)
    
    json_size_mb = os.path.getsize(OUTPUT_JSON_PATH) / (1024 * 1024)
    print(f"[✓] kurals.json saved ({json_size_mb:.2f} MB)")
    
    # 5. Compute embeddings
    print(f"[*] Loading embedding model '{MODEL_NAME}'...")
    model = SentenceTransformer(MODEL_NAME)
    
    print(f"[*] Computing normalized embeddings for {len(search_contexts)} contexts...")
    embeddings = model.encode(
        search_contexts,
        batch_size=64,
        show_progress_bar=True,
        normalize_embeddings=True,
        convert_to_numpy=True
    )
    
    embeddings_f32 = embeddings.astype(np.float32)
    print(f"[*] Embeddings array shape: {embeddings_f32.shape}, dtype: {embeddings_f32.dtype}")
    
    if embeddings_f32.shape != (EXPECTED_KURAL_COUNT, EMBEDDING_DIM):
        raise ValueError(f"Unexpected embeddings shape {embeddings_f32.shape}")
    
    # 6. Save binary embeddings
    print(f"[*] Saving flat binary embeddings to {OUTPUT_BIN_PATH}...")
    with open(OUTPUT_BIN_PATH, "wb") as f:
        f.write(embeddings_f32.tobytes())
    
    actual_byte_size = os.path.getsize(OUTPUT_BIN_PATH)
    print(f"[✓] Binary embeddings saved: {actual_byte_size} bytes (Expected: {EXPECTED_BYTE_SIZE})")
    
    if actual_byte_size != EXPECTED_BYTE_SIZE:
        raise ValueError(f"Byte size mismatch! Got {actual_byte_size}, expected {EXPECTED_BYTE_SIZE}")
    
    print("\n[🎉] Thirukkural Data & Vector generation completed successfully!")


if __name__ == "__main__":
    main()
