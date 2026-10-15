# Prompt files

| Purpose | Default (shipped) | Your override (preferred if present) |
|---|---|---|
| What GLiNER looks for (labels) | `gliner-labels.default.txt` | `gliner-labels.txt` |
| Words never sensitive on their own (pronouns, titles, greetings) | `not-sensitive.default.txt` | `not-sensitive.txt` |
| What to pseudonymize, for the Ollama detector | `rules.default.md` | `rules.md` |
| Instructions for the Ollama detector | `detection.default.md` | `detection.md` |
| Instructions for the target model | `system.default.md` | `system.md` |

For each purpose the app loads the override if it exists, otherwise the default.
If neither exists, the app stops with an error naming the missing files.
To change one, copy the default to the override name and edit the copy; the defaults stay as shipped.

The GLiNER labels file has one `label = CATEGORY` per line (`#` starts a comment); the default file explains the format. Problems are shown with their line number in the Prompts tab, and GLiNER detection won't run until they are fixed.

The word list has one word per line. A detected value made only of these words ("ich", "Sie", "Ich bitte Sie", "Sehr geehrte Damen und Herren") is ignored; a value that also contains a name ("Frau Bachmann") is kept. It applies to both detectors, never to values you add yourself. A bad line is shown and skipped.

The detection prompt must keep asking for the JSON shape `{"entities":[{"text":..., "category":...}]}`, because the app parses exactly that.
