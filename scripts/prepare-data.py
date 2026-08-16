#!/usr/bin/env python3
"""
prepare-data.py
Clean, data-driven ingestion pipeline that merges classical Tamil commentaries with modern
21st-century English translations, computes 384-dimensional dense vectors using
paraphrase-multilingual-MiniLM-L12-v2, and exports public/kurals.json and public/kural-embeddings.bin.
"""

import json
import os
import sys
import numpy as np
import requests
from sentence_transformers import SentenceTransformer

# Data Sources
KURAL_DATA_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json"
DETAIL_DATA_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/detail.json"
MODERN_ENG_URL = "https://raw.githubusercontent.com/jjasim/Thirukkural-English-Translation-Dataset/master/Thirukural_Eng.txt"

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


def fetch_text(url: str, description: str) -> str:
    print(f"[*] Fetching {description} from {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.text


def parse_detail_hierarchy(detail_data: list) -> dict[int, dict]:
    kural_map = {}
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


def parse_modern_english(raw_text: str) -> dict[int, str]:
    """
    Parses Jasim modern English translation dataset lines into a clean map.
    Replaces '$' line delimiters with spaces and strips formatting.
    """
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    modern_map = {}
    for idx, line in enumerate(lines, start=1):
        clean_text = line.replace("$", " ").replace("  ", " ").strip()
        modern_map[idx] = clean_text
    return modern_map


def build_search_context(k: dict) -> str:
    """
    Forms rich multi-lingual searchable text payload combining classical Tamil couplets,
    3 classical Tamil commentaries, modern English interpretations, and structural metadata.
    """
    parts = [
        f"Thirukkural {k['id']}: {k['line1']} {k['line2']}.",
        f"Chapter {k['athikaram_num']}: {k['athikaram_ta']} ({k['athikaram_en']}).",
        f"Section: {k['pal_ta']} ({k['pal_en']}) - Subdivision: {k['iyal_ta']} ({k['iyal_en']}).",
        f"Modern English Interpretation: {k['modern_en']}.",
        f"English Translation & Explanation: {k['translation_en']}. {k['explanation_en']}.",
        f"Transliteration: {k.get('transliteration1', '')} {k.get('transliteration2', '')}.",
        f"மு. வரதராசனார் உரை: {k['urais']['mu_va']}.",
        f"சாலமன் பாப்பையா உரை: {k['urais']['pappaiah']}.",
        f"கலைஞர் மு. கருணாநிதி உரை: {k['urais']['karunanidhi']}."
    ]
    return " ".join(parts)


def main():
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    
    # 1. Fetch raw datasets from primary sources
    kural_raw = fetch_json(KURAL_DATA_URL, "Thirukkural couplets & commentaries (tk120404)")
    detail_raw = fetch_json(DETAIL_DATA_URL, "Chapter & Section hierarchy (tk120404)")
    modern_raw = fetch_text(MODERN_ENG_URL, "Modern English Translation dataset (jjasim)")
    
    kurals_list = kural_raw.get("kural", [])
    if len(kurals_list) != EXPECTED_KURAL_COUNT:
        print(f"[!] Warning: Expected {EXPECTED_KURAL_COUNT} kurals, got {len(kurals_list)}")
    
    # 2. Parse hierarchy and modern translations
    hierarchy_map = parse_detail_hierarchy(detail_raw)
    modern_map = parse_modern_english(modern_raw)
    
    # 3. Clean and merge
    processed_kurals = []
    search_contexts = []
    
    for item in kurals_list:
        k_num = item.get("Number")
        hier = hierarchy_map.get(k_num, {})
        modern_text = modern_map.get(k_num, item.get("Translation", "").strip())
        
        record = {
            "id": k_num,
            "line1": item.get("Line1", "").strip(),
            "line2": item.get("Line2", "").strip(),
            "modern_en": modern_text,
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
    
    # Write processed JSON
    print(f"[*] Writing {len(processed_kurals)} kurals to {OUTPUT_JSON_PATH}...")
    with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(processed_kurals, f, ensure_ascii=False, indent=2)
    print(f"[✓] Successfully wrote {OUTPUT_JSON_PATH} ({os.path.getsize(OUTPUT_JSON_PATH):,} bytes)")
    
    # 4. Generate 384-d normalized embeddings
    print(f"[*] Loading SentenceTransformer model: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    
    print(f"[*] Encoding {len(search_contexts)} kural search contexts...")
    embeddings = model.encode(
        search_contexts,
        batch_size=32,
        show_progress_bar=True,
        normalize_embeddings=True,  # Crucial: L2 normalized so dot product == cosine similarity
        convert_to_numpy=True
    )
    
    # Ensure float32 format
    embeddings_f32 = embeddings.astype(np.float32)
    assert embeddings_f32.shape == (EXPECTED_KURAL_COUNT, EMBEDDING_DIM), f"Invalid shape: {embeddings_f32.shape}"
    
    print(f"[*] Writing binary embeddings to {OUTPUT_BIN_PATH}...")
    embeddings_f32.tofile(OUTPUT_BIN_PATH)
    
    actual_byte_size = os.path.getsize(OUTPUT_BIN_PATH)
    print(f"[✓] Binary embeddings size: {actual_byte_size:,} bytes (Expected: {EXPECTED_BYTE_SIZE:,} bytes)")
    assert actual_byte_size == EXPECTED_BYTE_SIZE, f"Byte size mismatch: {actual_byte_size} != {EXPECTED_BYTE_SIZE}"
    print("[✓] All data preparation completed successfully!")


if __name__ == "__main__":
    main()
