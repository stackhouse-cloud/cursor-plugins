# Provenix MCP tool cheat sheet

Endpoint: `https://api.provenix.cloud/mcp` (Streamable HTTP). Auth: OAuth 2.1 browser sign-in, or a workspace service-account key (`Authorization: Bearer dfsa_…`) for headless agents.

Every tool takes `workspace` (slug or id; optional with one workspace). Lists take `limit` (≤ 100) and `after` (`meta.next_cursor`). Call `provenix_help` for the live catalogue.

## Orientation

| Tool | Use |
| --- | --- |
| `provenix_context` | Who you act as, workspaces and roles, what is waiting. |
| `provenix_help` | Catalogue, or one tool with `name`. |

## Read

| Tool | Use |
| --- | --- |
| `list_quarantine` | Review queue; `needs_review`, `requested_only`. |
| `list_packages` / `get_package` / `list_versions` | Catalogue, one package, its versions (`state`). |
| `get_version` | `name`, `version`: everything about one version. |
| `list_clients` / `get_client` | Clients; `include: dependencies, unpinned`. |
| `list_installs` | Installs; `client_id`, `package`, `held_back`. |
| `list_refusals` | Blocked/failed requests; `window`, `outcome`, `client_id`. |
| `get_impact` / `get_dependencies` / `get_dependents` | Blast radius and graph; `name`, `version`, `depth`. |
| `list_policies` / `get_policy` / `policy_dry_run` | Policies; dry run changes nothing. |
| `list_alerts` / `search_audit_log` | Alerts; audit trail. |

## Decide (ask the user first)

| Tool | Needs |
| --- | --- |
| `approve_version` / `reject_version` / `reopen_decision` | `name`, `version`, `note`, `confirmed_by_user: true`; approver |
| `confirm_approval` | `name`, `version`, `confirmed_by_user: true`; another person's request |
| `cancel_approval` | `name`, `version` |
| `rescan_version` | `name`, `version`, `note?`; rate limited |
| `request_review` | `name`, `version`, `justification?`; people only |
| `discover_package` | `name`; admin |
| `mark_alerts_read` | `ids` or `all` (+ `event_type`) |
