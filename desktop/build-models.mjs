// Copies the detection models from the local Hugging Face cache into build/models, so the installer ships them
// and the app never downloads anything. Links in the cache are resolved, so the copy also works on Windows.
// The models are taken from HF_HOME and DOCLING_ARTIFACTS_PATH, else from the project's models/ folder that
// "npm run setup" fills, else from the libraries' caches in the home folder.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_MODELS = path.join(ROOT, 'models');
const projectOr = (name, otherwise) => (fs.existsSync(path.join(PROJECT_MODELS, name)) ? path.join(PROJECT_MODELS, name) : otherwise);
const SOURCE = path.join(process.env.HF_HOME || projectOr('huggingface', path.join(os.homedir(), '.cache', 'huggingface')), 'hub');
const TARGET = path.join(ROOT, 'build', 'models', 'hub');
// GLiNER and the tokenizer of the model it is built on; both are loaded when GLiNER starts.
const MODELS = ['urchade/gliner_multi_pii-v1', 'microsoft/mdeberta-v3-base'];
// Docling's models as python/document_extraction.py uses them (layout, tables, formulas, OCR), from the folder
// docling-tools downloaded them to; the ONNX copy of the layout model is not used, so it is not shipped.
const DOCLING_SOURCE = process.env.DOCLING_ARTIFACTS_PATH || projectOr('docling', path.join(os.homedir(), '.cache', 'docling', 'models'));
const DOCLING_TARGET = path.join(ROOT, 'build', 'models', 'docling');
const DOCLING_MODELS = ['docling-project--docling-layout-heron', 'docling-project--docling-models', 'docling-project--CodeFormulaV2', 'RapidOcr'];

const cacheFolder = (id) => 'models--' + id.replace('/', '--');

/** Like fs.cpSync, but every link is replaced by the file it points to (the cache links into blobs/). */
function copyResolvingLinks(from, to) {
  if (fs.statSync(from).isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) copyResolvingLinks(path.join(from, name), path.join(to, name));
  } else {
    fs.copyFileSync(from, to);
  }
}

fs.rmSync(TARGET, { recursive: true, force: true });
for (const id of MODELS) {
  const from = path.join(SOURCE, cacheFolder(id));
  if (!fs.existsSync(path.join(from, 'refs', 'main'))) {
    throw new Error(`${id} is not in ${SOURCE}. Run "npm run setup" (or detection once with "npm start") so it is downloaded, then build again.`);
  }
  for (const part of ['refs', 'snapshots', '.no_exist']) {
    if (fs.existsSync(path.join(from, part))) copyResolvingLinks(path.join(from, part), path.join(TARGET, cacheFolder(id), part));
  }
  console.log('copied', id);
}

fs.rmSync(DOCLING_TARGET, { recursive: true, force: true });
for (const name of DOCLING_MODELS) {
  const from = path.join(DOCLING_SOURCE, name);
  if (!fs.existsSync(from)) throw new Error(`${name} is not in ${DOCLING_SOURCE}. Run "npm run setup", or download the Docling models as docs/setup.md says, then build again.`);
  copyResolvingLinks(from, path.join(DOCLING_TARGET, name));
  console.log('copied', name);
}
