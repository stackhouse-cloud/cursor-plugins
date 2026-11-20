# StackHouse Cursor Plugins

Official [Cursor](https://cursor.com) plugin marketplace for [StackHouse](https://stackhouse.cloud) products.

## Available plugins

| Plugin | Path | Description |
| --- | --- | --- |
| [**Quizletto**](./plugins/quizletto) | `plugins/quizletto` | Build graded and profile quizzes, manage workspaces and candidate links, run test attempts, and analyze results via Quizletto MCP (`https://api.quizletto.cloud/v1/mcp`). |
| [**Tixanto**](./plugins/tixanto) | `plugins/tixanto` | Find, create, update, and comment on issues; manage cycles and epics via Tixanto MCP (`https://api.tixanto.cloud/v1/mcp/http`). |
| [**Cordo**](./plugins/cordo) | `plugins/cordo` | Explore streams, query events, and investigate ops findings via Cordo MCP (`https://api.cordo.cloud/mcp`). |

## Install in Cursor

### From the Cursor Marketplace (once listed)

1. Open **Customize → Plugins** in Cursor, or browse [cursor.com/marketplace](https://cursor.com/marketplace).
2. Search for **Quizletto**, **Tixanto**, or **Cordo** and install it.
3. Complete auth for that plugin: Quizletto opens an OAuth sign-in screen; Tixanto and Cordo ask for a personal token under **Configure**.

### From GitHub repository (individual users)

1. Open **Customize → Plugins** in Cursor.
2. Choose **From GitHub Repository** (or run `/plugin marketplace add https://github.com/stackhouse-cloud/cursor-plugins` in Cursor CLI).
3. Enter `https://github.com/stackhouse-cloud/cursor-plugins` and install the plugins you need.
4. Complete auth for that plugin: Quizletto opens an OAuth sign-in screen; Tixanto and Cordo ask for a personal token under **Configure**.

### Team / Enterprise Marketplace (org admins)

1. Open **Cursor Dashboard → Plugins & MCPs → Add Marketplace → Import from Repo**.
2. Enter `https://github.com/stackhouse-cloud/cursor-plugins`.
3. Optionally enable **Auto Refresh** and **Serve marketplace from Cursor**, then set rollout defaults per plugin.

### Local development & testing

Copy an individual plugin folder into `~/.cursor/plugins/local/<name>` (do not symlink outside `~/.cursor/plugins/local`) and reload Cursor:

```sh
rm -rf ~/.cursor/plugins/local/quizletto ~/.cursor/plugins/local/tixanto ~/.cursor/plugins/local/cordo
mkdir -p ~/.cursor/plugins/local
cp -R plugins/quizletto ~/.cursor/plugins/local/quizletto
cp -R plugins/tixanto ~/.cursor/plugins/local/tixanto
cp -R plugins/cordo ~/.cursor/plugins/local/cordo
```

Remove any duplicate manual server entry from `~/.cursor/mcp.json` so the MCP server isn't loaded twice.

## Legal & support

- [Terms of Service](https://stackhouse.cloud/terms)
- [Privacy Policy](https://stackhouse.cloud/privacy)
- Support: [Contact StackHouse](https://stackhouse.cloud/contact) or email [privacy@captionworks.com](mailto:privacy@captionworks.com)

Plugins are free to install and use. Quizletto signs in with a free StackHouse account via OAuth 2.1. Tixanto and Cordo use personal tokens you paste into the plugin configure dialog — tokens are not committed in the plugin source.

## Repository layout & adding more StackHouse plugins

Plugins live under `plugins/<name>/` and are indexed in [`.cursor-plugin/marketplace.json`](./.cursor-plugin/marketplace.json) (`metadata.pluginRoot: "plugins"`):

```text
cursor-plugins/
├── .cursor-plugin/
│   └── marketplace.json
├── plugins/
│   ├── quizletto/
│   ├── tixanto/
│   └── cordo/
│       ├── .cursor-plugin/
│       │   └── plugin.json
│       ├── assets/
│       │   └── logo.svg
│       ├── skills/
│       │   └── cordo/
│       │       └── SKILL.md
│       ├── mcp.json
│       ├── LICENSE
│       └── README.md
└── scripts/
    ├── validate.mjs
    └── validate.test.mjs
```

Additional StackHouse plugins (such as `plugins/dokko`) can be added alongside the existing plugins and registered in `.cursor-plugin/marketplace.json`.

Run validation locally before pushing:

```sh
node --test scripts/validate.test.mjs
node scripts/validate.mjs
```

## License

[MIT](./LICENSE)
