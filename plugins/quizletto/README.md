# Quizletto Plugin for Cursor

Connect Cursor to [Quizletto](https://www.quizletto.cloud) to create, edit, test, and publish graded or profile quizzes, issue candidate links, inspect attempts, and analyze results.

## What's included

- **MCP server (`mcp.json`)**: Connects over Streamable HTTP to `https://api.quizletto.cloud/v1/mcp` using OAuth 2.1 + PKCE — no API key copy-paste required.
- **Agent skill (`skills/quizletto/SKILL.md`)**: Guides Cursor agents on workspace selection (`quizletto_context`), draft vs published quiz versions (`quizletto_publish_quiz`), incremental step edits, graded vs profile scoring modes, test runs, and untrusted-content safety.

## Setup

1. Install the **Quizletto** plugin in Cursor (from the StackHouse marketplace or [GitHub repository](https://github.com/stackhouse-cloud/cursor-plugins)).
2. On your first Quizletto prompt (or via **Customize → Plugins → Quizletto**), Cursor opens your browser to sign in to Quizletto and approve access.
3. Ask Cursor to call `quizletto_context` or list your quizzes to verify the connection.

> **Managing access:** Active Cursor connections appear in Quizletto under **Settings → API tokens → Connected MCP apps**, where you can revoke access at any time.
