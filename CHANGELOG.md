# Changelog

## 0.1.0 (2026-10-28)

- First release: a forwarding client for the hosted dtmframe MCP server. The 5 tools of the captured surface are answered locally for tools/list, and every tools/call is forwarded upstream over a streamable-HTTP JSON-RPC session (initialize, notifications/initialized, tools/call, honouring the Mcp-Session-Id header when the upstream issues one).
- Tools: `search_products`, `get_current_offers`, `resolve_purchase_request`, `compare_products`, `list_deals`. Every tool carries a `title` key in the capture and it is served verbatim; every inputSchema carries a per-tool `$schema` key, also served verbatim. The capture's `annotations` and `execution` keys were dropped at fixture slimming and are not served. `get_current_offers` requires `product_id`; `resolve_purchase_request` requires `schema_version` and `mode`; `compare_products` requires `schema_version` and `edition_ids`; `search_products` and `list_deals` carry no `required` key in the capture and none is served.
- Upstream results pass through verbatim, including the isError flag; upstream failures surface as `toneframe error:` text results.
- One bin serves the CLI (one subcommand per tool, plus `--version`) and the stdio MCP server (`mcp` subcommand). The upstream endpoint can be overridden via `DTMFRAME_MCP_URL`. The upstream record declares no headers, so no auth header is ever sent.
