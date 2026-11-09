# Mirra project export

> Provenance: see manifest.json and SOURCE-STATUS.md. Source paths below are relative to this export.

This package is a sanitized source snapshot and evidence-based technical handoff for Mirra, an independently implemented visual board application. Read AI_CONTEXT.md first for orientation, then TECHNICAL_DESIGN.md and the focused documents in docs/. The manifest.json and reference/ files are machine-readable or generated inventories. Source references use paths relative to this export, such as source/src/model.mjs::Board.

## Start locally

Use Node24 or later and npm. For a dependency-free device-local canvas, open a terminal in source/ and run `npm run dev`; open http://127.0.0.1:4173/. For the cloud application, follow docs/setup-and-deployment.md: install in source/cloud/, apply the seven local SQL migrations, then start its development server. Production preview does not automatically grant a development identity.

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

From this folder run `node tools/refresh.mjs --watch`. It reads the original project above this folder and writes only inside this folder. The watcher refreshes sanitized copies, file hashes, dependency and symbol inventories, the manifest, and generated reference sections when source content changes. It refreshes the ZIP after successful refresh. It does not modify Git hooks, CI or startup configuration. To stop it, stop that process; to restart it, run the same command. A moved standalone export must pass `--source-root <PROJECT_ROOT>` to point at its maintained source.

Narrative docs are regenerated from reviewed templates, but a source fingerprint change marks them **REVIEW REQUIRED**. Automatic collection cannot honestly infer every new business rule. A maintainer must review and update tools/content.mjs, then explicitly acknowledge the new source with `node tools/refresh.mjs --accept-reviewed`. Never acknowledge changes without reading the diff. Verification results belong to their recorded fingerprint and are not silently reused after source changes. See docs/documentation-maintenance.md.

## Bootstrap prompt

Read README.md, then AI_CONTEXT.md, then TECHNICAL_DESIGN.md in this export. Check SOURCE-STATUS.md and manifest.json for provenance and stale evidence. Consult docs/ and reference/ as needed, and verify every proposed change against source/. Preserve data recovery, permission checks, revision/idempotency rules and local security patches. Treat [UNVERIFIED] items as questions rather than implemented behavior. Explain and test a change before claiming it works.
