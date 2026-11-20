# Texts the app works with

| Purpose | Shipped | Your own version (used if present) |
|---|---|---|
| What the detection model looks for (labels) | `gliner-labels.default.txt` | `gliner-labels.txt` |
| Words that are never sensitive on their own (pronouns, titles, greetings, professions, parties, family members, courts without a place, form labels, abbreviations such as "OR" or "CEO" that look like initials) | `not-sensitive.default.txt` | `not-sensitive.txt` |
| Instructions for the AI model, sent with every message | `system.default.md` | `system.md` |

Change them under Settings > Advanced and press "Save": your version is written next to the shipped one (or, when
the app runs with its own data folder, into `prompts/` there), and the shipped files stay as they are. Deleting
your version brings the shipped one back.

The labels file has one `label = CATEGORY` per line (`#` starts a comment); the file itself explains the format.
Problems are shown with their line number in Settings, and detection won't run until they are fixed.

The word list has one word per line. A detected value made only of these words ("ich", "Sie", "Ich bitte Sie",
"Sehr geehrte Damen und Herren") is ignored; a value that also contains a name ("Frau Bachmann") is kept. It never
applies to values you add yourself. A wrong line is shown and skipped.
