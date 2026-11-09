# Mirra export acceptance

OWNS: project-export/**

- [x] E1: A runnable sanitized source snapshot and all requested documentation files exist; the AI context is between1500 and2500 words and design sections cover the requested16 topics.
  EVIDENCE: 439 sanitized source files and all15 requested files generated; AI context1688 words; design has all16 ordered sections. Evidence: verification/structure.json and reference/file-index.md.
- [x] E2: Source references, route handlers and Mermaid diagrams validate; credential/private-destination scanning finds no unredacted values; original project content stays unchanged.
  EVIDENCE: All source/file citations,12 component symbols and18 route references checked;5 Mermaid blocks parsed; source and package-archive text scanned with no unredacted values. All original source fingerprints match; original Git status shows only the new project-export directory. Evidence: verification/structure.json.
- [x] E3: Installation, tests, TypeScript and production build run only against the exported copy and their outcomes and remaining gaps are recorded honestly.
  EVIDENCE: Export-only install,540 tests, TypeScript,7 local migrations, production build, npm audit and dependency tree all pass. Both local server modes smoke-tested; legacy hostname option corrected only in docs; PUT405 recorded as a known issue. Evidence: verification/report.json and http.json.
- [x] E4: The export includes tested automatic refresh tooling, a documented cold-read handoff and a complete ZIP; narrative drift is explicit rather than silently certified.
  EVIDENCE: Watcher fixture test, cold-read check and ZIP creation pass. Automatic watcher started as hidden process36996 with read-only source policy and export-only writes. Narrative drift and restart limits are explicit. Evidence: verification/watcher-test.json, cold-read.md, archive.json and local watcher.json.
