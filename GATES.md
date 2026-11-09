# Gates: Mirra full board application

OWNS: src/**, public/**, tests/**, scripts/**, replica/**, cloud/**, package.json, README.md, GATES.md

Scope: Rebuild every identified Miro web-app feature, with a continuing inventory, independent implementation, and requirement-level verification. Full scope remains open until signed-in discovery and implementation evidence establish parity.

- [x] G150: Every Checkmarx SCA finding is mapped by result ID/CVE to current resolved dependencies; fixable vulnerable ranges are eliminated and any upstream-unpatched finding has explicit verified remediation evidence rather than a blanket clean claim.
  EVIDENCE: 2026-11-09 scripts/checkmarx-security-check.mjs passes against installed packages and lockfile: 99 SCA findings mapped, 90 updated, 4 removed, 2 uri-js findings replaced by fast-uri, 2 picomatch findings locally patched with timed exploit regressions, 1 braces advisory withdrawn upstream requiring Checkmarx triage. All paths and result IDs retained in replica/checkmarx-remediation.json; npm audit reports zero vulnerabilities. Local patch and font/OG runtime packaging documented with licenses; no fresh Checkmarx certification claimed.

- [x] G151: The reported Python/JavaScript input loops have explicit validated bounds, QA responses send CSP/HSTS consistently, and negative regression tests prove input rejection without breaking valid large boards or preview artifacts.
  EVIDENCE: 2026-11-09 bounded Python theme bytes/counts/patterns and fixed-range loops pass 3 Python tests; bounded frame traversal rejects oversized input and 100000-item cycles. Existing 10000-frame validation and 30000-frame containment/descendant checks pass. Real preview success/404 tests enforce CSP/HSTS; Worker and static asset policy share headers. Production preview5175 served board HTML200 and unauthenticated API401 with CSP/HSTS. Browser240 rendered dashboard/editor/export dialog with no warning/error logs.

- [x] G152: Clean installation, application/security tests, TypeScript, production build and private deployment pass; remediation evidence covers all103 report entries with fresh Checkmarx certification clearly distinguished from local verification.
  EVIDENCE: 2026-11-09 clean install, valid npm dependency tree, 536 Node tests, 3 Python tests, TypeScript and production build pass. Private production deployment appgdep_6af176cc9a68819184275cb6497834e4 succeeded from tested source fe8cc94a52fc6ca513c848e3a36a8cb1de46ac67. Full 103-finding ledger records local evidence; Checkmarx CLI/credentials unavailable, so security triage and a new scan remain required before certification. Existing broader feature-parity gates are unchanged.
- [x] G148: Installed cloud dependencies and lockfile resolve the five user-requested exact versions with compatible React/Next companions and no invalid dependency tree.
  CHECK: node scripts/check-requested-dependencies.mjs
  EXPECT: REQUESTED_DEPENDENCIES_PASS
  EVIDENCE: automatic-evidence=v1; definition-sha256=9116bbe909adffc7576afe7e958e0a42a95e9b4d74de28f6fa90f5517f13091e; exit=0; EXPECT=matched; output-sha256=2bbd2678efcaa5f063d9a818af4b719a979a2e7e911cd6aab977b181c8ae142e; output-bytes=298; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra\mirra; path=2835c4462a72/39 entries

- [x] G149: Updated dependencies pass application tests, connector protocol validation regressions, TypeScript checking and a production build; private cloud publication records the exact tested source.
  EVIDENCE: 2026-11-09 requested direct versions and all nested copies verified in installed tree and lockfile; compatible React/React DOM19.3.1, Next ESLint config, Cloudflare plugin/types, scoped canary peer override and patched Sharp included. Clean npm ci succeeded; full526 tests and TypeScript checking passed. Zod connector record schemas use explicit key/value API and four protocol tests retain JSON values, reject forged extra authority and enforce limits. Production build with Vite8.3.6 passed with non-blocking upstream sourcemap/future config warnings. Source11bb0c18875b7708c332057ccfb86ef176e5aadd pushed and owner-private deployment appgdep_6af15b541b9c81919a9f0ce162c08b28 succeeded. npm audit has23 other advisories:5high17moderate1low, none on the five requested package names. This is a dependency update, not a complete app parity/security clearance. Reports dependency-update-report.json and dependency-audit.json.
- [ ] G147: Native adding and removing a Unicode-named table field preserves existing records, rejects blank field names without committing, persists through peer reload, remains unavailable to viewers, and is recoverable through Undo back to the original schema.
  EVIDENCE: pending native field lifecycle verification.
- [ ] G146: Native Tab and Shift+Tab from table metadata text controls commit valid edits and reach the intended next control, preserve invalid drafts and saved values, and do not automatically apply restored recovery drafts without a new edit.
  EVIDENCE: pending native metadata keyboard commit/focus verification.
- [x] G145: Native number formatting, currency normalization, field rename and visibility changes preserve numeric source values through peer reload; invalid currency/type settings retain recovery input without committing, viewers cannot edit field settings, and Undo restores the original schema/content.
  EVIDENCE: 2026-11-06 QA102 isolated4223 owner236/viewer237 changed Estimate to percent with5% hint and unchanged numeric5, then currency USD. Renamed field using Unicode Points caféé. Explicit metadata-draft apply normalized eur toEUR and hint€5.00; invalidQ1 draft apply showed Invalid currency, retained Q1 versus savedEUR and numeric5; discard restored saved setting. Hide removed numeric cell, Show restored. Changing type todate rejected Invalid table cell with recoverable type draft; discard retained number type. Saved viewer reload showed renamed field, EUR, number5, €5.00 and disabled name/type/visibility/format/currency controls. Screenshot table-metadata-verification.png inspected. Six owner Undos plus saved viewer reload restored exact original two-object IDs/text/transforms. Both error logs empty; tabs/server cleaned. Native fill/Tab observations initially retained unsent text; explicit reviewed metadata apply used for currency. Blur-only commit timing is not certified by this pass; conflict/reload recovery remains covered by existing metadata tests.
- [x] G144: Native timeline displays inclusive date spans with correct relative widths, omits undated records, reports inverted dates without losing records, updates through saved peer reload, and Undo restores valid spans and original board content.
  EVIDENCE: 2026-11-06 QA101 same4222 fixture, owner Redo restored import. Viewer Timeline showed Café Feb28–Mar1 left0 width50%, Build Mar1–Mar2 left25 width50%, same-day Second Mar3 left75 width25%; undated Empty omitted. Screenshot table-timeline-verification.png inspected. Owner edited r1 end toFeb27 via native date input; after Live cloud saved and viewer reload Timeline visibly reported An end date is earlier than its start date. Owner Undo and saved viewer reload restored all three exact date spans/widths. Further import Undo and saved reload matched original two-object IDs/text/transforms. Both logs empty; fixture tabs/server cleaned. Full table matrix and hosted saving remain open.
- [x] G143: Native table numeric and checkbox filters support Match all/any, typed invalid filters preserve input and existing results, sorting and grouping retain source records, empty results recover through Clear filters, and viewer-only view changes leave data and Undo unchanged through peer reload.
  EVIDENCE: 2026-11-06 QA101 isolated4222 owner234/viewer235 imported four-record Unicode typed fixture. Read-only peer numeric sort asc Café/Second/Build/Empty and desc Build/Second/Café/Empty kept empty last; Stage grouping Complete1/Ready2/Unassigned1. Estimate>1 returned Build/Second; adding Done=false with all returned Second and any returned Café/Build/Second. Invalid Start2026-02-31 retained input and prior three results with valid-date error. Nonmatching title yielded0/4; Clear filters restored4 and viewer Undo stayed disabled. One owner import Undo plus saved peer reload restored original IDs/text/transforms. No browser errors. Screenshot table-view-verification.png inspected; typed engine cases remain in table-filters tests. View UI was not persisted as a saved account view.
- [x] G141: The rendered bulk field action applies valid typed values only to selected current rows in one undoable patch, retains unrelated edits, rejects invalid values and changed schemas atomically, and rechecks permissions and locks.
  CHECK: node --test tests/table-bulk-fields.test.mjs tests/table-filters.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=6998607de72cbedb284a414ff8f9c1c5a31cb7b78f5a173eca5e6174259eceef; exit=0; EXPECT=matched; output-sha256=469c7007e6b18ef9ed194dd447e2f4905612066946f3da86bb8da3e24a4b16fb; output-bytes=1060; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G142: Native multi-record number checkbox date and select edits persist through peer reload, invalid input retains saved values and entered text, viewer mutation stays disabled with selected rows, and Undo restores the original board.
  EVIDENCE: 2026-11-06 QA100 isolated4221 owner232/viewer233 duplicated source record and selected both rows. Bulk Estimate0 saved both zero with aggregate sum/average/min/max0. NaN rejected Enter a finite number while input NaN and saved zero values remained. Done false saved; invalid Start2026-02-31 retained entered text with Invalid table cell update and blank saved dates. Valid Start2026-02-28 and Stage Complete saved. After Live cloud saved and viewer reload, editor DOM read both0/false/2026-02-28/Complete; viewer selected both rows and Apply to selected remained disabled. Screenshot table-bulk-fields-verification.png inspected. Five Undos plus saved viewer reload restored exact original two canvas object IDs/text/transforms and one table record. Error logs empty; tabs/server cleaned. Schema-change and disjoint-merge cases covered by actual rendered-action tests, not native concurrent-schema editing.
- [x] G139: Actual rendered table bulk duplicate and remove actions use current selected records, remap internal dependencies while retaining external ones, clean removed dependencies, preserve source rows, support atomic Undo/cloud patches and recheck permission and locks.
  CHECK: node --test tests/table-bulk-records.test.mjs tests/tables.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=9d360e19e56619774fbf5613e49939d7c3f915a9f8df99b355f1ce41b97ad8a8; exit=0; EXPECT=matched; output-sha256=a39a0c1045076861dd6074bc69a808729ca225a3b00d5b26dc3c44d9c90abd2d; output-bytes=1290; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G140: Native table duplicate and remove flows retain dependency links through cloud peer reload, support full Undo restoration, and remain disabled for viewers with selected records.
  EVIDENCE: 2026-11-06 QA099 isolated4220 owner230/viewer231 selected source record and duplicated1 to2. Second row Add dependency selected original ID; both selected then duplicated2 to4, showing dependency badges on original second and copied second. Removing selected originals left copied two-row pair and dependency badge. Live cloud saved and viewer reload retained2 records and the dependency; viewer selected both and Duplicate selected/Remove selected stayed disabled. Screenshot table-bulk-records-verification.png inspected. Four owner Undos plus saved viewer reload matched original two canvas objects IDs/text/transforms and one table record exactly. Both error logs empty, tabs/server cleaned. Precise internal/external dependency remapping and patch validity independently verified by actual rendered-action tests. Hosted browser and full table parity remain open.
- [x] G137: Adding selected notes or cards to a table reads its current text-field schema and latest selected content, preserves source objects, commits a single undoable cloud patch, and rejects missing text fields, permissions, locks and invalid batches without partial changes.
  CHECK: node --test tests/notes-to-records.test.mjs tests/table-actions.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=7c694d99d3c5a6e4e35d06c5ace0dbd6da7c3ce0f2b61e12eada64b8bb1944ce; exit=0; EXPECT=matched; output-sha256=43bafde50dc7a37806f45298be60c0f0c36c47fa58edf2582467c8d4fa858c9b; output-bytes=975; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G138: Native canvas-note to table conversion preserves its source through saved peer reload, supports one-step Undo, and stays disabled for a viewer even when the note and table are selected.
  EVIDENCE: 2026-11-06 QA098 isolated4219 owner228/viewer229 Ctrl+A selected original sticky and table; Open table -> Add selected notes as records changed1 to2 records with Protected note copied into Work item. After Live cloud saved and viewer reload, two canvas objects retained with original sticky and both table records. Screenshot notes-to-records-verification.png inspected. Viewer Ctrl+A selected note and table, opened table and Add selected notes as records stayed disabled. One owner Undo plus saved viewer reload matched original IDs/text/transforms exactly. Both error logs empty; fixture tabs/server cleaned. Schema-change edge reproduced and fixed in rendered-action regression test, not a native remote-schema test. Hosted saving and full parity remain open.
- [x] G135: The actual table-to-card application callback preserves displayed typed values and source records, creates fresh cards atomically in one Undo entry, survives cloud patches and redo, and rejects permission, invalid or out-of-bounds batches without partial changes.
  CHECK: node --test tests/table-card-conversion.test.mjs tests/table-actions.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=78bfbcbd5039492037c596ff3549a4ff4f4ca1467b61e56605602765bd6a332d; exit=0; EXPECT=matched; output-sha256=fc162b3e42d65e50fee1b62adb31837a662fd1a0173759ed6d0d9852a9428c37; output-bytes=950; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G136: Native selected-record conversion creates the expected card through cloud saving and peer reload, preserves table records, supports one-step Undo and keeps viewer conversion disabled.
  EVIDENCE: 2026-11-06 QA097 isolated4218 owner226/viewer227 opened Protected table through Objects/Open table; Select visible records then Selected records to cards created a third canvas object with Work item: Protected record and Estimate:5. Live cloud saved and viewer reload retained card plus original one-record table and sticky. Screenshot table-card-conversion-verification.png inspected. Viewer opened table and selected its record; conversion remained disabled with1 selected. One owner Undo plus saved viewer reload restored exact original IDs/text/transforms and two objects. Browser errors empty; tabs and fixture cleaned. This verifies local cloud-service flow; hosted auth and complete table parity remain open.
- [x] G134: Native lock indicators on attached and free connectors follow their world-space midpoint after local and remote endpoint movement, stay absent when unlocked or presenting, preserve ordinary object lock placement and retain content through save/reload and Undo.
  EVIDENCE: 2026-11-06 QA096 isolated4217 owner224/viewer225 reproduced connector badges at4,15 while paths were M500 450 L800 450 and M450 650 L850 650. Fixed badges at658,468 and658,668 after saved reload; ordinary Target badge stayed local4,15. Source Shift+ArrowRight updated Attached badge to663,468 in viewer without reload. Unlock Portable removed its badge; Shift+ArrowDown then relock and saved viewer reload placed it658,678. Presentation had zero lock indicators and exit restored them. Four owner Undos and saved viewer reload restored five items, source400/400, both original paths and original badge coordinates. Error logs empty; screenshot connector-lock-verification.png inspected. Fixture retired, tabs/server cleaned; no schema/model behavior change.
- [x] G131: Descendant selection includes every nested frame object and owned connector independent of storage order, preserves seed/group expansion and excludes unrelated branches without mutation; copy, duplicate and movement use the complete selection.
  CHECK: node --test tests/descendant-selection.test.mjs tests/movement-locks.test.mjs tests/clipboard-order.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=a5d952ab4314e669281f27ec1524320a35c188d42c195cd1987f4b06d5f7dc73; exit=0; EXPECT=matched; output-sha256=b40da958aade95e65cb8f582db5683f77d9552d487fc90fd7800b8a34b22bc2d; output-bytes=1460; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G132: Selecting descendants of a 30000-frame reverse-ordered hierarchy completes within five seconds in an isolated process with correct membership and unchanged document bytes.
  CHECK: node scripts/check-descendant-selection-scale.mjs
  EXPECT: DESCENDANT_SELECTION_SCALE_PASS
  EVIDENCE: automatic-evidence=v1; definition-sha256=0e55db7071b3aa03ca69470852d43e77240d29c7e413a6e1ea9e4a5369a3cd88; exit=0; EXPECT=matched; output-sha256=e32420275b4d0a3d890dcd942af195dcc7e544027589dcf0d7d2d4a887c4eb0a; output-bytes=78; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries
- [x] G133: Native reverse-ordered nested-frame duplication includes all descendants, connector ownership remains valid through peer reload, locked descendants prevent partial movement, and Undo restores original content.
  EVIDENCE: 2026-11-06 QA095 isolated4216 owner222/viewer223 imported reverse-stored owned connector, note, inner frame, outer frame. Selecting Outer and Shift+ArrowRight showed Unlock grouped or framed objects before moving, with exact scene geometry unchanged. Duplicate Outer included all four objects; saved viewer reload showed eight including both owned lines, both notes and both frame pairs. Screenshot descendant-selection-verification.png inspected. Two Undos and saved peer reload restored original two objects with identical IDs/text/transforms. Both error logs empty; tabs/server cleaned. Benchmark covers model selection, not large DOM rendering or all movement/copy scale.
- [x] G129: Copy, duplicate and paste preserve source stacking order for interleaved connectors and objects, including implicitly included lines, portable ownership, fresh IDs, endpoint remapping, cloud patching and Undo.
  CHECK: node --test tests/clipboard-order.test.mjs tests/connector-clipboard.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=f2d7b57bec752646716f9033c2a20fb17656b968ef8eeae93f554da90c422cb9; exit=0; EXPECT=matched; output-sha256=467b66b812d38ee171dc52c7fe9604b456100024f1b74cee2246be9823be5fff; output-bytes=1396; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G130: Native duplication of a mixed connector/object selection preserves visual stacking order after cloud save and peer reload, remains undoable, and keeps viewer duplication disabled.
  EVIDENCE: 2026-11-06 QA094 isolated4215 owner220/viewer221 imported five objects in a/attached/b/free/c stacking order; native Ctrl+A Duplicate produced ten objects, preserving that sequence twice after Live cloud saved and viewer reload. Viewer Ctrl+A Duplicate disabled. Screenshot clipboard-order-verification.png inspected. Two owner Undos and saved viewer reload restored original two objects with exact IDs/text/transforms. Both error logs empty. Native OS clipboard contents were not changed; model tests cover clipboard serialization and cross-board paste.
- [x] G126: Deleting frames preserves connector content/endpoints, reparents explicit connector ownership to the nearest surviving ancestor or clears it, honors locks and selection deletion, and remains atomic and undoable with valid cloud patches.
  CHECK: node --test tests/frame-deletion.test.mjs tests/frame-deletion-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=cb1c7983b4e51f84494b99602329faeaf90bbfe962a7cba2512b49b48e318276; exit=0; EXPECT=matched; output-sha256=3ad233ccd3e44c40928c7c02ad2b1c3c68073b09fc6ada2aa91767e36d954e11; output-bytes=1215; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G127: Native frame deletion with explicitly owned attached and portable connectors succeeds, retains intended content through peer reload and Undo, and keeps viewer deletion disabled without console errors.
  EVIDENCE: 2026-11-06 QA092/093 isolated4214 owner216/viewer217: imported six-object fixture, deleted inner then outer frame, retained four objects and attached/free paths M260 240 L380 240 and M200 370 L400 370 through saved peer reload; viewer Delete disabled. Two Undos restored frames and third Undo restored original two-object board through cloud acknowledgements and peer reload, exact IDs/types/transforms/text matched original. Both browser error logs empty. Earlier4213 checks covered locked descendant movement, unlock/move, geometry and Undo; screenshot frame-deletion-verification.png inspected. Earlier fixture exposed lost import Undo, then fresh4214 verified ordering fix. Native file chooser and hosted saving remain open.

- [x] G128: Head-inserted or restored objects retain requested stacking order, idempotence and concurrent objects; real cloud acknowledgements preserve earlier application Undo entries through frame deletion and restoration.
  CHECK: node --test tests/create-order.test.mjs tests/frame-deletion-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=1042f471a1620db4776155895e3d194f308cb47e8d09829197a6f88a5ea0bc31; exit=0; EXPECT=matched; output-sha256=af612fc209d9d43681a1a75c11b98cf36144a9674455300241b0cec7b79b8e84; output-bytes=946; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G123: Indexed frame containment matches the existing exhaustive geometry rules for rotation, tolerance, nesting, equal-area parent preference and ID ties, leaves connector metadata unchanged and rebuilds correctly after frame moves.
  CHECK: node --test tests/frame-index.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=d6395159f15db866d5d21e3c432068e32ebe473918e5d2cd2e260f1a2fb78317; exit=0; EXPECT=matched; output-sha256=0c1eab0c6fb831f46b6145ad468825e1159515daa19c786f22d60f6ae18bf933; output-bytes=663; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G124: Board construction correctly reconciles30000 nested frames,30000 disjoint frame/note pairs and30000 coincident frame/note pairs within a five-second isolated-process budget, preserving hierarchy, ties and independent geometry.
  CHECK: node scripts/check-frame-containment-scale.mjs
  EXPECT: FRAME_CONTAINMENT_SCALE_PASS
  EVIDENCE: automatic-evidence=v1; definition-sha256=642a4c354b5f1e1479438e08ad1f05a74b927723112511848e5173c4870094bf; exit=0; EXPECT=matched; output-sha256=057fbcc1e9888b157c22855d933ec7178003e1bbdb21075f58b7a82a066988eb; output-bytes=172; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G125: Native overlapping equal-area and rotated frames preserve the intended descendants through movement, peer reload and Undo, with original content restored and viewer mutations disabled.
  EVIDENCE: 2026-11-06 QA-091 isolated4212 owner212/viewer213 imported7-object synthetic overlap/rotation fixture through Paste board JSON. Frame B Shift+ArrowRight moved B100→110 and its preferred Tie note150→160 while coincident Frame A stayed100 and unrelated objects stayed fixed. Rotated45° C Shift+ArrowDown moved C100→110 and rotated child160→170. After Live cloud saved, viewer reload retained exact transforms/content and all7 objects; viewer Ctrl+A left Frame selection/Delete disabled. Screenshot frame-containment-verification.png inspected. Two movement Undos plus saved peer reload restored fixture transform array exactly; third import Undo restored original Protected note/Protected table/Protected record and2 objects after reload. Browser logs empty; two tabs and fixture stopped. This is normal-size browser coverage, not a30k-node DOM/rendering benchmark; native file import and hosted browser checks remain open.

- [x] G120: Frame-parent validation handles forward references, disconnected trees and deep nesting without recursion, rejects missing/non-frame/self/cyclic parents, preserves accepted document bytes and leaves invalid transactions atomic.
  CHECK: node --test tests/frame-validation.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=88a90a718fa39017cdd030f81591cafddb045ad2bff0e1a981c5397632fa4a8f; exit=0; EXPECT=matched; output-sha256=b193a95a0d91e325c8a7055d457d58a643637d79748a7d7effe41c64788b56bf; output-bytes=626; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G121: A valid10000-frame parent chain and a deep cycle are validated or rejected within a five-second isolated-process budget without changing the supported document limit.
  CHECK: node scripts/check-frame-validation-scale.mjs
  EXPECT: FRAME_VALIDATION_SCALE_PASS
  EVIDENCE: automatic-evidence=v1; definition-sha256=65e3e6016e30c2d271b68c8696c76ef96fa86dc33b24c074f7d3ee3604690ce6; exit=0; EXPECT=matched; output-sha256=02441c46d28e79d7f5ea1aacb2dd6ac3ab6c52f7b98c63e6563a5e095a0b538b; output-bytes=75; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G122: Native frame-around-selection creates nested frames, preserves objects through peer delivery/reload, moves descendants once, supports Undo and keeps viewer frame creation disabled.
  EVIDENCE: 2026-11-06 QA-090 isolated4211 owner210/viewer211 selected original sticky/table with Ctrl+A and invoked Frame selection3 times, producing3 nested frames/5 objects. ArrowRight on outer frame moved x4/36/68/100/340 to5/37/69/101/341, exactly1 per object. After owner Live cloud saved, fresh viewer reload retained exact moved transforms; viewer Ctrl+A left Frame selection disabled. Fit showed all nested frames; screenshot nested-frame-verification.png inspected. One Undo restored all original positions while keeping frames;3 more Undos removed frames. Final owner Live cloud saved and viewer reload matched original IDs/types/transforms byte-for-byte,2 objects retained. Browser error logs empty; both tabs closed and fixture stopped. Scale benchmark is validation-only; large rendered-board containment/performance remains open.

- [x] G119: Native browser-tab title follows accepted remote board renames and local Undo/Redo without reload, while the dashboard retains its own title.
  EVIDENCE: 2026-11-06 QA-089 native owner208/editor209 on final code: owner renamed Remote title corrected café, peer input and document.title changed without reload. Owner Undo immediately restored Bounded JSON café 界 🚀 title and peer followed; Redo restored corrected name/title. Owner Home kept Boards · Mirra while peer retained corrected cloud name/title,2 objects and Live cloud saved. Browser error logs empty.

- [x] G117: JSON request parsing bounds actual UTF-8 bytes before full buffering, handles split code points and malformed or interrupted streams, rejects non-object bodies with400 and over-limit bodies with413, and preserves board/history state on invalid input while valid writes still succeed.
  CHECK: node --test tests/request-body.test.mjs tests/request-body-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=5d56c7a43887c788182e2d663a425b82286a9c056eaf875cfdfbaf6dff735731; exit=0; EXPECT=matched; output-sha256=190e1e3f10c6e3b39622a6c0e8d0c06e1920bab3bb88ea4cf31dbf15fd8f1f82; output-bytes=871; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G118: Native cloud document saving, comment submission and voting remain functional through the bounded request reader, including peer delivery and reload with preserved content and clear error-free status.
  EVIDENCE: 2026-11-06 QA-088 isolated4210 owner208/editor209 saved Unicode board name Bounded JSON café 界 🚀 and published Valid UTF-8 comment café 界 🚀; peer received both through live updates. Owner created UTF-8 choices café 🚀 voting, peer joined, cast1 vote for Protected note and marked done; owner ended and peer reload retained name/comment plus Session complete/Protected note1 vote/editor Done. Screenshot request-reader-regression.png inspected after scrolling results into view. Two original objects retained. Both browser error logs empty;2 QA tabs closed and fixture stopped. Production browser verification remains open.

- [x] G114: Bring-to-view accepts only authenticated owner/editor commands from a live owned client, targets current same-board collaborators, expires without document/history mutations and cannot spoof another client or cross board boundaries; migration preserves existing state.
  CHECK: node --test tests/attention-api.test.mjs tests/attention-schema.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=8787d03d99a27c88e86d764ce9628927950d40d25b993b398e8357ae73028696; exit=0; EXPECT=matched; output-sha256=84108561fcfb40f83665a02bf6fa72e771b064b44c309590b143a08ee4087b99; output-bytes=1087; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G115: Attention delivery is board/account/client scoped, consumed once across stream renewal, ignored after close or expiry and enables following until explicit local stop without document mutation.
  CHECK: node --test tests/attention.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=e897d19d9c82f758c0d829525ee339994cab1e10d391a88abf4951e22af732b7; exit=0; EXPECT=matched; output-sha256=d86c65d0332342ad7be1189f02d2e0bffe5a66b590ebf7be561b26afc20a82c9; output-bytes=527; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G116: Native owner/editor individual/everyone bring commands start live following for intended participants, notify receivers, permit local escape and preserve edits; viewer/commenter cannot issue commands and desktop/mobile controls remain usable.
  EVIDENCE: 2026-11-06 QA-087 isolated4209 owner204/viewer205/editor206/commenter207: owner150% individual Bring viewer by Enter produced viewer Following owner150% while editor stayed104% and not following. Viewer zoom stopped; owner everyone requested2 participants and editor/viewer followed. Fresh390px editor206 used Bring everyone by Enter, requested2 and keyboard focus returned to action; dialog356px/client354=scroll354, screenshot bring-everyone-mobile.png inspected. Receiver toast owner brought you to their view was explicitly awaited and observed. Incoming owner request preserved editor open Unsent attention draft café, two objects and disabled Undo; synthetic draft explicitly discarded without saving. Viewer Stop remained stopped across subsequent stream renewal. Viewer and commenter People dialogs showed follow actions but zero bring controls. API covers role/client/board isolation, revocation race, expiry and independent rate cap. Captured error logs empty;4 QA tabs closed, viewport reset and server stopped. Hosted authenticated browser testing remains open.

- [x] G112: Save status follows the active device/cloud source, rejects late messages from departed cloud sessions, and distinguishes saved, unavailable and failed device persistence without advancing failed library state.
  CHECK: node --test tests/save-status.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=75966715ebd5ee268335f44d77343431051a5f829ab646f38e74bc70ac8c9b1d; exit=0; EXPECT=matched; output-sha256=ff5d52712ab254383af7e8276973362e8457f84a013789a20eebf573793f8e07; output-bytes=522; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G113: Native cloud-to-device navigation and reload show the actual save destination in text and tooltip; quota failure and cross-tab changes remain visible without losing board content, with readable desktop/mobile presentation.
  EVIDENCE: 2026-11-05 QA-086 isolated4208 owner201/storage202/mobile203: cloud Live saved to Home/device displayed Saved on this device in text and title immediately and after reload.156 synthetic quota buffers caused442-character Unicode name save to fail while retaining name and enabled Undo; Home remained blocked until buffers removed. Corrected name saved and survived reload. Opening another local tab changed201 warning to Changed in another tab; its rejected edit stayed Unsent in first tab/Not saved while203 loaded durable Device status café. Mobile390 and320 quota warning remained visible and tooltip matched, no horizontal overflow; retry Mobile verified café survived reload. Mobile cloud saved name despite unavailable local backup, with full warning visible at320; header bottom112.78, panel top126.78. Final responsive spacing put collaboration bottom624/Export617 above zoom top632, screenshot cloud-save-warning-mobile.png inspected;640x390 landscape panel/collab/zoom stayed separate. Retry device backup cleared warning to Live cloud saved. Two cloud objects remained. Captured browser error logs empty; all3 tabs closed, viewport reset,156 QA buffers removed and fixture stopped. Hosted browser verification remains open.

- [x] G109: Shared viewport geometry validates finite bounded rectangles, computes centered follow cameras with zoom limits and stops safely on scope changes, absent/cyclic targets or explicit stop without document mutations.
  CHECK: node --test tests/follow.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=a4dafc5f2cb9394f2010db3f69a56c8eed0aaea4aa63b15b6a5850c63daf7b5c; exit=0; EXPECT=matched; output-sha256=cec81198c8a895d2aae83c12065bcfb4234fdaf7f3ef1263df6ce006cf4162b7; output-bytes=553; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G110: Presence viewport/follow metadata is validated and authenticated per board/client, cannot spoof another owner or cross boards, expires with presence and leaves document/history revisions unchanged; additive migration preserves existing state.
  CHECK: node --test tests/follow-api.test.mjs tests/follow-schema.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=ec801758b1724f81261e33ce36e700865a67b14f8d4099ef7d3998172da9f35d; exit=0; EXPECT=matched; output-sha256=19ef661ab0c349bc37539672f366df13e0809a3062128f9ea3b277dc14e113ba; output-bytes=813; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G111: Native owner/editor/viewer follow and stop flows mirror live viewports across desktop/mobile, notify leaders, stop on local navigation or departed targets and preserve board content, undo and access isolation.
  EVIDENCE: 2026-11-05 QA-085 disposable4207 owner197/viewer198/editor199/owner200: viewer followed owner zoom125% then104% with matching DOM camera transforms, owner saw1 following you; viewer→editor→owner chain tracked ultimate leader. Explicit Stop and local zoom cleared follow. Mobile390 editor searched owner and followed by Enter, dialog356px with client354=scroll354; centered view and banner screenshot follow-mobile.png inspected. Owner departure cleared mobile follow after presence expiry. Final optimized code owner200 followed editor125%, Escape stopped, second follow then native canvas click stopped without mutation; third follow then Home/device-board transition hid follow and People, kept empty device board and cloud objects unchanged. Owner/editor/viewer retained2 cloud objects and disabled Undo throughout; API tests verify account/client/board isolation and no document revisions. Browser error logs empty. Viewport reset, all5 tabs closed and fixture stopped. Hosted browser save verification remains open.

- [x] G107: Bulk-note preparation appends to the latest document atomically, rejects invalid scope/permissions/input/layout and oversized cloud documents before mutation, preserves raw input on failure and supports one-step undo of accepted batches.
  CHECK: node --test tests/bulk-notes.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=96743c76667bdeb2d9dca56599f61f395a264f9d08d8be1ec2ab70bda57aec43; exit=0; EXPECT=matched; output-sha256=6b9be38d8a46e2ee5ca67123f03c8659d57bfed96228bd79010dd2e0c597bcc9; output-bytes=481; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G108: Native bulk Enter-separated creation, cancel/error correction, cloud-size rejection, peer delivery, undo and viewer restrictions work with retained input and mobile keyboard layout.
  EVIDENCE: 2026-11-05 QA-084 disposable4206 owner193/editor194/mobile195:300x2500 CJK batch (750299 characters) rejected by UTF-8 cloud-size preflight, retaining all input,2 original objects and disabled Undo; Cancel/reopen retained input. Whitespace-only error corrected; native Enter separated Café/Second/Third, Cancel/reopen kept3 lines/2 columns, keyboard creation produced grid with200/170 offsets, peer received all3, one Undo restored2. Editor draft Hold this batch retained during owner downgrade to viewer with Create disabled/read-only warning and2 objects; role restore cleared warning and allowed commit, successful commit cleared input and Undo restored2.390px dialog349 client=scroll, buttons inside bounds; screenshot inspected. Mobile Cancel then open separate device board showed empty input; return to original cloud board restored2 lines and keyboard create/Undo worked. Final peer2 objects Live cloud saved, logs empty; viewport reset,3 tabs closed and fixture stopped. Unsubmitted input has no reload persistence and is labelled accordingly; hosted verification remains open.

- [x] G105: Sticky square/wide conversion is atomic and undoable, preserves height/center/content/style/tags and group identity, reconciles frames and connector bounds, rejects invalid/mixed/locked targets and invalid geometry without mutation.
  CHECK: node --test tests/sticky-shape.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=a7e8f18230389019e7bdc1aba9061eb0df04ced5908209dc449cdb49352fae3d; exit=0; EXPECT=matched; output-sha256=2dbc8df430fb9ebd138c7e87111b0e1c602a65a906000e73056fa32406b525ff; output-bytes=668; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G106: Existing sticky shape controls support keyboard/pointer conversion, peer synchronization, undo/reload and lock/viewer restrictions with readable desktop/mobile layout.
  EVIDENCE: 2026-11-05 QA-083 disposable4205 owner189/viewer190/mobile191: tagged existing note180x160 at100/100 converted by Enter to160x160 at110/100 and pointer to274.2857x160 at52.8571/100, retaining center190/180, Protected note text and Keep shape tag. Viewer received exact geometry and reload retained it; one Undo returned square and Redo wide. Lock and mixed note/table selection disabled both controls; viewer right-click controls disabled. Mobile390 keyboard square/wide worked with panelbody258 client=scroll and document390 client=scroll; desktop1440 document and panel256 fit. Existing Clear content context-menu focus remained clear-content-menu. Desktop/mobile screenshots inspected; error logs empty. Viewport reset, three tabs closed, fixture stopped. Group/frame/connector/rotation/invalid geometry are model-tested. Exact signed-in proportions/semantics remain inventory work; hosted saving remains open.

- [x] G103: Independent tab-scoped cloud backups survive another tab's late acknowledgement, reload with original baseline, and remain account/board isolated; older shared or closed-tab backups stay available for explicit review without automatic replay or deletion.
  CHECK: node --test tests/cloud-tab-drafts.test.mjs tests/cloud-journal.test.mjs tests/drafts.test.mjs tests/comment-client.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=d0bea566ee093002eebe35f293a14ec0b663856946c8a552218f452e604b1963; exit=0; EXPECT=matched; output-sha256=84f1e8de97c9139ff2ff60dcd788417739397b2d85aa2fc89d3aaf9eaa9cc12a; output-bytes=2542; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G104: Two native tabs retain divergent unsent board backups through peer saves and reload, expose other backups read-only, preserve correct role/account scope and fit recovery controls at mobile width.
  EVIDENCE: 2026-11-05 QA-082 disposable4204 A181/B182/control183: disconnected B edited Tab B unsent café, A saved Tab A independently. After B reload its Cloud list retained separate This tab revision0 and Other tab revision1; read-only reviews showed each distinct text. A own revision1 remained intact. Restoring B preserved its recovered local text and reported expected concurrent-edit conflict; fresh viewer187 confirmed durable server text stayed A. After both tabs closed, new owner188 loaded durable A and explicitly reviewed closed B revision0, with no automatic application. Viewer185 on another userId showed no owner backup list. Mobile186 review showed B preview, readonly JSON, initial scroll0, client/scroll354 equal at390px; Escape/Close returned opener and underlying board remained unchanged. Screenshot cloud-tab-backup-mobile.png inspected. Captured browser errors empty; viewport reset, all8 QA tabs closed and fixture stopped. Older shared backup migration, corrupted bytes, duplicate/no-lock forks and foreign identity suppression are covered by runnable tests; hosted verification/native downloads remain open.

- [x] G101: Device draft journal failure cannot block cloud submission or let incoming snapshots discard unsent edits; pending/error/conflict status retains the backup warning, successful backup retry clears it, and account/role guards still apply.
  CHECK: node --test tests/cloud-journal.test.mjs tests/cloud-client.test.mjs tests/drafts.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=6bf32972e47de26f53a82e1e26a3caa9d1df87fa4a54876262db62db02494cef; exit=0; EXPECT=matched; output-sha256=4fd4bcf6620c10c40e76746bd4c41da2cb68efb89ea71f7ac4d877518c9bfefb; output-bytes=2254; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G102: Actual browser storage quota exhaustion retains an edited cloud board, displays recovery limits, synchronizes with peers when online and recovers a failed write after restore without losing the local edit.
  EVIDENCE: 2026-11-05 QA-081 disposable4203 owner176/control177/viewer178/connection179/mobile180. Filled156 namespaced QA buffers until real QuotaExceededError. Before fix a saved-in-editor note was not submitted; synthetic disjoint peer addition replaced its text with Protected note and header Live cloud saved, reproducing data loss. Five regression tests failed before changes. After fix a quota-blocked device backup did not block cloud submission: viewer received Quota-safe cloud save. Combined native stream loss/503 write failure plus full storage retained Memory-only draft survives and displayed Offline draft kept only in this tab with backup warning. Restore committed the text alongside both peer additions without reload. Failed backup retry retained warning; Export current board opened existing export dialog without invoking file chooser.390px recovery panel fit (dialog client339 equals scroll339); screenshot cloud-quota-recovery-mobile.png inspected. Removed exactly156 QA buffers without deleting app data; Enter Retry saved backup, hid warning and focused Close. Owner retry cleared its own warning; viewer reload retained final Unicode note read-only. Captured error logs empty; viewport reset, five tabs closed and fixture stopped. Native download/file-import and hosted identity remain open gates.

- [x] G99: Planned event-stream rotation renews the identity-bound connection once with current revision, ignores stale sources and close callbacks, preserves unsaved/error/conflict status and exposes actual interruption/revocation without duplicate presence timers.
  CHECK: node --test tests/cloud-connection.test.mjs tests/cloud-client.test.mjs tests/cloud-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=067d3ff3545f4e7da7d3fd217b34036c117cd20de43d97dbf7edab980955d3e9; exit=0; EXPECT=matched; output-sha256=503645f8881e43d0b80460d482c5f2b7a34ae519699128165b77eab1339a5921; output-bytes=4339; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G100: Browser collaboration survives multiple planned stream rotations with peer edits and saved/read-only labels; a real interruption remains visible and reconnect restores live delivery without losing drafts.
  EVIDENCE: 2026-11-05 QA-080 disposable4202 owner172/viewer173/control174/editor175: fixture GET/POST control recorded11 scoped planned renewals across14 opened owner streams. Owner Unicode edit propagated to viewer. Forced native stream destruction and503 write rejection showed Connection interrupted then Offline draft kept, retaining local edited note while viewer kept last durable text. First recovery reproduced a terminal503 stream stall; added failing regression and bounded CLOSED-source retry fix. Final reload loaded the fix before a new outage: retained Recovered after503 note saved automatically after restore without another board reload; owner returned Live cloud saved and viewer received it read-only. A later editor Peer after recovery update reached both owner and viewer, proving recovered inbound delivery. Unit coverage preserves dirty/offline/conflict/identity/revoked states and suppresses retired callbacks; server test proves scoped renewal then clean close. Screenshot cloud-recovery.png inspected; captured browser error logs empty. Four synthetic tabs closed and fixture stopped. Production browser saving remains G13 open.

- [x] G97: Four stacking actions preserve relative selection order and frame slots, expand groups, respect local locks, reject invalid actions, create one undo step and retain concurrent cloud additions while conflicting on competing orders.
  CHECK: node --test tests/stacking.test.mjs tests/stacking-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=b05f8de1987f40e4ed978de64f52cfccc943e8927aa14d92dd3452324161e37d; exit=0; EXPECT=matched; output-sha256=16099a3159d19847b33e564f551fa05948e8a13b9f34a755a548ec9fa1bda16d; output-bytes=895; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G98: Stacking controls change rendered overlap order and persist through undo/reload/peer delivery, with frame/viewer restrictions, keyboard operation and mobile layout verified.
  EVIDENCE: 2026-11-05 QA-079 disposable4201 owner169/viewer170/mobile171 imported background frame plus overlapping A/B/C/D. Objects list selected covered A; Arrange opened and focused first enabled layer action. Forward rendered B/A/C/D; Enter Front B/C/D/A; Enter Backward B/C/A/D; Back A/B/C/D. Boundary actions disabled and focus moved to next enabled button. One Undo restored B/C/A/D and viewer reload confirmed durable order; native SSE later delivered B/C/D/A without reload. Lock disabled all actions; frame selection disabled Arrange, with frame first in rendered scene throughout; viewer right-click showed all four disabled.390px keyboard Front succeeded, panelbody243 equal scroll243 and document390 equal scroll390. Desktop screenshot visibly shows A above overlapping shapes with unchanged geometry, mobile screenshot inspected. Browser logs empty, viewport reset and fixture tabs/server closed. Exact signed-in multi-group semantics and production browser identity remain open.

- [x] G95: Clear content removes supported unlocked widget text and sticky tag assignments atomically while preserving catalog, styles, structure and unsupported widgets; undo/redo and cloud conflict/role guards protect the result.
  CHECK: node --test tests/clear-content.test.mjs tests/tag-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=af0f306a9187c280e59dee8bf76dc34a341e48f702d8e844016182b3e7111817; exit=0; EXPECT=matched; output-sha256=034a9f5077ae10c7e408b59850d0c216563836291f1da0a8b375e7c1a10c3bfb; output-bytes=1139; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G96: Visible and keyboard clear-content actions work with peer synchronization, undo, locked/unsupported/viewer restrictions and native text editing on desktop/mobile.
  EVIDENCE: 2026-11-05 QA-078 disposable4200 owner166/viewer167/mobile168: tag creation then right-click note opened Selection actions and focused Clear content; Enter removed text/tag badge together with unchanged transform translate100/100 rotate0/90/80. Viewer reload confirmed durable empty note and later native peer updates delivered Undo/clear with read-only status. One Undo restored both text and tag; catalog retained unchecked reusable tag. Locked note and unsupported table disabled both visible actions; viewer right-click action disabled and shortcut preserved board. Owner Ctrl+Backspace cleared unlocked note; same shortcut in Find removed only final input word.390px panelbody client/scroll258 equal, document390 equal scroll; keyboard Enter clear and Undo worked. Screenshot clear-content-mobile.png inspected. Browser error logs empty, viewport reset and fixture tabs/server closed. Other widget types and unsupported structured metadata remain feature-inventory gaps.

- [x] G93: Spreadsheet clipboard parsing preserves quoted tabs/newlines, Unicode, empty cells and rectangular layout within50 rows/100 columns/5000 cells/6000 codepoints per cell; importing is atomic/undoable and rejects invalid scope, permissions, layout or oversized cloud documents before mutation.
  CHECK: node --test tests/spreadsheet-paste.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=99ad92ce411ea0354681b5a7fb0b645e3833355bfd2f999261e628e20a107126; exit=0; EXPECT=matched; output-sha256=217c74760b72b6f1039f1b9da3bb59f0498b009147db51dc4c1852aea66f5cc1; output-bytes=981; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G94: Native spreadsheet paste previews notes/text choices, supports cancel and invalid-input recovery, leaves native text controls and selection clipboard intact, synchronizes with a peer and prevents viewer writes across desktop/mobile keyboard flows.
  EVIDENCE: 2026-11-05 QA-077 disposable4199 owner161/viewer162/mobile163: native quoted multiline Unicode TSV previewed2x2 including blank cell; keyboard confirmation created4 notes in grid and viewer received all4; one Undo restored original2. Cancel preserved history. Malformed quote retained raw input with Notes disabled; text fallback created literal text and Undo restored board. Selection clipboard remained immediate; native Find field paste stayed in input; viewer canvas paste could not mutate. Escape closed chooser without closing underlying Tags panel. Rich HTML-table hint with plain single cell opened1x1 and created one note; explicit Board-menu chooser supported plain single cell; ordinary plain text stayed immediate. Fixed reproduced mobile Cancel clipping by wrapping actions; all buttons inside dialog at390 and320px, document width equals320 scroll width. Screenshot spreadsheet-paste-mobile.png inspected. Error logs empty; clipboard restored, viewport reset, fixture tabs/server closed. Exact signed-in parity, large-board browser performance and hosted identity remain open.

- [x] G91: Minimap projection contains content and viewport for empty/negative/rotated/linked/freehand/extreme boards; inverse navigation and keyboard panning preserve zoom and never mutate document data.
  CHECK: node --test tests/minimap.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=4266c3db4bd23d03739245ab8b9b9dbf4730f753aa0b5fc65954e152e33a6a4a; exit=0; EXPECT=matched; output-sha256=fe6d6c6f415ffe360d1258833f2fd710a435d2fb6e1357594912b342fcb52cea; output-bytes=734; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G92: Minimap toggles by button/M, navigates by pointer and keyboard for owner/viewer, refreshes after peer edits, respects text inputs and presentation, and fits desktop/mobile layouts without changing board history or cloud data.
  EVIDENCE: 2026-11-05 QA-076 synthetic4198 owner159/viewer160: button and M open with map focus; viewer ArrowRight/Shift+ArrowDown changed scene camera while104% zoom, object IDs/transforms/text and disabled Undo stayed unchanged. Home fit, pointer click recentered and drag delta matched frozen projection; Escape closed and focused toggle. M typed in Find input stayed text. Owner added rotated negative-coordinate shape and frame; viewer minimap updated to4 nodes. Presentation hid map and navigation chrome; exit restored open map. Empty pasted board showed0 nodes and finite viewport; one Undo restored4. Mobile stacking bug reproduced then fixed (navigation z4/panel z2);390px map125..381 and320px map87..311 fit;320px zoom112..312 stayed clear of Undo8..101.844x390 maptop116/bottom312 stayed below header72. Screenshot minimap-mobile.png inspected; temporary viewport reset. Browser error logs empty. Large-board browser performance and exact signed-in parity remain unverified.

- [x] G89: Sticky tag catalog and assignments validate unique names and eight-tag limits; create/assign/rename/remove/delete are atomic, lock-safe, undoable, portable through clipboard and protected from stale cloud overwrites or dangling concurrent references.
  CHECK: node --test tests/tags.test.mjs tests/tag-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=dd6f79396a02148e785fd00b8c04124f26f984579c7f92ea85bea0476af5c62f; exit=0; EXPECT=matched; output-sha256=41548d0b8bd5130dd4e1f3cd7481796a22d5296edf549002fc609cb2c1ff9a1d; output-bytes=1551; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G90: Sticky tag controls support reusable creation, bulk assignment/removal, global rename/delete and tag search with rendered badges; desktop/mobile keyboard, reload, peer synchronization and viewer restrictions are verified.
  EVIDENCE: 2026-11-05 QA-075 synthetic4197 owner156/viewer157/editor158: Unicode create via Enter, duplicate retaining tag, remove on duplicate, mixed two-note selection and bulk apply, global rename, eight-tag cap with ninth rejection, tag-based board search returning2 notes after reload. Editor typed name survived owner rename; stale Save rejected until explicit latest-name review. Locked notes blocked global delete; unlock/delete removed bindings and one Undo restored catalog+both bindings. Viewer mutation controls disabled and live status remained read only after fix. Find tagged notes selected2; Escape returned canvas focus.390px panelbody client/scroll widths243 equal; screenshot sticky-tags-mobile.png inspected. Legacy pasted import cleared catalog and one Undo restored3 tagged fixture objects/name. This verifies core tag flows; exact signed-in parity and unsent rename reload recovery are not claimed.

- [x] G88: Unconfirmed/rejected voting ballots survive panel reopen and tab reload in the same account/board scope without automatic replay; retries retain original revisions, confirmed saves clear recovery, and corrupt/quota-failed/concurrently changed storage is preserved for explicit review.
  CHECK: node --test tests/voting-recovery.test.mjs tests/voting-client.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=f7b5b7e92857038f9912b233081fbac217c79baf11a3b9c6a796db3f00f3bb21; exit=0; EXPECT=matched; output-sha256=3448aac85fe9b1deef597574774c897c285c3f95cf2f63603c80a367e3c820e8; output-bytes=1868; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G87: Rejected voting saves retain their error and intended ballot for review; history refresh cannot move unresolved intent to another session, and ended-session intent cannot be resubmitted.
  CHECK: node --test tests/voting-client.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=5d1e03f5a04a557d39efbce0fa3fdb2a5e91b1f7c46435776e94d2a0f03a31c6; exit=0; EXPECT=matched; output-sha256=578abda26e1562bf2fa2f8174b3c6f36b5a92cfdd403eda99a4ce6bfd86ecf7d; output-bytes=871; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G86: Voting streams invalidate on initial connection, ballot/session changes, role changes and deadline expiry without sending any private allocations; the client rejects another board/account and ignores closed-session events.
  CHECK: node --test tests/voting-api.test.mjs tests/cloud-client.test.mjs tests/voting-client.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=d3447b8005da86453375c5b2604b0f50b1aabcf52fd6ae93d9f363accd45b652; exit=0; EXPECT=matched; output-sha256=f7cef1048ae351bc59aa14b59a878d40c32360acaa1db56e93b58e702c1e5cde; output-bytes=3326; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G82: Voting config/ballot validation enforces budgets and eligible objects, preserves private allocations in participant-specific projections and reveals only anonymous totals after completion.
  CHECK: node --test tests/voting.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=b8fa1144ab062e3c72504241b7381f9fbc20fbb9eeb196d0c77b036e495be73d; exit=0; EXPECT=matched; output-sha256=db1eeef5a7d1ae4975dd4cfc979b95d463df7e0f8fe96c2dc040fcfa9fdd8fe2; output-bytes=719; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G83: Voting API atomically enforces authenticated board access, facilitator rights, per-user revisions, budgets, session deadlines and anonymous result visibility under concurrent requests.
  CHECK: node --test tests/voting-api.test.mjs tests/voting.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=07f2d2db0a7e1e05e5f7d2493588bc089d4a710bdebdbc353cfe34e2e3fb1d7f; exit=0; EXPECT=matched; output-sha256=4a5ef3e4f0af3d5ed1f8b0a6768ee6cb500333f586db931dd29d54cb92278479; output-bytes=2203; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G84: Voting setup/join/change/done/extend/end/results/history flows work in owner/editor/viewer browsers and persist through reconnect with privacy intact.
  EVIDENCE: 2026-11-05 QA-072 synthetic4195 owner149/viewer150/editor151: setup Unicode title; join; three votes budget; release; done/reload; private zero allocations in facilitator/peer view; extension; rename; end anonymous totals table2/note1. Editor draft sticky-only single-per-item session started; viewer extra increment hidden after1 vote; automatic expiry showed note1 result without reload; history switched sessions. Skip closed panel without joining and reopening retained empty ballot. Empty selection rejected; Enter created a session; Escape returned canvas focus and final End focused session heading. Mobile390px panel scrollWidth equals clientWidth243 after select fix; inspected voting-mobile-results.png. Browser error logs empty. Core flows verified; latest50 history cap and advanced parity remain in feature inventory. Production schema confirmed QA-070; production browser identity remains G13 open.

- [x] G85: Voting migration enforces session/state constraints, one active session per board, valid private ballot JSON and cascading cleanup without changing existing board tables.
  CHECK: node --test tests/voting-schema.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=c7c6337a3148d104c2340d8ea3af91244e10b108ea53484570a059fd5d249c75; exit=0; EXPECT=matched; output-sha256=d375f2cf3de49daa0678e495582c9ee2de2663a8b5612461ce6038ab1f22168d; output-bytes=572; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G81: Timer completion notifies once for normal expiry or a newly delivered already-expired run, suppresses stale reload/reentry notifications and preserves independent board scopes.
  CHECK: node --test tests/timer-completion.test.mjs tests/timer.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=0ac10396756aab7d0c23b8c6c664eb049c5897d221e18be8ed9363b272e9bd80; exit=0; EXPECT=matched; output-sha256=0f2d9b3bca29a8a55f4d5f2a59d596f1861eedbeb9b55de5bd87db046183b4db; output-bytes=1701; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G79: Timer music validates known choices, preserves legacy timer documents and participates in conflict-safe shared timer transitions.
  CHECK: node --test tests/timer.test.mjs tests/timer-audio.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=cbe5f0bff055ec68741411e39070777e3d78d73a000ba2af01433aa6fd3cd4d4; exit=0; EXPECT=matched; output-sha256=70b26ea00e5a67ff92d7c163dda9b3b8215848b37671fcb3d58c0ef856e19ff6; output-bytes=1599; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G80: Timer audio requires local opt-in, supports local mute for viewers, reflects shared music selection and stops its playback engine on pause/reset/clear/completion.
  EVIDENCE: QA-068 fresh4194/session71439 owner142/viewer143; default muted, explicit opt-in reports running AudioContext/music, viewer shared track read-only and local toggle enabled. Pause/reset/completion return idle-enabled status; owner mute leaves viewer playing; pulse shared after SSE update. Test sound invoked,3s completion in both roles, clear/mute restores original2 objects/errors empty. Scheduling tests cover stop/clear/scope changes/late enable. Screenshot timer-audio-viewer.png. Physical speaker output not certified.

- [x] G78: Timer setup and controls remain keyboard reachable on portrait and short landscape screens; dismissing the panel from an input returns canvas focus while preserving a running countdown.
  EVIDENCE: QA-067 browser140 reproduced ignored Escape; fixed141 at390x844 closes from seconds/focuses canvas while badge counts01:00->00:16. Portrait Clear602..641 inside body142..641. At844x390 Restart and Clear205..244 inside body132..244 with heading93..132. Escape from Clear retains paused05:00. Timer cleared/original2 objects/errors empty; viewport reset. Screenshots timer-mobile-controls.png and timer-landscape-controls.png.

- [x] G75: Shared timer state validates start/pause/resume/stop/add/reset transitions, persists across serialization and merges independently from canvas edits while rejecting concurrent conflicting timer changes.
  CHECK: node --test tests/timer.test.mjs tests/changes.test.mjs tests/cloud-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=9731b8329cb27f0261f4b3d478f755f3fb3e05110ce2bdb1ece7a057681593fd; exit=0; EXPECT=matched; output-sha256=4d01245d75fe2e5126738d2ae7e02d3ed24163a3930786863f2bbe6fecdb4f7c; output-bytes=4080; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G76: Rendered timer supports shared countdown, setup, pause/resume/stop/add time, reload persistence, viewer restrictions and completion feedback in multiple clients.
  EVIDENCE: QA-066 fresh4193/session5057; owner135/editor136/viewer137 shared01:29 paused; owner add1/resume and fresh138 loaded02:28. Fresh138 pause focus Resume, add5/reset01:30, invalid0 rejected,2s completes Time is up/00:00 in all3 roles. Minimized badge/presentation overlay verified. Clear restored2 objects/no timer/errors empty.139 verified retained setup readout01:00. Screenshot shared-timer-complete.png. Music/chime/full responsive parity remain open.

- [x] G77: Cloud timer clock uses authenticated server-time samples and monotonic elapsed time rather than local wall-clock skew; invalid samples cannot replace a valid clock.
  CHECK: node --test tests/clock.test.mjs tests/cloud-client.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=393d4574308451f5c1eb082d4b4440710743d4afec9c7ccad1323b68d2da8c07; exit=0; EXPECT=matched; output-sha256=b019cb78657ccbcd3a09610355b437ad1332d80f59460f362d87c3728e8c702b; output-bytes=1522; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G74: Root-frame ordering accepts only complete permutations, preserves other object stacking, supports Undo/Redo and updates presentation order through cloud patches.
  CHECK: node --test tests/frame-order.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=f5642852faa8abe6c2745e739f75b3b564d20bdfccd96bf9374b5e4a9e1d6d1c; exit=0; EXPECT=matched; output-sha256=9c5f29306c9c81d641becea59518d15757c7681c70b3b629ad88cc58f7ec151c; output-bytes=402; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [ ] G72: Browser JSON import rejects malformed input without replacing the current board, imports a valid Unicode document and restores the previous document through one Undo.
  EVIDENCE: partial; browser128 malformed file rejected with original2 objects and Undo disabled. File chooser completed after10631s despite20s tool timeout; no repeated transfer. Valid file browser case remains pending.

- [x] G73: Pasted JSON import shows persistent validation errors within the dialog, imports a valid Unicode board and allows one-step Undo without losing the previous document.
  EVIDENCE: QA-063 browser129 retains invalid source and inline error with original2 objects/Undo disabled; valid café/rocket board imported and fresh editor130 loaded it; one Undo restores title and original2 objects. Viewer131 import action disabled. Captured errors empty. Screenshot import-inline-error.png. Native valid file case G72 remains open.

- [x] G70: Browser presentation visits root frames only, supports next/previous/Home/End/Escape and retains a coherent current frame when a peer changes presentation content.
  EVIDENCE: Owner125/editor126 on synthetic4192 verified3 root slides excluding nested frame, arrow wrap/Home/End, deleted-current fallback to B, live B title, A identity stable across reorder with index1->2, last-frame removal exits/focuses Present, and Escape exit. Fixture restored2 objects/errors empty. Five presentation tests pass; QA-062.

- [x] G71: Presentation hides editing selection outlines, resize handles and frame titles, then restores normal editing visuals on exit without changing selected objects.
  EVIDENCE: QA-062 browser127: editing selected5/handles4/titles1, presentation0/0/0 with connector stroke #4055df, Escape restores5/4/1. Original2 objects restored/errors empty. Screenshot presentation-clean.png.

- [x] G69: Frame chooser remains usable on portrait and short landscape screens; keyboard users can reach custom dimensions, reject invalid input and cancel placement without creating an object.
  EVIDENCE: QA-061 browser124 at390x844 and844x390: first preset focus, Tab reaches width, invalid0/Enter creates0 frames, Escape from width and submit closes chooser/selects Select/focuses canvas. Close button also cancels. Landscape submit rect204.75..243.75 inside body132..244; heading93..132 stays visible. Original2 objects/errors empty; viewport reset. Screenshots frame-chooser-mobile.png and frame-chooser-landscape.png.

- [x] G68: Frame creation offers named ratio presets and validated custom dimensions; chosen dimensions survive undo/redo and serialization, and browser placement respects cloud editing permissions.
  CHECK: node --test tests/frame-presets.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=9acd8a5163dd9c18df7b827d9d99bbc19ef550202a128bc62f625482c07ef794; exit=0; EXPECT=matched; output-sha256=bd571226700362d6b00a1f909ed815bb08f5109685cf5d362ca95617ca8d9839; output-bytes=363; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G67: Group accepts selections containing connectors and rejects grouping or ungrouping a locked member without partial changes or history entries.
  CHECK: node --test tests/group-connectors.test.mjs tests/model.test.mjs tests/group-line-alignment.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=62d0ab10dd5e1a07de0c21c9ae0d087aba2244030ee9d3724ae5e362ae283c4e; exit=0; EXPECT=matched; output-sha256=4b502084a3c522b0f7d12cad2f5b46be0f7a33210bdde5eaf82cc7b1e0c6872a; output-bytes=1773; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G66: Aligning a group translates portable connector endpoints with its shapes, moves attached endpoints only once and rejects locked group contents atomically.
  CHECK: node --test tests/group-line-alignment.test.mjs tests/frame-alignment.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=d4ea6b51e5beff7cf43f844934990600d7b564168718ed15eebc2cba8900c976; exit=0; EXPECT=matched; output-sha256=316e226f9c60ed7113fca4b5fc615eb97f3a68458c9d36da6c2da187130210e1; output-bytes=980; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G65: Frame border line-style controls render solid, dashed and dotted patterns and retain the selected style after reload.
  EVIDENCE: Browser111 synthetic4192 frame border rendered Dotted=2 5, Dashed=10 6, Solid=none; Dotted retained after reload. Screenshot replica/clone-screens/frame-rotated-containment.png. QA-057.

- [x] G64: Frames contain rotated objects by visible geometry, reject objects outside rotated frame boundaries, preserve nested descendant movement and prevent movement around locked rotated contents.
  CHECK: node --test tests/frame-containment.test.mjs tests/model.test.mjs tests/movement-locks.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=0e06ac51fb2360fb2b915d1f89af8324cf4cce719775e8c76a11690b52221531; exit=0; EXPECT=matched; output-sha256=4e1317062431ace71800558fe65606b5232d34ad10bddc939c15edead37b2b59; output-bytes=1897; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G63: Drag selection uses visible rotated geometry and current connector endpoints, includes portable lines, preserves whole-object containment and resolves grouped selections consistently.
  CHECK: node --test tests/marquee.test.mjs tests/model.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=e93aaca667efeeecb361ddd516fea19829c1322d5edeb79319de15c91aafec50; exit=0; EXPECT=matched; output-sha256=4b62b114ad7291eba9e5bf4310cd49142af1f4e011b10dea5a50967b2ab779d3; output-bytes=1539; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G62: Text Fill produces an optional visible background while untouched text remains transparent; background toggles, conflict checks, undo, cloud patches, legacy property recovery and standalone export retain intended state.
  CHECK: node --test tests/text-background.test.mjs tests/inspector-recovery.test.mjs tests/cloud-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=92d6f0429472c4edbac4e94a697ab2715da10360cc19179aabc55060fdb28f2a; exit=0; EXPECT=matched; output-sha256=6d0155889067f256615d16a7d3724b26980172e8847a8fb12cd083a8964b1a2e; output-bytes=3991; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G61: Selection color displays and updates visible connector/pen strokes after explicit line styling, handles mixed selections atomically, preserves locked objects and rejects read-only edits.
  CHECK: node --test tests/selection-color.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=3ce9bd047618a7b3c15167ee85d985cb8dab1b1eedacc7aa6fdafba0fddcbfbd; exit=0; EXPECT=matched; output-sha256=cb879e3e3c33d98016261d285ae543a224db914a418b01067f7685f4c6ef9789; output-bytes=462; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G60: Table preview typography reflects inspector settings with accurate defaults, optional automatic sizing, retained record content and styling in standalone SVG export.
  CHECK: node --test tests/table-preview-style.test.mjs tests/inspector.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=be394b44c5b92f4f612f2807ed985f0dce3d98d39400906f6417c08902177dfb; exit=0; EXPECT=matched; output-sha256=f1b0638e15013558d0279b3de1f1eaea639cecc2f25d59a1cd148f05cd9fcd35; output-bytes=1150; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G59: Connector label alignment and automatic text sizing affect rendered labels, preserve default typography and saved styling, and survive reload and cloud synchronization.
  CHECK: node --test tests/connector-label.test.mjs tests/inspector.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=42c7009a6efee3279712602a489c72162537a6593d499031b93a7529f6deb403; exit=0; EXPECT=matched; output-sha256=be984e212fea4238fa977bb72a0f505ac99b2cc7fa23354cfac7fad0be1097ad; output-bytes=1078; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G58: Narrow-screen side panels, selection actions and board actions occupy separate usable areas at portrait and short landscape widths; selection actions remain operable and closing the panel restores the normal canvas layout.
  EVIDENCE: 2026-11-05 browser98:390x844 panel y80..551, toolbar559..671, board actions679..764. Properties opened; Duplicate2->3 and Undo3->2.320x568 panel80..208, toolbar216..358, actions366..488; Tab reached Delete entirely inside toolbar after scroll.844x390 panel80..193, toolbar201..265, actions273..326; horizontal toolbar scroll reached Delete; creation rail scrolled to Table and back to Select. Final rail x8..72 remains separate from panel x80..836. Closing panel restored display:block/fixed toolbar. Viewport reset; screenshots mobile-panel-toolbar-fixed.png and landscape-panel-toolbar-fixed.png. Scope is these surfaces and viewports, not complete mobile accessibility.

- [x] G57: Find and Objects expose connector labels through stable keyboard-operable results, select current connector state and fit the actual line rather than its placeholder rectangle, including portable endpoints.
  CHECK: node --test tests/object-panel.test.mjs tests/connector-clipboard.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=be41e29204253e962080e013e54ce2ead66939f8c267245a9870b1411b501b6f; exit=0; EXPECT=matched; output-sha256=2dd6fca528f4242648cd59aa4dea4ffdbba86604910e3d7fbb6a84a90696a579; output-bytes=1607; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G56: Connector-only copy, cut/paste and duplicate preserve visible endpoints, routing and content without copying unrelated objects; pasted free endpoints move, serialize and synchronize safely while copied internal attachments remain linked.
  CHECK: node --test tests/connector-clipboard.test.mjs tests/editing.test.mjs tests/changes.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=0eed3fa6b0854f1018f56e367924a5ad502c7b70b0d06a5fa6a074a6523f2962; exit=0; EXPECT=matched; output-sha256=6004d4f2c8236ff2e84724f585dc015bb03e4eb180cf600b9ab713533b48527f; output-bytes=2286; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G55: Frame title formatting follows saved font, emphasis, color, alignment and automatic sizing, with accurate inspector defaults and consistent standalone SVG output.
  CHECK: node --test tests/frame-title.test.mjs tests/inspector.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=53be52581f93a3b5c51b71909d25928298beebed1e1abc8c3769dd547433e9ab; exit=0; EXPECT=matched; output-sha256=472ba694be3f33097d2adb8f65b28b044b896eea8aabfdafd11ab8b95f67af00; output-bytes=1010; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G54: Connector opacity remains editable without endpoint geometry controls, and the default label size shown in properties matches the rendered label; style edits preserve endpoints and remote changes.
  CHECK: node --test tests/inspector.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=75986b788255f0099dd95f55f0c4dcc1363a94ab9725bc946cb19b4f8a3b15a9; exit=0; EXPECT=matched; output-sha256=e8b90b4b8f1c812bd9ba152e24ae3545628fd84afdde7d092a8c2f6bd9a7f8bb; output-bytes=754; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [ ] G1: Signed-in screen and feature discovery covers the user's available Miro web application, including individual settings and edge states.
  EVIDENCE: pending; Edge URL policy detection prevented UI access on 2026-11-04. Public documentation research is partial discovery only.
- [ ] G2: Every discovered feature is implemented and verified against its individual acceptance criteria.
  EVIDENCE: pending; replica/features.csv is the continuing inventory, not a completeness certificate.
- [x] G3: Board model supports editing, geometry, undo/redo, serialization, and invalid-data rejection.
  CHECK: node --test tests/model.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=e5eb02db088712749ec876f44400ae85cb32a9ab2e1c464308cb89b0c766a62f; exit=0; EXPECT=matched; output-sha256=8e5ae9f4bee1cc13980fba9c7a8efab62d429a9a84716cffd8cc040ab50961e2; output-bytes=1140; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries
- [ ] G4: Browser flows work at desktop and mobile widths, including keyboard operation, persistence, recovery, sharing, and concurrent edits.
  EVIDENCE: pending; requires direct rendered interaction evidence for each flow.
- [ ] G5: Production identity, access isolation, collaboration, files, integrations, and AI capabilities pass integration and security verification.
  EVIDENCE: pending
- [ ] G6: Full feature comparison identifies no missing or partially implemented feature and all required end-to-end checks pass.
  EVIDENCE: pending; no claim of 100% replication is warranted before G1-G5 are met.

- [x] G7: Local board library preserves documents through board creation, switching, copy, rename, star, space assignment, trash and restore, rejects stale writes, and survives storage errors.
  CHECK: node --test tests/library.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=ac4f32cbc774e829651cd082d8c511ee77fb9261a9a51d6b763e76ebbe2528b0; exit=0; EXPECT=matched; output-sha256=08704e5ac25619a9d8cda8b85d4021e5981c1029f40e743642f4cfedfd3961e0; output-bytes=683; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries
- [x] G8: Dashboard board lifecycle is usable in the rendered browser and preserves existing board data during migration.
  EVIDENCE: 2026-11-04 in-app browser tab 3: six-object legacy board preserved; separate empty board created; star/filter, copy, trash/restore, space create/assignment/filter, rename, title search (1 match and 0 matches), alphabetical sort, and reload persistence visibly verified. Desktop and 390x844 screenshots saved under replica/clone-screens/dashboard-*.png. This gate covers local lifecycle only; G4/G5 remain unmet for production and collaboration.

- [x] G9: Editing operations preserve valid geometry and styling, copy/paste remaps relationships, and bulk creation is atomic with meaningful invalid-input controls.
  CHECK: node --test tests/editing.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=0914c9c6719d02432e6b1ec38e17f9bd587a3fa209783417caf27c2e89d2a3ad; exit=0; EXPECT=matched; output-sha256=04e2b47f67ed3f5a92a989aa88042c78768db9129e27de4a5a54e6d19112114b; output-bytes=1074; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries
- [x] G10: Inspector, shapes, bulk sticky creation, and selection copy/paste work through the rendered application and survive reload.
  EVIDENCE: 2026-11-04 browser verified three bulk notes with one-step undo/redo; numeric 200x180 sizing and 15-degree rotation; 24px bold text; diamond creation; clipboard paste produced a second unique shape id; elbow routing, dashes, both-end arrows and label persisted after reload; negative width was rejected. Properties inspected at 390x844 and viewport restored. SVG download retained inline text layout, label and rotation and omitted resize handles. Scope is the implemented editing cases, not complete rich text or diagram parity.

- [x] G11: Server access isolation, member roles, independent edit merge, request idempotency, same-field conflict, and event-stream behavior pass integration tests.
  CHECK: node --test tests/cloud-api.test.mjs tests/changes.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=b87c6bc18b9ebe16f93ed9770d8d7d2e59d48f439f462d555a516929bd69b43b; exit=0; EXPECT=matched; output-sha256=e6fb5140490385bfb97a27989d928cda12b9f19d4ed07f055fe32a8ae8266c10; output-bytes=3055; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries
- [x] G12: Live client preserves in-flight edits, retries exact operation ids after transport failure, merges disjoint updates, retains conflicting drafts, and handles permission downgrade.
  CHECK: node --test tests/cloud-client.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=ffd4835e5739f6042f9767809c1cf3d4baf1350f36794874482588161eb7ff65; exit=0; EXPECT=matched; output-sha256=59a6ffd4ec75cce8108813daadea94982224a60d203dcd83ed82aa17486e2403; output-bytes=1087; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries
- [ ] G13: Hosted cloud publication succeeds and durable save plus live synchronization are verified on the deployed application.
  EVIDENCE: pending; local two-client bidirectional editing and persistence across server restart verified, hosted verification still required.

- [x] G14: Typed table records, schema edits, filters, sorting, grouping, calculations, dependencies, timeline bounds, serialization and cloud patch validation pass behavioral tests.
  CHECK: node --test tests/tables.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=589fc49cd9267669fe24db2fc8f959e1904431f795518491c9cddab7defbb0d2; exit=0; EXPECT=matched; output-sha256=3432a7bfbae85b8953375c5b31701d9ea4679cf821810f971c378b7138ca583c; output-bytes=895; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries
- [x] G15: Table editing and refreshed visual controls work in the browser at desktop and mobile widths without breaking existing cloud edits and comments.
  EVIDENCE: 2026-11-04 local full-stack browser verified typed records; sorting/filter/grouping; bulk estimates; schema visibility/currency; dependency cycle rejection; live disjoint cell merge and stale same-cell draft retention; root/reply/resolve discussion; actual 390x844 navigation and table opening. Schema expansion/scroll defect fixed. Detailed cases, screenshots and limitations in replica/test-plan.md.

- [ ] G16: Current application functionality passes the full flow matrix in replica/test-plan.md, with fixed reproduced failures and no unresolved critical bugs.
  EVIDENCE: pending; current QA pass started 2026-11-04. Missing capabilities remain explicit in features.csv.


- [x] G17: Browser history routes open local and cloud boards, retain the current route on failure, and serialize rapid transitions.
  CHECK: node --test tests/navigation.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=e99d2c2124312a60c9ef2dc727ac6f9bb9329cab5e062571088fb63a0bd1c858; exit=0; EXPECT=matched; output-sha256=83db3b7fd10846889c37ca0f51b760c2d6ffb09337ba8e1bf4b66d8c1ccd80a9; output-bytes=373; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G18: Cloud request failures preserve HTTP status, identify login redirects, reject malformed responses, and stop authentication retries without losing drafts.
  CHECK: node --test tests/cloud-request.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=5a9a02bd26428d0833bd6975367d5d0fd4a3eca6d756b0842b97ea22202a1960; exit=0; EXPECT=matched; output-sha256=3df3bed2eb96d172f66635e59c63243bb0d0438062963b50e425847ff1f8c561; output-bytes=637; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G19: Application dialogs expose names from their visible headings, and invalid imports preserve the current board with an actionable error.
  EVIDENCE: 2026-11-04 browser DOM resolves all eight dialog names and AX names export/editor. Invalid version and malformed JSON imports show errors while complete rendered object id/text/transform arrays remain unchanged. See replica/test-plan.md and clone-screens/qa-invalid-import.png.

- [x] G20: Keyboard users can place supported canvas objects with Enter, edit them, and undo the creation while pointer creation continues to work.
  EVIDENCE: 2026-11-04 browser verified keyboard note/text/shape/card creation and editing with undo; stable sticky 3->4->3; frame 3->4->3; table 1->2->1 with table editor; pointer frame creation remained 3->4->3. See clone-screens/qa-keyboard-placement.png.


- [x] G21: Rendered viewer and commenter sessions permit allowed actions while blocking canvas mutation, including templates and stale open dialogs.
  EVIDENCE: 2026-11-04 synthetic loopback real-API browser verified viewer restrictions and table inspection; commenter publication; no cross-account comment recovery; live editor downgrade blocks stale bulk and retains visible text draft; outsider board denial. Detailed evidence and screenshots in replica/test-plan.md.

- [x] G22: Cloud device drafts are isolated by authenticated user and board, reject read-only writes, preserve corrupt/legacy data without automatic cross-account restoration, and handle storage failures.
  CHECK: node --test tests/drafts.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=ebab840bbfb99255ffa8aea85edb52ce7c72e0b9fd8acf4dfe4296c297963c1a; exit=0; EXPECT=matched; output-sha256=bbacee7b93bb4840772e9f724ce77c601f0e9d8a8a301f9081999534282c9646; output-bytes=730; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G23: Double-clicking cloud save creates one copy, and finishing a delayed upload does not replace the active board after the user closes or navigates away.
  EVIDENCE: 2026-11-04 750ms synthetic server latency reproduced two copies before fix, exactly one after; closed dialog retains local route; navigating to destination retains destination after completion, with one source copy and no destination copy. See replica/test-plan.md and qa-single-cloud-upload.png.


- [x] G24: A live session cannot apply or submit another account's data after authentication changes; drafts remain bound to the original account and server rejects mismatched expected identity.
  CHECK: node --test tests/cloud-client.test.mjs tests/cloud-request.test.mjs tests/cloud-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=7cfd6cfa2c3cfdd7b53958cc2bc5d7543be0dcd5d9e3fc77016b9ba789158b70; exit=0; EXPECT=matched; output-sha256=fee968c7e1f394c9e5be47a43424149de011e55f5659c2294c878608b1d63fd2; output-bytes=4134; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G25: Cloud creation retries use a durable account/source intent and server receipt so lost responses and concurrent retries create one board without accepting changed payloads.
  CHECK: node --test tests/cloud-api.test.mjs tests/uploads.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=ebb2a212f63135d05502bf178d43fb4f3eb52f9c3d25a4715ac6e13d129bae2b; exit=0; EXPECT=matched; output-sha256=fc465399c23d63ab8f3435932ceaa9fe6a8c7a349d5b4f78771ef6d2e6e39bef; output-bytes=3195; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G26: Concurrent comment edits reject stale text without losing either draft, identical retries are idempotent, and removed comments cannot be overwritten.
  CHECK: node --test tests/cloud-api.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=3f4f47a2595a899cac2a076eab63b500887f3ca8e29b739d8c0b67261f6322b9; exit=0; EXPECT=matched; output-sha256=2f6c03c3c09804ceab9ea9144f7099f2fadf4694fff8e4fd33affd5ff9e34141; output-bytes=2635; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G27: Gesture commits cancel after permission loss, merge independent remote changes, rebase undo history, preserve conflicting drafts, and recover safely from invalid previews.
  CHECK: node --test tests/gestures.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=3ade57e4f189a95f6b4d6aea8981a9fa0580cce11bfbfdba2e6e8f2d7019ff00; exit=0; EXPECT=matched; output-sha256=5d7046a48a5a2422a9e60d8abbf55334371c823efdfda3fd6af11c65ab9431c4; output-bytes=798; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G28: Native controls keep their keyboard activation and editing behavior while canvas shortcuts still create, edit and move objects.
  CHECK: node --test tests/keyboard.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=7684ed36c2b25cd09de8d43d562db6530643b1a7582314b0d4ca7ef0ee8cb9ed; exit=0; EXPECT=matched; output-sha256=0a10a9f437548d500a2767acee99a56b9c6c8ed2edd811801cca92bd2acd2cab; output-bytes=786; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G29: Saving table cells keeps keyboard focus usable; Tab and Shift Tab commit once and advance to the adjacent enabled control without losing drafts on failed validation.
  CHECK: node --test tests/table-focus.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=487f8715f6b62f58182bbfecb1856064b8f2d6563ee727a7a02c1b1780062c36; exit=0; EXPECT=matched; output-sha256=b12fdf651e7ee78aadd36e76b3340db033d1dad74f0ce9d9268753cbdefd982f; output-bytes=585; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G30: Incomplete native number/date input cannot silently clear saved table data, and intentional empty values still clear cells.
  CHECK: node --test tests/cell-input.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=e7805f5247c3c657b00cb2a5144a13216aea68ba5f9c7b4fa86866c1eb650b1e; exit=0; EXPECT=matched; output-sha256=39ae261fb0815d113f3221107fb4fb84f3b0d7dfba7773c191a63f10f07db5cc; output-bytes=565; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G31: Duplicated tabs obtain independent comment draft namespaces, preserve inherited drafts, and retain their own recovery namespace after reload.
  CHECK: node --test tests/comment-client.test.mjs tests/comment-drafts.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=ae676325d49df79ae090a3aa0e9b105b732b2d811a3833a5b9670cacdb8d7a9b; exit=0; EXPECT=matched; output-sha256=923f321cfdab1790a3e83c8ea17c508ada986b4256585d302d5e3d0237cfac9a; output-bytes=1089; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G32: Unsent table cell drafts survive rerenders and reloads in their scoped tab; stale or removed cells cannot silently overwrite saved data and remain exportable.
  CHECK: node --test tests/table-drafts.test.mjs tests/table-cell-commit.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=bdc5367a67f0102848cd0963e96379a31f8bfdc7ce99122176110b0f279c0944; exit=0; EXPECT=matched; output-sha256=abac1a9336d9e0b0b123c594bf9443d604d5caa750eac972c71cbb44bd81d6c0; output-bytes=1131; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G33: Board-level recovery finds unsent table input after the table is removed, respects account and board isolation, and exposes stored bytes plus in-memory drafts without recreating content.
  CHECK: node --test tests/table-recovery-index.test.mjs tests/table-cell-commit.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=f591364c1bfc4a94d5d133e95fe918124b5ebcbc402cdc112f2d7352f44f0239; exit=0; EXPECT=matched; output-sha256=0baed419ce23bf4505dd30b9bbcdb1be5a7ab98f210c398e794c91295f35b203; output-bytes=1026; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G34: Access changes submit once, keep their original board identity, preserve a user's closed or newer dialog, and recover control state after failure.
  CHECK: node --test tests/member-ui.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=66cf4c918bce0acf2d623c336eb08e6322612f074650f79ca761a6d9dd7b89cd; exit=0; EXPECT=matched; output-sha256=e2cd65331ad7dff31c7f8d5758aa110d169d99f76b0a76123cf614cf84150f21; output-bytes=831; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G35: Objects and Find panels reflect current edits and deletions, retain stable button focus, and navigate with current object geometry.
  CHECK: node --test tests/object-panel.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=47558584123f2941dafac32ce3592b00a53ddbfdb35e7ed7e4ec9893e994293a; exit=0; EXPECT=matched; output-sha256=70c91b5b318a8d951045abc8aa165b97243f5ee45c2594d0052fbcc42d55b10d; output-bytes=811; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G36: Table builder inputs retain their intended field/value through rerenders and reject changed fields or invalid checkbox values before applying.
  CHECK: node --test tests/table-forms.test.mjs tests/cell-input.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=36729e95970f10746976ebb7b6b8435f2d332274d012a4f37d4063dba74dcfa0; exit=0; EXPECT=matched; output-sha256=95b0de2232c6993cf5d098a356a160b66cc81fe5e8d1b4ae61ab3c15d4d5ed72; output-bytes=1087; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G37: Table title and schema drafts survive scoped recovery and reject stale or incompatible metadata writes while preserving independent changes.
  CHECK: node --test tests/table-metadata.test.mjs tests/table-drafts.test.mjs tests/table-recovery-index.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=ac2a4426ab637eb58882c5782f6300a06c4fb1e1538c8be65f363836f3452c50; exit=0; EXPECT=matched; output-sha256=34c7fad5602a5d27a7bf99b67a17cb1c9cba0a4f1dc935927593329c0cd59385; output-bytes=1816; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G38: Typed filters reject invalid comparison values before addition and report incompatible saved filters after remote schema changes, without clearing pending input.
  CHECK: node --test tests/table-filters.test.mjs tests/tables.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=28b6f239312439a29a7b294029fe4086cbbcb618ea1239b08a8e53ba4bbf0b05; exit=0; EXPECT=matched; output-sha256=a5f384fce62b14e4e7cd4156289e8c5487281b3f1730a87328d810f0756c6e1b; output-bytes=1376; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G39: Table exports and record-to-card conversion use current saved records and schema even when a focused control deferred remote rerendering; invalid current views fail visibly.
  CHECK: node --test tests/table-actions.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=d58e7d9394e7cac53fdbf04eaa6c54125e0c2c3c6517c7dfb3771fbe0058fdc5; exit=0; EXPECT=matched; output-sha256=bb1ec5614f9b25a9bead8f8e67fe94adbdd52245e95bc15741a6ec90ccda4ac3; output-bytes=581; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G40: Presentation follows a stable current frame through remote rename/removal and keyboard navigation works from presentation controls without intercepting editable fields.
  CHECK: node --test tests/presentation.test.mjs tests/keyboard.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=811c226cbc4fd98c108cd9b0af3dcfeef3f3561d731d665ca14deb5c4b50170f; exit=0; EXPECT=matched; output-sha256=22124905e6c6e5ba00c55305701939b626fb575fcc0bc46c00a343292a678953; output-bytes=1246; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G41: Presentation controls and long frame names remain readable and operable within a 390px viewport without horizontal clipping.
  EVIDENCE: 2026-11-05 browser58 measured controls within390px (bar12..378; button bounds36..354), then320px (bar12..308; buttons72..248). Long unbroken Unicode frame name wraps; navigation works; active frame rectangle fits after viewport change. Screenshot presentation-mobile-long-name.png; viewport and board fixture restored.

- [x] G42: Object text saves reject stale content, removed/locked objects, permission loss and changed board/account scope while preserving typed input for explicit review.
  CHECK: node --test tests/object-editor.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=4aa803b5fe71ad57a70efcf83b7d293973968da8e3fddad61e893ee6b58962b4; exit=0; EXPECT=matched; output-sha256=a649fbf42f2debe8efb76f4f16bd16cfa07386519b267f886951660aa704a821; output-bytes=699; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G43: Property inspector applies only edited fields, preserves independent remote edits, rejects overlapping stale changes and disables irrelevant hidden controls.
  CHECK: node --test tests/inspector.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=75986b788255f0099dd95f55f0c4dcc1363a94ab9725bc946cb19b4f8a3b15a9; exit=0; EXPECT=matched; output-sha256=9037b01280b5200698296b8a2e22a9eda7f99c9ceb414665afcd01825119326c; output-bytes=752; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G44: Async board import cannot replace another board/account or newer edits; invalid, oversized and cancelled imports preserve the current board, and successful imports remain undoable.
  CHECK: node --test tests/board-import.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=576ca6f506890b516f608e3dffefc6bf8c438c2936d45e5c91b041f80a60f314; exit=0; EXPECT=matched; output-sha256=59005753324a8208bec7c2ac55b3f988b4c7d090d419d0f193f84f3c9f07d424; output-bytes=771; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G45: Board-name autosave rejects stale rename baselines and changed identity scopes, preserves conflicting input across rerenders, and offers explicit reviewed retry or discard.
  CHECK: node --test tests/board-title.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=fe4d12297c473eb06e11c3ef9979117cb616837dae3ff01cf909df7057f5843b; exit=0; EXPECT=matched; output-sha256=38200ffa6e6dd681eb9f962d31901633864782a0daf8eee92f394d4373a2dd28; output-bytes=698; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G46: Rendered clipboard copy/paste/cut preserves synthetic Unicode content and object identity, supports undo, and leaves native text controls isolated.
  EVIDENCE: 2026-11-05 browser72/73 native paste retained Clipboard café 🚀; Copy payload carried original id and paste assigned a different id; canvas cut reduced text count2 to1 and Undo restored2; textarea paste/cut changed only native input and kept4 objects; malformed selection showed Paste failed; viewer cut copied selection without removal and paste kept4 objects. Owner Undo restored2 original objects; captured errors empty. Screenshot clipboard-invalid-selection.png.

- [x] G47: Aligning frames moves their descendants by the same delta without changing child layout, respects locked containers, and remains undoable.
  CHECK: node --test tests/frame-alignment.test.mjs tests/model.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=c337c86eb75fabd9b07545dc2e2135b5cd6f6208c70426bc0cb4ddcc9ad0780c; exit=0; EXPECT=matched; output-sha256=ae1ca717b551e6ca00084dec98e99f2adb96af224789410df61e7a3664c135f1; output-bytes=1702; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G48: Creation-tool and dashboard selections expose accessible pressed state, visible controls have names, and keyboard focus is visible without changing native control behavior.
  EVIDENCE: 2026-11-05 browser75 confirmed Sticky pressed true and Select false; keyboard V switched Select true. Native Tab focused Text with a 3px accent ring; rendered control-name audit found no unnamed board controls. Dashboard Starred/space/Recent pressed states updated; Enter opened New board with Name focused; Escape restored New board focus without creation. Focus contrast measured in replica/accessibility-audit.json. Screenshot keyboard-tool-focus.png. This is partial accessibility coverage.

- [x] G49: Moving grouped/framed selections cannot separate locked contents, and a remote lock during a gesture cancels without saving or losing authoritative changes.
  CHECK: node --test tests/movement-locks.test.mjs tests/gestures.test.mjs tests/keyboard.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=62d97e0a170c38e9b9ad617b2da5bf3e53f89ff9d955aebe90558ae58b2da03f; exit=0; EXPECT=matched; output-sha256=46f9a8010a25feca9fe2599392f3ad1effc9225b41ee53626e763a34df6c2747; output-bytes=1838; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G50: Standalone SVG export includes rendered frame/connector labels and rotated content in its viewBox without exporting selection handles or live collaboration overlays.
  CHECK: node --test tests/svg-bounds.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=69c48ed691cd0f4d1419116c0aafef9d0cf08b28733f211e772f57b65bd9c801; exit=0; EXPECT=matched; output-sha256=d99b7d0dba8903538860dc3d054c9e118cf86951d73e0c513b664de6727948c1; output-bytes=544; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G51: Unsent object text survives tab reload within its account/board/object scope, retains the original conflict baseline, remains exportable after deletion, and preserves corrupt/quota-failed stored data safely.
  CHECK: node --test tests/object-drafts.test.mjs tests/object-editor.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=97db7b64cfe3d99c247d4fbab7c93a2e29387fc2a4a9d7c1e05d542a6ad08981; exit=0; EXPECT=matched; output-sha256=e45606cae3c8a1926f538a505b70c1a68e7f613cf878726be6874e0bdaefe50c; output-bytes=1555; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G52: Pending board-name input survives reload within its account/board tab scope, requires reviewed recovery, preserves stale baselines and failed-storage bytes, and cannot be saved by a timer from another board.
  CHECK: node --test tests/board-title.test.mjs tests/title-recovery.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=e45b930a8b00a9fddcfbf7f02b2ff33678cc797dc58bd5dbe76b74ce620bbc9b; exit=0; EXPECT=matched; output-sha256=9b451eef1c95a757b95941e6a8f2ea3fbb0804699809f65cb7dfc7271e030bc5; output-bytes=1310; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries

- [x] G53: Inspector edits survive scoped tab reload with original comparison baselines, remain exportable after deletion, and can be explicitly rebased without treating unrelated newer properties as edits.
  CHECK: node --test tests/inspector-recovery.test.mjs tests/inspector.test.mjs
  EXPECT: fail 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=7632a064a00c4bee6d2f6b6a89d94875c6c4aa246711ab4f673bd183c4145b4c; exit=0; EXPECT=matched; output-sha256=fda881639ac3306a5f3af65c8db9553e1ec56ab67df0bd73b3909eb7b8fd430e; output-bytes=1710; shell=C:\Windows\system32\cmd.exe; cwd=C:\Srini\Mirra; path=2835c4462a72/39 entries
