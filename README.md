# Pseudonymizer

Use AI models without disclosing confidential data. Pseudonymizer finds names, addresses, IDs and other sensitive
values in a text or PDF on your computer, replaces them with placeholders such as `[[PERSON_1]]`, sends only that
version to the AI tool you chose, and puts the original values back into the answer.

Your original text and the list of replaced values never leave your computer. Always check the highlighted preview
before sending: detection can miss values.

## Install
Install the app with the installer built for your system (`...-setup.exe` on Windows, `.AppImage` on Linux), and
one AI tool, logged in with your own account: Claude Code, Codex CLI or Gemini CLI.

To set it up from this repository, or to build the installer for your computer: [BUILDING.md](BUILDING.md). In short,
with Node.js 22.13 or newer: `npm run setup`, then `npm start`, or `npm run build` for the installer.

## Use
1. Paste text, or open a text file or PDF, and press "Find sensitive values".
2. Check the highlighted values: click one to keep it visible, add missing ones under "Edit values".
3. Send. Your question is sent as you type it, so leave names out of it.
4. Read the answer, with the original values put back.

Technical details are in [docs/reference.md](docs/reference.md).
