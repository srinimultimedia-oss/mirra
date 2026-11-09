# Cold-read check

Input used: AI_CONTEXT.md only. This check verifies answer coverage and records the semantic review; it does not simulate a separate human reader.

## What does the app do?

Mirra is a browser/SVG visual workspace with a local board library and a separate D1-backed hosted layer for permissions, comments, presence and collaboration. It does not claim full Miro parity.

Evidence: AI_CONTEXT sections1,2,4,10.

## How do I run it locally?

Use Node24+. In source/, npm run dev serves the device-only editor at loopback4173. For cloud development, in source/cloud/ run npm run install:ci, node ../../tools/migrate-local.mjs, then npm run dev -- --port 5173 --host 127.0.0.1. Root npm test requires cloud dependencies installed.

Evidence: AI_CONTEXT sections4,8.

## Where would I change feature X?

For a table field: src/tables.mjs validation first, public/table-editor.mjs UI next, src/table-drafts.mjs recovery, then typed-cell/permission/undo tests. Theme changes start at public/design.css; routes start at src/navigation.mjs or cloud/app and the service/method exports. Synchronize root copies before cloud build.

Evidence: AI_CONTEXT sections3,7.

## What is stored in the browser?

localStorage contains versioned board/library JSON, scoped recovery drafts, creation intents and a seven-day sidebar preference. sessionStorage contains the tab client id and table/text/title/property/voting recovery. These contain user content, not service credentials.

Evidence: AI_CONTEXT sections2,3,5.
