// Copies the detection models from the local Hugging Face cache into build/models, so the installer ships them
// and the app never downloads anything. Links in the cache are resolved, so the copy also works on Windows.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = process.env.HF_HOME ? path.join(process.env.HF_HOME, 'hub') : path.join(os.homedir(), '.cache', 'huggingface', 'hub');
const TARGET = path.join(ROOT, 'build', 'models', 'hub');
// GLiNER and the tokenizer of the model it is built on; both are loaded when GLiNER starts.
const MODELS = ['urchade/gliner_multi_pii-v1', 'microsoft/mdeberta-v3-base'];

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
    throw new Error(`${id} is not in ${SOURCE}. Run detection once with "npm start" so it is downloaded, then build again.`);
  }
  for (const part of ['refs', 'snapshots', '.no_exist']) {
    if (fs.existsSync(path.join(from, part))) copyResolvingLinks(path.join(from, part), path.join(TARGET, cacheFolder(id), part));
  }
  console.log('copied', id);
}
