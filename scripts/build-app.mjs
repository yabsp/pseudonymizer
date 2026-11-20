// "npm run build": the desktop app for this computer's system and processor, as an installer for people who don't
// use a terminal: Windows an installer (.exe, per user, no administrator rights), Linux an AppImage, macOS a disk
// image (.dmg). Everything goes in: Electron, the app, the parts of the packages it uses (with the accelerator
// libraries of this system that "npm run setup" installed) and the detection model of models/gliner. The result is
// in dist/. Run "npm run setup" first.
//
//   npm run build            the installer
//   npm run build -- --dir   only the unpacked app (dist/*-unpacked), to try it without installing
//
// electron-builder downloads its own tools (NSIS on Windows, the AppImage tools on Linux) on the first build; they
// are kept in .cache/electron-builder, like everything else, inside the project folder.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_DIR = path.join(ROOT, 'models', 'gliner');
const ELECTRON_DIST = path.join(ROOT, 'node_modules', 'electron', 'dist');
const ORT_BIN = 'node_modules/onnxruntime-node/bin/napi-v6';
const SYSTEMS = { win32: 'windows', linux: 'linux', darwin: 'macos' };
const ONLY_FOLDER = process.argv.includes('--dir');

function fail(message) {
  console.error(`\nBuild stopped: ${message}`);
  process.exit(1);
}

if (!Object.hasOwn(SYSTEMS, process.platform)) fail(`apps are built for Windows, Linux and macOS, not for ${process.platform}.`);
if (!fs.existsSync(ELECTRON_DIST)) fail('Electron is missing. Run "npm run setup" first.');
if (!fs.existsSync(path.join(MODEL_DIR, 'model.json'))) fail('the detection model is missing. Run "npm run setup" first.');

// Before electron-builder is loaded: its downloads and its temporary files (a copy of the whole app while the
// installer is made) go into the project folder, not the user's.
process.env.ELECTRON_BUILDER_CACHE = path.join(ROOT, '.cache', 'electron-builder');
process.env.ELECTRON_CACHE = path.join(ROOT, '.cache', 'electron');
const TEMP = path.join(ROOT, '.cache', 'tmp');
fs.mkdirSync(TEMP, { recursive: true });
for (const name of ['TEMP', 'TMP', 'TMPDIR']) process.env[name] = TEMP;
const { default: builder } = await import('electron-builder');

const { version: electronVersion } = JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules', 'electron', 'package.json'), 'utf8'));
const model = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, 'model.json'), 'utf8'));
// Only the model in use, with its data file if it has one, and what reads text for it.
const modelFiles = ['model.json', model.file, `${model.file}_data`, 'tokenizer.json', 'tokenizer_config.json', 'gliner_config.json']
  .filter((name) => fs.existsSync(path.join(MODEL_DIR, name)));
// ONNX Runtime ships its libraries for every system; only this one's go in.
const otherSystems = fs.readdirSync(path.join(ROOT, ORT_BIN)).flatMap((system) => fs.readdirSync(path.join(ROOT, ORT_BIN, system)).map((arch) => `${system}/${arch}`))
  .filter((folder) => folder !== `${process.platform}/${process.arch}`);
const artifactName = `\${productName}-\${version}-${SYSTEMS[process.platform]}-\${arch}.\${ext}`;

const config = {
  appId: 'app.pseudonymizer.desktop',
  productName: 'Pseudonymizer',
  directories: { output: 'dist' },
  electronDist: ELECTRON_DIST,
  electronVersion,
  // The packages' programs are made for any Node; nothing is compiled.
  npmRebuild: false,
  asar: true,
  // Libraries are loaded by the system, which can't read them inside the app's archive.
  asarUnpack: [`${ORT_BIN}/**`],
  files: [
    'package.json', 'desktop/**', 'server/**', 'public/**', 'config/**', 'prompts/*.default.*',
    '!**/*.map', '!**/*.d.ts',
    ...otherSystems.map((folder) => `!${ORT_BIN}/${folder}/**`),
    // What the app does not use: install scripts, other builds of pdf.js and Tesseract, sources.
    '!node_modules/onnxruntime-node/script/**',
    '!node_modules/pdfjs-dist/{legacy,web,types,image_decoders,iccs}/**',
    '!node_modules/tesseract.js/src/**',
    '!node_modules/tesseract.js-core/*.wasm',
    '!node_modules/tesseract.js-core/tesseract-core{,-simd,-relaxedsimd}.{js,wasm.js}',
  ],
  extraResources: [{ from: 'models/gliner', to: 'models/gliner', filter: modelFiles }],
  // Electron's own ways to run other code with the app's program are switched off, and the app only starts from
  // its own unchanged archive.
  electronFuses: {
    runAsNode: false,
    enableNodeOptionsEnvironmentVariable: false,
    enableNodeCliInspectArguments: false,
    enableEmbeddedAsarIntegrityValidation: true,
    onlyLoadAppFromAsar: true,
    grantFileProtocolExtraPrivileges: false,
  },
  // No updates over the internet: no update information next to the installers.
  publish: null,
  win: { target: 'nsis', icon: 'desktop/icons/icon.ico', artifactName },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    differentialPackage: false,
    artifactName: artifactName.replace('.${ext}', '-setup.${ext}'),
  },
  linux: { target: 'AppImage', icon: 'desktop/icons/icon.png', category: 'Office', artifactName },
  mac: { target: 'dmg', icon: 'desktop/icons/icon.png', category: 'public.app-category.productivity', artifactName },
};

const platform = { win32: builder.Platform.WINDOWS, linux: builder.Platform.LINUX, darwin: builder.Platform.MAC }[process.platform];
const arch = builder.Arch[process.arch];
if (arch === undefined) fail(`no app can be built for the processor type ${process.arch}.`);
console.log(`Building Pseudonymizer for ${SYSTEMS[process.platform]} (${process.arch}), Electron ${electronVersion}, ${model.name}.`);
let artifacts;
try {
  artifacts = await builder.build({
    projectDir: ROOT,
    targets: platform.createTarget(ONLY_FOLDER ? ['dir'] : null, arch),
    config,
    publish: 'never',
  });
} catch (e) {
  fail(e.message);
}

const megabytes = (bytes) => `${Math.round(bytes / 1e6)} MB`;
console.log('\nBuilt:');
for (const file of artifacts.filter((f) => !f.endsWith('.blockmap') && !f.endsWith('.yml'))) console.log(`  ${path.relative(ROOT, file)} (${megabytes(fs.statSync(file).size)})`);
const unpacked = fs.readdirSync(path.join(ROOT, 'dist')).filter((name) => name.endsWith('-unpacked'));
for (const name of unpacked) console.log(`  dist/${name}/ (the app unpacked)`);
