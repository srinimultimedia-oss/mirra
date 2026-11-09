# Styling and UX

> Provenance: see manifest.json and SOURCE-STATUS.md. Source paths below are relative to this export.

The main editor loads source/public/style.css before source/public/design.css. The later sheet overrides the base theme. Current design tokens include bg #f5f7fb, surface #ffffff, text #17253a, muted #5d6f82, border #dce3ed, accent #4055df, radius15px and a layered shadow. Font preference is Inter, Segoe UI, system-ui, sans-serif; naming Inter does not download it. SVG item colors, strokes and typography are document fields, not a blanket CSS theme. Sources: source/public/index.html; source/public/design.css::root; source/src/model.mjs::validateDocument; source/src/typography.mjs.

Floating controls use rounded surfaces and shadow; the dashboard uses dark navigation and a responsive board grid. Important responsive breakpoints appear at1000px,850px,600px and520px, with short-viewport rules. Reduced-motion media rules remove animation/transition behavior. Sources: source/public/design.css and source/public/style.css media rules.

The cloud React shell uses Tailwind, tw-animate-css and vendored shadcn CSS. Its --background/--foreground/etc tokens and .dark rules are a separate system. Do not infer a user-facing dark-mode switch in the vanilla editor from these definitions. Source: source/cloud/app/globals.css; source/cloud/app/layout.tsx::RootLayout.

Accessibility evidence includes labelled fields/buttons, dialog labels, status and alert roles, canvas tabindex, focus handling and keyboard paths. Inspect source/public/index.html, public/table-focus.mjs, public/table-editor.mjs and public/app.mjs. Screen-reader coverage, audited contrast for every state and browser-version compatibility are [UNVERIFIED]. The source uses modern APIs including SVG, structuredClone, native dialog, crypto, EventSource and optional navigator.locks; there is no verified minimum-browser matrix.
