# Cordo Plugin for Cursor

Connect Cursor to [Cordo](https://www.cordo.cloud) to discover streams, query events, run ops digests, review anomaly findings, and manage views, monitors, and channels over MCP.

## What's included

- **MCP server (`mcp.json`)**: Connects over Streamable HTTP to `https://api.cordo.cloud/mcp` with your personal access token (`Authorization: Bearer …`).
- **Agent skill (`skills/cordo/SKILL.md`)**: Guides Cursor agents on session bootstrap (`cordo_context`), stream investigation, findings, views, and untrusted-content safety.

## Setup

1. Install the **Cordo** plugin in Cursor from the [Cursor Marketplace](https://cursor.com/marketplace) (or from this [GitHub repository](https://github.com/stackhouse-cloud/cursor-plugins)).
2. Open **Customize → Plugins → Cordo → Configure** and paste a personal access token from Cordo **Settings → API tokens** (`lxp_…`).
3. Ask Cursor to call `cordo_context` or run `ops_digest` on a busy stream to verify the connection.

> **Managing access:** Revoke or rotate tokens anytime under Cordo **Settings → API tokens**. Remove any duplicate manual `"cordo"` entry from `~/.cursor/mcp.json` so the server is not loaded twice.

## Legal & support

- [Terms of Service](https://stackhouse.cloud/terms)
- [Privacy Policy](https://stackhouse.cloud/privacy)
- Support: [Contact StackHouse](https://stackhouse.cloud/contact) or email [privacy@captionworks.com](mailto:privacy@captionworks.com)

## License

[MIT](./LICENSE)
