# StackHouse Cursor Plugins

Official [Cursor](https://cursor.com) plugin marketplace for [StackHouse](https://stackhouse.cloud) products.

## Available plugins

| Plugin | Path | Description |
| --- | --- | --- |
| [**Quizletto**](./plugins/quizletto) | `plugins/quizletto` | Build graded and profile quizzes, manage workspaces and candidate links, run test attempts, and analyze results via Quizletto MCP (`https://api.quizletto.cloud/v1/mcp`). |

## Install in Cursor

### From GitHub repository (individual users)

1. Open **Customize → Plugins** in Cursor.
2. Choose **From GitHub Repository** (or run `/plugin marketplace add https://github.com/stackhouse-cloud/cursor-plugins` in Cursor CLI).
3. Enter `https://github.com/stackhouse-cloud/cursor-plugins` and install **Quizletto**.
4. When prompted on first use, approve the OAuth sign-in screen in your browser.

### Team / Enterprise Marketplace (org admins)

1. Open **Cursor Dashboard → Plugins & MCPs → Add Marketplace → Import from Repo**.
2. Enter `https://github.com/stackhouse-cloud/cursor-plugins`.
3. Optionally enable **Auto Refresh** and **Serve marketplace from Cursor**, then set rollout defaults per plugin.

### Local development & testing

Copy an individual plugin folder into `~/.cursor/plugins/local/<name>` (do not symlink outside `~/.cursor/plugins/local`) and reload Cursor:

```sh
rm -rf ~/.cursor/plugins/local/quizletto
mkdir -p ~/.cursor/plugins/local
cp -R plugins/quizletto ~/.cursor/plugins/local/quizletto
```

Remove any duplicate manual server entry from `~/.cursor/mcp.json` so the MCP server isn't loaded twice.

## Repository layout & adding more StackHouse plugins

Plugins live under `plugins/<name>/` and are indexed in [`.cursor-plugin/marketplace.json`](./.cursor-plugin/marketplace.json) (`metadata.pluginRoot: "plugins"`):

```text
cursor-plugins/
├── .cursor-plugin/
│   └── marketplace.json
├── plugins/
│   └── quizletto/
│       ├── .cursor-plugin/
│       │   └── plugin.json
│       ├── assets/
│       │   └── logo.svg
│       ├── skills/
│       │   └── quizletto/
│       │       └── SKILL.md
│       ├── mcp.json
│       └── README.md
└── scripts/
    ├── validate.mjs
    └── validate.test.mjs
```

Additional StackHouse plugins (such as `plugins/tixanto`, `plugins/dokko`, and `plugins/cordo`) can be added alongside `plugins/quizletto` and registered in `.cursor-plugin/marketplace.json`.

Run validation locally before pushing:

```sh
node --test scripts/validate.test.mjs
node scripts/validate.mjs
```

## License

[MIT](./LICENSE)
