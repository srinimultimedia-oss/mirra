# Mirra

Independent implementation of a collaborative visual board application. Full feature parity with the requested Miro web app is an active objective, not an achieved claim.

Run `npm run dev`, then open the printed loopback URL. Run `npm test` for model verification. No dependency installation is needed for the initial canvas.

Discovery: `replica/recon.md`. Feature inventory: `replica/features.csv`. Acceptance tracking: `GATES.md`. The static loopback preview is device-local and unauthenticated. The separate `cloud/` application has managed sign-in, server-enforced board access and D1 storage; its production details are recorded in `replica/cloud-deployment.json`. Full Miro parity remains incomplete.

Checkmarx must scan this repository's current `main` commit, including the regular files under `cloud/`, `cloud/package.json`, `cloud/package-lock.json` and the audited local dependencies in `cloud/vendor/`. Historical source/deployment archives in `replica/` are local release artifacts and are not tracked scan inputs. The cloud source is included as regular files rather than a Git submodule so a normal GitHub checkout contains the dependency fixes. Local hosting Git metadata, credentials, database state, dependencies and build output stay excluded. From `cloud/`, run `npm run install:ci`; from the root, run `node scripts/check-requested-dependencies.mjs` to check installed versions and dependency-tree validity. The full finding ledger is `replica/checkmarx-remediation.md`; npm audit alone is not Checkmarx certification.

The dashboard supports device-local boards, recent and starred views, title search, sorting, spaces, copies, renaming, recoverable trash and restore. Existing single-board data migrates automatically while keeping the earlier recovery copy. Export your boards for off-device backups. Changes in another tab pause saving rather than silently overwrite a newer library; export unsaved work before reloading.

On the canvas, frame moves and copies include contained descendants. Select multiple objects in one frame and use Group, or Ctrl/Cmd+G; use Ungroup or Ctrl/Cmd+Shift+G to separate them. Frame selection surrounds selected objects with a new frame. Model and browser checks cover the recorded cases in the build log, not full Miro parity.

The properties dialog includes numeric geometry, rotation, opacity, borders, whole-object text styling and connector routing. Use Ctrl/Cmd+C, X and V for selection clipboard actions. Sticky tools include a palette and line-based bulk creation with one-step undo.

For server-backed boards, open Cloud from the board or Cloud boards from the dashboard. Saving a local board creates a cloud copy without replacing the local original. Retrying the same unchanged local source reopens that copy instead of duplicating it; duplicate the local board first if you want a separate new copy. A cloud session autosaves changes, receives live updates, shows collaborator cursors and supports comments/replies/resolve/reopen. Independent fields merge; conflicting fields retain the unsaved device draft and require resolution. Cloud uses periodic SSE refresh (approximately one-second update checks), not a character-level CRDT. Board owners can grant editor/commenter/viewer roles; collaborators also require access to the private Site itself. No email invitation delivery is configured.

`node scripts/sync-cloud.mjs` copies authored canvas modules into the hosting checkout before cloud builds. From `cloud/`, `npm run dev -- --port 5173 --hostname 127.0.0.1` starts the local full-stack preview after dependencies and pending D1 migrations are installed. Preview sign-in uses the starter's loopback-only development identity. Production does not include that mock identity. Root tests require Node 24 and use SQLite for API integration fixtures.

With the canvas focused, use N/T/O/F/K to select a note/text/ellipse/frame/card tool, then Enter to place at the visible center. The Table toolbar button also supports Enter placement on the canvas. Use Enter to edit a selected object and Ctrl/Cmd+Z to undo. Drawing and connector tools retain their pointer interactions; contextual hints describe each tool.

Cloud device drafts are scoped to the signed-in account and board. Older unlabeled drafts stay on the device and never restore automatically. When one exists for the open board, Cloud offers an explicit older-draft export with an ownership notice; only use that recovery for work that belongs to you.

For isolated role/latency browser QA, `node scripts/qa-roles.mjs` runs a loopback-only synthetic-identity server backed by in-memory SQLite and the real board API. Its identities are test fixtures, not authentication. Never deploy that script. It uses port 4180 by default; MIRRA_QA_PORT selects another local port. The query qa-delay=create delays board creation for duplicate-submit checks. Fixture data is separate from the regular preview and production.


A cloud session is bound to its authenticated account. If that identity changes, requests stop and the original account's draft stays available for recovery. Creation requests also use a persistent account/source/content intent and an atomic server receipt, including recovery after a lost response and page reload. These behaviors have local API and D1-preview evidence; production sign-in verification remains tracked separately.
