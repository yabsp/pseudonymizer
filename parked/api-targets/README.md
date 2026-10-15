# API targets (parked)

Direct calls to the Anthropic, OpenAI-compatible and Gemini APIs with the user's API key. They are
not part of the app until they are tested; the app currently sends prompts only through local CLIs
(`config/adapters.json`).

To enable one again: move it back to `public/js/targets/`, offer it in the Settings tab next to the
CLIs, store its base URL and key the way the old settings did, and add tests.
