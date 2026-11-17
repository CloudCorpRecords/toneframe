# BUILD REPORT — toneframe

Clean-room rebuild of `com.dtmframe/dtmframe` v0.1.2
(remote-only MCP server at `https://dtmframe.com/mcp/`),
built 2026-10-28 as a forwarding client. Package:
`@reneturcios/toneframe` 0.1.0, registry name
`io.github.CloudCorpRecords/toneframe`.

## Surface built

Full captured surface: **5 of 5 tools built**, none omitted.

| Tool | Required fields as served |
|------|---------------------------|
| `search_products` | NO `required` key in the capture — served verbatim, none invented |
| `get_current_offers` | `product_id` |
| `resolve_purchase_request` | `schema_version`, `mode` |
| `compare_products` | `schema_version`, `edition_ids` |
| `list_deals` | NO `required` key in the capture — served verbatim, none invented |

Each served tool carries exactly the keys `name`, `title`,
`description`, `inputSchema`, exactly as captured: this
capture carries a `title` key on every tool, served
verbatim, and each tool's `inputSchema` carries a per-tool
`$schema` key (`http://json-schema.org/draft-07/schema#`),
also served verbatim inside the schema. The capture's
`annotations` and `execution` keys were dropped at fixture
slimming (recorded in the fixture's `_source` note) and are
NOT served. The tool literals were generated
programmatically from
`harness/fixtures/dtmframe-tools-original.json` by the
script at `/tmp/b48-toneframe-scratch/gen.py` (parse +
re-serialise; the generator's round-trip assertion
confirmed the emitted literals parse back to the fixture's
tool objects) — never retyped — and the
registration-integrity test suite plus the parity harness
confirmed the served literals deep-equal the fixture's 5
tool objects, in order. Tools are registered via the MCP
SDK low-level Server API (`ListToolsRequestSchema` /
`CallToolRequestSchema` handlers), not McpServer+zod.

## The resolve_purchase_request computation-only distinction

`resolve_purchase_request` was weighed against the
purchase-commit rule and KEPT, with the distinction
recorded in the spec: its own description states
"Computation only… No purchase, no persistence, no
notification" — it computes product/setup candidates with
cost breakdowns and budget fit from typed constraints and
returns navigation links; it takes NO personal details
(its ownership inputs are user-claimed PRODUCT edition
entitlements, not identity or contact data), sends
nothing, and commits nothing — the "never submits" side
of the quote/booking rule. `compare_products` is the same
computation-only class. No payment execution, metering
charge, signup or send tool exists in the surface;
merchant purchase links live only on the site's own
pages, outside this surface.

## Fixture conflicts

**None.** The spec and the fixture agree on all 5 tools'
names, titles, descriptions, required fields (including
the two tools with no `required` key: `search_products`,
`list_deals`) and property shapes. The spec's notes that
every tool carries a `title` key and a per-tool `$schema`
key inside its inputSchema, and that the capture's
`annotations`/`execution` keys were dropped at slimming
and are not served, all match the fixture exactly.

## Labelled reconstructions (from the spec's Wire section)

- Upstream endpoint pinned: `https://dtmframe.com/mcp/`
  (trailing slash exactly as the record declares it).
- Env override `DTMFRAME_MCP_URL` — labelled reconstruction.
- The registry record declares NO headers on the remote: no
  auth header is ever sent. Tests assert that no
  `Authorization` header is sent under any environment —
  including with key-like env vars (`DTMFRAME_API_KEY`,
  `API_KEY`, `AUTHORIZATION`) set — and that no `X-API-Key`
  header is ever sent; upstream requests carry only
  `Content-Type`, `Accept` and, when issued,
  `Mcp-Session-Id`.
- Error rendering `toneframe error:` text for upstream
  failures — labelled reconstruction.
- Upstream results pass through verbatim, including
  `isError` and extra fields. tools/call is forwarded as
  streamable-HTTP JSON-RPC: initialize (protocolVersion
  `2025-03-26`) → notifications/initialized → tools/call,
  honouring `Mcp-Session-Id` when issued; plain-JSON and
  SSE replies are both parsed. The forwarding core takes an
  injectable fetch; tests stub the upstream — no live
  network calls in tests (the CLI forwarding test uses a
  stub HTTP server on localhost only).

## Deviations

None.

## Lockfile

- Route: generated clean from birth in the build dir with no
  `node_modules` and no pre-existing lockfile:
  `npm install --package-lock-only --ignore-scripts --offline`
  (Route 3).
- Parses as JSON; `name` == `@reneturcios/toneframe`.
- Package entries: **128**.
- sha256: `ecd7195d1e717edeadc205c7291d94b6d781a6d9b10632b0ebd53f6ab9fd243e`
  (re-verified unchanged after the subsequent offline `npm ci`).

## server.json

- Description exactly: "Japan music-production gear prices:
  catalogue search, current offers, comparisons, sales." —
  **89 characters**.
- npm package entry carries `"version": "0.1.0"`; the OCI
  entry (`ghcr.io/cloudcorprecords/toneframe:0.1.0`) carries
  **no** `version` field. Both entries carry
  packageArguments `[{type: positional, value: mcp}]` and
  transport stdio. Dockerfile (node:20-alpine, both stages)
  carries the label
  `io.modelcontextprotocol.server.name="io.github.CloudCorpRecords/toneframe"`.
  Container workflow `IMAGE` is
  `ghcr.io/cloudcorprecords/toneframe` and its smoke test
  asserts the server name `toneframe`.

## Verification (all run 2026-10-28)

1. `npx tsc --noEmit` → exit 0.
2. `npm run build` → exit 0; real `dist/` produced (cli,
   forward, index, mcp, types — .js, .d.ts, .js.map each).
3. `node dist/cli.js --version` → `0.1.0`.
4. `npm test` → **58 tests, 58 pass, 0 fail**
   (registration-integrity suite deep-equals the served
   tools/list against the fixture's 5 tools, including the
   title-key and per-tool $schema assertions, the
   required-key exactness checks and the nested
   additionalProperties checks, session
   establishment/reuse, env override, the
   no-Authorization-header assertions under any
   environment, verbatim argument forwarding and result
   pass-through including upstream isError, SSE parsing,
   error rendering, MCP-layer validation, and CLI
   behaviour including a tool subcommand forwarding to a
   stubbed localhost upstream).
5. Parity: `python3 /home/hatch/workspace/mcp-rebuild-100/harness/parity.py --original /home/hatch/workspace/mcp-rebuild-100/harness/fixtures/dtmframe-tools-original.json --rebuild "stdio:node /home/hatch/workspace/mcp-rebuild-100/builds/toneframe/dist/cli.js mcp" --out /home/hatch/workspace/mcp-rebuild-100/builds/toneframe/parity-out` → **verdict PASS, parity 100.0**
   (5/5 identical, 0 missing, 0 extra, no schema diffs).
   Output in `parity-out/`.
