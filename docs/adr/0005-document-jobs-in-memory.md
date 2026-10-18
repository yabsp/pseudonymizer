# 5. Documents are converted as jobs on the server, held in memory only

Status: accepted (2026-10-17)

## Context
Converting a PDF takes seconds to minutes per document (about 10 s per scanned page, a minute per formula on a
CPU). Users with several documents should not wait in front of the busy overlay for each one, and should be
able to work in another app meanwhile (docs/todo.md, items 1 and 2).

## Decision
- A job list in the local server (`server/jobs.js`, `POST/GET/DELETE /api/jobs`): each format has a pipeline
  of steps (text: read as UTF-8; PDF: Docling through `server/documents.js`), a new tool is one more step.
  One job runs at a time, in the order added, since the steps use all CPU cores. Cancelling stops the step's
  process tree and deletes its temporary folder; a waiting job is never written to disk.
- Jobs, uploaded bytes and results live in the server's memory only and are gone when it stops. Uploaded bytes
  are dropped when the job starts, results when the job is removed. The list holds at most 50 documents and
  500 MB waiting. Nothing goes to logs, settings or browser storage; file names stay in the page.
- Detection is a step in the page (`ui/documents.js`), after the server's conversion, with the detector chosen
  in Settings, so batch documents end at "ready to review". It is not done on the server, because the detectors
  and their settings, labels and word lists live in the page. Sending stays a manual step after review.
- Notifications (opt-in, Notification API; native in the desktop app, which allows only this permission) say
  only "Document 2 of 5 is ready to review": no file names, text or values.

## Consequences
- Results don't survive a restart of the app; keeping them would need a decision on encrypted storage.
- Detection of a converted document can run while the server converts the next one, so both share the CPU.
- A conversion that runs while the page is closed keeps running until it finishes; its result stays in memory
  until the server stops (the page that added it is the only one that knows its id and file name).
