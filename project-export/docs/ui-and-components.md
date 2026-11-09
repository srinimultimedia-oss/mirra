# UI and components

> Provenance: see manifest.json and SOURCE-STATUS.md. Source paths below are relative to this export.

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
