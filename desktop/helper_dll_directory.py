"""PyInstaller runtime hook for the detection helper (desktop/build-helper.mjs), run before gliner_helper.py.

On Windows, PyInstaller puts the DLLs that PyTorch's XPU build needs from the environment's Library\\bin (sycl9.dll,
libmmd.dll, the MKL SYCL libraries) next to the others in the helper's _internal folder. PyTorch loads its own DLLs
first with a restricted search, which fails for these, and then retries with torch\\lib and <prefix>\\Library\\bin
added to PATH. In the helper that folder doesn't exist, so without this torch fails to import ("shm.dll or one of
its dependencies"). Only the helper's own folder is added."""
import os
import sys

if sys.platform == 'win32' and getattr(sys, 'frozen', False):
    os.environ['PATH'] = sys._MEIPASS + os.pathsep + os.environ.get('PATH', '')
