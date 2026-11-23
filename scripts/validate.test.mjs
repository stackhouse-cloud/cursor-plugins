import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateMarketplaceRepo } from "./validate.mjs";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

test("stackhouse-cloud/cursor-plugins repository passes validation and ships quizletto + tixanto + cordo", async () => {
  const result = await validateMarketplaceRepo(REPO_ROOT);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);

  const marketplace = JSON.parse(
    await fs.readFile(
      path.join(REPO_ROOT, ".cursor-plugin", "marketplace.json"),
      "utf8"
    )
  );
  assert.equal(marketplace.name, "stackhouse");
  assert.equal(marketplace.owner?.name, "StackHouse");
  assert.equal(marketplace.owner?.email, "privacy@captionworks.com");
  assert.equal(marketplace.metadata?.pluginRoot, "plugins");
  assert.equal(marketplace.$schema, undefined);

  const quizlettoEntry = marketplace.plugins.find(
    (p) => p.name === "quizletto"
  );
  assert.ok(quizlettoEntry, "expected quizletto entry in marketplace.json");
  assert.equal(quizlettoEntry.source, "quizletto");

  const tixantoEntry = marketplace.plugins.find((p) => p.name === "tixanto");
  assert.ok(tixantoEntry, "expected tixanto entry in marketplace.json");
  assert.equal(tixantoEntry.source, "tixanto");

  const pluginManifest = JSON.parse(
    await fs.readFile(
      path.join(
        REPO_ROOT,
        "plugins",
        "quizletto",
        ".cursor-plugin",
        "plugin.json"
      ),
      "utf8"
    )
  );
  assert.equal(pluginManifest.$schema, undefined);
  assert.equal(pluginManifest.category, "productivity");
  assert.equal(pluginManifest.author?.email, "privacy@captionworks.com");
  assert.equal(pluginManifest.mcpServers, undefined);

  const mcp = JSON.parse(
    await fs.readFile(
      path.join(REPO_ROOT, "plugins", "quizletto", "mcp.json"),
      "utf8"
    )
  );
  assert.equal(mcp.mcpServers?.quizletto?.type, "http");
  assert.equal(
    mcp.mcpServers?.quizletto?.url,
    "https://api.quizletto.cloud/v1/mcp"
  );

  assert.ok(
    await fs
      .access(path.join(REPO_ROOT, "plugins", "quizletto", "LICENSE"))
      .then(() => true)
      .catch(() => false),
    "expected plugins/quizletto/LICENSE"
  );

  const tixantoManifest = JSON.parse(
    await fs.readFile(
      path.join(
        REPO_ROOT,
        "plugins",
        "tixanto",
        ".cursor-plugin",
        "plugin.json"
      ),
      "utf8"
    )
  );
  assert.equal(tixantoManifest.category, "productivity");
  assert.equal(tixantoManifest.author?.email, "privacy@captionworks.com");
  assert.equal(
    tixantoManifest.variables,
    undefined,
    "tixanto uses OAuth 2.1 and should not require plugin variables"
  );

  const tixantoMcp = JSON.parse(
    await fs.readFile(
      path.join(REPO_ROOT, "plugins", "tixanto", "mcp.json"),
      "utf8"
    )
  );
  assert.equal(tixantoMcp.mcpServers?.tixanto?.type, "http");
  assert.equal(
    tixantoMcp.mcpServers?.tixanto?.url,
    "https://api.tixanto.cloud/v1/mcp/http"
  );
  assert.equal(
    tixantoMcp.mcpServers?.tixanto?.headers,
    undefined,
    "tixanto uses OAuth 2.1 and should not set static auth headers"
  );

  assert.ok(
    await fs
      .access(path.join(REPO_ROOT, "plugins", "tixanto", "LICENSE"))
      .then(() => true)
      .catch(() => false),
    "expected plugins/tixanto/LICENSE"
  );

  const cordoEntry = marketplace.plugins.find((p) => p.name === "cordo");
  assert.ok(cordoEntry, "expected cordo entry in marketplace.json");
  assert.equal(cordoEntry.source, "cordo");

  const cordoManifest = JSON.parse(
    await fs.readFile(
      path.join(REPO_ROOT, "plugins", "cordo", ".cursor-plugin", "plugin.json"),
      "utf8"
    )
  );
  assert.equal(cordoManifest.category, "productivity");
  assert.equal(cordoManifest.author?.email, "privacy@captionworks.com");
  assert.ok(
    cordoManifest.variables?.properties?.CORDO_API_TOKEN,
    "expected CORDO_API_TOKEN plugin variable"
  );

  const cordoMcp = JSON.parse(
    await fs.readFile(
      path.join(REPO_ROOT, "plugins", "cordo", "mcp.json"),
      "utf8"
    )
  );
  assert.equal(cordoMcp.mcpServers?.cordo?.type, "http");
  assert.equal(cordoMcp.mcpServers?.cordo?.url, "https://api.cordo.cloud/mcp");
  assert.equal(
    cordoMcp.mcpServers?.cordo?.headers?.Authorization,
    "Bearer ${CORDO_API_TOKEN}"
  );

  assert.ok(
    await fs
      .access(path.join(REPO_ROOT, "plugins", "cordo", "LICENSE"))
      .then(() => true)
      .catch(() => false),
    "expected plugins/cordo/LICENSE"
  );
});

test("validator rejects common Cursor marketplace pitfalls", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-plugins-test-"));
  try {
    await fs.writeFile(path.join(tmpDir, "README.md"), "# Test\n");
    await fs.writeFile(path.join(tmpDir, "LICENSE"), "MIT\n");
    await fs.mkdir(path.join(tmpDir, ".cursor-plugin"), { recursive: true });
    await fs.mkdir(path.join(tmpDir, "plugins", "demo", ".cursor-plugin"), {
      recursive: true,
    });

    // Hybrid root plugin.json + "./" source prefix + undeclared MCP variable
    await fs.writeFile(
      path.join(tmpDir, ".cursor-plugin", "plugin.json"),
      JSON.stringify({ name: "demo" })
    );
    await fs.writeFile(
      path.join(tmpDir, ".cursor-plugin", "marketplace.json"),
      JSON.stringify({
        name: "captionworks",
        owner: { name: "Captionworks" },
        metadata: { pluginRoot: "plugins" },
        plugins: [
          {
            name: "demo",
            source: "./demo",
            version: "1.0.0",
          },
        ],
      })
    );

    const badLayout = await validateMarketplaceRepo(tmpDir);
    assert.equal(badLayout.valid, false);
    assert.ok(
      badLayout.errors.some((e) => e.includes("repository root")),
      "should reject root .cursor-plugin/plugin.json"
    );
    assert.ok(
      badLayout.errors.some((e) => e.includes('unsupported property "version"')),
      "should reject extra properties on marketplace plugin entries"
    );
    assert.ok(
      badLayout.errors.some((e) => e.includes("bare relative subdirectory")),
      "should reject ./ prefix on source"
    );

    // Clean root, check undeclared MCP variable detection
    await fs.unlink(path.join(tmpDir, ".cursor-plugin", "plugin.json"));
    await fs.writeFile(
      path.join(tmpDir, ".cursor-plugin", "marketplace.json"),
      JSON.stringify({
        name: "captionworks",
        owner: { name: "Captionworks" },
        metadata: { pluginRoot: "plugins" },
        plugins: [{ name: "demo", source: "demo" }],
      })
    );
    await fs.writeFile(
      path.join(tmpDir, "plugins", "demo", ".cursor-plugin", "plugin.json"),
      JSON.stringify({ name: "demo", mcpServers: "mcp.json" })
    );
    await fs.writeFile(
      path.join(tmpDir, "plugins", "demo", "mcp.json"),
      JSON.stringify({
        mcpServers: {
          demo: {
            url: "https://example.com/mcp",
            headers: { Authorization: "Bearer ${DEMO_TOKEN}" },
          },
        },
      })
    );

    const missingVar = await validateMarketplaceRepo(tmpDir);
    assert.equal(missingVar.valid, false);
    assert.ok(
      missingVar.errors.some((e) => e.includes("DEMO_TOKEN")),
      "should reject undeclared ${VAR} placeholder in mcp.json"
    );

    // Reject Cursor-schema-incompatible "$schema" and Title Case categories
    await fs.writeFile(
      path.join(tmpDir, ".cursor-plugin", "marketplace.json"),
      JSON.stringify({
        $schema: "https://cursor.com/schemas/cursor-plugin/marketplace.json",
        name: "captionworks",
        owner: { name: "Captionworks", email: "plugins@example.com" },
        metadata: { pluginRoot: "plugins" },
        plugins: [{ name: "demo", source: "demo" }],
      })
    );
    await fs.writeFile(
      path.join(tmpDir, "plugins", "demo", ".cursor-plugin", "plugin.json"),
      JSON.stringify({
        $schema: "https://cursor.com/schemas/cursor-plugin/plugin.json",
        name: "demo",
        author: { name: "Captionworks", email: "plugins@example.com" },
        category: "Productivity",
      })
    );
    await fs.writeFile(
      path.join(tmpDir, "plugins", "demo", "mcp.json"),
      JSON.stringify({
        mcpServers: { demo: { type: "http", url: "https://example.com/mcp" } },
      })
    );

    const schemaNoise = await validateMarketplaceRepo(tmpDir);
    assert.equal(schemaNoise.valid, false);
    assert.ok(
      schemaNoise.errors.some((e) =>
        e.includes('unsupported key "$schema"')
      ),
      "should reject $schema (Cursor Ajv additionalProperties: false)"
    );
    assert.ok(
      schemaNoise.errors.some((e) => e.includes("lowercase kebab-case")),
      "should reject Title Case category values"
    );
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
