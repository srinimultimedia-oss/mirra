# Dependency inventory

Source: source/cloud/package.json and package-lock.json. Installed presence does not establish rendered usage. npm lockfile version 3. Import evidence below identifies actual consuming files; packages without a lexical import may be CLI/configuration/transitive inputs, and their product-level purpose is [UNVERIFIED].

| Package | Declaration | Locked version | Kind | Import/use evidence |
| --- | --- | --- | --- | --- |
| @base-ui/react | ^1.7.0 | 1.7.0 | dependency | source/cloud/components/ui/combobox.tsx |
| @hookform/resolvers | ^5.7.1 | 5.7.1 | dependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| @shadcn/react | ^0.3.0 | 0.3.0 | dependency | source/cloud/components/ui/message-scroller.tsx |
| class-variance-authority | 0.7.1 | 0.7.1 | dependency | source/cloud/components/ui/alert.tsx, source/cloud/components/ui/attachment.tsx, source/cloud/components/ui/badge.tsx, source/cloud/components/ui/bubble.tsx, source/cloud/components/ui/button-group.tsx |
| clsx | 2.1.1 | 2.1.1 | dependency | source/cloud/lib/utils.ts |
| cmdk | ^1.1.1 | 1.1.1 | dependency | source/cloud/components/ui/command.tsx |
| date-fns | ^4.4.0 | 4.4.0 | dependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| drizzle-orm | 0.45.2 | 0.45.2 | dependency | source/cloud/db/index.ts, source/cloud/db/schema.ts, source/cloud/examples/d1/app/api/notes/route.ts, source/cloud/examples/d1/db/schema.ts |
| embla-carousel-react | ^8.6.0 | 8.6.0 | dependency | source/cloud/components/ui/carousel.tsx |
| input-otp | ^1.4.2 | 1.4.2 | dependency | source/cloud/components/ui/input-otp.tsx |
| lucide-react | ^1.31.0 | 1.31.0 | dependency | source/cloud/components/connector-error.tsx, source/cloud/components/ui/accordion.tsx, source/cloud/components/ui/breadcrumb.tsx, source/cloud/components/ui/calendar.tsx, source/cloud/components/ui/carousel.tsx |
| next | 16.5.0-canary.45 | 16.5.0-canary.45 | dependency | source/cloud/app/chatgpt-auth.ts, source/cloud/app/layout.tsx, source/cloud/app/page.tsx, source/cloud/next.config.ts |
| next-themes | ^0.4.6 | 0.4.6 | dependency | source/cloud/components/ui/sonner.tsx |
| radix-ui | ^1.6.7 | 1.6.7 | dependency | source/cloud/components/ui/accordion.tsx, source/cloud/components/ui/alert-dialog.tsx, source/cloud/components/ui/aspect-ratio.tsx, source/cloud/components/ui/attachment.tsx, source/cloud/components/ui/avatar.tsx |
| react | 19.3.1 | 19.3.1 | dependency | source/cloud/components/ui/accordion.tsx, source/cloud/components/ui/alert-dialog.tsx, source/cloud/components/ui/alert.tsx, source/cloud/components/ui/attachment.tsx, source/cloud/components/ui/avatar.tsx |
| react-day-picker | ^10.0.1 | 10.0.1 | dependency | source/cloud/components/ui/calendar.tsx |
| react-dom | 19.3.1 | 19.3.1 | dependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| react-hook-form | ^7.85.0 | 7.85.0 | dependency | source/cloud/components/ui/form.tsx |
| react-resizable-panels | ^4.12.2 | 4.12.2 | dependency | source/cloud/components/ui/resizable.tsx |
| recharts | ^3.8.0 | 3.8.0 | dependency | source/cloud/components/ui/chart.tsx |
| sonner | ^2.0.8 | 2.0.8 | dependency | source/cloud/components/ui/sonner.tsx |
| tailwind-merge | 3.6.0 | 3.6.0 | dependency | source/cloud/lib/utils.ts |
| vaul | ^1.1.2 | 1.1.2 | dependency | source/cloud/components/ui/drawer.tsx |
| zod | 4.6.7 | 4.6.7 | dependency | source/cloud/scripts/connector-preview/host-binding.mjs, source/cloud/scripts/connector-preview/protocol.mjs |
| @cloudflare/vite-plugin | 1.67.0 | 1.67.0 | devDependency | source/cloud/vite.config.ts |
| @cloudflare/workers-types | 5.20261109.1 | 5.20261109.1 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| @tailwindcss/postcss | 4.2.1 | 4.2.1 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| @types/node | 22.19.19 | 22.19.19 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| @types/react | 19.2.14 | 19.2.14 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| @types/react-dom | 19.2.3 | 19.2.3 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| @vitejs/plugin-react | 6.0.2 | 6.0.2 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| @vitejs/plugin-rsc | 0.5.39 | 0.5.39 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| drizzle-kit | 0.31.10 | 0.31.10 | devDependency | source/cloud/drizzle.config.ts |
| eslint | 9.39.4 | 9.39.4 | devDependency | source/cloud/eslint.config.mjs |
| eslint-config-next | 16.5.0-canary.45 | 16.5.0-canary.45 | devDependency | source/cloud/eslint.config.mjs |
| json-rpc-2.0 | 1.7.1 | 1.7.1 | devDependency | source/cloud/scripts/connector-preview/connector-preview-session.mjs |
| raw-body | 3.0.2 | 3.0.2 | devDependency | source/cloud/scripts/connector-preview/host-binding.mjs, source/cloud/scripts/vite/connector-preview-plugin.mjs |
| react-server-dom-webpack | 19.3.1 | 19.3.1 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| tailwindcss | 4.2.1 | 4.2.1 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| tw-animate-css | ^1.4.0 | 1.4.0 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| typescript | 5.9.3 | 5.9.3 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| vinext | 1.4.4 | 1.4.4 | devDependency | source/cloud/next-env.d.ts, source/cloud/vite.config.ts, source/cloud/worker/index.ts |
| vite | 8.3.6 | 8.3.6 | devDependency | source/cloud/scripts/vite/sites-vite-plugin.ts, source/cloud/vite.config.ts |
| wrangler | 4.158.0 | 4.158.0 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| picomatch | file:vendor/picomatch-4.0.7+mirra.security.1.tgz | 4.0.7+mirra.security.1 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| @shuding/opentype.js | file:vendor/shuding-opentype.js-1.4.0-beta.0.tgz | 1.4.0-beta.0 | devDependency | source/tests/font-runtime-security.test.mjs |
| @vercel/og | file:vendor/vercel-og-1.0.3+mirra.runtime.2.tgz | 1.0.3+mirra.runtime.2 | devDependency | [UNVERIFIED] runtime use; inspect scripts/config or package relationship |
| braces | file:vendor/braces-3.0.3+mirra.security.1.tgz | 3.0.3+mirra.security.1 | devDependency | source/tests/remaining-security.test.mjs |

Root package has no declared dependencies. Vendored file tarballs and licenses are required installation inputs. See source/cloud/package.json::scripts for Vite/Vinext/ESLint/Drizzle/Wrangler CLI use.
