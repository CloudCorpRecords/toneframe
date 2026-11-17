# toneframe

What does music-production gear cost in Japan right now, which editions differ how, and which sales are actually running? toneframe is a local forwarding client for the hosted dtmframe MCP service, a Japanese music-production buying guide: it answers `tools/list` locally from the captured tool definitions and forwards every call to the service, returning the answers exactly as the service sends them back.

All five tools are read-only computations over the site's published catalogue. `search_products` searches the product catalogue by typed vocabulary or a free-text product name. `get_current_offers` returns the current merchant offers of one product, with prices stated as observations carrying a verification state, not guarantees. `list_deals` lists the sales and campaigns the guide has recorded. The other two tools are computation-only: `resolve_purchase_request` computes product, setup and add-on candidates with cost breakdowns and budget fit from typed constraints — its own description states "Computation only… No purchase, no persistence, no notification" — and `compare_products` computes per-edition differences the same way. Neither takes personal details, sends anything, or commits anything; merchant purchase links live only on the site's own pages, reached through the navigation links the results carry.

## The tools

- **`search_products`** — Search the catalogue by `category`, `brand`, `product_id`, `alias`, plugin `format`, `os` or `license`, or by a free-text product name in `q`; `limit` and `cursor` page the results. No required parameters.
- **`get_current_offers`** — Current merchant offers of one product: price with currency exponent and display string, tax and shipping status, seller class, presentation state and freshness times. `product_id` is required; `region` defaults to JP.
- **`resolve_purchase_request`** — Computation-only candidates from typed constraints (category, brand, formats, OS, license, budget), optional free text and user-claimed ownership of product editions. Requires `schema_version` and `mode`.
- **`compare_products`** — Computation-only per-edition differences (license, billing period, formats, OS, capabilities, cheapest known cost, budget fit) for 2 to 10 edition ids. Requires `schema_version` and `edition_ids`.
- **`list_deals`** — Sales and campaigns recorded by the guide, running ones first, filterable by brand, category, kind, source and state. No required parameters.

## Install and run

As an MCP server via npm:

```bash
npx -y @reneturcios/toneframe mcp
```

MCP client configuration:

```json
{
  "mcpServers": {
    "toneframe": {
      "command": "npx",
      "args": ["-y", "@reneturcios/toneframe", "mcp"]
    }
  }
}
```

As a container:

```bash
docker run -i ghcr.io/cloudcorprecords/toneframe
docker run --rm ghcr.io/cloudcorprecords/toneframe list_deals '{}'
```

## CLI

One binary serves both the command line and the MCP server. Each tool is a subcommand taking a single JSON string with that tool's arguments:

```bash
toneframe search_products '{"q":"e935"}'
toneframe get_current_offers '{"product_id":"sennheiser-e935"}'
toneframe list_deals '{"kind":"sale","limit":10}'
toneframe --version
```

Exit codes: `0` when the forwarded call succeeds, `1` when the upstream result is an error, and `2` for usage problems such as an unknown subcommand or a malformed JSON argument.

## Configuration

- `DTMFRAME_MCP_URL` — Overrides the upstream endpoint. The default is the pinned hosted endpoint, `https://dtmframe.com/mcp/` (trailing slash included, exactly as the upstream record declares it). (The override variable is a reconstruction added by this rebuild.)

The upstream registry record declares no headers, so no authentication header is ever sent; the tool surface was captured keyless.

Upstream failures — a JSON-RPC error from the service, a non-2xx response, an unreadable body, or a request that fails outright — are reported to the caller as an error result whose text starts with `toneframe error:`.

## How forwarding works

The first forwarded call opens a session: an `initialize` request (protocol version `2025-03-26`), followed by a `notifications/initialized` notification, then the `tools/call` itself. If the service answers the initialize request with an `Mcp-Session-Id` header, that value is carried on every later request, and the open session is reused for the rest of the process. Replies are accepted either as plain JSON or as server-sent events. Successful results pass through verbatim, including any `isError` flag and any extra fields the service includes.

## Development

```bash
npm install
npm run build   # tsc -> dist/ (dist/cli.js is the bin)
npm test        # tsx --test test/*.test.ts — stubbed upstream, no network
npm run dev     # run the CLI from source
```

The test suite checks the served tool list against the captured surface (the 5 tools, deep-equal, in order, with the `title` keys and the per-tool `$schema` keys inside the input schemas served verbatim, and the required lists exactly as captured), exercises the session handshake and its reuse, verifies that no `Authorization` header is ever sent under any environment, and verifies that arguments go upstream untouched and results come back untouched.

## License

MIT — see `LICENSE`. Copyright (c) 2026 Rene Turcios.
