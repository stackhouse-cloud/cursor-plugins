# Provenix Plugin for Cursor

Connect Cursor to [Provenix](https://www.provenix.cloud), the npm dependency firewall, to work the quarantine queue, investigate held versions and their blast radius, and approve, reject, or rescan versions with you over MCP.

## What's included

- **MCP server (`mcp.json`)**: Connects over Streamable HTTP to `https://api.provenix.cloud/mcp` with OAuth 2.1 browser sign-in (PKCE + Dynamic Client Registration).
- **Agent skill (`skills/provenix/SKILL.md`)**: Guides Cursor agents on session bootstrap (`provenix_context`), review workflows (what is waiting, is this version safe, who is affected), asking you before any decision, and untrusted-package-text safety.

## Setup

1. Install the **Provenix** plugin in Cursor from the [Cursor Marketplace](https://cursor.com/marketplace) (or from this [GitHub repository](https://github.com/stackhouse-cloud/cursor-plugins)).
2. When Cursor connects to the Provenix MCP server, click **Connect** / **Needs authentication** to open Provenix in your browser and approve access. Cursor acts with your role in each workspace.
3. Ask Cursor to call `provenix_context` or check what is waiting in quarantine to verify the connection.

> **Managing access:** Disconnect it anytime under **Connected apps** in the Provenix console. Actions Cursor takes appear in the audit log under your name, marked *via Cursor (MCP)*. Remove any duplicate manual `"provenix"` entry from `~/.cursor/mcp.json` so the server is not loaded twice.

## Headless agents

For CI, use a workspace service-account key instead of browser sign-in. See [Use Provenix from AI tools](https://docs.provenix.cloud/mcp/#headless-agents).

## Legal & support

- [Terms of Service](https://stackhouse.cloud/terms)
- [Privacy Policy](https://stackhouse.cloud/privacy)
- Support: [Contact StackHouse](https://stackhouse.cloud/contact) or email [privacy@captionworks.com](mailto:privacy@captionworks.com)

## License

[MIT](./LICENSE)
