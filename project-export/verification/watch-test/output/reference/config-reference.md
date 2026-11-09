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


PORT is optional for the static server (default4173). SITES_MANAGED_LINUX_CONTAINER selects the managed execution profile. WRANGLER/MINIFLARE log/state paths are development settings. Source: source/scripts/serve.mjs; source/cloud/scripts/execution-profile.mjs; source/cloud/scripts/sites-env.mjs.
