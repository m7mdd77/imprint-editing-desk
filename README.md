# Imprint — one thoughtful edit

A working entry for [Beyond the Chatbot](https://build.doo.ooo/challenges/beyond-the-chatbot).

[Open the live editing desk](https://imprint-editing-desk.choggyacc.chatgpt.site/) · [Public source](https://github.com/m7mdd77/imprint-editing-desk) · [90-second continuous walkthrough](https://imprint-editing-desk.choggyacc.chatgpt.site/walkthrough.mp4)

Imprint makes the document the interface. Opening a proof initiates a real DeepSeek reading; one exact proposed edit appears beside its highlighted source passage. The editor accepts it, keeps the original, changes direction or restores the previous text. No conversation to reconstruct and no dashboard to interpret.

The sample is a short public-domain excerpt from Jane Austen's *Pride and Prejudice*, chapter I, credited to [Project Gutenberg](https://www.gutenberg.org/ebooks/1342). Imprint explicitly presents an editorial adaptation, not a correction to the author's original. It also accepts a user's own 80–6,000-character document.

## Clean local run

Node.js 24.19+; no third-party dependencies are needed for the local editor and tests.

```powershell
node --test test/*.test.js
node scripts/build.mjs
node server.js
```

Open http://127.0.0.1:3291. Manual editing, exact undo and text export work locally without a provider. Live suggestions show an honest unavailable state until configured. There is no fixture fallback.

To enable genuine DeepSeek, copy `.env.example` to ignored `.env`, set an approved AgentRouter key and the genuine supported Claude Code executable path, then run `node --env-file=.env server.js`. The operator may reuse the existing private sibling environment via `node --env-file=../decision-engine/.env server.js`. Never copy that file into this source.

## What to try

1. Open the proof. This initiates a live reading without an editing prompt. The draft stays unchanged.
2. Read the highlighted original and the suggested replacement in the margin. **Keep this edit** mutates the actual document; **Keep the original** excludes the passage from the next reading.
3. If the interpretation is wrong, select **Wrong direction? Keep the voice**. It rejects that passage and requests a different reading. Editorial choices are context for inference, not canned response selectors.
4. **Undo last edit** restores the exact prior text, without another model call. A response from an older document/context is discarded.
5. Import or manually edit a document. Open the resulting proof, review a suggestion and export the actual current text as a downloadable `.txt` artifact.
6. Open **What this replaces** for a side-by-side image comparison. The prior dashboard/chat UI is clearly labeled as an illustrative reconstruction, not a third-party screenshot. The Imprint image shows the actual build.

## Model authority and boundaries

DeepSeek infers the next edit from the document, editorial direction, protected opening and kept passages. It returns exactly one quoted source span, replacement, editorial reason and inferred intent, or explicitly returns no edit. It cannot apply, export, publish, invoke tools or access local files. A suggestion is bound to the full input text and monotonic version. Both server and browser validate exact unique anchoring, protected spans, rejected passages and unchanged numbers before application.

These checks do **not** establish semantic equivalence or prove preservation of facts, names, literary meaning or tone. Those remain human judgments. The model is instructed to preserve them; they are not claimed as mechanically guaranteed. Imported documents and model output render as escaped text, never executable markup.

The same supported Claude Code transport used for earlier projects is reused, with tools/MCP/session persistence disabled, bounded output, a 45-second application deadline with the documented low-effort client setting, a client-estimated $0.10 per-invocation budget and no application retry or fallback. The supported client can make internal requests or continuations; returned usage is aggregated, so one application attempt is not a guarantee of one billable provider request. Failed attempts count against the PC's persistent 16-attempt rolling-hour allowance. The public host also limits eight attempts per anonymous session per hour and 16 globally per hour. Client cost estimates are not provider-billing guarantees.

## Public hosting

The ChatGPT Site serves the interface and Worker/D1 queue. An authenticated outbound PC worker performs genuine inference. The AgentRouter key remains on the PC; only a separate random worker credential is stored as a Site secret. The public service requires the operator's PC awake and connected. Browser-local editing/export remain available when it is offline.

The anonymous HttpOnly, SameSite cookie maps server-side to a session. Origin and CSRF checks protect job creation. Worker claim and completion require a service credential; jobs are claimed once, late/repeated completion is rejected, and no browser can claim another visitor's work.

Current text, undo history (up to 20 revisions) and editing choices are device-local browser storage, not cross-device accounts. Live inference sends the current document and editing context through D1 and the PC to DeepSeek. Do not enter sensitive writing. Queue input is cleared after claim and results after delivery/timeout; abandoned rows are cleaned on subsequent activity after 120 seconds. This is request-driven operational cleanup, not a guarantee about provider logs, database backups or forensic erasure. Local AI storage retains attempt timestamps/client runtime state; no application prompt archive is created. Provider retention is outside this prototype's control.

The prototype performs real document changes and downloads. It does not send emails, publish articles, connect to a production CMS, grade coursework, or make automatic factual judgments.

Hosted development uses the retained Vinext Sites starter under `site/`: `npm ci`, root `node scripts/build.mjs`, then `npm run build` inside `site/`. Preserve its Sites integration, manifest identity and immutable tracked D1 migration history. The public source includes all Site files, not a Git submodule.

See [methodology](docs/methodology.md), [architecture](docs/architecture.md), [failure test](docs/failure-test.md), [two-year thesis](docs/thesis.md), [data source](docs/data-source.md) and [release record](docs/release.md). Unit/model-double tests and actual provider/browser evidence are reported separately.

The clean source archive passes all 22 tests and starts locally without a key. Public browser verification separately confirms genuine suggestions, actual text changes, persistence after reload, exact undo and a downloaded artifact matching the edited document byte-for-byte. The [comparison image](docs/evidence/comparison.jpg) shows the required interface contrast.

