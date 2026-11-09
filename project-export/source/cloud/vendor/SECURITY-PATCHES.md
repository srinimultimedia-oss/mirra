# Auditable dependency remediation

## braces 3.0.3 + local depth-limit patch

`braces/` preserves the MIT-licensed upstream 3.0.3 runtime and public API.
Version `3.0.3+mirra.security.1` identifies a local patch, not an upstream release.
The parser rejects nesting beyond a fixed 128-level limit before recursive
cleanup. Compile, expand and stringify independently validate their AST with an
iterative traversal before walking it: maximum depth 128, at most 65536 nodes,
no child cycles/shared nodes, and consistent parent metadata. Caller options
cannot disable these guards. The installed tarball is overridden across all
parents and the original source and licenses are included for review.

`tests/remaining-security.test.mjs` exercises strings below the existing length
limit, deep/cyclic/oversized ASTs and ordinary nested alternatives, numeric
ranges, escaped literals, micromatch and actual fast-glob discovery. Guard
failures are explicit RangeErrors rather than call-stack exhaustion.

The reported CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm was withdrawn upstream on
2026-10-23 as not practically exploitable. No patched upstream version exists.
This patch adds defensive limits; a version-based Checkmarx result may still
need security triage using the patch evidence and withdrawal notice. Do not
rename the package, claim an upstream fix, or automatically suppress it.

Upstream: https://github.com/micromatch/braces/tree/3.0.3
Advisory: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

## picomatch 4.0.7 + local patch

`picomatch/` is the MIT-licensed upstream npm 4.0.7 runtime with a documented
local change in `lib/parse.js` for CVE-2026-112366. A raw unescaped `*` in a
single repeated extglob branch now enters the existing risky-pattern handling,
including when the optional recursion guard is disabled. Safe character-class
reductions and ordinary globs retain their existing behavior. Risky patterns
without a safe reduction are treated literally, following upstream handling.

This is not an upstream patched release. The version build metadata identifies
the local patch. The matching local tarball is used through npm overrides so
all parents load the same reviewed code. `tests/glob-security.test.mjs` exercises
the reproduced hostile patterns in a time-limited child process and checks
ordinary file globs and safe repeated alternatives.

Upstream: https://github.com/micromatch/picomatch/tree/4.0.7
Advisory: https://github.com/advisories/GHSA-fc5q-39xc-vjpf

## OpenType runtime packaging

`opentype/` contains the MIT-licensed `@shuding/opentype.js` 1.4.0-beta.0
self-contained CommonJS and ESM distribution bundles. Their runtime font
inflater is already embedded; neither bundle imports external `fflate` or
contains `unzipSync`. The unused external ZIP dependency is therefore removed
from this runtime-only package, as are development-only scripts/dependencies.
Source-map references are omitted because source maps are not shipped here.
The upstream version and license remain unchanged; no upstream security release
is claimed. ZIP extraction is not provided by this package.

Compressed WOFF and original TTF parsing plus actual OG PNG rendering are
verified by `tests/font-runtime-security.test.mjs`. This removes the separately
installed fflate ZIP API from the resolved dependency tree, rather than pinning
another release still affected by the reported ZIP issue.

Upstream: https://www.npmjs.com/package/@shuding/opentype.js/v/1.4.0-beta.0

## OG renderer runtime packaging and WASM compatibility

`vercel-og/` preserves the MPL-2.0 licensed @vercel/og 1.0.3 self-contained
runtime distributions, type declarations, fonts and WASM assets. External
build-time Satori/Resvg dependency declarations are omitted because these
runtime bundles already contain their used code. The bundles contain no
`unzipSync` or ZIP extraction API; removing their redundant external dependency
tree eliminates the separately installed fflate package. The rendering tests
exercise the actual packaged ImageResponse API, rather than an API stub.

Two missing upstream HarfBuzz runtime provisions were exposed by the tests:
the Node ESM entry now supplies a lexical createRequire/dirname context and the
official harfbuzzjs 0.10.0 hb.wasm asset is included, with its license. The Worker
entry imports this WASM as a precompiled module and instantiates that module
through Emscripten's documented hook; it does not require a filesystem or runtime
WASM byte compilation. The local version metadata identifies this packaging
patch and is not an upstream version claim. Source maps are omitted from the
runtime package. Corresponding modified source distributions are available in
this repository; upstream licenses are retained.

Upstream: https://www.npmjs.com/package/@vercel/og/v/1.0.3
HarfBuzz asset: https://www.npmjs.com/package/harfbuzzjs/v/0.10.0
