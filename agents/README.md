# Documentation for AI agents

Technical documentation for agents (and developers) working on this repository. The user-facing documentation is
the [README](../README.md) and [docs/setup.md](../docs/setup.md).

Read in this order:
1. [AGENTS.md](../AGENTS.md): the rules. Confidentiality comes first; they apply to every change.
2. [architecture.md](architecture.md): how the parts fit together.
3. [reference.md](reference.md): server API, environment variables, helper protocols, detection details, data
   locations, desktop app, models and licences, measurements.
4. [testing.md](testing.md): test suites, stand-ins, baselines, how to verify in the running app, pitfalls.
5. [todo.md](todo.md): planned work and open decisions.

Decisions are recorded in [docs/adr/](../docs/adr/).

Keep these files current in the same change that makes them outdated (AGENTS.md, "Documentation"). User-facing text
(what the app does, how to install and use it) belongs in the README or docs/setup.md, everything technical here.
