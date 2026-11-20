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

test("stackhouse-cloud/cursor-plugins repository passes validation and ships quizletto", async () => {
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
  assert.equal(marketplace.metadata?.pluginRoot, "plugins");

  const quizlettoEntry = marketplace.plugins.find(
    (p) => p.name === "quizletto"
  );
  assert.ok(quizlettoEntry, "expected quizletto entry in marketplace.json");
  assert.equal(quizlettoEntry.source, "quizletto");

  const mcp = JSON.parse(
    await fs.readFile(
      path.join(REPO_ROOT, "plugins", "quizletto", "mcp.json"),
      "utf8"
    )
  );
  assert.equal(
    mcp.mcpServers?.quizletto?.url,
    "https://api.quizletto.cloud/v1/mcp"
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
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
