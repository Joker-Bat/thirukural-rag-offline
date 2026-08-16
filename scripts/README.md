# Data Preparation & Vector Generation Pipeline

This module is responsible for ingesting the full 1,330 Thirukkural corpus, parsing hierarchical metadata (Paal, Iyal, Athikaram), constructing cross-lingual search contexts, and generating normalized 384-dimensional dense vectors.

## Requirements
Managed via `uv` with Python 3.10+:
- `sentence-transformers>=3.0.0`
- `numpy>=1.24.0`
- `requests>=2.31.0`

## Execution
From the project root:
```bash
cd scripts
uv run prepare-data.py
```

## Generated Outputs
- `../public/kurals.json`: Clean JSON array of all 1,330 structured Kural records.
- `../public/kural-embeddings.bin`: A contiguous flat `Float32Array` of size $1330 \times 384 = 510,720$ float32 numbers (exactly 2,042,880 bytes).
