# Behavior, rules and edge cases

> Provenance: see manifest.json and SOURCE-STATUS.md. Source paths below are relative to this export.

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
