# Pseudonymizer

Use AI models without disclosing confidential data. Pseudonymizer finds names, addresses, IDs and other sensitive
values in your text or PDF, replaces them with placeholders such as `[[PERSON_1]]`, sends only that version to the
AI model you chose, and puts the original values back into the answer. Made for lawyers, doctors and consultants.

## What stays on your computer
- Your original text, your documents and the list of replaced values never leave your computer.
- Finding the values happens on your computer, with local models. No cloud service is involved.
- You see exactly what will be sent before anything is sent, and you decide.
- The AI model only receives the version with placeholders, through an AI tool you installed and logged in to
  yourself (Claude Code, Codex or Gemini CLI).

Pseudonymization is only as good as detection: always look at the highlighted preview before sending.

## Getting started
**Desktop app** (Linux, Windows in preparation): download it, start it, done. It brings everything it needs.
- Linux: make `Pseudonymizer-<version>-x86_64.AppImage` executable (right click > Properties > "Allow executing",
  or `chmod +x`) and start it.
- Windows: run `Pseudonymizer-Setup-<version>.exe`. Without a code signature, Windows shows a warning ("More info"
  > "Run anyway").

**From the project folder**: see [docs/setup.md](docs/setup.md). Then `npm start` and open http://localhost:8091.

You also need one AI tool, installed and logged in on your computer: Claude Code, OpenAI Codex CLI or Gemini CLI
(see [docs/setup.md](docs/setup.md#ai-tools)).

## Using it
1. **Your text or document.** Paste text, or open or drop a file: text files fill the text box, PDFs (up to 50 MB)
   appear as a document. Press "Find sensitive values".
2. **Check what will be sent.** The hidden parts are highlighted. Click one to see what it stands for, or to keep it
   visible. Anything missing can be added under "Edit values", where you can also save the list and load it again.
3. **Send.** Add your question if you like; it is sent exactly as you type it, so leave names out of it. "Save as
   file" saves the pseudonymized version instead, for uploading to any chat yourself.
4. **Answer.** The answer comes back with the original values put back in. An answer from another chat can be
   pasted there too ("Already have an answer").

Settings has the detection model (GLiNER is the default; GLiNER + Presidio finds more), the sensitivity, the
hardware (a GPU is used automatically if your computer has a usable one) and the AI tool. Settings are saved
automatically. The button at the top right switches between light, dark and your system's setting.

### PDF documents
Text, headings and tables are read on your computer, also from scanned pages. Images are never sent: each is
replaced by a marker such as `[Image 1, page 2: not sent]`. The PDF file itself and its file name are never sent
either. Formulas are marked at first; "Convert formulas" turns them into LaTeX (about a minute each on a laptop).

## Good to know
- Detecting values takes a few seconds per page on a laptop; the first detection after starting also loads the
  model (about 10 seconds).
- The desktop app doesn't open PDFs and doesn't offer Presidio yet.
- Planned: converting several documents in the background, notifications, reusable value lists.

## For developers and AI agents
[AGENTS.md](AGENTS.md) has the engineering rules (confidentiality first) and [agents/](agents/) the technical
documentation: architecture, API, tests and the to-do list. Decisions are recorded in [docs/adr/](docs/adr/).
