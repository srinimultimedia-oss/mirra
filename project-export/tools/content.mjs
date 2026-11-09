export const docs = {
'README.md': `# Mirra project export

This package is a sanitized source snapshot and evidence-based technical handoff for Mirra, an independently implemented visual board application. Read AI_CONTEXT.md first for orientation, then TECHNICAL_DESIGN.md and the focused documents in docs/. The manifest.json and reference/ files are machine-readable or generated inventories. Source references use paths relative to this export, such as source/src/model.mjs::Board.

## Start locally

Use Node24 or later and npm. For a dependency-free device-local canvas, open a terminal in source/ and run \`npm run dev\`; open http://127.0.0.1:4173/. For the cloud application, follow docs/setup-and-deployment.md: install in source/cloud/, apply the seven local SQL migrations, then start its development server. Production preview does not automatically grant a development identity.

## What is included

- source/: authored application source, tests, migrations, required vendored packages, and selected historical documentation. No installed dependencies, Git metadata, local databases, environment files or production release archives are included in the distributable ZIP.
- AI_CONTEXT.md: a standalone handoff for a future model.
- TECHNICAL_DESIGN.md: the sixteen-section technical design.
- docs/: focused architecture, UI, data, behavior, styling, services, setup and decisions.
- reference/: current source file index, dependency versions, glossary and configuration.
- tools/: export refresh/watcher, verification, archive builder and cold-read checks.
- verification/: validation reports; heavy installation caches/build state are excluded from the ZIP.

## Evidence and limitations

The source is authoritative. Prior replica/ architecture prose includes plans that disagree with the implemented D1 backend. Full Miro parity is not established. The hosted PUT ballot routing mismatch is preserved and documented, not silently fixed. The local braces and picomatch patches need maintenance and fresh security scanning. Read SOURCE-STATUS.md before relying on this pack after any change. Sources: source/README.md; source/GATES.md; source/cloud/vendor/SECURITY-PATCHES.md; source/cloud/app/api/[...path]/route.ts.

## Automatic updates

From this folder run \`node tools/refresh.mjs --watch\`. It reads the original project above this folder and writes only inside this folder. The watcher refreshes sanitized copies, file hashes, dependency and symbol inventories, the manifest, and generated reference sections when source content changes. It refreshes the ZIP after successful refresh. It does not modify Git hooks, CI or startup configuration. To stop it, stop that process; to restart it, run the same command. A moved standalone export must pass \`--source-root <PROJECT_ROOT>\` to point at its maintained source.

Narrative docs are regenerated from reviewed templates, but a source fingerprint change marks them **REVIEW REQUIRED**. Automatic collection cannot honestly infer every new business rule. A maintainer must review and update tools/content.mjs, then explicitly acknowledge the new source with \`node tools/refresh.mjs --accept-reviewed\`. Never acknowledge changes without reading the diff. Verification results belong to their recorded fingerprint and are not silently reused after source changes. See docs/documentation-maintenance.md.

## Bootstrap prompt

Read README.md, then AI_CONTEXT.md, then TECHNICAL_DESIGN.md in this export. Check SOURCE-STATUS.md and manifest.json for provenance and stale evidence. Consult docs/ and reference/ as needed, and verify every proposed change against source/. Preserve data recovery, permission checks, revision/idempotency rules and local security patches. Treat [UNVERIFIED] items as questions rather than implemented behavior. Explain and test a change before claiming it works.
`,
'AI_CONTEXT.md': `# Mirra: context for a new engineer or AI

## 1. Mission

Mirra is an independent visual collaboration workspace. It lets a person organize device-local boards and manipulate SVG objects, and provides a separate hosted application for authenticated board storage, comments, presence, facilitation and collaboration. The deliverable is not evidence that every Miro feature exists. The application has substantial implemented model and API behavior, but acceptance gaps and a concrete hosted voting route mismatch remain. Your job is to preserve existing documents and recovery drafts while extending verified behavior. Source evidence: source/README.md; source/public/index.html; source/public/app.mjs; source/src/model.mjs::Board; source/cloud/lib/board-service.ts::boardAPI; source/GATES.md.

## 2. Mental model

1. A board document is version1 JSON containing a name and items, with optional timer and tag metadata. Every object has a stable identifier and a recognized type. validateDocument rejects invalid geometry, content, table data, connectors and frame cycles before accepting a document. Source: source/src/model.mjs::validateDocument.
2. Board is the editing model. It applies changes as transactions and manages undo/redo independently of DOM rendering. Treat a coherent user action as one transaction, including operations affecting frame descendants. Source: source/src/model.mjs::Board.
3. LocalLibrary is the device-local board collection. It stores documents, spaces, stars, timestamps and recoverable trash as a versioned snapshot. Its stale-tab detection protects against blind replacement; it is not a distributed transaction system. Source: source/src/library.mjs::LocalLibrary.
4. The editor is vanilla JavaScript and SVG, not a React canvas. public/app.mjs connects DOM controls, Board, persistence, camera/selection state and smaller UI modules. Source: source/public/app.mjs::render, changed, openTable.
5. The cloud wrapper is a Vinext application with React layout and API routing, executed in a Cloudflare Worker. Its root authenticates and redirects to the same static editor. Source: source/cloud/app/page.tsx::Home; source/cloud/worker/index.ts::fetch.
6. CloudSession synchronizes document changes through same-origin JSON requests and EventSource updates. Revisions, before-values and operation identifiers govern retries and conflicts. This is not a character-level CRDT. Source: source/src/cloud-client.mjs::CloudSession; source/src/changes.mjs::applyChanges.
7. Recovery drafts are separate from saved documents. Several editors preserve unsent text, properties, table inputs, cloud snapshots and voting intents with account/board/tab context. A recovery draft must not overwrite a newer server document automatically. Source: source/src/drafts.mjs; source/src/table-drafts.mjs; source/src/voting-recovery.mjs.
8. Authorization belongs on the server. Hosted identity comes from trusted platform headers; D1 queries enforce board membership and roles. A disabled button is only a UI convenience. Source: source/cloud/lib/board-service.ts::identity, boardAPI; source/cloud/lib/voting-service.ts::votingAPI.
9. Root modules are copied into cloud/lib/core and cloud/public by an explicit synchronization script. Editing only a copy produces drift. Source: source/scripts/sync-cloud.mjs.

## 3. Where things live

Start at source/public/index.html for the editor layout and source/public/app.mjs for event wiring. Pure document operations live in source/src/model.mjs; transforms and connector paths in geometry.mjs; containment indexing in frame-index.mjs; table schemas and typed cells in tables.mjs; merge operations in changes.mjs. Timer, voting, tags and recovery each have dedicated src modules. DOM editors and panels live in source/public/, including TableEditor in table-editor.mjs and ObjectTextEditor in object-editor.mjs. Cloud APIs are source/cloud/lib/board-service.ts and voting-service.ts. The actual framework route is source/cloud/app/api/[...path]/route.ts. D1 schema and migrations are source/cloud/db/schema.ts and source/cloud/drizzle/. Styling sources are source/public/style.css, design.css and source/cloud/app/globals.css. The generated reference/file-index.md enumerates the current snapshot and exported symbols.

Storage map: localStorage holds mirra.library.v1 board/library JSON, mirra.device-draft.v2.* recovery drafts, mirra.cloud-upload.v1.* creation intents and mirra.sidebar.preference (seven-day display state). Legacy board/draft keys remain migration/recovery inputs. sessionStorage holds mirra.comment.client and per-tab table/text/title/property/voting draft namespaces. These contain user board content and unsent input, not service credentials. Exact derivation is in source/src/library.mjs, drafts.mjs, uploads.mjs, table-drafts.mjs, object-drafts.mjs and title-drafts.mjs, source/public/inspector-recovery.mjs and source/cloud/lib/sidebar-preference.mjs.

## 4. Main flow walkthrough

For a local session, run npm run dev in source/. scripts/serve.mjs serves only allowed public/src paths, defaults to loopback port4173 and applies shared security headers. index.html loads the external ES module app.mjs. Startup attempts to open LocalLibrary from localStorage; storage failures retain an in-memory board and block unsafe saving. Hash routes select home, a local board or a cloud board. Sources: source/scripts/serve.mjs; source/public/app.mjs initialization; source/src/navigation.mjs::HistoryNavigation.

On the dashboard a user creates or opens a board. On the canvas, a tool creates an object; selection actions, text editing and properties call model operations. changed() filters obsolete selection identifiers, persists and renders. Import validates a proposed document before replacing content; exports produce editable JSON or SVG. A frame operation may affect descendants, so never substitute a shallow item-only edit for an existing model operation. Sources: source/public/app.mjs::changed, edit; source/public/board-import.mjs::prepareBoardImport; source/src/model.mjs::Board.

For cloud use, the hosted root requires a platform user and redirects to /public/index.html. Opening Cloud obtains identity and board access through /api/me and /api/boards. Saving a local board to cloud retains its local original and uses a digest-backed creation intent. CloudSession tracks a server base, local work and pending changes. Server requests recheck identity, origin and role. A change either commits under revision/idempotency checks or returns a recoverable conflict. EventSource refreshes shared document/activity state while presence is refreshed separately. Sources: source/cloud/app/chatgpt-auth.ts::requireChatGPTUser; source/src/uploads.mjs::prepareCloudUpload; source/src/cloud-client.mjs::CloudSession; source/cloud/lib/board-service.ts::boardAPI.

## 5. Invariants that must not break

Preserve stable item identifiers and versioned JSON. Geometry must remain finite and bounded; malformed imports must fail before replacing a document. Validate tables with the same pure schema used by the API. Keep frame ancestry acyclic and connector endpoints valid. Preserve one-step undo for compound operations. Server permissions must be rechecked for every mutation, including when a user's role changes during a session. Do not expose individual ballots through another participant's response. Preserve unsent drafts through errors, account changes and conflicting peer updates. Retry uncertain operations with the same intent instead of creating duplicates. Never trust client identity headers as authentication outside the intended hosting trust boundary. Sources: source/src/model.mjs::validateDocument; source/src/tables.mjs::validateTable; source/src/changes.mjs::applyChanges; source/cloud/lib/board-service.ts; source/src/voting.mjs::votingView; source/src/uploads.mjs; source/src/drafts.mjs.

## 6. Conventions

The repository uses ES modules with .mjs for the root editor/model and TypeScript/TSX for much of the cloud layer. Root browser imports use absolute /public/ and /src/ URLs; pure modules use relative imports. Existing editor code is compact, often with multiple statements per line; cloud starter components use conventional React formatting. Prefer the neighboring pattern over a broad reformat. CSS custom properties define the editor theme; cloud React components use Tailwind classes and a separate token layer. Tests use node:test and assert, with SQLite fixtures for API tests. Commit history contains both descriptive security commits and generic user commits, so no mandatory commit-message convention is established. Sources: source/package.json; source/cloud/package.json; source/public/app.mjs imports; source/public/design.css; source/tests/; reference/change-history.md.

## 7. Making common changes safely

For a new editor screen, first decide whether it is a dashboard state, dialog or real route. Add pure navigation rules to src/navigation.mjs if the hash shape changes, then wire public/app.mjs, add markup/panel code in public/, and test navigation/error recovery. For a server route, edit cloud/app and the relevant service; export the required HTTP method from the framework entry. Do not assume an implemented service method is exposed automatically. Sources: source/src/navigation.mjs; source/cloud/app/api/[...path]/route.ts.

For a component, use a small public module when extending the canvas editor; a React component under cloud/components is appropriate only for the React layer. Connect its data through explicit callbacks and the existing mutation guards. For a table field, start with src/tables.mjs validation and serialization, update public/table-editor.mjs and recovery handling in src/table-drafts.mjs, then add typed-cell, permission and undo tests. Sources: source/public/table-editor.mjs::TableEditor; source/src/tables.mjs; source/src/table-drafts.mjs.

For a business rule, change the pure model/validator first, add negative and compatibility tests, then adapt UI feedback and server validation. For a theme change, change public/design.css tokens and inspect dialogs, responsive toolbars and SVG exports; cloud/app/globals.css is a separate theme. After root editor changes, run scripts/sync-cloud.mjs in your working copy before the cloud build. This export tool itself never runs that mutating script against the original source. Sources: source/public/design.css; source/cloud/app/globals.css; source/scripts/sync-cloud.mjs; source/tests/.

## 8. Bootstrap and build gotchas

Use Node24 or later for the whole repository: root tests use built-in SQLite, while the cloud package alone declares a lower minimum. The device-only server requires no dependency installation. Full cloud setup needs npm run install:ci in source/cloud/, node ../../tools/migrate-local.mjs to apply all seven local D1 migrations, and then npm run dev -- --port 5173 --host 127.0.0.1. Run npm test from source/ after cloud dependencies are present because some tests import cloud packages. npm run start serves a built Worker and is different from the development server with its loopback identity helper. Sources: source/package.json; source/cloud/package.json; source/cloud/README.md; docs/setup-and-deployment.md.

Do not replace npm run install:ci with a different package manager without reviewing the wrapper and lockfile. File dependencies under cloud/vendor are required inputs, not disposable generated output. Some scripts refer to historical verification logs or external Sites helpers; they are not standalone deployment automation. The exported hosting project identifier and private origin are placeholders requiring configuration. Sources: source/cloud/scripts/install-ci.mjs; source/cloud/package-lock.json; source/cloud/vendor/SECURITY-PATCHES.md; reference/config-reference.md.

## 9. High-risk areas

Treat merge logic, account-scoped recovery, voting visibility and D1 receipt/revision checks as high risk. A seemingly simpler retry can duplicate a board or overwrite a peer edit. A changed serializer can strand recovery data. Local picomatch and braces hardening must be replaced only after compatible upstream behavior and hostile-input regressions pass. Production authorization depends on the trusted platform removing spoofed identity headers; copying the Worker onto an arbitrary host is not a complete authentication deployment. Sources: source/src/changes.mjs; source/src/cloud-client.mjs; source/src/drafts.mjs; source/cloud/lib/voting-service.ts; source/cloud/vendor/SECURITY-PATCHES.md; source/cloud/app/chatgpt-auth.ts.

## 10. Current status and open work

Implemented source includes local board lifecycle, SVG editing, typed tables, imports/exports, cloud board APIs, permissions, comments, presence, following, timers, voting logic and recovery. Implementation presence does not certify every deployed flow. In particular, VotingClient uses PUT for ballots while the framework catch-all exports no PUT handler: the exported local development server returns HTTP405 for a ballot PUT request. Production execution remains [UNVERIFIED]. Full Miro parity, native keyboard/table acceptance and several hosted verification outcomes remain open in GATES.md. Historical architecture prose mentions a planned Postgres backend, but current schema is D1/SQLite. Security scan closure needs a fresh Checkmarx result, especially for locally patched dependencies. Sources: source/GATES.md; source/src/voting-client.mjs; source/cloud/app/api/[...path]/route.ts; source/replica/architecture.md; source/cloud/db/schema.ts; docs/open-questions.md.

## 11. Bootstrap prompt

Read README.md, then AI_CONTEXT.md, then TECHNICAL_DESIGN.md in this export. Check SOURCE-STATUS.md and manifest.json for provenance and stale evidence. Consult docs/ and reference/ as needed, and verify every proposed change against source/. Preserve data recovery, permission checks, revision/idempotency rules and local security patches. Treat [UNVERIFIED] items as questions rather than implemented behavior. Explain and test a change before claiming it works.
`,
'TECHNICAL_DESIGN.md': `# Mirra technical design

## 1. Document control

Document version1.0; generated date, source branch, commit and content fingerprint are recorded in manifest.json and SOURCE-STATUS.md. The snapshot is sanitized; configuration placeholders are listed in reference/config-reference.md. A dirty working tree is represented by per-file hashes and status, not falsely attributed entirely to a commit. Sources: manifest.json; reference/source-inventory.json.

## 2. Executive summary

Mirra is a visual workspace for creating and arranging boards of ideas, diagrams and typed records. Source-supported user roles include a device-local user and cloud owner/editor/commenter/viewer. The browser can operate without a backend for local boards; hosted persistence adds identity, membership, revisioned mutations and live activity. Full Miro parity, deployed integrations and production operational SLOs are not established. Sources: source/README.md; source/public/index.html; source/cloud/lib/board-service.ts::boardAPI; source/GATES.md.

## 3. Functional overview

The dashboard organizes boards by recency, stars, spaces and trash. Canvas tools create sticky notes, text, shapes, frames, connectors, pen strokes, cards and tables. Selection supports properties, alignment, grouping, duplication, locks and deletion. Import/export uses editable JSON and SVG; malformed input is validated before replacement. Cloud flows cover board creation/access, comments, role grants, presence/following and activity streams. Facilitation modules cover timers and voting; native production voting has an identified HTTP-method routing gap. Sources: source/public/app.mjs; source/src/model.mjs::TYPES, Board; source/public/board-import.mjs::prepareBoardImport; source/cloud/lib/board-service.ts; source/cloud/lib/voting-service.ts; docs/behavior.md.

## 4. Architecture

\`\`\`mermaid
flowchart LR
  U[User] --> B[Browser editor]
  B --> LS[Browser storage]
  B --> W[Hosted Worker API]
  A[Trusted identity platform] --> W
  W --> D[(D1 SQLite)]
  C[Optional connector binding] --> W
\`\`\`

\`\`\`mermaid
flowchart TD
  HTML[public index HTML] --> APP[app module]
  APP --> MODEL[Board and validators]
  APP --> UI[DOM editor modules]
  APP --> LOCAL[LocalLibrary]
  APP --> CLIENT[CloudSession]
  CLIENT --> API[boardAPI and votingAPI]
  API --> SQL[D1 schema and SQL]
  SYNC[sync cloud script] --> COPIES[Hosted editor and core copies]
\`\`\`

These diagrams show code boundaries, not separately deployed microservices. The version table is generated in reference/dependencies.md. The complete route map is in manifest.json and docs/architecture.md. Sources: source/scripts/sync-cloud.mjs; source/cloud/worker/index.ts::fetch; source/cloud/app/page.tsx::Home; source/cloud/app/api/[...path]/route.ts::handle.

## 5. UI design

The editor is an HTML dashboard plus a full-window SVG canvas with floating board actions, creation tools, selection actions, zoom/undo controls, panels and native dialogs. DOM modules receive host elements and callbacks rather than React props. TableEditor receives accessors for the current item, commit/rename/create-card callbacks, writable checks, draft storage and undo. ObjectTextEditor and BoardTitleEditor manage edit/recovery flows. React RootLayout and starter UI components form a distinct layer and are not the canvas component hierarchy. Forms validate names, numeric geometry, styles, table cell types and conflict baselines. Sources: source/public/index.html; source/public/app.mjs::openTable, edit; source/public/table-editor.mjs::TableEditor; source/public/object-editor.mjs::ObjectTextEditor; source/public/board-title.mjs::BoardTitleEditor; source/cloud/app/layout.tsx::RootLayout. See docs/ui-and-components.md.

## 6. State and data

Board documents use version1 with name/items and optional timer/tags. Items have bounded geometry, stable ids and recognized types. LocalLibrary stores a version1 snapshot with revision, boards, spaces and activeId. A board entry contains a document and lifecycle metadata. Cloud boards store JSON documents and revisions in D1; membership, operation receipts, presence, comments, limits and voting use separate tables. Client drafts are intentionally separate from the durable document and scoped to account/board/tab where applicable. Sources: source/src/model.mjs::validateDocument; source/src/library.mjs::validateLibrary, LocalLibrary; source/src/drafts.mjs::deviceDraftKey; source/cloud/db/schema.ts.

\`\`\`mermaid
sequenceDiagram
  participant U as User
  participant E as Editor
  participant M as Board
  participant C as CloudSession
  participant S as API
  participant D as D1
  U->>E: Edit object
  E->>M: Apply transaction
  E->>C: Queue changes and preserve draft
  C->>S: Changes with revision and operation id
  S->>D: Check access and commit or reject
  D-->>S: Current document and revision
  S-->>C: Saved snapshot or conflict
  C-->>E: Refresh status and render
\`\`\`

This is a conceptual flow; local-only editing persists through LocalLibrary instead. Storage keys, formats and expiry are detailed in docs/state-and-data.md. No IndexedDB implementation was identified in the inspected core/editor source.

## 7. Application logic

Board operations validate documents and preserve undo transaction boundaries. Frame containment uses frame-index and reconcileFrames rather than unchecked recursive ancestry. Connector geometry resolves endpoints and routes shapes; selection and bounds support transforms/export. changesBetween creates field-level operations; applyChanges checks before-values and throws Conflict instead of blindly overwriting peer work. Cloud creation uses a SHA256 digest and persisted operation intent. Voting validates budgets and private/public projections separately from board JSON. Sources: source/src/model.mjs::Board, reconcileFrames; source/src/frame-index.mjs; source/src/geometry.mjs; source/src/changes.mjs::changesBetween, applyChanges, Conflict; source/src/uploads.mjs::prepareCloudUpload; source/src/voting.mjs::validateBallot, votingView.

Errors surface through status elements, dialog errors and toasts; failed persistence preserves available in-memory work and recovery paths. Sources: source/public/app.mjs::toast; source/src/save-status.mjs; source/public/inspector-recovery.mjs.

## 8. Styling and UX

The editor loads style.css then design.css. Custom properties define backgrounds, surfaces, text, accent, radius, shadow and font. The later design layer uses a blue accent and dark dashboard navigation; SVG object styling is separate document data. Responsive rules include1000px,850px,600px and520px adjustments and short-height cases. Reduced-motion rules disable transitions/animations. Native buttons/forms/dialogs, labels, status/alert roles, SVG focus and keyboard bindings provide accessibility affordances; a complete screen-reader, contrast and browser-compatibility certification is [UNVERIFIED]. Cloud React Tailwind tokens include a separate dark theme and do not prove the editor has a dark-mode toggle. Sources: source/public/style.css; source/public/design.css; source/public/index.html; source/cloud/app/globals.css; docs/styling.md.

## 9. External dependencies and services

The root editor loads local modules/styles and calls same-origin /api endpoints. Cloud authentication depends on hosting-provided identity headers and sign-in/sign-out routes. D1 is required for server data; connectors are optional request-scoped bindings, not a catalog of implemented integrations. No runtime analytics/CDN-font integration was identified in the inspected editor entry points. Network failures preserve drafts and show reconnect/conflict/error status rather than certify offline cloud writes. Runtime dependency purposes and examples are in docs/external-services.md; exact direct dependency versions are in reference/dependencies.md. Sources: source/src/cloud-client.mjs::cloudRequest, CloudSession; source/cloud/app/chatgpt-auth.ts; source/cloud/lib/connectors.ts::connectorsForRequest; source/cloud/db/index.ts::getDb.

## 10. Security

validateDocument and typed table validation reject malformed documents and unsafe link schemes. Board API checks trusted identity, expected client identity, same-origin writes, server role access and per-minute write limits. readJSONObject enforces a4MB UTF8 JSON-object boundary. SQL uses prepared bindings for dynamic values; inspect individual query branches before extensions. Shared CSP/HSTS/nosniff headers cover application responses and static assets; preview connector JSON endpoints use deny-all CSP. Display text is created through DOM text/value APIs and SVG attributes; this is not a claim that arbitrary HTML is supported. Sources: source/src/model.mjs::validateDocument; source/src/tables.mjs::validCell; source/cloud/lib/request-body.ts::readJSONObject; source/cloud/lib/board-service.ts::boardAPI; source/src/security-headers.mjs::securityHeaders; source/cloud/public/_headers; source/cloud/scripts/vite/connector-preview-plugin.mjs.

Browser storage contains document and draft contents, which remain readable to same-origin JavaScript; do not store service credentials there. Sidebar display state uses localStorage rather than an authentication cookie. Local development auth cookies are separate loopback fixtures. Locally patched dependencies retain licenses and evidence; zero npm audit is not Checkmarx certification. Sources: source/cloud/lib/sidebar-preference.mjs; source/cloud/scripts/vite/sites-vite-plugin.ts; source/cloud/vendor/SECURITY-PATCHES.md. Current exported-copy results belong in verification/report.json.

## 11. Performance

The root editor is native ES modules and SVG without a bundle step. The hosted React/framework layer is built into client/server assets. SVG rendering cost depends on object count and interaction path; document limits are safeguards, not performance promises. The server events endpoint polls D1 on a timer and renews connections, which has database/read cost as concurrency grows. Local static preview uses no-store; API JSON responses and SSE define explicit cache behavior. Actual exported build sizes are measured in verification/report.json rather than estimated here. No load-test throughput, production cache-hit ratio or supported concurrent-user count is established. Sources: source/public/app.mjs::render; source/src/model.mjs::MAX_BOARD_ITEMS; source/cloud/lib/board-service.ts::boardAPI events branch; source/scripts/serve.mjs; source/cloud/package.json.

## 12. Build and deployment

Use Node24+ and npm. Device-only: cd source, npm run dev. Full app: cd source/cloud, npm run install:ci, apply local migrations with the exact Wrangler command in docs/setup-and-deployment.md, npm run dev. From source run npm test; from source/cloud run npx tsc --noEmit, npm run build and npm run start. The start command uses the generated dist/server/wrangler.json. npm run lint is available but not silently represented as passing. Production hosting is Sites-managed Cloudflare Workers with D1; the repository alone does not provision the production identity gateway or grant hosting access. Deployment requires configuration placeholders and the official Sites tooling. Sources: source/package.json; source/cloud/package.json; source/cloud/scripts/install-ci.mjs; source/cloud/scripts/run-framework.mjs; source/cloud/vite.config.ts; source/cloud/README.md.

## 13. Testing

Root tests use node:test, strict assertions and SQLite fixtures to exercise model, recovery, APIs and security. Tests importing cloud dependencies require installation in source/cloud first. Python theme validation tests require Python3 and the included isolated skill utility. Focused scale scripts exist for frame validation, containment and descendant selection; they are not production load tests. Export verification runs record command status, source fingerprint and output logs. Browser/platform sign-in, native keyboard flows and fully deployed concurrency remain separate acceptance gaps. Sources: source/tests/; source/scripts/check-frame-validation-scale.mjs; source/scripts/check-frame-containment-scale.mjs; source/tests/review-theme-bounds.py; source/GATES.md.

## 14. Known issues and technical debt

The catch-all API route omits PUT while VotingClient/votingAPI use PUT for ballots; the exporter preserves this mismatch. Copied modules can drift if synchronization is skipped. A large app.mjs owns much editor orchestration. Historical architecture docs contain unimplemented plans. Hosting/publication depends on tools outside this repository. Local dependency patches carry maintenance obligations. Unchecked acceptance gates are not automatically bugs, but they are not verified completion either. TODO/FIXME matches are inventoried separately in reference/code-markers.md and can include upstream vendor comments. Sources: source/cloud/app/api/[...path]/route.ts; source/src/voting-client.mjs; source/cloud/lib/voting-service.ts; source/scripts/sync-cloud.mjs; source/replica/architecture.md; source/GATES.md; source/cloud/vendor/SECURITY-PATCHES.md.

## 15. Open questions

See docs/open-questions.md. Production access configuration, latest security scan closure, end-to-end hosted voting, comprehensive accessibility/browser support and complete feature parity are [UNVERIFIED]. Automatic inventory refresh does not resolve these questions. Human review is required for changed narrative claims.

## 16. Change history

reference/change-history.md contains a sanitized bounded Git log. Descriptive commits include adding audited cloud source and lockfile to security scanning and fixing sidebar preferences, preview headers and braces recursion. Generic commit subjects do not establish a design rationale. This document separates source-observed decisions from inferred motives. Sources: Git history captured in reference/change-history.md; docs/decisions-log.md.
`,
'docs/architecture.md': `# Architecture

Mirra has a dependency-free browser editor plus a hosted Worker application. The browser editor can be served by the root Node HTTP server. The hosted root uses React/Vinext for authenticated entry, then serves the same editor from static assets. The API catch-all delegates to service functions and a D1 binding. These boundaries come from source/public/index.html, source/public/app.mjs, source/scripts/serve.mjs, source/cloud/app/page.tsx::Home and source/cloud/worker/index.ts::fetch.

\`\`\`mermaid
flowchart LR
  Browser[Vanilla SVG editor] --> Local[LocalLibrary and drafts]
  Browser --> Client[CloudSession]
  Client --> Route[API catch all]
  Route --> Board[boardAPI]
  Board --> Voting[votingAPI]
  Board --> D1[(D1 database)]
  Voting --> D1
  Gateway[Trusted identity gateway] --> Route
\`\`\`

Root editor files are copied to cloud/public/public, core modules to cloud/public/src and cloud/lib/core. There is no automatic import alias replacing these copies. Source: source/scripts/sync-cloud.mjs. The exporter never runs that synchronization against the original project.

## Routing map

- Local / serves public/index.html through scripts/serve.mjs.
- Hash #home, #board/<id> and #cloud/<id> are parsed by source/src/navigation.mjs::parseRoute and dispatched by HistoryNavigation.
- Hosted / invokes source/cloud/app/page.tsx::Home, requires a user and redirects to /public/index.html.
- /api/me; /api/boards; /api/boards/:id; /changes; /members; /comments; /presence; /attention; /events are handled in source/cloud/lib/board-service.ts::boardAPI.
- /api/boards/:id/voting and its session/join/ballot/start/end/extend/rename branches are handled in source/cloud/lib/voting-service.ts::votingAPI. Service branches do not imply method exports: the framework entry currently exports GET/POST/PATCH/DELETE only.
- /signin-with-chatgpt, /signout-with-chatgpt and /callback belong to hosting identity infrastructure; local development intercepts them in source/cloud/scripts/vite/sites-vite-plugin.ts::sites.

Request identity is established outside boardAPI and consumed from trusted headers. ctx.props.CONNECTORS is request-scoped; no global cross-user capability cache is used in source/cloud/lib/connector-context.ts::runWithConnectorBinding. The database is SQLite/D1, not the Postgres plan found in historical replica prose. Source: source/cloud/db/schema.ts and source/cloud/db/index.ts::getDb.
`,
'docs/ui-and-components.md': `# UI and components

## Editor layout

source/public/index.html contains dashboard, workspace, canvas, boardbar, creation tools, selectionbar, side panel, undo/redo and zoom controls. Native dialogs handle text, properties, imports/exports, cloud access, comments, bulk notes and tables. source/public/app.mjs creates additional timer/voting/tag/follow/minimap UI through mount functions. Sources: index.html ids; app.mjs imports and panel/handler wiring.

## Component contracts

| Component | Inputs | Outputs / internal state | Source |
| --- | --- | --- | --- |
| Board | Valid document | Model transactions and undo/redo; doc | source/src/model.mjs::Board |
| TableEditor | Dialog element, getItem/commit, writable, rename, undo, createCards, draftStorage/draftContext | Typed cell/metadata editing, recovery and view state | source/public/table-editor.mjs::TableEditor; source/public/app.mjs::openTable |
| ObjectTextEditor | Current object and editor callbacks as wired by app | Text baseline, unsent draft and conflict review | source/public/object-editor.mjs::ObjectTextEditor; app.mjs::edit |
| BoardTitleEditor | Board name/baseline and persistence callbacks | Name draft, retry/discard and conflict display | source/public/board-title.mjs::BoardTitleEditor |
| InspectorRecovery | Current properties/baseline | Recovery and rebase state | source/public/inspector-recovery.mjs::InspectorRecovery, rebaseInspector |
| mountMinimap | Host/camera/document callbacks | Minimap navigation UI | source/public/minimap-view.mjs::mountMinimap |
| mountVotingPanel | Session/client callbacks from app | Setup, ballot, status and results controls | source/public/voting-view.mjs::mountVotingPanel |
| RootLayout | React children | HTML/body shell and global CSS | source/cloud/app/layout.tsx::RootLayout |
| SidebarProvider | defaultOpen, optional controlled open/onOpenChange, children and div props | Context, mobile/desktop visibility, seven-day display preference | source/cloud/components/ui/sidebar.tsx::SidebarProvider; source/cloud/lib/sidebar-preference.mjs |

React starter UI components in source/cloud/components/ui are available code, not proof of rendered use in the board. reference/file-index.md lists each file and its exported symbols. No Storybook contract or complete design-spec artifact was identified.

## Forms and interactions

Document name is at most500 characters; item text at most100000. Geometry must be finite, sizes at least1 and bounded by model checks. Properties validate colors and numeric ranges; table fields use typed validation in source/src/tables.mjs::validCell and validateTable. Comment creation/editing checks text limits and server authorship; membership uses owner-only API access and allowed roles. UI validation never replaces server rules. Sources: source/src/model.mjs::validateDocument; source/public/index.html forms; source/cloud/lib/board-service.ts::boardAPI.

Keyboard bindings and focus behavior are wired in source/public/app.mjs, public/table-focus.mjs and related editors. Native dialog/tab behavior has unchecked acceptance gates; do not infer accessibility certification from the existence of ARIA attributes. Sources: source/GATES.md; source/public/index.html.
`,
'docs/state-and-data.md': `# State and data

## Document and library schemas

A document is {version:1,name,items,...optionalMetadata}. Items use ids/types, x/y/w/h, text/fill and type-specific fields. Recognized types are sticky/text/shape/frame/connector/pen/card/table. Optional tags and timer are validated through dedicated modules. A library is {version:1,revision,boards,spaces,activeId}; a board entry includes its doc, timestamps, starred, spaceId and nullable deletedAt. Sources: source/src/model.mjs::TYPES, validateDocument; source/src/library.mjs::validateLibrary.

Tables use version1, fields and records. Fields support text, number, checkbox, select, date, person and link; a record has id, cells and blockedBy. Actual caps include50 fields and5000 records; links allow HTTP/HTTPS, dates must round-trip as calendar dates, dependencies cannot be missing/self-referential/cyclic. Source: source/src/tables.mjs::FIELD_TYPES, validCell, validateTable.

## Storage inventory

| Key / prefix | Storage | Format / scope / expiry | Source |
| --- | --- | --- | --- |
| mirra.library.v1 | localStorage | Versioned JSON library; no explicit TTL | source/src/library.mjs::LocalLibrary |
| mirra.board.v1 | localStorage legacy | Migration input retained as recovery; no inferred deletion | source/src/library.mjs constructor |
| mirra.device-draft.v2.* | localStorage | JSON; encoded user/board/kind/context | source/src/drafts.mjs::deviceDraftKey, saveCloudDraft |
| mirra.cloud.draft.* | localStorage legacy | Older account-unlabelled draft; explicit export path | source/src/drafts.mjs::readLegacyCloudDraft |
| mirra.cloud-upload.v1.* | localStorage | User/source and digest intent for idempotent creation | source/src/uploads.mjs::uploadIntentKey, prepareCloudUpload |
| mirra.comment.client | sessionStorage | Tab client id; Web Locks isolate duplicates where available | source/src/comment-client.mjs::claimCommentClient; source/public/app.mjs initialization |
| mirra.table-input.v1.* | sessionStorage via editor | Table draft JSON; scoped mode/user/board/table | source/src/table-drafts.mjs::tableDraftKey; source/public/app.mjs::openTable |
| mirra.voting.intent.v1:* | sessionStorage supplied by voting UI | Account/board-scoped uncertain ballot intent | source/src/voting-recovery.mjs::VotingRecovery; source/public/voting-view.mjs |
| mirra.object-text.v1.* | sessionStorage | Object text draft scoped by object/context | source/src/object-drafts.mjs; source/public/object-editor.mjs |
| mirra.board-name.v1.* | sessionStorage | Board name draft | source/src/title-drafts.mjs; source/public/board-title.mjs |
| mirra.properties.v1.* | sessionStorage | Property editing draft | source/public/inspector-recovery.mjs |
| mirra.sidebar.preference | localStorage | {open:boolean,expiresAt:number}; seven days | source/cloud/lib/sidebar-preference.mjs |

Other text/title/property recovery keys are derived by their owning modules; the generated symbol/file inventory identifies those modules. Exact fallback when storage is blocked is handled in the editor and recovery classes; do not assume localStorage is always available. Source: source/public/object-editor.mjs; source/public/board-title.mjs; source/public/inspector-recovery.mjs; source/public/app.mjs.

## Server tables

boards stores document JSON/revisions; board_creations and mutations store idempotency receipts; members stores role grants; presence stores pointers/viewports/follow/attention and timestamps; comments stores threads and soft-deletion fields; api_limits stores expiring counters. voting_sessions, voting_participants and voting_mutations separate session lifecycle, private ballots and receipts. Source: source/cloud/db/schema.ts; source/cloud/drizzle/0000_quick_millenium_guard.sql through0006_easy_jetstream.sql.

## Update and recovery flow

\`\`\`mermaid
flowchart TD
  Edit[User edit] --> Validate[Pure validators and Board transaction]
  Validate --> Local[LocalLibrary save]
  Validate --> Draft[Preserve scoped cloud draft]
  Draft --> Patch[Revisioned API changes]
  Patch --> Saved[Accepted snapshot]
  Patch --> Conflict[Conflict review retains draft]
  Peer[EventSource update] --> Merge[Merge or conflict checks]
  Merge --> Saved
  Merge --> Conflict
\`\`\`

Source: source/public/app.mjs::changed; source/src/cloud-client.mjs::CloudSession; source/src/changes.mjs::applyChanges. Source-controlled JSON consists chiefly of dependency/configuration/migration metadata and theme/test inputs, not production board records. No production database or browser data is exported.
`,
'docs/behavior.md': `# Behavior, rules and edge cases

## Device-local board lifecycle

Dashboard actions create, open, rename, copy, star, move to a space, trash and restore board entries. LocalLibrary serializes a validated collection and detects stale serialized snapshots before overwriting. Earlier single-board storage is a migration source. A quota or stale-tab failure must not be reported as saved. Sources: source/src/library.mjs::LocalLibrary; source/public/app.mjs dashboard wiring; source/src/save-status.mjs.

## Canvas editing

Creating and transforming objects uses Board operations; frame operations include descendants, connectors resolve bound/free endpoints, and undo groups represent coherent actions. Locked objects and viewer permissions prevent applicable edits. Export produces editable JSON or standalone SVG; import validates proposed content before replacement. Sources: source/src/model.mjs::Board; source/src/geometry.mjs; source/src/selection.mjs; source/public/board-import.mjs::prepareBoardImport; source/public/app.mjs.

## Cloud persistence

Creating a cloud copy preserves the local board and uses a persisted digest/operation intent. Retries of an uncertain response reuse the same identity, source and content intent. Changes check before-values/revisions; conflicts keep unsent work and offer explicit recovery. Account changes invalidate the original session instead of sending work under another user. Source: source/src/uploads.mjs::prepareCloudUpload; source/src/cloud-client.mjs::CloudSession; source/src/changes.mjs::applyChanges; source/cloud/lib/board-service.ts::boardAPI.

## Authorization and collaboration

Server roles are owner/editor/commenter/viewer. Membership is not equivalent to permission to visit the private hosting site; both layers can apply. Comment authorship and resolution rules are enforced in API branches. Presence, viewport following and attention use server records and live events, not permanent board objects. Sources: source/cloud/lib/board-service.ts::identity, boardAPI; source/src/follow.mjs; source/public/follow-view.mjs.

## Tables and facilitation

Table cells are typed; validation rejects invalid dates, unsafe links, missing dependencies and invalid field definitions. UI drafts preserve raw invalid values so users can repair them. Timer logic uses a shared clock and server-time observations. Voting has private own-ballot projections while active and aggregate results after end; removed targets cannot receive increased allocations. A service-level PUT ballot branch exists, but the framework route omits PUT. The exported development HTTP boundary was tested and returned405 for PUT; production execution is [UNVERIFIED]. Fix/test the method export before claiming hosted voting works. Sources: source/src/tables.mjs; source/src/table-drafts.mjs; source/src/timer.mjs; source/src/clock.mjs; source/src/voting.mjs::votingView; source/cloud/app/api/[...path]/route.ts.

## Failure feedback

Statuses, errors, dialogs, draft exports and conflict review are first-class paths. Do not replace preserved work with a retry spinner or hide storage failures. SSE disconnect/reconnect behavior is implemented in CloudSession but is not evidence of offline multiuser editing. Source: source/src/cloud-client.mjs; source/src/save-status.mjs; source/public/cloud-backups.mjs; source/public/inspector-recovery.mjs.
`,
'docs/styling.md': `# Styling and UX

The main editor loads source/public/style.css before source/public/design.css. The later sheet overrides the base theme. Current design tokens include bg #f5f7fb, surface #ffffff, text #17253a, muted #5d6f82, border #dce3ed, accent #4055df, radius15px and a layered shadow. Font preference is Inter, Segoe UI, system-ui, sans-serif; naming Inter does not download it. SVG item colors, strokes and typography are document fields, not a blanket CSS theme. Sources: source/public/index.html; source/public/design.css::root; source/src/model.mjs::validateDocument; source/src/typography.mjs.

Floating controls use rounded surfaces and shadow; the dashboard uses dark navigation and a responsive board grid. Important responsive breakpoints appear at1000px,850px,600px and520px, with short-viewport rules. Reduced-motion media rules remove animation/transition behavior. Sources: source/public/design.css and source/public/style.css media rules.

The cloud React shell uses Tailwind, tw-animate-css and vendored shadcn CSS. Its --background/--foreground/etc tokens and .dark rules are a separate system. Do not infer a user-facing dark-mode switch in the vanilla editor from these definitions. Source: source/cloud/app/globals.css; source/cloud/app/layout.tsx::RootLayout.

Accessibility evidence includes labelled fields/buttons, dialog labels, status and alert roles, canvas tabindex, focus handling and keyboard paths. Inspect source/public/index.html, public/table-focus.mjs, public/table-editor.mjs and public/app.mjs. Screen-reader coverage, audited contrast for every state and browser-version compatibility are [UNVERIFIED]. The source uses modern APIs including SVG, structuredClone, native dialog, crypto, EventSource and optional navigator.locks; there is no verified minimum-browser matrix.
`,
'docs/external-services.md': `# External services and dependencies

## Runtime boundaries

The editor loads its modules/CSS from the current origin. Its cloud transport uses fetch('/api/...'), EventSource for board events and sendBeacon for leaving presence. ChatGPT hosting supplies authenticated-user headers and sign-in/sign-out/callback paths. D1 is the server database. Optional connectors are request-scoped platform capabilities rather than hardcoded provider credentials. Sources: source/src/cloud-client.mjs::cloudRequest, CloudSession; source/cloud/app/chatgpt-auth.ts; source/cloud/lib/connector-context.ts; source/cloud/lib/connectors.ts; source/cloud/db/index.ts.

No analytics endpoint, CDN script or hosted-font stylesheet was found in the inspected editor entry points. Public npm registry/repository links in manifests are installation/provenance references, not application telemetry. Sources: source/public/index.html; source/public/design.css; source/cloud/package-lock.json. Provider-specific connector actions wired to board UI are [UNVERIFIED].

## Sanitized examples

\`\`\`http
GET /api/me
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"user":{"id":"<USER_ID>","email":"<USER_EMAIL>","name":"<DISPLAY_NAME>"}}
\`\`\`

This projection is defined by source/cloud/lib/board-service.ts::identity and the me branch. Do not synthesize its authentication headers in a public deployment; the trusted gateway must establish them.

\`\`\`http
GET /api/boards/<BOARD_ID>/events?revision=0&clientId=<CLIENT_ID>
Accept: text/event-stream

HTTP/1.1 200 OK
Content-Type: text/event-stream
\`\`\`

SSE payloads and renewal behavior must be read from the events branch and CloudSession listeners, not assumed to be WebSocket frames. Source: source/cloud/lib/board-service.ts::boardAPI; source/src/cloud-client.mjs::CloudSession.

The dependency version/purpose table is reference/dependencies.md. React/Vinext/Vite serve the cloud shell; Drizzle describes D1; UI libraries support starter React components; Zod is installed but presence alone does not prove all business validation uses it. Core document/table validators are handwritten. Vendored font/OG and glob packages are licensed runtime inputs. Source: source/cloud/package.json; source/src/model.mjs; source/src/tables.mjs; source/cloud/vendor/SECURITY-PATCHES.md.

## Failure behavior

fetch requests have a10-second client timeout; CloudSession preserves/reviews drafts, tracks errors and reconnects EventSource. Server identity/access failures return JSON errors. A local device board can work without cloud service availability; pending cloud work is not guaranteed to become durable merely because a browser draft exists. Sources: source/src/cloud-client.mjs::cloudRequest, CloudSession; source/cloud/lib/board-service.ts::boardAPI; source/src/drafts.mjs.
`,
'docs/setup-and-deployment.md': `# Setup and deployment

## Prerequisites and root meanings

In this document PROJECT_EXPORT is the extracted export directory. source/ is the runnable sanitized snapshot, not the original workspace. Use Node24 or later plus npm; cloud/package.json declares Node>=22.13.0 but root tests require>=24. Git/tar and platform access are required for Sites publication, not for the device-only editor. Sources: source/package.json; source/cloud/package.json; source/cloud/README.md.

## Device-only editor

\`\`\`sh
cd source
npm run dev
\`\`\`

Open http://127.0.0.1:4173/. PORT can select another port. No install/build step is required for this mode. Cloud endpoints are not implemented by this static server. Source: source/scripts/serve.mjs.

## Full cloud development

\`\`\`sh
cd source/cloud
npm run install:ci
node ../../tools/migrate-local.mjs
npm run dev -- --port 5173 --host 127.0.0.1
\`\`\`

The included migrate-local helper writes a local-only Wrangler configuration inside this export, applies the ordered SQL migrations with Wrangler receipts, and uses the same placeholder database id and .wrangler/state directory as Vite. No production DB is touched by --local. Command outcomes are recorded in verification/report.json. Sources: source/cloud/vite.config.ts::localBindingConfig; source/cloud/drizzle/; source/cloud/package.json.

For reference, this is the underlying per-file SQL operation (not the preferred migration-receipt workflow):

\`\`\`powershell
Get-ChildItem ./drizzle/*.sql | Sort-Object Name | ForEach-Object {
  npx wrangler d1 execute site-creator-d1 --local --persist-to .wrangler/state --file $_.FullName
  if ($LASTEXITCODE -ne 0) { throw "Migration failed" }
}
\`\`\`

On a fresh database apply0000 through0006 exactly once. The execute loop has no migration receipts and must not be repeated blindly; use a proper tracked migration process for maintained environments. A dev server may persist under a profile-specific path; verify the DB path against Vite/Wrangler configuration. Read verification/report.json for observed command results.

Portable development auth is a loopback-only synthetic identity. Follow the local sign-in link; do not expose this server as production authentication. Source: source/cloud/scripts/vite/sites-vite-plugin.ts::sites; source/cloud/vite.config.ts.

The historical source/cloud/README.md uses --hostname. The pinned Vinext1.4.4 CLI rejects that legacy option; the --host form above was verified against the exported copy. This is a documentation compatibility issue retained in the source snapshot. Evidence: source/cloud/package-lock.json; source/cloud/scripts/run-framework.mjs; verification/http.json.

## Tests, types, lint and build

\`\`\`sh
# From source/
npm test
# From source/cloud/
npx tsc --noEmit
npm run lint
npm run build
npm run start -- --port 5175
\`\`\`

The start command reads dist/server/wrangler.json and is a production-build preview; it does not run Vite's synthetic sign-in middleware. Lint is listed because it exists, not claimed to pass unless recorded in the verification report. Install dependencies before tests that import cloud modules. Source: source/package.json; source/cloud/package.json.

## Synchronizing future edits

In a working copy, run node scripts/sync-cloud.mjs from source/ after changing root src/public modules, then build the cloud app. This intentionally writes hosted copies in that working copy. The export refresh tool never runs it against the original project. Source: source/scripts/sync-cloud.mjs.

## Production deployment

The production target is a Sites-managed Cloudflare Worker with a D1 binding named DB. Replace <SITE_PROJECT_ID> and <SITE_ORIGIN>, provision/authenticate hosting, apply migrations to the intended production D1, and use the official Sites source, build, package and private-deploy workflow. Preserve current audience; never upload browser backups, environment files or local DB state. There is no repository-owned npm deploy command and no standalone identity-gateway provisioning script. Deploying with bare Wrangler to another host is [UNVERIFIED] and requires a trusted auth-header boundary. Sources: source/cloud/.openai/hosting.json; source/cloud/worker/index.ts; source/cloud/app/chatgpt-auth.ts; source/cloud/README.md; reference/config-reference.md.

The original external Sites helper is not redistributed as an assumed dependency. A future operator needs a compatible installed Sites plugin/control plane, or must explicitly design a different production authentication/provisioning route. No deployment is performed while creating this export.
`,
'docs/decisions-log.md': `# Decisions log

These entries distinguish observable implementation choices from undocumented motives. No interview or conversation memory is used as evidence.

## ADR01: Browser-native editor

Status: observed. The root editor uses SVG and ES modules with no root runtime dependencies. Consequence: static device-local operation is possible; DOM orchestration and rendering are application-owned. Historical prose explicitly describes this as the first vertical slice. Source: source/package.json; source/public/index.html; source/public/app.mjs; source/replica/architecture.md.

## ADR02: Separate hosted wrapper

Status: observed. Vinext/React routes and a Worker wrap static editor copies, D1 and API services. Consequence: two entry paths and copy synchronization must be maintained. An undocumented reason for choosing Vinext over alternatives is [UNVERIFIED]. Source: source/cloud/vite.config.ts; source/cloud/app/page.tsx; source/scripts/sync-cloud.mjs.

## ADR03: Revisioned changes and recovery

Status: observed. Changes compare before-values, creation/mutation operations have receipts, and device drafts preserve uncertain edits. Consequence: conflicts/retries need explicit review and cannot be simplified into last-write-wins without changing behavior. Source: source/src/changes.mjs::applyChanges; source/src/uploads.mjs; source/cloud/lib/board-service.ts.

## ADR04: Trusted hosting identity

Status: observed. App/API identity is consumed from hosting-provided user headers; local auth is explicitly loopback-only. Consequence: standalone hosting must recreate the trust boundary, not merely copy headers. Source: source/cloud/app/chatgpt-auth.ts; source/cloud/lib/board-service.ts::identity; source/cloud/scripts/vite/sites-vite-plugin.ts.

## ADR05: Auditable local dependency patches

Status: documented in source. Local picomatch/braces and font/OG packages preserve licenses and identify local versions. Consequence: file tarballs and source must remain together; upgrades require hostile-input and rendering compatibility checks. Source: source/cloud/vendor/SECURITY-PATCHES.md; source/cloud/package.json; source/tests/glob-security.test.mjs; source/tests/remaining-security.test.mjs.

## ADR06: Do not claim parity from component presence

Status: explicit documentation rule. GATES.md and README retain incomplete broader parity/verification outcomes. Starter UI component files and planned architecture are not evidence that a product flow is rendered or production-tested. Source: source/README.md; source/GATES.md; source/cloud/components/ui/; source/replica/architecture.md.
`,
'docs/open-questions.md': `# Open questions and [UNVERIFIED] items

1. **Hosted voting HTTP route:** VotingClient and votingAPI use PUT for ballots, but the framework catch-all exports no PUT. The exported development server returned HTTP405 for this PUT request (verification/http.json). Determine the production response and add the correct route export/test in a maintained working copy. The export does not fix it. Sources: source/src/voting-client.mjs; source/cloud/lib/voting-service.ts; source/cloud/app/api/[...path]/route.ts.
2. **Production auth/provisioning:** Which supported Sites account/control plane should provision the sanitized snapshot? The production identity gateway and database are not exportable code state. Sources: source/cloud/.openai/hosting.json; source/cloud/app/chatgpt-auth.ts; source/cloud/README.md.
3. **Latest security closure:** A new Checkmarx result after local dependency patches is not established by code or npm audit. Review local patch evidence and withdrawn advisory triage. Source: source/cloud/vendor/SECURITY-PATCHES.md; source/replica/checkmarx-remediation.md.
4. **Feature acceptance:** Full Miro parity, native keyboard/table behavior and several hosted flows remain unchecked in GATES.md. Which product scope should be the release criterion? Source: source/GATES.md; source/replica/features.csv.
5. **Accessibility/browser support:** No complete verified compatibility or WCAG conformance matrix is present. Define target browsers and audit scope. Sources: source/public/index.html; source/public/design.css; source/GATES.md.
6. **Scale/operations:** Production concurrency limits, SSE/D1 cost, monitoring, backups and restore objectives are not established by model scale scripts. Sources: source/cloud/lib/board-service.ts events branch; source/scripts/check-frame-validation-scale.mjs; source/replica/backend.md.
7. **Documentation conflicts:** Historical architecture describes a Postgres plan; implemented schema is D1. Maintain historical intent as such instead of documenting planned infrastructure as live. Sources: source/replica/architecture.md; source/cloud/db/schema.ts.
8. **Installed package purpose:** Some dependencies have no direct lexical runtime import. Confirm their intended use before removing them; tooling and transitive relationships may still require them. Source: reference/dependencies.md; source/cloud/package.json.
9. **Automatic narrative review:** The included watcher updates evidence and flags narrative drift. Truly semantic prose updates require a reviewing engineer/model; no unattended model service credential is configured. Source: tools/refresh.mjs; docs/documentation-maintenance.md.
`,
'docs/documentation-maintenance.md': `# Automatic documentation maintenance

Run node tools/refresh.mjs --watch from this folder. The watcher hashes allowlisted source content, ignores node_modules/builds/Git/local state, debounces changes and writes only within this export. It refreshes sanitized source copies, the manifest, dependency/configuration/file/symbol inventories, code-marker/change-history references and generated document sections, then rebuilds the ZIP. Polling covers missed watcher events. It starts no external service and transmits no source.

The reviewed narrative baseline is recorded in tools/review-baseline.json. When source content changes, every generated document gets a REVIEW REQUIRED notice and SOURCE-STATUS.md lists drift. The tool does not invent new features or turn an outdated test result into a current pass. Update tools/content.mjs and inspect changed source before running node tools/refresh.mjs --accept-reviewed. This acknowledgement is a human decision, not a validation bypass. To install grammar-check tooling locally run npm install --prefix verification/diagram-check --no-save --ignore-scripts --no-audit --no-fund mermaid@11.17.2 jsdom@26. The static parser uses an isolated DOM for sanitization and does not drive a browser. Run node tools/verify.mjs and re-run the applicable exported-copy checks before distributing a refreshed ZIP.

Use --source-root <PROJECT_ROOT> when the export is detached from its original parent. Without an explicit root, the parent is accepted only when expected project entry files exist. Never point the watcher at the export's own source/ snapshot: that would create a misleading self-updating reference. A removed original file is recorded as retired; the no-delete export policy retains its old copied bytes and marks the source snapshot as requiring review. No obsolete copy is silently certified current.

The archive is generated by tools/archive.mjs with the filename project-export-mirra-YYYYMMDD.zip. It excludes archive recursion, node_modules, generated builds, local runtime/database state, install caches and logs. Manifest source hashes describe sanitized distributable files; original hashes identify provenance separately. Required local vendor tarballs remain included. No Git hook, CI file, startup task or original project file is modified.

For an always-on workflow, keep the watcher process running. It is not a restart-persistent Windows service. CI/startup integration outside this folder is intentionally not installed under the user's original-files constraint. When active, watcher state for this session is recorded locally in verification/watcher.json (live process state is excluded from the distributable ZIP); do not assume it survived a machine or application restart.
`,
'reference/glossary.md': `# Glossary

- **Board:** validated version1 document and editing transaction model; source/src/model.mjs::Board.
- **LocalLibrary:** device-local board collection with stars/spaces/trash; source/src/library.mjs::LocalLibrary.
- **Item:** one SVG/document object with stable id and recognized type; source/src/model.mjs::TYPES, validateDocument.
- **CloudSession:** identity-bound synchronization and conflict state; source/src/cloud-client.mjs::CloudSession.
- **Before-value:** expected prior field state used to reject a conflicting patch; source/src/changes.mjs::applyChanges.
- **Creation intent:** digest-bound idempotency identity for saving a local board to cloud; source/src/uploads.mjs::prepareCloudUpload.
- **Device draft:** unsent/recovery data separate from a saved document; source/src/drafts.mjs.
- **D1:** Cloudflare's SQLite database binding used by services; source/cloud/db/index.ts.
- **Presence:** expiring collaborator pointer/viewport/follow/attention records; source/cloud/db/schema.ts::presence.
- **SSE:** EventSource-compatible server event stream; source/cloud/lib/board-service.ts events branch.
- **Facilitator:** voting-session management identity subject to current board permission; source/cloud/lib/voting-service.ts::requireManage.
- **Sites:** hosting/control-plane integration expected by cloud scaffolding; source/cloud/.openai/hosting.json and cloud/README.md.
- **Reviewed fingerprint:** source content baseline against which narrative freshness is judged; tools/refresh.mjs.
`
};
