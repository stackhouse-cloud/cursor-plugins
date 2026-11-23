# Tixanto Plugin for Cursor

Connect Cursor to [Tixanto](https://www.tixanto.cloud) to find, create, update, and comment on issues, manage cycles and epics, and search your backlog over MCP.

## What's included

- **MCP server (`mcp.json`)**: Connects over Streamable HTTP to `https://api.tixanto.cloud/v1/mcp/http` using OAuth 2.1 + PKCE — no API key copy-paste required.
- **Agent skill (`skills/tixanto/SKILL.md`)**: Guides Cursor agents on workspace/project selection (`tixanto_context`), issue keys vs UUIDs, pickup / status updates, comments, search, and untrusted-content safety.

## Setup

1. Install the **Tixanto** plugin in Cursor from the [Cursor Marketplace](https://cursor.com/marketplace) (or from this [GitHub repository](https://github.com/stackhouse-cloud/cursor-plugins)).
2. On your first Tixanto prompt (or via **Customize → Plugins → Tixanto**), Cursor opens your browser to sign in to Tixanto and approve access. Sign-in uses your StackHouse account — there is no fee to install or use this plugin.
3. Ask Cursor to call `tixanto_context` or list your issues to verify the connection.

> **Managing access:** Active Cursor connections appear in Tixanto under **Settings → API keys → Connected MCP apps**, where you can revoke access at any time. Remove any duplicate manual `"tixanto"` entry from `~/.cursor/mcp.json` so the server is not loaded twice.

## Legal & support

- [Terms of Service](https://stackhouse.cloud/terms)
- [Privacy Policy](https://stackhouse.cloud/privacy)
- Support: [Contact StackHouse](https://stackhouse.cloud/contact) or email [privacy@captionworks.com](mailto:privacy@captionworks.com)

## License

[MIT](./LICENSE)
