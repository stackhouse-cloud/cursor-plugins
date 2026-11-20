# Tixanto MCP tool cheat sheet

Server namespace in Cursor is usually `plugin-tixanto-tixanto` or `user-tixanto`. Same tools exist on stdio (`tixanto-mcp`) and HTTP (`/v1/mcp/http`). Default advertise tier is `core`; `TIXANTO_MCP_TOOL_TIER=full` adds bulk, webhooks, analytics, dashboards.

Call `tixanto_help` for the live list. This file is a compact map, not a schema dump.

## Session

| Tool | Use |
| --- | --- |
| `tixanto_context` | Session primer. Optional `workspace_id`. |
| `tixanto_help` | Catalogue. Optional `name` for one tool's schema. |

## Issues

| Tool | Use |
| --- | --- |
| `get_issue` | Full issue (description, status). Key needs `workspace_id`. |
| `list_issues` | Project (`project_id`), workspace slice (`workspace_id`), or epic children (`workspace_id` + `epic_id`). |
| `count_issues` | Counts without paging. |
| `create_issue` | Only `title` required. |
| `update_issue` | Patch. `"null"` / empty string clears some nullable fields. `estimate` number or string. |
| `transition_issue` | Category or status key. |
| `delete_issue` | Permanent delete. |

List/search rows are **summaries** (no description). Use `get_issue` for the full document.

## Comments and files

| Tool | Use |
| --- | --- |
| `list_comments` / `create_comment` | `project_id` optional. |
| `list_issue_attachments` / `get_issue_attachment` / `add_issue_attachment` | Attachments; download is base64. |

## Labels, fields, links

| Tool | Use |
| --- | --- |
| `list_labels` / `create_label` | Project labels. |
| `add_issue_label` / `remove_issue_label` / `set_issue_labels` | Per-issue labels. |
| `list_custom_fields` / `list_issue_custom_fields` / `set_issue_custom_fields` | Custom fields. |
| `list_issue_links` / `link_issues` / `unlink_issues` | Relationships. |

Prefer `update_issue(parent_id=...)` for real sub-task hierarchy. Use `link_issues(kind=sub_task_of)` for a soft pointer.

## Board structure

| Tool | Use |
| --- | --- |
| `list_workspaces` / `list_projects` / `list_project_members` | Discovery. |
| `list_project_statuses` | Status keys before `update_issue`. |
| `list_cycles` / `get_cycle` / `get_sprint_status` | Sprints. |
| `list_epics` / `get_epic` | Epics (rollup only). Children via `list_issues(..., epic_id)`. |
| `list_versions` / `set_issue_versions` / `release_version` | Releases. |

## Search and my work

| Tool | Use |
| --- | --- |
| `search` | Issues, comments, projects, epics, cycles. Filter language in `q`. |
| `semantic_search_issues` | Vector search; omitted unless embeddings are enabled. |
| `get_my_work` | Assigned / watching / due / overdue. |
| `list_workspace_members` | Disambiguate names for `assigned_to:` / `created_by:`. |
| `list_notifications` / `mark_notifications_read` | Inbox. |

## Views and planning

| Tool | Use |
| --- | --- |
| `manage_views` / `resolve_view` | Saved views. |
| `plan_sprint` / `summarise_project` | Read-only advisory. |
| `submit_plan` | Declare an ordered tool plan before executing. |

## Extended tier (often hidden)

`bulk_create_issues`, `bulk_update_issues`, `manage_automation_rules`,
`manage_webhook_subscriptions`, `manage_webhook_deliveries`,
`get_project_metrics`, `manage_dashboards`, `resolve_dashboard_widgets`.
