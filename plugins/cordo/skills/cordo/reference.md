# Cordo MCP tool cheat sheet

Server namespace in Cursor is usually `plugin-cordo-cordo` or `user-cordo`. Endpoint: `https://api.cordo.cloud/mcp` (Streamable HTTP). Auth: OAuth 2.1 browser sign-in (or personal access token `Authorization: Bearer lxp_…`).

Call `cordo_help` for the live catalogue and investigation recipes. This file is a compact map, not a schema dump.

## Session

| Tool | Use |
| --- | --- |
| `cordo_context` | Session primer: user, non-empty streams, views. |
| `cordo_help` | Catalogue + recipes. Optional `name` for one tool. |
| `describe_stream` | Metadata, learned field catalog, roles, schema status. |

## Investigate

| Tool | Use |
| --- | --- |
| `query` | Aggregates / search (`count`, `sum`, `avg`, `max`, percentiles, `events`). |
| `top_values` | Top values for one field (group-by count). |
| `sample_events` | Matching event samples. |
| `recent_events` | Raw Postgres ingest tail. |
| `summarize_stream` | Volume + top values + samples in one call. |
| `ops_digest` | Ops triage: volume, status/level mix, slow routes, failing jobs, open findings. |
| `get_trace` | Request timeline by `request_id`. |
| `event_context` | Surrounding events for one `event_id`. |

## Patterns and findings

| Tool | Use |
| --- | --- |
| `list_patterns` | Mined log patterns for a window. |
| `list_findings` | Anomaly findings (`open` default). |
| `get_finding` | One finding with reasons, evidence, next steps. |
| `manage_findings` | `dismiss` / `reopen` / `mute` / `unmute` / `list_mutes`. |

## Views and resources

| Tool | Use |
| --- | --- |
| `manage_views` / `resolve_view` / `tail_view` | Saved views. |
| `manage_streams` | Stream list/get/create/update/delete. |
| `manage_stream_api_keys` | Ingest key lifecycle (`reveal_secret: true` on create/rotate). |
| `ingest_events` | Sample JSON events (not production shipping). |
| `manage_metrics` | Recorded metric CRUD + series. |
| `manage_monitors` | Detection monitor CRUD + `history`. |
| `manage_channels` | Notification channel CRUD / test-fire. |
| `manage_alerts` | List/get alerts and evidence. |
