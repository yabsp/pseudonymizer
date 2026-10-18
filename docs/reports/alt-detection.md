# alt-detection: alternative detection approaches (final report, 2026-10-18)

Branch `alt/detection`. Benchmark harness in `tests/bench/` (candidate runner, scorer with the corpus metrics of
tune/detection, restricted-ensemble filter, consistency-rules prototype). Nothing was built into the app: no
alternative was clearly better without a cost the user has to decide on (see "Open decisions").

## Setup
- 84 documents: 29 test fixtures and 55 documents from the shared corpus (pseudonymizer-corpus, truth files of 2026-10-17).
- Metrics as tests/model/corpus-eval.mjs on tune/detection: leaks = truth values still in the text, over-redacted =
  keep entries hidden, unrelated = hidden text that is neither a value nor contains one.
- This branch's core (patterns + addDetected), i.e. WITHOUT tune/detection's new rules; the numbers compare
  candidates with each other, not with tune/detection's dev-set numbers (29 of 4102 leaks for GLiNER at 0.4).
- pharma-en-01 alone has 397 values, of which the baseline leaks 308, so totals are also given without it (83 docs).
- Detection ran on the RTX 2070 (CUDA torch, same gliner 0.2.29); times are GPU times.

## Results

| Candidate | leaks 84 docs (of 3922) | leaks 83 docs (of 3525) | over-redacted 83 (of 844) | unrelated 83 |
|---|---|---|---|---|
| GLiNER multi PII v1 @0.4 (baseline) | 389 | 81 | 76 | 831 |
| + consistency rules (initials, towns, spellings) | 362 | 55 | 80 | 852 |
| GLiNER2-PII (fastino) alone @0.5 | 417 | 227 | 91 | 1329 |
| OpenAI Privacy Filter alone (fixtures only) | 76 of 496 (GLiNER: 3) | - | - | - |
| GLiNER + GLiNER2 all categories | 226 | 45 | 120 | 1713 |
| GLiNER + GLiNER2 PERSON, ID, ADDRESS @0.5 | 237 | 56 | 87 | 973 |
| GLiNER + LLM reviewer (Qwen3-4B) | 126 | 59 | 99 | 1105 |
| consistency + GLiNER2 PERSON, ID, ADDRESS | 223 | 42 | 89 | 980 |
| consistency + LLM reviewer | 105 | 38 | 103 | 1123 |
| consistency + GLiNER2 restricted + LLM reviewer | 81 | 32 | 110 | 1227 |

Speed and size: GLiNER2-PII 1.23 GB, 205M parameters, 55 s for 84 docs on the GPU (GLiNER: 147 s, both
with the same 150-word windows). LLM reviewer: Qwen3-4B-Instruct-2507 Q4_K_M, 2.5 GB file, 2.2 GB VRAM, median
4.7 s per document, max 102 s (pharma-en-01), 783 s for all 84 on the GPU; on the CPU (shared, with JSON
grammar) 60 to 95 s per document. Privacy Filter: 2.8 GB, used 16 GB RAM and hung on the first long corpus document.

## Findings
- GLiNER2-PII is worse than GLiNER alone, but as a second model restricted to PERSON, ID and ADDRESS it cuts leaks
  by 24% (55 -> 42 with the consistency rules) for +9 over-redacted values (+11%) and +15% unrelated hits. Its
  COMPANY hits are what over-redacts (product and insurance names: "Microsoft Teams", "Prévoyance professionnelle LPP").
- The LLM reviewer (second pass over the pseudonymized text, values must appear literally) catches what both NER
  models miss: town names in tables (pharma-en-01: 308 -> about 67 leaks), initials, file names, account numbers.
  But it hides diagnoses and legal references ("Diabetes mellitus Typ 2", "COPD GOLD 3", "art. 199 CO"), which
  takes away the context doctors and lawyers need. It is too slow on a laptop CPU.
- llama.cpp tips: JSON grammar mode (`response_format`) made answers 28x slower; a long system prompt listing
  exclusions made Qwen3-4B answer NONE on obvious leftovers; one user message with a short instruction works.
- CUDA for llama-cpp-python on Windows works with the cu124 wheel plus the pip packages nvidia-cuda-runtime-cu12
  and nvidia-cublas-cu12 with their `bin` folders on PATH (os.add_dll_directory alone was not enough).

## Rejected
- OpenAI Privacy Filter (Apache-2.0): 25x more leaks than GLiNER on the fixtures, no organisation category, 16 GB RAM.
- E3-JSI/gliner-multi-pii-domains-v1 (Apache-2.0): fixtures 25 leaks vs 9 for the current model.
- GLiNER2-PII as a replacement for GLiNER; a second GLiNER pass over the pseudonymized text (leaks 9 -> 5 but
  over-redaction 3 -> 10 and 3x time).

## Open decisions for the user
1. GLiNER2-PII as an optional second detector (PERSON, ID, ADDRESS only): about -24% leaks, +1.2 GB download for the
   desktop app, extra detection time (CPU time not measured yet). Compare with GLiNER + Presidio on tune/detection
   (29 -> 13 leaks but 91 -> 178 over-redacted): GLiNER2 restricted seems the gentler trade, but it must be measured on
   tune/detection's dev set with its new core rules before deciding.
2. LLM reviewer as an opt-in "second opinion" on a GPU only, showing its finds as suggestions to confirm in the review
   instead of hiding them (it over-redacts diagnoses). 2.5 GB model, llama-cpp-python (MIT) in the helper.
3. Neither is implemented in the app; both would be a new detector in DETECTORS with a wrapper file in python/.

## Open work
- CPU timing of GLiNER2-PII and of the free-text LLM prompt; Qwen3-1.7B (downloaded, not measured).
- Rerun the best ensembles through tune/detection's corpus-eval.mjs with its final core.

## Downloads (all on E:)
openai/privacy-filter 2.8 GB Apache-2.0; fastino/gliner2-privacy-filter-PII-multi 1.23 GB Apache-2.0;
E3-JSI/gliner-multi-pii-domains-v1 1.16 GB Apache-2.0 (rejected, can be deleted); unsloth/Qwen3-4B-Instruct-2507-GGUF
Q4_K_M 2.5 GB Apache-2.0; Qwen/Qwen3-1.7B-GGUF Q8_0 1.8 GB Apache-2.0; torch 2.8.0+cu126 2.9 GB BSD-3 (venv alt-gpu);
gliner2 2.1.0 Apache-2.0, transformers 5.16.1 Apache-2.0 (alt-gpu); llama-cpp-python 0.3.36 MIT (venvs alt-llm, alt-llm-cuda);
nvidia-cuda-runtime-cu12, nvidia-cublas-cu12, nvidia-cuda-nvrtc-cu12 about 0.9 GB, NVIDIA EULA (alt-llm-cuda).
Venvs: E:\Projects\pseudonymizer-venvs\alt-gpu, alt-llm, alt-llm-cuda. Runs: E:\Projects\pseudonymizer-scratch\alt-detection\runs.
