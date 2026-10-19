"""The only place that knows about hardware: which processors and GPUs this machine has, which back ends can use
them, how GLiNER is loaded on one, and whether its results can be trusted. Everything runs on this machine.

Back ends: PyTorch on the CPU, an NVIDIA GPU (CUDA), an Intel GPU (XPU) or Apple silicon (MPS), and ONNX Runtime
with CUDA, DirectML (Windows, any GPU), CoreML (macOS) or the CPU. Which ones work depends on the installed
packages: PyTorch has one build per kind of GPU, ONNX Runtime one package per provider."""
import json
import os
import platform
import re
import shutil
import subprocess
import sys

# ONNX Runtime (1.31.0, Linux too) sends usage telemetry to Microsoft (mobile.events.data.microsoft.com) as soon as it
# is imported, unless this is set first; its disable_telemetry_events() comes too late. gliner_helper.py and
# document_extraction.py import this module before gliner and docling, which load ONNX Runtime; forced, not a default.
os.environ['ORT_DISABLE_TELEMETRY'] = '1'

# Tried in this order by "auto": GPUs first, then the CPU. ONNX Runtime on the CPU is not picked automatically:
# measured on an Intel Core Ultra 7 it was no faster than PyTorch, and it needs the model exported first.
AUTO_ORDER = ['torch-cuda', 'onnx-cuda', 'torch-xpu', 'onnx-directml', 'torch-mps', 'onnx-coreml', 'torch-cpu']
BACKEND_IDS = AUTO_ORDER + ['onnx-cpu']
# ONNX Runtime providers this app may use, all local. Others are never passed, among them
# AzureExecutionProvider, which can send the model's input to Azure.
ONNX_PROVIDERS = {'onnx-cuda': 'CUDAExecutionProvider', 'onnx-directml': 'DmlExecutionProvider',
                  'onnx-coreml': 'CoreMLExecutionProvider', 'onnx-cpu': 'CPUExecutionProvider'}
TORCH_DEVICES = {'torch-cuda': 'cuda', 'torch-xpu': 'xpu', 'torch-mps': 'mps', 'torch-cpu': 'cpu'}
# Docling's device for each back end; ONNX Runtime providers map to the PyTorch device of the same hardware.
DOCLING_DEVICES = {'torch-cuda': 'cuda', 'onnx-cuda': 'cuda', 'torch-xpu': 'xpu', 'torch-mps': 'mps', 'onnx-coreml': 'mps'}
LABELS = {
    'torch-cuda': 'NVIDIA GPU (PyTorch CUDA)', 'onnx-cuda': 'NVIDIA GPU (ONNX Runtime CUDA)',
    'torch-xpu': 'Intel GPU (PyTorch XPU)', 'onnx-directml': 'GPU via DirectML (ONNX Runtime, Windows)',
    'torch-mps': 'Apple GPU (PyTorch MPS)', 'onnx-coreml': 'Apple Neural Engine and GPU (ONNX Runtime CoreML)',
    'torch-cpu': 'CPU (PyTorch)', 'onnx-cpu': 'CPU (ONNX Runtime)',
}
INSTALL_HINTS = {
    'torch-cuda': 'Install the CUDA build of PyTorch from pytorch.org into .venv (needs an NVIDIA GPU and driver).',
    'torch-xpu': 'Install the XPU build of PyTorch from pytorch.org into .venv (needs Intel GPU drivers).',
    'torch-mps': 'Only on Macs with Apple silicon.',
    'onnx-cuda': 'Install onnxruntime-gpu instead of onnxruntime (needs an NVIDIA GPU, driver and CUDA).',
    'onnx-directml': 'Windows only: install onnxruntime-directml instead of onnxruntime.',
    'onnx-coreml': 'macOS only, with onnxruntime.',
    'onnx-cpu': 'Install onnxruntime into .venv.',
}
COMMAND_TIMEOUT_S = 5
# Windows per GLiNER call on a GPU; 8 and 16 gave the same values as one at a time on the Arc iGPU.
GPU_BATCH_WINDOWS = 8
# Where exported ONNX models are kept: PSEUDONYMIZER_CACHE, or the user's cache folder.
CACHE_DIR = os.environ.get('PSEUDONYMIZER_CACHE') or os.path.join(
    os.environ.get('LOCALAPPDATA') or os.path.join(os.path.expanduser('~'), '.cache'), 'pseudonymizer')
# A model id usable as a folder name: "/" becomes "--" ("urchade/gliner_multi_pii-v1" -> "urchade--gliner_multi_pii-v1").
MODEL_FOLDER = re.compile(r'[^\w.-]+')

# Synthetic text for checking a back end against the CPU: names, places, numbers in four languages.
CANARY_TEXT = ('Patientin Maria Keller, geboren am 14.02.1961, wohnt an der Rebgasse 21 in Basel. '
               'Monsieur Thierry Baud travaille chez Horlogerie Fleurier SA. '
               'Il signor Matteo Ghirlanda, telefono 091 825 44 10. Contact: hans.muster@example.com')
CANARY_LABELS = ['person', 'address', 'organization', 'date of birth', 'phone number', 'email address']
CANARY_THRESHOLD = 0.4
# A value the CPU finds with at least this score must be found by the back end too, and the other way round.
# Values between the threshold and this score may tip either way through tiny numeric differences.
CANARY_CERTAIN = 0.6


def _run(command):
    """Output of a short system command, or '' if it is missing, fails or takes too long."""
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=COMMAND_TIMEOUT_S, check=False)
        return result.stdout.strip() if result.returncode == 0 else ''
    except (OSError, subprocess.SubprocessError):
        return ''


def _cpu_name():
    if sys.platform.startswith('linux'):
        try:
            with open('/proc/cpuinfo', encoding='utf-8') as f:
                for line in f:
                    if line.startswith('model name'):
                        return line.split(':', 1)[1].strip()
        except OSError:
            pass  # fall back to platform.processor() below
    if sys.platform == 'darwin':
        return _run(['sysctl', '-n', 'machdep.cpu.brand_string']) or platform.processor()
    return platform.processor() or platform.machine()


def _memory_gb():
    try:
        import psutil
        return round(psutil.virtual_memory().total / 1024 ** 3, 1)
    except ImportError:
        return None


def _gpus():
    """Names of the graphics adapters, read the way each system offers them."""
    names = []
    nvidia = shutil.which('nvidia-smi') and _run(['nvidia-smi', '--query-gpu=name', '--format=csv,noheader'])
    if nvidia:
        names += [f'NVIDIA {n}' if not n.startswith('NVIDIA') else n for n in nvidia.splitlines()]
    if sys.platform == 'win32':
        listed = _run(['powershell', '-NoProfile', '-Command', 'Get-CimInstance Win32_VideoController | ForEach-Object Name'])
        names += [n.strip() for n in listed.splitlines() if n.strip()]
    elif sys.platform == 'darwin':
        names += [line.split(':', 1)[1].strip() for line in _run(['system_profiler', 'SPDisplaysDataType']).splitlines()
                  if 'Chipset Model' in line]
    elif shutil.which('lspci'):
        # lspci lines like "00:02.0 VGA compatible controller: Intel Corporation Meteor Lake-P [Intel Arc Graphics]"
        names += [line.split(': ', 1)[1] for line in _run(['lspci']).splitlines()
                  if re.search(r'VGA|3D controller|Display controller|Processing accelerators', line) and ': ' in line]
    return list(dict.fromkeys(names))


def _torch_status():
    try:
        import torch
    except ImportError as e:
        return None, {key: f'PyTorch is not installed ({e}).' for key in TORCH_DEVICES}
    reasons = {}
    if not torch.cuda.is_available():
        reasons['torch-cuda'] = f'This PyTorch ({torch.__version__}) has no CUDA support or finds no NVIDIA GPU.'
    if not (hasattr(torch, 'xpu') and torch.xpu.is_available()):
        reasons['torch-xpu'] = f'This PyTorch ({torch.__version__}) has no XPU support or finds no Intel GPU.'
    if not (hasattr(torch.backends, 'mps') and torch.backends.mps.is_available()):
        reasons['torch-mps'] = 'No Apple GPU (MPS) available.'
    return torch, reasons


def _torch_device_name(torch, backend):
    if backend == 'torch-cuda':
        return torch.cuda.get_device_name(0)
    if backend == 'torch-xpu':
        return torch.xpu.get_device_name(0)
    return None


def _onnx_providers():
    try:
        import onnxruntime
        return set(onnxruntime.get_available_providers()), onnxruntime.__version__
    except ImportError:
        return None, None


def backend_status():
    """[{id, label, available, reason?, device?}] for every back end, in the order "auto" tries them."""
    torch, torch_reasons = _torch_status()
    providers, onnx_version = _onnx_providers()
    result = []
    for backend in BACKEND_IDS:
        entry = {'id': backend, 'label': LABELS[backend], 'available': False}
        if backend in TORCH_DEVICES:
            reason = torch_reasons.get(backend)
            if reason is None and torch is not None:
                # is_available() only counts devices: PyTorch's XPU build reports one even when its GPU runtime
                # can't open it (e.g. driver libraries missing), and only opening the device shows that.
                try:
                    entry['device'] = _torch_device_name(torch, backend)
                    entry['available'] = True
                except RuntimeError as e:
                    reason = f'PyTorch finds this GPU but can\'t use it ({e}). Check the GPU drivers.'
        elif providers is None:
            reason = 'ONNX Runtime is not installed.'
        elif ONNX_PROVIDERS[backend] not in providers:
            reason = f'This ONNX Runtime ({onnx_version}) has no {ONNX_PROVIDERS[backend]}.'
        else:
            entry['available'] = True
            reason = None
        if reason:
            entry['reason'] = reason
            if backend in INSTALL_HINTS:
                entry['hint'] = INSTALL_HINTS[backend]
        result.append({k: v for k, v in entry.items() if v is not None})
    return result


def probe():
    """What the Settings tab shows: this machine and every back end."""
    torch, _ = _torch_status()
    _, onnx_version = _onnx_providers()
    return {
        'system': {
            'os': f'{platform.system()} {platform.release()}',
            'architecture': platform.machine(),
            'cpu': _cpu_name(),
            'threads': os.cpu_count(),
            'memoryGb': _memory_gb(),
            'gpus': _gpus(),
            'python': platform.python_version(),
            'torch': getattr(torch, '__version__', None),
            'onnxruntime': onnx_version,
        },
        'backends': backend_status(),
    }


def resolve(requested):
    """The back end to use: the requested one if it is available, for "auto" the first available one."""
    if requested != 'auto' and requested not in BACKEND_IDS:
        raise ValueError(f'unknown hardware "{requested}", expected auto or one of {", ".join(BACKEND_IDS)}')
    status = {b['id']: b for b in backend_status()}
    if requested == 'auto':
        # torch-cpu also when PyTorch reports nothing, e.g. a GLiNER stand-in in tests
        return next((b for b in AUTO_ORDER if status[b]['available']), 'torch-cpu')
    if not status[requested]['available']:
        raise RuntimeError(f'{LABELS[requested]} is not available on this machine. {status[requested].get("reason", "")}')
    return requested


def docling_device(backend):
    return DOCLING_DEVICES.get(backend, 'cpu')


def onnx_folder(model_name):
    return os.path.join(CACHE_DIR, 'onnx', MODEL_FOLDER.sub('--', model_name))


def _export_onnx(model_name):
    """Exports the model once with GLiNER's own PyTorch exporter; later runs reuse the files."""
    folder = onnx_folder(model_name)
    if os.path.exists(os.path.join(folder, 'model.onnx')):
        return folder
    from gliner import GLiNER
    GLiNER.from_pretrained(model_name).export_to_onnx(folder)
    return folder


def load_gliner(model_name, backend):
    from gliner import GLiNER
    if backend == 'torch-cpu':
        return GLiNER.from_pretrained(model_name)
    if backend in TORCH_DEVICES:
        return GLiNER.from_pretrained(model_name, map_location=TORCH_DEVICES[backend])
    # The CPU provider comes second, for the few operations a GPU provider can't run; never any other.
    providers = [ONNX_PROVIDERS[backend]] + (['CPUExecutionProvider'] if backend != 'onnx-cpu' else [])
    return GLiNER.from_pretrained(_export_onnx(model_name), runtime='onnxruntime', runtime_model_file='model.onnx',
                                  runtime_options={'providers': providers})


def _findings(model):
    return [(e['start'], e['end'], e['label'], e['score'])
            for e in model.predict_entities(CANARY_TEXT, CANARY_LABELS, threshold=CANARY_THRESHOLD)]


def same_findings(reference, candidate, certain=CANARY_CERTAIN):
    """True if every value one side finds with a certain score is also found by the other side."""
    spans = lambda found: {(s, e, label) for s, e, label, _score in found}
    certain_spans = lambda found: {(s, e, label) for s, e, label, score in found if score >= certain}
    return certain_spans(reference) <= spans(candidate) and certain_spans(candidate) <= spans(reference)


def verify(model, model_name):
    """Compares the model on a back end with PyTorch on the CPU, on CANARY_TEXT. A GPU that computes wrongly would
    otherwise make detection miss values without anyone noticing."""
    reference = _findings(load_gliner(model_name, 'torch-cpu'))
    candidate = _findings(model)
    return same_findings(reference, candidate), reference, candidate


def load_verified(model_name, backend):
    """(model on the back end, whether it finds the same values as the CPU). A PyTorch GPU gets the model loaded
    once: checked on the CPU first, then moved, instead of a second copy loaded only for the check (3 to 5 s)."""
    if backend in TORCH_DEVICES:
        model = load_gliner(model_name, 'torch-cpu')
        reference = _findings(model)
        model.to(TORCH_DEVICES[backend])
        return model, same_findings(reference, _findings(model))
    model = load_gliner(model_name, backend)
    same, _reference, _candidate = verify(model, model_name)
    return model, same


def batch_size(backend):
    """How many windows GLiNER reads per call: a GPU is mostly waiting between small calls, so it gets several at
    once (2 to 4 times faster on an Intel Arc iGPU, same values). The CPU reads one at a time: batching gained
    little there, and padding in small batches changed a few scores (agents/reference.md, measurements)."""
    return 1 if backend in ('torch-cpu', 'onnx-cpu') else GPU_BATCH_WINDOWS


if __name__ == '__main__':
    print(json.dumps(probe(), indent=2))
