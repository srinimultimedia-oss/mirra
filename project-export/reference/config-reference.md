# Configuration reference

## Required Configuration

| Name / placeholder | Used by | Supplied via |
| --- | --- | --- |
| <SITE_PROJECT_ID> | source/cloud/.openai/hosting.json | Provisioned hosting project; replace placeholder only in working copy |
| <SITE_ORIGIN> | source/public/app.mjs and hosted copies | Deployed private site origin; replace sanitized fallback link |
| DB | source/cloud/vite.config.ts, source/cloud/lib/board-service.ts | Cloudflare D1 binding and migrated database |
| Authenticated-user headers | source/cloud/app/chatgpt-auth.ts, source/cloud/lib/board-service.ts | Trusted hosting gateway; local development fixture only on loopback |
| CONNECTORS (optional) | source/cloud/worker/index.ts | Request-scoped platform binding |
| <PRIVATE_SOURCE_REPOSITORY>, <DEPLOYMENT_ID>, <SITE_VERSION_ID>, <CHECKMARX_RESULTS_URL> | Sanitized historical documentation only | Original operator records; not required for local application execution |
| <ORIGINAL_USER_PATH>, <ORIGINAL_WORKSPACE>, <USER_EMAIL> | Sanitized historical prose only | Non-runtime references; do not recover personal values for local execution |

## Environment names found in source

This is a lexical inventory of names, not evidence that every setting is needed. Defaults/conditional behavior must be read at the cited file. No current environment values are exported.

| Name | Files |
| --- | --- |
| A | source/cloud/public/public/cloud-backups.mjs, source/public/cloud-backups.mjs |
| BASH_SOURCE | source/cloud/scripts/build-verified.sh, source/cloud/scripts/install-ci.sh, source/cloud/scripts/install-pnpm.sh, source/cloud/scripts/sites-env.sh |
| C | source/scripts/check-requested-dependencies.mjs |
| CODEX_SANDBOX | source/cloud/vite.config.ts |
| DOTS_SLASH | source/cloud/vendor/picomatch/lib/constants.js |
| DOT_LITERAL | source/cloud/vendor/picomatch/lib/constants.js, source/cloud/vendor/picomatch/lib/parse.js |
| END_ANCHOR | source/cloud/vendor/picomatch/lib/constants.js |
| FONTS | source/cloud/public/public/app.mjs, source/public/app.mjs |
| H | source/cloud/public/public/minimap-view.mjs, source/public/minimap-view.mjs |
| HOME | source/cloud/scripts/install-ci.sh, source/cloud/scripts/install-pnpm.sh |
| JSON | source/cloud/lib/board-service.ts, source/cloud/scripts/connector-preview/connector-preview-session.mjs, source/cloud/scripts/install-ci.sh, source/cloud/scripts/npm-install.mjs, source/cloud/scripts/pnpm-install.mjs, source/cloud/scripts/vite/connector-preview-plugin.mjs, source/tests/glob-security.test.mjs, source/tests/remaining-security.test.mjs, source/tests/uri-compatibility-security.test.mjs |
| M | source/cloud/public/public/app.mjs, source/cloud/public/public/cell-paste.mjs, source/public/app.mjs, source/public/cell-paste.mjs |
| MINIFLARE_REGISTRY_PATH | source/cloud/scripts/sites-env.mjs |
| MIRRA_QA_PORT | source/scripts/qa-roles.mjs |
| MOBILE_BREAKPOINT | source/cloud/hooks/use-mobile.ts |
| O | source/scripts/qa-roles.mjs |
| ONE_CHAR | source/cloud/vendor/picomatch/lib/parse.js |
| PORT | source/scripts/serve.mjs |
| PPID | source/cloud/scripts/install-ci.sh |
| QMARK | source/cloud/vendor/picomatch/lib/constants.js |
| S | source/cloud/public/public/timer-view.mjs, source/public/timer-view.mjs |
| SHARP_IGNORE_GLOBAL_LIBVIPS | source/cloud/scripts/install-ci.mjs |
| SIGN_IN_PATH | source/cloud/app/chatgpt-auth.ts |
| SIGN_OUT_PATH | source/cloud/app/chatgpt-auth.ts |
| SITES_BUILD_KILL_AFTER | source/cloud/scripts/build-verified.sh |
| SITES_BUILD_TIMEOUT | source/cloud/scripts/build-verified.sh |
| SITES_ENV_READY | source/cloud/scripts/build-verified.sh, source/cloud/scripts/install-ci.sh, source/cloud/scripts/install-pnpm.sh |
| SITES_INSTALL_KILL_AFTER | source/cloud/scripts/install-ci.sh, source/cloud/scripts/install-pnpm.sh |
| SITES_INSTALL_LOCKS | source/cloud/scripts/install-pnpm.sh |
| SITES_INSTALL_LOCKS_PID | source/cloud/scripts/install-pnpm.sh |
| SITES_INSTALL_REPORT_PATH | source/cloud/scripts/npm-install.mjs, source/cloud/scripts/pnpm-install.mjs |
| SITES_INSTALL_TIMEOUT | source/cloud/scripts/install-ci.sh, source/cloud/scripts/install-pnpm.sh |
| SITES_NPM_CACHE_SEED | source/cloud/scripts/install-ci.sh |
| SITES_PNPM_BIN | source/cloud/scripts/install-pnpm.sh |
| SITES_PNPM_BOOTSTRAP_TIMEOUT | source/cloud/scripts/install-pnpm.sh |
| SITES_PNPM_CACHE_SEED | source/cloud/scripts/install-pnpm.sh |
| SITES_PNPM_SHARED_STORE | source/cloud/scripts/install-pnpm.sh |
| SITES_PNPM_STORE_LOCK_TIMEOUT | source/cloud/scripts/install-pnpm.sh |
| SITES_PNPM_STORE_PREPARE_TIMEOUT | source/cloud/scripts/install-pnpm.sh |
| SITES_PROJECT_ROOT | source/cloud/scripts/build-verified.sh, source/cloud/scripts/install-ci.sh, source/cloud/scripts/install-pnpm.sh |
| SITES_RUNTIME_ROOT | source/cloud/scripts/install-ci.sh, source/cloud/scripts/install-pnpm.sh, source/cloud/scripts/sites-env.sh, source/cloud/scripts/tool-environment.mjs |
| SLASH_LITERAL | source/cloud/vendor/picomatch/lib/constants.js, source/cloud/vendor/picomatch/lib/parse.js |
| START_ANCHOR | source/cloud/vendor/picomatch/lib/constants.js, source/cloud/vendor/picomatch/lib/parse.js |
| W | source/cloud/public/public/minimap-view.mjs, source/public/minimap-view.mjs |
| WIN_NO_SLASH | source/cloud/vendor/picomatch/lib/constants.js |
| WIN_SLASH | source/cloud/vendor/picomatch/lib/constants.js |
| WRANGLER_LOG_PATH | source/cloud/scripts/sites-env.mjs |
| WRANGLER_REGISTRY_PATH | source/cloud/scripts/sites-env.mjs |
| XDG_CACHE_HOME | source/cloud/scripts/install-pnpm.sh |
| XDG_DATA_HOME | source/cloud/scripts/install-pnpm.sh |

PORT is optional for the static server (default4173). SITES_MANAGED_LINUX_CONTAINER selects the managed execution profile. WRANGLER/MINIFLARE log/state paths are development settings. Source: source/scripts/serve.mjs; source/cloud/scripts/execution-profile.mjs; source/cloud/scripts/sites-env.mjs.
