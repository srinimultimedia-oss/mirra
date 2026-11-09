# External services and dependencies

> Provenance: see manifest.json and SOURCE-STATUS.md. Source paths below are relative to this export.

## Runtime boundaries

The editor loads its modules/CSS from the current origin. Its cloud transport uses fetch('/api/...'), EventSource for board events and sendBeacon for leaving presence. ChatGPT hosting supplies authenticated-user headers and sign-in/sign-out/callback paths. D1 is the server database. Optional connectors are request-scoped platform capabilities rather than hardcoded provider credentials. Sources: source/src/cloud-client.mjs::cloudRequest, CloudSession; source/cloud/app/chatgpt-auth.ts; source/cloud/lib/connector-context.ts; source/cloud/lib/connectors.ts; source/cloud/db/index.ts.

No analytics endpoint, CDN script or hosted-font stylesheet was found in the inspected editor entry points. Public npm registry/repository links in manifests are installation/provenance references, not application telemetry. Sources: source/public/index.html; source/public/design.css; source/cloud/package-lock.json. Provider-specific connector actions wired to board UI are [UNVERIFIED].

## Sanitized examples

```http
GET /api/me
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"user":{"id":"<USER_ID>","email":"<USER_EMAIL>","name":"<DISPLAY_NAME>"}}
```

This projection is defined by source/cloud/lib/board-service.ts::identity and the me branch. Do not synthesize its authentication headers in a public deployment; the trusted gateway must establish them.

```http
GET /api/boards/<BOARD_ID>/events?revision=0&clientId=<CLIENT_ID>
Accept: text/event-stream

HTTP/1.1 200 OK
Content-Type: text/event-stream
```

SSE payloads and renewal behavior must be read from the events branch and CloudSession listeners, not assumed to be WebSocket frames. Source: source/cloud/lib/board-service.ts::boardAPI; source/src/cloud-client.mjs::CloudSession.

The dependency version/purpose table is reference/dependencies.md. React/Vinext/Vite serve the cloud shell; Drizzle describes D1; UI libraries support starter React components; Zod is installed but presence alone does not prove all business validation uses it. Core document/table validators are handwritten. Vendored font/OG and glob packages are licensed runtime inputs. Source: source/cloud/package.json; source/src/model.mjs; source/src/tables.mjs; source/cloud/vendor/SECURITY-PATCHES.md.

## Failure behavior

fetch requests have a10-second client timeout; CloudSession preserves/reviews drafts, tracks errors and reconnects EventSource. Server identity/access failures return JSON errors. A local device board can work without cloud service availability; pending cloud work is not guaranteed to become durable merely because a browser draft exists. Sources: source/src/cloud-client.mjs::cloudRequest, CloudSession; source/cloud/lib/board-service.ts::boardAPI; source/src/drafts.mjs.
