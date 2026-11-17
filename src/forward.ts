/**
 * toneframe core: a forwarding client for the hosted
 * dtmframe MCP server, a Japanese music-production
 * buying guide.
 *
 * Nothing about products, offers or deals is computed
 * here, except that tools/list is answered from the
 * literal definitions below, which reproduce a live
 * capture of the upstream server word for word (name,
 * title, description and inputSchema exactly as
 * captured; every tool carries a `title` key, and every
 * inputSchema carries a per-tool `$schema` key, both
 * served verbatim). The capture's `annotations` and
 * `execution` keys were dropped at fixture slimming and
 * are not served. A tools/call travels upstream over a
 * streamable-HTTP JSON-RPC session: an initialize POST,
 * a notifications/initialized POST, then the tools/call
 * POST, carrying the Mcp-Session-Id response header on
 * later requests when the upstream issues one. The
 * session opens lazily on the first forwarded call and
 * is reused for the client's lifetime.
 *
 * All five captured tools are read-only computations
 * over the site's published product catalogue.
 * `resolve_purchase_request` and `compare_products`
 * are computation-only: their own descriptions state
 * "Computation only... No purchase, no persistence, no
 * notification" -- they compute candidates and cost
 * breakdowns from typed constraints and return
 * navigation links; they take no personal details,
 * send nothing and commit nothing.
 *
 * The endpoint is pinned to https://dtmframe.com/mcp/
 * (trailing slash exactly as the record declares it)
 * and may be replaced with the DTMFRAME_MCP_URL
 * environment variable (that override is a labelled
 * reconstruction). The registry record declares NO
 * headers on the upstream remote, so no auth header is
 * ever sent, under any environment.
 *
 * A successful upstream result is returned exactly as
 * received, isError flag and extra fields included.
 * Failures -- an upstream JSON-RPC error, a non-2xx
 * status, a body that cannot be parsed, or a fetch
 * that throws or times out -- become an isError result
 * whose text begins with `toneframe error:` (that
 * rendering is a labelled reconstruction). Replies may
 * be plain JSON or SSE (`data:` lines); the JSON-RPC
 * message whose id matches the request wins.
 */
import type {
  FetchFn,
  FetchResponseLike,
  ForwardDeps,
  ToolArgs,
  ToolDef,
  ToolResult,
} from "./types.js";

export const VERSION = "0.1.0";

export const DEFAULT_ENDPOINT_URL = "https://dtmframe.com/mcp/";

export const DEFAULT_TIMEOUT_MS = 30000;

export const PROTOCOL_VERSION = "2025-03-26";

/* ------------------------------------------------------------------ */
/* Tool definitions (tools/list literals, verbatim from the live       */
/* capture in harness/fixtures/dtmframe-tools-original.json;           */
/* generated programmatically by parsing and re-serialising the        */
/* fixture JSON, never retyped).                                       */
/* ------------------------------------------------------------------ */

export const TOOL_DEFS: ToolDef[] = [
  {
    "name": "search_products",
    "title": "Search products",
    "description": "Searches the product catalog of a Japanese music-production buying guide by typed, non-personal vocabulary: category, brand (slug or id), product_id, alias (an exact product name or registered alias, matched after normalization), plugin format, OS and license, or by a free-text product name (q). Returns products with ids, editions, brand, category, product type tokens (roles, e.g. eq, compressor, reverb, synth; absent when unknown), catalog status and checked_at; an unresolved alias returns 0 products with unresolved_constraints=[alias_unresolved]. Current offers of a product are returned by get_current_offers. Optional q (up to 200 characters) is a product name as typed: any spelling, katakana, hiragana or romaji; shopping words such as セール, 最安, sale or upgrade are ignored. A maker name at the start or end is set aside and the rest is matched against that maker's products only (Sennheiser e 935 matches e935 exactly); a model of another maker or an unlisted model gives 0 products. It is matched like the site's own search (exact, prefix, substring, several words, then similar spellings that begin like the query, carry the same numbers and, for several words, cover the last word); a product type or category word (reverb, リバーブ, コンプ, ヘッドフォン) answers with up to 20 products of that type. Typed filters narrow q before the cut to 20. At most 20 products, in match order; matched_alias is the registered spelling that matched and match_kind how (exact, prefix, substring, tokens, fuzzy, role, category); with a maker name, fuzzy only covers a typing error in a listed product name (a word with digits, such as a model number, has to match exactly), and without one it can be a sibling model. No match: 0 products with unresolved_constraints=[q_unresolved]. More than 20 matches: limits_hit=[result_limit] and search_complete=false, and next_cursor pages only within the 20. alias takes precedence over q; a q cursor is valid only for the same q and filters. q is used only to compute the answer; the text itself is not stored or logged. A product the site has measured itself also carries measurements (newest first) in summary form: evidence_id, edition_id, product_version, measured_at, results as named fields each with { value, decimals } (the decimals it was read with, e.g. export_duration_seconds, latency_compensation_samples, integrated_loudness_lufs, true_peak_dbtp), runs, result_statistic and disclosure (provided, loaned or self_purchased). The full record (environment, settings, comparison conditions, procedure, failure cases) is returned by compare_products. They are not a sound-quality rating; the key is absent when there is no measurement. A call with no filter (no q, alias, category, brand, product_id, format, os or license) and no cursor also carries, at the top level, measurements: the site's synthetic demonstrations (record_kind synthetic_demonstration), signal-processing facts shown with signals the site generated, concerning no product, in full: subject_ja, results ({ value, decimals }, e.g. null_residual_peak_dbfs, thd_percent, aliasing_max_dbfs, rt60_seconds), and how to run them again (script_ref path and commit, signal_seed, libraries, artifacts with sha256). canonical_page is the product page on this site; it carries the complete price table (including listings withheld on this channel), the merchant purchase links and the affiliate disclosure. site_entry_page is the same page with the entry marker for this channel. Read-only. Links are user_navigation handoffs (handoff_mode=user_navigation) and are not intended for prefetching or automatic clicking.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "category": {
          "type": "string",
          "description": "Product category to filter by",
          "enum": [
            "daw",
            "instrument_plugin",
            "effect_plugin",
            "mastering_limiter_plugin",
            "mastering_suite",
            "restoration",
            "sample_library",
            "ai_separation",
            "ai_restoration",
            "ai_composition",
            "ai_voice",
            "vocal_synth",
            "audio_interface",
            "mixer",
            "preamp_outboard",
            "microphone",
            "headphones",
            "studio_monitor",
            "guitar",
            "bass",
            "keyboard",
            "synthesizer",
            "electronic_instrument",
            "pedal",
            "multi_effect",
            "amp_simulator",
            "dj_controller",
            "dj_player",
            "dj_mixer",
            "midi_controller",
            "accessory",
            "computer",
            "computer_peripheral"
          ]
        },
        "brand": {
          "type": "string",
          "description": "Brand name to filter by",
          "minLength": 1,
          "maxLength": 160
        },
        "product_id": {
          "type": "string",
          "description": "Product identifier to match",
          "minLength": 1,
          "maxLength": 160
        },
        "alias": {
          "type": "string",
          "description": "Alternate product name or alias to search by",
          "minLength": 1,
          "maxLength": 200
        },
        "format": {
          "type": "string",
          "description": "Plugin format to filter by",
          "enum": [
            "vst2",
            "vst3",
            "au",
            "aax",
            "clap",
            "standalone"
          ]
        },
        "os": {
          "type": "string",
          "description": "Operating system to filter by",
          "enum": [
            "macos",
            "windows",
            "linux",
            "ios",
            "android"
          ]
        },
        "license": {
          "type": "string",
          "description": "License type to filter by",
          "enum": [
            "perpetual",
            "subscription",
            "rent_to_own",
            "free",
            "trial",
            "unknown"
          ]
        },
        "limit": {
          "default": 20,
          "type": "integer",
          "description": "Maximum number of results to return",
          "minimum": 1,
          "maximum": 50
        },
        "cursor": {
          "type": "string",
          "description": "Pagination cursor from a previous response",
          "minLength": 1,
          "maxLength": 256
        },
        "q": {
          "description": "A product name as typed (1 to 200 characters), optionally with its maker: any spelling, katakana, hiragana or romaji. A maker name at the start or end (its name, slug, alias or katakana reading, also in the form e935 by Sennheiser or with a possessive) is set aside and the rest is matched against that maker's products only; a model of another maker, or one the catalogue does not list, matches nothing. Shopping words (セール, 最安, sale, upgrade, full version and similar) and a trailing product-type phrase (dynamic microphone and similar, whatever the product's type) are set aside, unless that would leave only a maker name or a type word, and a query of shopping words only matches nothing. Matched like the site's own search: exact, prefix (which can return a longer name of the same series, such as UR44C for UR44), substring, every word of several words, then similar spellings that begin like the query, carry the same numbers and, for several words, cover the last word; with a maker name, a similar spelling only covers a typing error in a listed product name: the same numbers, and a word that differs by one letter (two when both words have eight or more letters); a word with digits, such as a model number, or a three-letter word has to match exactly. A product type or category word (reverb, リバーブ, コンプ, ヘッドフォン), alone or after a maker name, and a maker name with a type phrase (studio headphones, dynamic EQ), answer with up to 20 products of that type; descriptive words such as dynamic or condenser are not checked against the data. It travels only in a request body, never in a URL, and is used only to compute the answer; the text itself is not stored or logged.",
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        }
      }
    }
  },
  {
    "name": "get_current_offers",
    "title": "Get current offers",
    "description": "Returns the current merchant offers of one product (product_id, product slug or edition_id; region JP by default): price in integer minor units with currency_exponent plus price_display (the same amount formatted, e.g. ¥29,700, or 無料 for a price of zero), tax and shipping status, seller class, presentation_state (active, ending_soon, stale, scheduled, unverified), price_certainty, checked_at, fresh_until and expires_at. Prices are observations with a verification state, not guarantees. An offer past fresh_until has presentation_state stale: its price is the last checked price (see checked_at) and it is not a basis for a lowest price, budget fit, cheapest cost or list_deals prices_from; expired offers are not returned. An offer priced in another currency may carry converted (a yen estimate: amount_minor, display such as 約¥7,800, rate_source ecb_eurofxref, rate_reference_date, rate_basis direct or cross_via_eur, and basis_note, a fixed English sentence saying that this site computed the estimate from the European Central Bank's reference rates of that date and that it is not a price) that is not used for ordering, budget fit, cheapest cost or lowest_observed. field_availability.offers is not_recorded when no offer of the product has been recorded. customer_segment is general, or existing_owner, education or nfr for a row the store names as an upgrade, crossgrade, update, EDU or NFR edition (maker and distributor names are not read). Rows that are not general stay in this list with their segment and are not used for a product's default price, lowest price, list_deals prices_from or largest_discount_percent; lowest_observed has no element for editions named upgrade, crossgrade, update, EDU or NFR. A price or listing that a source keeps off this channel is marked withheld_by_channel_policy (offers_coverage=partial) and is not estimated; Rakuten Ichiba listings, for example, appear only on the web page. Each offer's permitted_handoff_links contains canonical_page and site_entry_page, and merchant_plain only where the source permits link distribution on this channel. An optional lowest_observed[] gives, per edition with price history, the window minimum (window_min_amount_minor, window_min_observed_at, observed_since, missing_days, merchant_count, basis_ja) and names the current offer when it is the lowest price seen so far (current_is_lowest_so_far, label_tier high / probable, label_ja, rule_id). current_is_lowest_so_far is true, false or null; null comes with lowest_so_far_undetermined_reason (no_current_price, current_offer_not_on_this_channel, no_price_drop_observed or not_comparable), and false means the current price is above the window minimum. window_min_display is the window minimum formatted. The window minimum is the lowest of our own observations and recorded external references, stated with its basis; it is not a vendor list price or a regular price. An offer of a subscription or rent-to-own edition carries billing_period (month or year): its price is the charge for one period, and it has no reference_price or discount_rate_bps; field_availability.billing_period is unknown when the period is not verified. Such editions have no lowest_observed element. A bundle product with a complete member list carries bundle_cards[]: per shop and currency, the bundle price, each included single product with its verified price at the same shop (amount_minor null with excluded_reason when there is none; never estimated), break_even_count (bundle price divided by the median single price, two decimals, rounded half up), discount_vs_singles_bps (the bundle price against the sum of the priced single prices in basis points, floored; negative when the bundle costs more than the singles; computed over members_priced of members_total), the formula with its inputs, snapshot_id and computed_at. An optional price_record[] gives, per edition and currency, the lowest price observed in the stated window and the last observed price drop at a shop, with the days since each; it records observations and is not a forecast. An optional record_badges[] gives, per edition and currency, record_low (the current price is the lowest of our own record since record_since, after a higher price was recorded; record_low_ja states it with its scope, and it is not the word 過去最安) with new_low_on, and the previous sale (the most recently ended sale that covered the edition at a store: its days, store and recorded price) with below_previous_sale (the current price is below every price recorded in that sale's days; below_previous_sale_ja). false means the badge is not stated. canonical_page is the product page on this site; it carries the complete price table (including listings withheld on this channel), the merchant purchase links and the affiliate disclosure. site_entry_page is the same page with the entry marker for this channel. Read-only; no purchase execution. Links are user_navigation handoffs (handoff_mode=user_navigation) and are not intended for prefetching or automatic clicking.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "product_id": {
          "type": "string",
          "description": "Product identifier to match",
          "minLength": 1,
          "maxLength": 160
        },
        "region": {
          "default": "JP",
          "type": "string",
          "description": "Region to use for offers and pricing",
          "enum": [
            "JP",
            "US",
            "EU",
            "GB",
            "GLOBAL"
          ]
        },
        "condition": {
          "type": "string",
          "description": "Condition of the product to get offers for",
          "enum": [
            "new",
            "used",
            "refurbished",
            "unknown"
          ]
        }
      },
      "required": [
        "product_id"
      ]
    }
  },
  {
    "name": "resolve_purchase_request",
    "title": "Resolve a purchase request",
    "description": "Computation only: conditional product / setup / add-on candidates from typed constraints (category, brand, formats, OS, license, budget), optional free text and user-claimed ownership, bound to one published snapshot. Each candidate has fit reasons, a cost breakdown over the offers this channel may disclose, budget fit, acquisition steps, canonical_page and site_entry_page. For a product candidate, canonical_page is the product page on this site; it carries the complete price table (including listings withheld on this channel), the merchant purchase links and the affiliate disclosure. site_entry_page is the same page with the entry marker for this channel. For a setup candidate canonical_page is the /find/ page. No purchase, no persistence, no notification. For a subscription or rent-to-own edition, cost_breakdown.payable_now is the first charge, recurring_cost one later charge (estimated) and recurring_period its period (month or year); with budget_scope=total_including_recurring_12m the total counts 12 monthly or 1 yearly charge, otherwise budget_fit is judged on the first payment. Where a product has one-off and recurring editions, the default scope prices the one-off edition and the 12-month scope the edition with the smallest 12-month total (assumptions key edition_choice). A price is taken from the default confirmed-route class first (a maker store or a confirmed authorized dealer selling new; for hardware also domestic distribution); when a cheaper confirmed listing of the same edition lies outside that class, the candidate's mismatches state it with its amount. search_complete=false with optimality_scope=best_found marks an answer cut at a limit, a free-text term that looks like a product name (Latin letters, digits or katakana) but matches no registered alias (unresolved_constraints no_alias_match), or no candidates (no_candidates). Free-text aliases match whole words only. With a budget, candidates are ordered by budget_fit first (confirmed, estimated_within, estimated_over, over, unknown) before the answer is cut to max_candidates; when in-budget candidates are still cut, limits_hit contains budget_fit_candidates_truncated. An edition with no price in the requested currency keeps its price in the original currency in cost_breakdown and acquisition_steps[].cost, with budget_fit unknown and the reason in the candidate's mismatches; such an amount may carry converted (a yen estimate: amount_minor, display such as 約¥7,800, rate_source ecb_eurofxref, rate_reference_date, rate_basis direct or cross_via_eur, and basis_note, a fixed English sentence saying that this site computed the estimate from the European Central Bank's reference rates of that date and that it is not a price) that is not used for ordering, budget fit, cheapest cost or lowest_observed. A product's default price uses general rows of unrestricted editions only. When a restricted edition (upgrade, crossgrade, update, EDU or NFR) is named, by constraints.target_edition_id or a free-text alias, or when all of a product's editions are restricted, the answer prices that edition and marks it: customer_segment on cost_breakdown.payable_now and total and on the step cost, reason_codes restricted_edition_price:<segment>, eligibility_status conditional, a sentence in the candidate's mismatches, and the assumption restricted_edition_price (value the segment, basis user_provided, parsed_from_query or default). A product candidate carries product_name, and price_checked_at is the check time of the price used. Stale offers (past fresh_until) are not used for costs or budget fit. Bounded compute class (10 per minute, shared with POST /api/v1/resolve). Links are user_navigation handoffs (handoff_mode=user_navigation) and are not intended for prefetching or automatic clicking.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "schema_version": {
          "type": "string",
          "description": "Schema version of the request",
          "const": "1.1"
        },
        "locale": {
          "default": "ja-JP",
          "type": "string",
          "description": "Locale for the response",
          "minLength": 2,
          "maxLength": 32
        },
        "region": {
          "default": "JP",
          "type": "string",
          "description": "Region to use for offers and pricing",
          "enum": [
            "JP",
            "US",
            "EU",
            "GB",
            "GLOBAL"
          ]
        },
        "mode": {
          "type": "string",
          "description": "Resolution mode: find a product, build a setup, or improve a setup",
          "enum": [
            "find_product",
            "build_setup",
            "improve_setup"
          ]
        },
        "query": {
          "type": "string",
          "description": "Purchase request or product search text",
          "maxLength": 2000
        },
        "constraints": {
          "default": {
            "budget_scope": "incremental_upfront_total",
            "presentation_sort": "fit"
          },
          "type": "object",
          "description": "Constraints on the request, such as budget",
          "properties": {
            "budget": {
              "type": "object",
              "properties": {
                "amount_minor": {
                  "type": "integer",
                  "minimum": 0,
                  "maximum": 9007199254740991
                },
                "currency": {
                  "type": "string",
                  "enum": [
                    "JPY",
                    "USD",
                    "EUR",
                    "GBP",
                    "KWD"
                  ]
                }
              },
              "required": [
                "amount_minor",
                "currency"
              ],
              "additionalProperties": false
            },
            "budget_scope": {
              "default": "incremental_upfront_total",
              "type": "string",
              "enum": [
                "incremental_upfront_total",
                "total_including_recurring_12m"
              ]
            },
            "daw": {
              "type": "string",
              "enum": [
                "logic-pro",
                "ableton-live",
                "cubase",
                "studio-one",
                "fl-studio",
                "pro-tools",
                "reaper",
                "garageband",
                "other"
              ]
            },
            "experience": {
              "type": "string",
              "enum": [
                "beginner",
                "intermediate",
                "advanced"
              ]
            },
            "explanation_depth": {
              "type": "string",
              "enum": [
                "standard",
                "detailed"
              ]
            },
            "license_preference": {
              "type": "string",
              "enum": [
                "perpetual",
                "subscription",
                "rent_to_own",
                "free",
                "trial",
                "unknown"
              ]
            },
            "bundle_kind": {
              "type": "string",
              "enum": [
                "vendor_bundle",
                "setup_bundle"
              ]
            },
            "category": {
              "type": "string",
              "description": "Product category to filter by",
              "enum": [
                "daw",
                "instrument_plugin",
                "effect_plugin",
                "mastering_limiter_plugin",
                "mastering_suite",
                "restoration",
                "sample_library",
                "ai_separation",
                "ai_restoration",
                "ai_composition",
                "ai_voice",
                "vocal_synth",
                "audio_interface",
                "mixer",
                "preamp_outboard",
                "microphone",
                "headphones",
                "studio_monitor",
                "guitar",
                "bass",
                "keyboard",
                "synthesizer",
                "electronic_instrument",
                "pedal",
                "multi_effect",
                "amp_simulator",
                "dj_controller",
                "dj_player",
                "dj_mixer",
                "midi_controller",
                "accessory",
                "computer",
                "computer_peripheral"
              ]
            },
            "brand": {
              "type": "string",
              "description": "Brand name to filter by",
              "minLength": 1,
              "maxLength": 160
            },
            "target_edition_id": {
              "type": "string",
              "minLength": 1,
              "maxLength": 160
            },
            "formats": {
              "maxItems": 6,
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "vst2",
                  "vst3",
                  "au",
                  "aax",
                  "clap",
                  "standalone"
                ]
              }
            },
            "os": {
              "maxItems": 5,
              "type": "array",
              "description": "Operating system to filter by",
              "items": {
                "type": "string",
                "enum": [
                  "macos",
                  "windows",
                  "linux",
                  "ios",
                  "android"
                ]
              }
            },
            "presentation_sort": {
              "default": "fit",
              "type": "string",
              "enum": [
                "fit",
                "cost",
                "fewer_steps"
              ]
            },
            "max_stores": {
              "type": "integer",
              "minimum": 1,
              "maximum": 10
            },
            "exclude_hardware": {
              "type": "boolean"
            },
            "delivery_deadline": {
              "type": "string"
            },
            "setup_goal": {
              "type": "string",
              "enum": [
                "guitar_recording",
                "vocal_recording",
                "dj_start",
                "desktop_mixing"
              ]
            }
          },
          "additionalProperties": false
        },
        "ownership_claims": {
          "default": [],
          "maxItems": 200,
          "type": "array",
          "description": "Products or entitlements the user claims to already own",
          "items": {
            "type": "object",
            "properties": {
              "entitlement_id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 160
              },
              "edition_id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 160
              },
              "kind": {
                "type": "string",
                "enum": [
                  "perpetual",
                  "time_limited",
                  "trial",
                  "free_giveaway",
                  "hardware_bundled",
                  "nfr",
                  "education"
                ]
              },
              "acquired_at": {
                "type": "string"
              },
              "acquisition_source": {
                "type": "string",
                "enum": [
                  "purchase",
                  "giveaway",
                  "bundle",
                  "unknown"
                ]
              },
              "registered": {
                "type": "boolean"
              },
              "region": {
                "type": "string",
                "description": "Region to use for offers and pricing",
                "enum": [
                  "JP",
                  "US",
                  "EU",
                  "GB",
                  "GLOBAL"
                ]
              },
              "transferable": {
                "type": "boolean"
              },
              "edition_certainty": {
                "type": "string",
                "enum": [
                  "confirmed",
                  "unknown"
                ]
              },
              "verification": {
                "type": "string",
                "const": "user_claimed"
              }
            },
            "required": [
              "entitlement_id",
              "edition_id",
              "kind",
              "acquisition_source",
              "registered",
              "verification"
            ],
            "additionalProperties": false
          }
        },
        "owned_editions": {
          "default": [],
          "maxItems": 200,
          "type": "array",
          "description": "Editions the user already owns",
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 160
          }
        },
        "user_supplied_prices": {
          "maxItems": 10,
          "type": "array",
          "description": "Prices supplied by the user to include in the result",
          "items": {
            "type": "object",
            "properties": {
              "offer_id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 160
              },
              "edition_id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 160
              },
              "price": {
                "type": "object",
                "properties": {
                  "amount_minor": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "currency": {
                    "type": "string",
                    "enum": [
                      "JPY",
                      "USD",
                      "EUR",
                      "GBP",
                      "KWD"
                    ]
                  }
                },
                "required": [
                  "amount_minor",
                  "currency"
                ],
                "additionalProperties": false
              }
            },
            "required": [
              "price"
            ],
            "additionalProperties": false
          }
        },
        "detail": {
          "default": "summary",
          "type": "string",
          "description": "Level of detail to return: summary or full",
          "enum": [
            "summary",
            "full"
          ]
        },
        "max_candidates": {
          "default": 3,
          "type": "integer",
          "description": "Maximum number of candidate products to return",
          "minimum": 1,
          "maximum": 10
        }
      },
      "required": [
        "schema_version",
        "mode"
      ]
    }
  },
  {
    "name": "compare_products",
    "title": "Compare editions",
    "description": "Computation only: per-edition differences (license, billing_period for a subscription or rent-to-own edition, formats, OS, capabilities, cheapest known cost over the offers this channel may disclose, budget fit) for 2 to 10 edition ids under the same channel policy as resolve_purchase_request. Each row has canonical_page and site_entry_page. canonical_page is the product page on this site; it carries the complete price table (including listings withheld on this channel), the merchant purchase links and the affiliate disclosure. site_entry_page is the same page with the entry marker for this channel. cheapest_cost is taken from the default confirmed-route class first, as in resolve_purchase_request; an edition with a cheaper confirmed listing outside that class is named in assumptions (key cheapest_cost_default_route_first, value the edition id, note_ja with the amount). An edition with no price in the requested currency keeps cheapest_cost in the original currency, with budget_fit unknown and the assumption key cheapest_cost_foreign_currency (value the edition id); cheapest_cost may carry converted (a yen estimate: amount_minor, display such as 約¥7,800, rate_source ecb_eurofxref, rate_reference_date, rate_basis direct or cross_via_eur, and basis_note, a fixed English sentence saying that this site computed the estimate from the European Central Bank's reference rates of that date and that it is not a price) that is not used for ordering, budget fit, cheapest cost or lowest_observed. Each row's price_checked_at is the check time of that price. Stale offers (past fresh_until) are not used for cheapest_cost. A general edition is priced from general rows only; a named restricted edition (upgrade, crossgrade, update, EDU or NFR) is priced from its own rows, with customer_segment on cheapest_cost, eligibility_status conditional and the assumption restricted_edition_price once per segment. A row whose edition the site has measured itself also carries measurements in full: environment (host machine, OS, DAW and version, audio interface, sample rate, buffer size, tools), product_version, settings, measured_at, comparison conditions, procedure, results ({ value, decimals } per named field), runs and result_statistic, failure cases, material rights and disclosure. They are not a sound-quality rating and not part of differing_fields; numbers compare only between editions listed in compared_edition_ids. Bounded compute class (shared with POST /api/v1/compare). Links are user_navigation handoffs (handoff_mode=user_navigation) and are not intended for prefetching or automatic clicking.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "schema_version": {
          "type": "string",
          "description": "Schema version of the request",
          "const": "1.1"
        },
        "locale": {
          "default": "ja-JP",
          "type": "string",
          "description": "Locale for the response",
          "minLength": 2,
          "maxLength": 32
        },
        "region": {
          "default": "JP",
          "type": "string",
          "description": "Region to use for offers and pricing",
          "enum": [
            "JP",
            "US",
            "EU",
            "GB",
            "GLOBAL"
          ]
        },
        "edition_ids": {
          "minItems": 2,
          "maxItems": 10,
          "type": "array",
          "description": "Identifiers of the editions to compare",
          "items": {
            "type": "string",
            "minLength": 1,
            "maxLength": 160
          }
        },
        "constraints": {
          "default": {
            "budget_scope": "incremental_upfront_total"
          },
          "type": "object",
          "description": "Constraints on the request, such as budget",
          "properties": {
            "budget": {
              "type": "object",
              "properties": {
                "amount_minor": {
                  "type": "integer",
                  "minimum": 0,
                  "maximum": 9007199254740991
                },
                "currency": {
                  "type": "string",
                  "enum": [
                    "JPY",
                    "USD",
                    "EUR",
                    "GBP",
                    "KWD"
                  ]
                }
              },
              "required": [
                "amount_minor",
                "currency"
              ],
              "additionalProperties": false
            },
            "budget_scope": {
              "default": "incremental_upfront_total",
              "type": "string",
              "enum": [
                "incremental_upfront_total",
                "total_including_recurring_12m"
              ]
            },
            "daw": {
              "type": "string",
              "enum": [
                "logic-pro",
                "ableton-live",
                "cubase",
                "studio-one",
                "fl-studio",
                "pro-tools",
                "reaper",
                "garageband",
                "other"
              ]
            },
            "license_preference": {
              "type": "string",
              "enum": [
                "perpetual",
                "subscription",
                "rent_to_own",
                "free",
                "trial",
                "unknown"
              ]
            },
            "formats": {
              "maxItems": 6,
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "vst2",
                  "vst3",
                  "au",
                  "aax",
                  "clap",
                  "standalone"
                ]
              }
            },
            "os": {
              "maxItems": 5,
              "type": "array",
              "description": "Operating system to filter by",
              "items": {
                "type": "string",
                "enum": [
                  "macos",
                  "windows",
                  "linux",
                  "ios",
                  "android"
                ]
              }
            },
            "exclude_hardware": {
              "type": "boolean"
            }
          },
          "additionalProperties": false
        },
        "ownership_claims": {
          "default": [],
          "maxItems": 200,
          "type": "array",
          "description": "Products or entitlements the user claims to already own",
          "items": {
            "type": "object",
            "properties": {
              "entitlement_id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 160
              },
              "edition_id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 160
              },
              "kind": {
                "type": "string",
                "enum": [
                  "perpetual",
                  "time_limited",
                  "trial",
                  "free_giveaway",
                  "hardware_bundled",
                  "nfr",
                  "education"
                ]
              },
              "acquired_at": {
                "type": "string"
              },
              "acquisition_source": {
                "type": "string",
                "enum": [
                  "purchase",
                  "giveaway",
                  "bundle",
                  "unknown"
                ]
              },
              "registered": {
                "type": "boolean"
              },
              "region": {
                "type": "string",
                "description": "Region to use for offers and pricing",
                "enum": [
                  "JP",
                  "US",
                  "EU",
                  "GB",
                  "GLOBAL"
                ]
              },
              "transferable": {
                "type": "boolean"
              },
              "edition_certainty": {
                "type": "string",
                "enum": [
                  "confirmed",
                  "unknown"
                ]
              },
              "verification": {
                "type": "string",
                "const": "user_claimed"
              }
            },
            "required": [
              "entitlement_id",
              "edition_id",
              "kind",
              "acquisition_source",
              "registered",
              "verification"
            ],
            "additionalProperties": false
          }
        },
        "user_supplied_prices": {
          "maxItems": 10,
          "type": "array",
          "description": "Prices supplied by the user to include in the result",
          "items": {
            "type": "object",
            "properties": {
              "offer_id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 160
              },
              "edition_id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 160
              },
              "price": {
                "type": "object",
                "properties": {
                  "amount_minor": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "currency": {
                    "type": "string",
                    "enum": [
                      "JPY",
                      "USD",
                      "EUR",
                      "GBP",
                      "KWD"
                    ]
                  }
                },
                "required": [
                  "amount_minor",
                  "currency"
                ],
                "additionalProperties": false
              }
            },
            "required": [
              "price"
            ],
            "additionalProperties": false
          }
        },
        "detail": {
          "default": "summary",
          "type": "string",
          "description": "Level of detail to return: summary or full",
          "enum": [
            "summary",
            "full"
          ]
        }
      },
      "required": [
        "schema_version",
        "edition_ids"
      ]
    }
  },
  {
    "name": "list_deals",
    "title": "List sales and campaigns",
    "description": "Lists the sales and campaigns recorded by a Japanese music-production buying guide (region JP), running ones first: title, kind, source (manufacturer store, merchant listings or manufacturer announcement), state, recorded start and end with deadline_status, checked_at / fresh_until, brands, categories, a sample of target products, prices_from (the lowest current price per currency among the general-segment offers this channel may disclose, stale offers excluded, with a display string; a sale with only restricted rows has prices_from [] and field_availability.prices_from unknown), and the largest discount against the merchant's own reference price among the general-segment offers this channel may disclose (per-period prices of subscription or rent-to-own editions count in neither). has_free_item is true when a disclosable offer of the sale is free (a 100% discount or a price of 0); a giveaway known only from an announcement has kind giveaway and no linked offers, so its has_free_item is false. Filters: brand slug, category slug, kind, source, state (running by default), limit, cursor. No merchant links are returned; offers of one product are returned by get_current_offers. canonical_page is the campaign page on this site; it carries every offer, the complete price table (including listings withheld on this channel), the merchant purchase links and the affiliate disclosure. site_entry_page is the same page with the entry marker for this channel. Read-only. Links are user_navigation handoffs (handoff_mode=user_navigation) and are not intended for prefetching or automatic clicking.",
    "inputSchema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "brand": {
          "description": "Brand slug as on /brands/{slug}/ (the manufacturer_id from search_products is accepted too).",
          "type": "string",
          "minLength": 1,
          "maxLength": 160,
          "pattern": "^[a-z0-9][a-z0-9_-]{0,159}$"
        },
        "category": {
          "description": "Category slug as on /categories/{slug}/, e.g. audio-interface (the search_products spelling audio_interface is accepted too).",
          "type": "string",
          "minLength": 1,
          "maxLength": 160,
          "pattern": "^[a-z0-9][a-z0-9_-]{0,159}$"
        },
        "kind": {
          "description": "Campaign kind.",
          "type": "string",
          "enum": [
            "sale",
            "giveaway",
            "purchase_bonus",
            "coupon",
            "bundle_change",
            "cashback",
            "upgrade_offer",
            "seasonal_feature"
          ]
        },
        "source": {
          "description": "official = manufacturer store, merchant = reseller or marketplace listings, announcement = manufacturer announcement without listings.",
          "type": "string",
          "enum": [
            "official",
            "merchant",
            "announcement"
          ]
        },
        "state": {
          "default": "running",
          "description": "running (default) = active, ending_soon or stale; ending_soon; scheduled; all = every state including ended campaigns.",
          "type": "string",
          "enum": [
            "running",
            "ending_soon",
            "scheduled",
            "all"
          ]
        },
        "limit": {
          "default": 20,
          "type": "integer",
          "description": "Maximum number of results to return",
          "minimum": 1,
          "maximum": 50
        },
        "cursor": {
          "description": "Opaque next_cursor of the previous page (bound to one published snapshot).",
          "type": "string",
          "minLength": 1,
          "maxLength": 256
        }
      }
    }
  }
];

export const TOOL_NAMES = TOOL_DEFS.map((t) => t.name);

/** Whether `name` belongs to the captured surface. */
export function isKnownTool(name: string): boolean {
  return TOOL_NAMES.includes(name);
}

/* ------------------------------------------------------------------ */
/* Forwarding client                                                   */
/* ------------------------------------------------------------------ */

function errorResult(detail: string): ToolResult {
  return {
    content: [{ type: "text", text: `toneframe error: ${detail}` }],
    isError: true,
  };
}

function rpcErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message !== "") return message;
    return JSON.stringify(error);
  }
  return String(error);
}

/**
 * Read a JSON-RPC response body, tolerating SSE framing.
 * Returns the message whose id matches `expectedId` when
 * present, otherwise the last parseable message, otherwise
 * null when nothing in the body parses.
 */
export function parseRpcBody(
  text: string,
  expectedId?: number,
): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const candidates: Record<string, unknown>[] = [];
  const tryPush = (payload: string): void => {
    try {
      const parsed: unknown = JSON.parse(payload);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        candidates.push(parsed as Record<string, unknown>);
      }
    } catch {
      // Not a JSON payload; skip this candidate.
    }
  };
  if (trimmed.includes("data:")) {
    for (const line of trimmed.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice("data:".length).trim();
      if (payload !== "" && payload !== "[DONE]") tryPush(payload);
    }
  } else {
    tryPush(trimmed);
  }
  if (candidates.length === 0) return null;
  if (expectedId !== undefined) {
    const match = candidates.find((c) => c.id === expectedId);
    if (match !== undefined) return match;
  }
  return candidates[candidates.length - 1];
}

async function defaultFetch(
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
): Promise<FetchResponseLike> {
  return fetch(url, init) as unknown as FetchResponseLike;
}

/**
 * A forwarding client holding a single upstream session,
 * opened lazily on first use and reused from then on
 * (for the process lifetime in the MCP server, or for a
 * single invocation in the CLI).
 */
export class ToneframeClient {
  private readonly deps: ForwardDeps;
  private sessionId: string | null = null;
  private ready = false;
  private sessionPromise: Promise<void> | null = null;
  private idCounter = 0;

  constructor(deps: ForwardDeps = {}) {
    this.deps = deps;
  }

  private fetchFn(): FetchFn {
    return this.deps.fetchFn ?? defaultFetch;
  }

  private endpointUrl(): string {
    if (this.deps.url && this.deps.url.trim() !== "") return this.deps.url.trim();
    const raw = (this.deps.env ?? process.env).DTMFRAME_MCP_URL;
    if (raw && raw.trim() !== "") return raw.trim();
    return DEFAULT_ENDPOINT_URL;
  }

  private timeoutMs(): number {
    if (typeof this.deps.timeoutMs === "number" && this.deps.timeoutMs > 0) {
      return this.deps.timeoutMs;
    }
    return DEFAULT_TIMEOUT_MS;
  }

  private nextId(): number {
    this.idCounter += 1;
    return this.idCounter;
  }

  private async post(
    body: unknown,
    withSession: boolean,
  ): Promise<FetchResponseLike> {
    // The registry record declares NO headers on the upstream
    // remote: no Authorization header is ever sent.
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (withSession && this.sessionId !== null) {
      headers["Mcp-Session-Id"] = this.sessionId;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs());
    try {
      return await this.fetchFn()(this.endpointUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  private async ensureSession(): Promise<void> {
    if (this.ready) return;
    if (this.sessionPromise === null) {
      this.sessionPromise = (async () => {
        const initId = this.nextId();
        const initRes = await this.post(
          {
            jsonrpc: "2.0",
            id: initId,
            method: "initialize",
            params: {
              protocolVersion: PROTOCOL_VERSION,
              capabilities: {},
              clientInfo: { name: "toneframe", version: VERSION },
            },
          },
          false,
        );
        const sessionId = initRes.headers.get("mcp-session-id");
        if (sessionId) this.sessionId = sessionId;
        const initText = await initRes.text();
        const initParsed = parseRpcBody(initText, initId);
        if (initParsed !== null && initParsed.error) {
          throw new Error(rpcErrorMessage(initParsed.error));
        }
        if (initRes.status < 200 || initRes.status >= 300) {
          throw new Error(`HTTP ${initRes.status}`);
        }
        if (initParsed === null && initText.trim() !== "") {
          throw new Error("malformed response");
        }
        const initializedRes = await this.post(
          { jsonrpc: "2.0", method: "notifications/initialized" },
          true,
        );
        try {
          await initializedRes.text();
        } catch {
          // Nothing needed from the notification response body.
        }
        this.ready = true;
      })();
    }
    try {
      await this.sessionPromise;
    } catch (err) {
      this.sessionPromise = null;
      this.sessionId = null;
      throw err;
    }
  }

  /** Forward one tool call; upstream failures come back as isError results. */
  async callTool(name: string, args: ToolArgs): Promise<ToolResult> {
    try {
      await this.ensureSession();
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }

    const callId = this.nextId();
    let callRes: FetchResponseLike;
    try {
      callRes = await this.post(
        {
          jsonrpc: "2.0",
          id: callId,
          method: "tools/call",
          params: { name, arguments: args ?? {} },
        },
        true,
      );
    } catch (err) {
      return errorResult(
        `request failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const parsed = parseRpcBody(await callRes.text(), callId);
    if (parsed !== null && parsed.error) {
      return errorResult(rpcErrorMessage(parsed.error));
    }
    if (callRes.status < 200 || callRes.status >= 300) {
      return errorResult(`HTTP ${callRes.status}`);
    }
    if (parsed === null) return errorResult("malformed response");
    const result = parsed.result as ToolResult | undefined;
    if (result === undefined || result === null || typeof result !== "object") {
      return errorResult("malformed response");
    }
    // Hand the upstream result back exactly as received.
    return result;
  }
}

/** Build a forwarding client; tests inject a fake fetch and env through deps. */
export function createClient(deps: ForwardDeps = {}): ToneframeClient {
  return new ToneframeClient(deps);
}

/** One-shot helper: a fresh client for a single call (the CLI path). */
export async function callTool(
  name: string,
  args: ToolArgs,
  deps: ForwardDeps = {},
): Promise<ToolResult> {
  return new ToneframeClient(deps).callTool(name, args);
}
