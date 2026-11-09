# Miro web application recon

Date: 2026-11-04. Target: https://miro.com/app/board/. Scope: complete web application feature parity requested by user, including account-available capabilities and independently identified paid capabilities. No reduced-scope completion criterion.

## Evidence boundary

The signed-in Edge window is titled “My First Board - Miro”. Computer Use refused access because it could not confidently detect the browser URL. No board UI was read, no private account data was collected, and no target code or private endpoints were inspected. The following is a preliminary public-documentation map; detailed control states, plan entitlement, and screen layouts remain unobserved. Revisit browser access using supported tooling when available. Do not bypass the policy guard.

## Sources

| ID | Source | URL | Evidence |
| --- | --- | --- | --- |
| D1 | Toolbars | https://help.miro.com/hc/en-us/articles/360017730553-Toolbars | Board, creation, collaboration, navigation controls |
| D2 | Essential tools | https://help.miro.com/hc/en-us/sections/26264590241682-Essential-Tools | Tool categories |
| D3 | Board items | https://developers.miro.com/docs/board-items | Public object types |
| D4 | Tables | https://help.miro.com/hc/en-us/articles/22760922335506-Tables | Fields, views, records and operations |
| D5 | Frames | https://help.miro.com/hc/en-us/articles/360018261813-Frames | Containers, presentation and export |
| D6 | Sticky notes | https://help.miro.com/hc/en-us/articles/360017572054-Sticky-notes | Notes, colors, bulk input and authors |
| D7 | Access rights | https://help.miro.com/hc/en-us/articles/360017572194-Board-access-rights | Roles and sharing scopes |
| D8 | Private mode | https://help.miro.com/hc/en-us/articles/9794413310482-Private-mode | Hidden contributions and reveal rules |
| D9 | Voting | https://help.miro.com/hc/en-us/articles/360017572274-Voting | Limits, sessions and results |
| D10 | AI workflows | https://help.miro.com/hc/en-us/articles/29722516406546-Miro-AI-Workflows-overview | Agents and visual workflow execution |
| D11 | Sidekicks | https://help.miro.com/hc/en-us/articles/30139627329042-Sidekicks | Selected-object context and generated formats |
| D12 | Prototypes | https://help.miro.com/hc/en-us/articles/26654269713682-Miro-Prototypes | Multi-screen generation and refinement |
| D13 | Pricing | https://miro.com/pricing/ | Entitlements; detailed comparison still to inspect |
| D14 | Free plan | https://help.miro.com/hc/en-us/articles/360017730373-Free-Plan | Paid feature boundaries |
| D15 | Home page | https://help.miro.com/hc/en-us/articles/360017571294-Home-page | Recent/starred navigation; board actions and search |
| D16 | Working with objects | https://help.miro.com/hc/en-us/articles/360017730953-Working-with-objects | Grouping, locking, stacking, rotation and clearing content |
| D17 | Precise resizing | https://help.miro.com/hc/en-us/articles/32903445474706-Precise-resizing | Numeric dimensions and format-specific rulers |
| D18 | Keyboard shortcuts | https://help.miro.com/hc/en-us/articles/360017731033-Shortcuts-and-hotkeys | Clipboard, editing and tool bindings |
| D19 | Connection lines | https://help.miro.com/hc/en-us/articles/360017730733-Connection-lines | Endpoints, labels and diagram connections |
| D20 | Comments | https://help.miro.com/hc/en-us/articles/360017730873-Comments | Threads, drafts, editing, resolve, read state and reactions |

## Preliminary screen map

| ID | Screen/surface | Purpose | Observation |
| --- | --- | --- | --- |
| S01 | Workspace/dashboard | Locate and organize boards | D15; target account UI unobserved |
| S02 | Board canvas | Create and manipulate content | Documented; account UI unobserved |
| S03 | Object context controls | Style and arrange selections | Documented; detailed variants pending |
| S04 | Board menu/preferences | Board lifecycle and settings | D1 |
| S05 | Templates and insert tools | Add content and reusable layouts | D1,D2 |
| S06 | Share and permissions | Role/scope management | D7 |
| S07 | Activity/comments | Discuss and review changes | D1 |
| S08 | Frames/layers | Navigate structured content | D1,D5 |
| S09 | Presentation | Present frames | D1,D5 |
| S10 | Facilitation | Timer, voting, private contributions | D1,D8,D9 |
| S11 | Tables and timeline | Structured work records | D4 |
| S12 | AI and workflows | Contextual generation and transformation | D10,D11,D12 |
| S13 | Integrations/media | External content and providers | D1,D3 |
| S14 | History/export | Recovery and external formats | D1,D5 |
| S15 | Team/admin/profile | Identity and organization controls | Discovery pending |

## Flows to verify

F01 Create/open/rename/reload a board. F02 Create/edit/move/resize/duplicate/delete content with undo/redo. F03 Connect and arrange a diagram. F04 Group content in frames and present/export. F05 Invite editor/commenter/viewer and verify isolation. F06 Concurrent editing, presence and reconnection. F07 Comment/reply/resolve and activity navigation. F08 Run timer/voting/private brainstorming. F09 Create/filter/sort/group tables and timeline records. F10 Generate and refine artifacts with selected canvas context. F11 Import/export and recover history. F12 Workspace lifecycle and administration. Each flow requires negative states, permissions, loading/error, long content, mobile, and keyboard validation.

## Inferred data model

Workspace -> members, spaces, boards. Board -> items, layers, frames, revisions, grants, comments, sessions. Items have stable ids, geometry, ordering, type-specific properties, and optional parent/container relationships. Connectors reference endpoints. Table -> fields, records, views, dependencies. Sessions include voting, timer, private state, presentation, presence. AI workflow -> nodes, edges, runs, generated artifacts. Provider connections belong to authorized users/teams. These are independent design inferences; they are not assertions about Miro's internal schema.

## Scope and uncertainty

The full requested scope remains active. Proprietary assets, source, logos, paid libraries, user networks, provider credentials, and Miro's hosted services are not implementation inputs. Corresponding functionality needs independent code and authorized provider integrations. No feature is removed from the inventory merely because it needs paid entitlements, credentials, or more evidence. Size: XL, with substantial discovery and verification remaining. Largest risks: concurrent editing semantics, scope/role enforcement, breadth of structured formats and AI/provider integrations.

QA-076 navigation source: https://help.miro.com/hc/en-us/articles/360017731053-Using-Miro-with-a-mouse-trackpad-or-touchscreen read2026-11-05 documents minimap in bottom-right controls and M toggle. This remains public behavioral discovery; signed-in account states are not certified.
