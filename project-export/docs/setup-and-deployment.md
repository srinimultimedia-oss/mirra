# Setup and deployment

> Provenance: see manifest.json and SOURCE-STATUS.md. Source paths below are relative to this export.

## Prerequisites and root meanings

In this document PROJECT_EXPORT is the extracted export directory. source/ is the runnable sanitized snapshot, not the original workspace. Use Node24 or later plus npm; cloud/package.json declares Node>=22.13.0 but root tests require>=24. Git/tar and platform access are required for Sites publication, not for the device-only editor. Sources: source/package.json; source/cloud/package.json; source/cloud/README.md.

## Device-only editor

```sh
cd source
npm run dev
```

Open http://127.0.0.1:4173/. PORT can select another port. No install/build step is required for this mode. Cloud endpoints are not implemented by this static server. Source: source/scripts/serve.mjs.

## Full cloud development

```sh
cd source/cloud
npm run install:ci
node ../../tools/migrate-local.mjs
npm run dev -- --port 5173 --host 127.0.0.1
```

The included migrate-local helper writes a local-only Wrangler configuration inside this export, applies the ordered SQL migrations with Wrangler receipts, and uses the same placeholder database id and .wrangler/state directory as Vite. No production DB is touched by --local. Command outcomes are recorded in verification/report.json. Sources: source/cloud/vite.config.ts::localBindingConfig; source/cloud/drizzle/; source/cloud/package.json.

For reference, this is the underlying per-file SQL operation (not the preferred migration-receipt workflow):

```powershell
Get-ChildItem ./drizzle/*.sql | Sort-Object Name | ForEach-Object {
  npx wrangler d1 execute site-creator-d1 --local --persist-to .wrangler/state --file $_.FullName
  if ($LASTEXITCODE -ne 0) { throw "Migration failed" }
}
```

On a fresh database apply0000 through0006 exactly once. The execute loop has no migration receipts and must not be repeated blindly; use a proper tracked migration process for maintained environments. A dev server may persist under a profile-specific path; verify the DB path against Vite/Wrangler configuration. Read verification/report.json for observed command results.

Portable development auth is a loopback-only synthetic identity. Follow the local sign-in link; do not expose this server as production authentication. Source: source/cloud/scripts/vite/sites-vite-plugin.ts::sites; source/cloud/vite.config.ts.

The historical source/cloud/README.md uses --hostname. The pinned Vinext1.4.4 CLI rejects that legacy option; the --host form above was verified against the exported copy. This is a documentation compatibility issue retained in the source snapshot. Evidence: source/cloud/package-lock.json; source/cloud/scripts/run-framework.mjs; verification/http.json.

## Tests, types, lint and build

```sh
# From source/
npm test
# From source/cloud/
npx tsc --noEmit
npm run lint
npm run build
npm run start -- --port 5175
```

The start command reads dist/server/wrangler.json and is a production-build preview; it does not run Vite's synthetic sign-in middleware. Lint is listed because it exists, not claimed to pass unless recorded in the verification report. Install dependencies before tests that import cloud modules. Source: source/package.json; source/cloud/package.json.

## Synchronizing future edits

In a working copy, run node scripts/sync-cloud.mjs from source/ after changing root src/public modules, then build the cloud app. This intentionally writes hosted copies in that working copy. The export refresh tool never runs it against the original project. Source: source/scripts/sync-cloud.mjs.

## Production deployment

The production target is a Sites-managed Cloudflare Worker with a D1 binding named DB. Replace <SITE_PROJECT_ID> and <SITE_ORIGIN>, provision/authenticate hosting, apply migrations to the intended production D1, and use the official Sites source, build, package and private-deploy workflow. Preserve current audience; never upload browser backups, environment files or local DB state. There is no repository-owned npm deploy command and no standalone identity-gateway provisioning script. Deploying with bare Wrangler to another host is [UNVERIFIED] and requires a trusted auth-header boundary. Sources: source/cloud/.openai/hosting.json; source/cloud/worker/index.ts; source/cloud/app/chatgpt-auth.ts; source/cloud/README.md; reference/config-reference.md.

The original external Sites helper is not redistributed as an assumed dependency. A future operator needs a compatible installed Sites plugin/control plane, or must explicitly design a different production authentication/provisioning route. No deployment is performed while creating this export.
