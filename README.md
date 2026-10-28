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
**Desktop app** (Linux, Windows): download it, start it, done. It brings everything it needs, also for PDFs.
- Linux: make `Pseudonymizer-<version>-x86_64.AppImage` executable (right click > Properties > "Allow executing",
  or `chmod +x`) and start it.
- Windows: unpack `Pseudonymizer-<version>-win-x64.zip` into a folder of your choice (about 7.6 GB) and start
  `Pseudonymizer.exe`. It uses an NVIDIA graphics card if your computer has one (much faster for PDFs with
  formulas) and the processor otherwise. Without a code signature, Windows shows a warning ("More info" > "Run anyway"). On the
  first start the app adds itself to the Start menu, which Windows needs for its notifications. To remove it,
  delete the folder and the Start menu entry.

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

**Several documents at once:** in the Documents tab, add or drop several files. They are converted one after another
on your computer and their sensitive values are found right away, so you can work on something else meanwhile.
Change the order by dragging a row; a file that is already in the list, or already open, is not converted again.
Open puts a ready document into the steps above; sending stays a separate step. The list is gone when the app
closes.

Settings has the detection model (GLiNER + Presidio is the default and finds the most; GLiNER alone is faster), the sensitivity, the
hardware (a GPU is used automatically if your computer has a usable one) and the AI tool. Settings are saved
automatically. Notifications (off by default) tell you when a document is ready or detection is done while the
window is in the background; they never contain file names, text or values. The button at the top right switches between light, dark and your system's setting.

### PDF documents
Text, headings and tables are read on your computer, also from scanned pages. Images are never sent: each is
replaced by a marker such as `[Image 1, page 2: not sent]`. The PDF file itself and its file name are never sent
either. Formulas are marked at first; "Convert formulas" turns them into LaTeX (about 10 to 20 seconds each on a
processor, a few seconds with an Intel graphics chip, under a second with an NVIDIA graphics card).

## Good to know
- When the app starts, it gets detection ready in the background (about 10 seconds); the page says when it is
  checking the hardware and loading the model. Detecting then takes a few seconds per page on a laptop's
  processor, and less than a second per page with a usable graphics card.
- Swiss towns are hidden also without a postal code ("aus Hochdorf"); a court's seat ("Bezirksgericht Hochdorf")
  stays readable unless the town also appears elsewhere in the text.
- Presidio reads German, French and English. Prompt changes are kept with "Save" in the Prompts tab.
- Planned: reusable value lists.

## For developers and AI agents
[AGENTS.md](AGENTS.md) has the engineering rules (confidentiality first) and [agents/](agents/) the technical
documentation: architecture, API, tests and the to-do list. Decisions are recorded in [docs/adr/](docs/adr/).
