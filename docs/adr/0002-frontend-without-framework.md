# 2. Frontend stays without a framework

Status: accepted (2026-10-16)

## Context
The frontend was modernized (theme switch, simpler steps, options on demand) and more features are planned,
starting with PDF import. The question was whether to rebuild it with a framework. The frontend is about
1,600 lines of plain ES modules with no build step and no npm dependencies.

## Options
- **No framework**: keep plain modules, add small conventions.
- **Preact + htm, vendored**: components without a build step, two small files in the repo.
- **Vue, Svelte or React with Vite**: richer ecosystem, but hundreds of npm packages and a build before every run.

## Decision
No framework (chosen by the user). The frontend keeps native ES modules and gains conventions instead:
- `h()` in `ui/dom.js` builds elements and only ever sets text, so values from users, files and models
  can't become HTML.
- One UI module per part of the page with an `init…` function; workflow state stays in `ui/workflow.js`.
- Document importers are a registry (`public/js/import/`), one file per format, so PDF import is one file.
- Colors are CSS tokens with light and dark sets; the theme choice stays in the browser.

## Consequences
- Nothing to install or build; every line that runs in the page is in the repo and can be audited.
- Re-rendering is manual (`refresh()` in `ui/workflow.js`). If views grow to the point where this becomes
  error-prone, vendored Preact + htm is the next step and would fit the same module layout.
