# Glossary

> REVIEW REQUIRED: source changed since narrative review. Read SOURCE-STATUS.md; do not treat prior validation as current.

- **Board:** validated version1 document and editing transaction model; source/src/model.mjs::Board.
- **LocalLibrary:** device-local board collection with stars/spaces/trash; source/src/library.mjs::LocalLibrary.
- **Item:** one SVG/document object with stable id and recognized type; source/src/model.mjs::TYPES, validateDocument.
- **CloudSession:** identity-bound synchronization and conflict state; source/src/cloud-client.mjs::CloudSession.
- **Before-value:** expected prior field state used to reject a conflicting patch; source/src/changes.mjs::applyChanges.
- **Creation intent:** digest-bound idempotency identity for saving a local board to cloud; source/src/uploads.mjs::prepareCloudUpload.
- **Device draft:** unsent/recovery data separate from a saved document; source/src/drafts.mjs.
- **D1:** Cloudflare's SQLite database binding used by services; source/cloud/db/index.ts.
- **Presence:** expiring collaborator pointer/viewport/follow/attention records; source/cloud/db/schema.ts::presence.
- **SSE:** EventSource-compatible server event stream; source/cloud/lib/board-service.ts events branch.
- **Facilitator:** voting-session management identity subject to current board permission; source/cloud/lib/voting-service.ts::requireManage.
- **Sites:** hosting/control-plane integration expected by cloud scaffolding; source/cloud/.openai/hosting.json and cloud/README.md.
- **Reviewed fingerprint:** source content baseline against which narrative freshness is judged; tools/refresh.mjs.
