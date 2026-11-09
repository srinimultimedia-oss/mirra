# Decisions log

> REVIEW REQUIRED: source changed since narrative review. Read SOURCE-STATUS.md; do not treat prior validation as current.

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
