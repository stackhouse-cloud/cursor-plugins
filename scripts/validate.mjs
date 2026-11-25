#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const MARKETPLACE_NAME_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const PLUGIN_NAME_RE = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const SKILL_NAME_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?$/;

// Match Cursor's marketplace.schema.json / plugin.schema.json
// (additionalProperties: false). Do not allow "$schema" — Cursor's Ajv
// validator rejects it, and https://cursor.com/schemas/... is only an $id.
const ALLOWED_MARKETPLACE_KEYS = new Set([
  "name",
  "owner",
  "metadata",
  "plugins",
]);

const ALLOWED_PLUGIN_ENTRY_KEYS = new Set([
  "name",
  "source",
  "description",
  "minClientVersions",
]);

const ALLOWED_PLUGIN_MANIFEST_KEYS = new Set([
  "name",
  "displayName",
  "description",
  "version",
  "minClientVersions",
  "author",
  "publisher",
  "homepage",
  "repository",
  "license",
  "logo",
  "keywords",
  "category",
  "tags",
  "commands",
  "agents",
  "skills",
  "rules",
  "hooks",
  "variables",
  "mcpServers",
]);

const CATEGORY_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BUILTIN_MCP_VARS = new Set([
  "CURSOR_PLUGIN_ROOT",
  "CLAUDE_PLUGIN_ROOT",
]);

const SECRET_TOKEN_RE = /\b(?:qzl_[A-Za-z0-9_-]{8,}|dfsa_[A-Za-z0-9_-]{8,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,})\b/;

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(targetPath) {
  try {
    const stat = await fs.stat(targetPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

function isSafeRelativeSubpath(value) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  if (
    value === "." ||
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("/") ||
    value.includes("\\") ||
    path.isAbsolute(value)
  ) {
    return false;
  }
  const normalized = path.posix.normalize(value);
  return (
    normalized !== "." &&
    normalized !== ".." &&
    !normalized.startsWith("../")
  );
}

function parseFrontmatter(rawContent) {
  const content = rawContent.replace(/\r\n/g, "\n");
  if (!content.startsWith("---\n")) {
    return null;
  }
  const closingIndex = content.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return null;
  }
  const block = content.slice(4, closingIndex);
  const fields = {};
  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const colon = line.indexOf(":");
    if (colon === -1) {
      continue;
    }
    const key = line.slice(0, colon).trim();
    let val = line.slice(colon + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    fields[key] = val;
  }
  return fields;
}

async function readJson(filePath, label, errors) {
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    errors.push(`${label} is missing: ${filePath}`);
    return { data: null, raw: null };
  }
  try {
    return { data: JSON.parse(raw), raw };
  } catch (err) {
    errors.push(`${label} contains invalid JSON (${filePath}): ${err.message}`);
    return { data: null, raw };
  }
}

export async function validateMarketplaceRepo(repoRoot) {
  const errors = [];

  for (const requiredRootFile of ["README.md", "LICENSE"]) {
    if (!(await pathExists(path.join(repoRoot, requiredRootFile)))) {
      errors.push(`Repository root is missing ${requiredRootFile}.`);
    }
  }

  if (await pathExists(path.join(repoRoot, ".cursor-plugin", "plugin.json"))) {
    errors.push(
      "Do not place .cursor-plugin/plugin.json at the repository root alongside .cursor-plugin/marketplace.json; place plugins under subdirectories."
    );
  }

  const marketplacePath = path.join(repoRoot, ".cursor-plugin", "marketplace.json");
  const { data: marketplace, raw: marketplaceRaw } = await readJson(
    marketplacePath,
    "Marketplace manifest",
    errors
  );
  if (!marketplace) {
    return { valid: false, errors };
  }

  if (Buffer.byteLength(marketplaceRaw, "utf8") > 10 * 1024 * 1024) {
    errors.push("Marketplace manifest exceeds 10 MB limit.");
  }

  for (const key of Object.keys(marketplace)) {
    if (!ALLOWED_MARKETPLACE_KEYS.has(key)) {
      errors.push(`Marketplace manifest contains unsupported key "${key}".`);
    }
  }

  if (
    typeof marketplace.name !== "string" ||
    !MARKETPLACE_NAME_RE.test(marketplace.name)
  ) {
    errors.push(
      'Marketplace "name" must be lowercase kebab-case starting and ending with an alphanumeric character.'
    );
  }

  if (
    !marketplace.owner ||
    typeof marketplace.owner.name !== "string" ||
    marketplace.owner.name.trim().length === 0
  ) {
    errors.push('Marketplace "owner.name" is required.');
  }

  if (
    !marketplace.owner ||
    typeof marketplace.owner.email !== "string" ||
    !EMAIL_RE.test(marketplace.owner.email)
  ) {
    errors.push(
      'Marketplace "owner.email" is required for Cursor Marketplace submissions.'
    );
  }

  const pluginRoot = marketplace.metadata?.pluginRoot;
  if (pluginRoot !== undefined) {
    if (!isSafeRelativeSubpath(pluginRoot)) {
      errors.push(
        `Marketplace "metadata.pluginRoot" must be a bare relative directory name (got "${pluginRoot}").`
      );
    } else if (!(await isDirectory(path.join(repoRoot, pluginRoot)))) {
      errors.push(
        `Marketplace "metadata.pluginRoot" directory does not exist: ${pluginRoot}`
      );
    }
  }

  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
    errors.push('Marketplace "plugins" must be a non-empty array.');
    return { valid: false, errors };
  }

  const seenNames = new Set();
  for (const [index, entry] of marketplace.plugins.entries()) {
    const label = `plugins[${index}]`;
    if (!entry || typeof entry !== "object") {
      errors.push(`${label} must be an object.`);
      continue;
    }

    for (const key of Object.keys(entry)) {
      if (!ALLOWED_PLUGIN_ENTRY_KEYS.has(key)) {
        errors.push(
          `${label} contains unsupported property "${key}" (put plugin metadata inside plugin.json instead).`
        );
      }
    }

    if (typeof entry.name !== "string" || !PLUGIN_NAME_RE.test(entry.name)) {
      errors.push(
        `${label}.name must be lowercase alphanumeric with hyphens or periods.`
      );
      continue;
    }

    if (seenNames.has(entry.name)) {
      errors.push(`Duplicate plugin name in marketplace.json: "${entry.name}".`);
    }
    seenNames.add(entry.name);

    if (!isSafeRelativeSubpath(entry.source)) {
      errors.push(
        `${label}.source must be a bare relative subdirectory path without ".", "./", "..", or leading "/" (got "${entry.source}").`
      );
      continue;
    }

    if (
      typeof pluginRoot === "string" &&
      (entry.source === pluginRoot || entry.source.startsWith(`${pluginRoot}/`))
    ) {
      errors.push(
        `${label}.source ("${entry.source}") must not repeat metadata.pluginRoot ("${pluginRoot}").`
      );
      continue;
    }

    const relPluginDir = pluginRoot
      ? path.posix.join(pluginRoot, entry.source)
      : entry.source;
    const pluginDir = path.join(repoRoot, relPluginDir);

    if (!(await isDirectory(pluginDir))) {
      errors.push(`${label}.source directory does not exist: ${relPluginDir}`);
      continue;
    }

    const pluginManifestPath = path.join(
      pluginDir,
      ".cursor-plugin",
      "plugin.json"
    );
    const { data: pluginManifest } = await readJson(
      pluginManifestPath,
      `${entry.name} plugin.json`,
      errors
    );
    if (!pluginManifest) {
      continue;
    }

    for (const key of Object.keys(pluginManifest)) {
      if (!ALLOWED_PLUGIN_MANIFEST_KEYS.has(key)) {
        errors.push(`${entry.name}: plugin.json has unsupported key "${key}".`);
      }
    }

    if (pluginManifest.name !== entry.name) {
      errors.push(
        `${entry.name}: marketplace entry name ("${entry.name}") does not match plugin.json name ("${pluginManifest.name}").`
      );
    }

    if (
      pluginManifest.version !== undefined &&
      (typeof pluginManifest.version !== "string" ||
        !SEMVER_RE.test(pluginManifest.version))
    ) {
      errors.push(
        `${entry.name}: plugin.json version ("${pluginManifest.version}") must be valid semver (X.Y.Z).`
      );
    }

    if (
      !pluginManifest.author ||
      typeof pluginManifest.author.name !== "string" ||
      pluginManifest.author.name.trim().length === 0
    ) {
      errors.push(`${entry.name}: plugin.json author.name is required.`);
    } else if (
      typeof pluginManifest.author.email !== "string" ||
      !EMAIL_RE.test(pluginManifest.author.email)
    ) {
      errors.push(
        `${entry.name}: plugin.json author.email is required for Cursor Marketplace submissions.`
      );
    }

    if (pluginManifest.category !== undefined) {
      if (
        typeof pluginManifest.category !== "string" ||
        !CATEGORY_RE.test(pluginManifest.category)
      ) {
        errors.push(
          `${entry.name}: plugin.json category ("${pluginManifest.category}") must be lowercase kebab-case (e.g. "productivity").`
        );
      }
    }

    for (const urlField of ["homepage", "repository"]) {
      if (pluginManifest[urlField] !== undefined) {
        try {
          const parsed = new URL(pluginManifest[urlField]);
          if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            errors.push(`${entry.name}: ${urlField} must be an http(s) URL.`);
          }
        } catch {
          errors.push(
            `${entry.name}: ${urlField} is not a valid URL ("${pluginManifest[urlField]}").`
          );
        }
      }
    }

    if (pluginManifest.logo !== undefined) {
      if (
        !pluginManifest.logo.startsWith("http://") &&
        !pluginManifest.logo.startsWith("https://")
      ) {
        if (!isSafeRelativeSubpath(pluginManifest.logo)) {
          errors.push(
            `${entry.name}: logo path "${pluginManifest.logo}" must be a clean relative path.`
          );
        } else if (
          !(await pathExists(path.join(pluginDir, pluginManifest.logo)))
        ) {
          errors.push(
            `${entry.name}: logo file not found at ${relPluginDir}/${pluginManifest.logo}.`
          );
        }
      }
    }

    const declaredVars = new Set(
      Object.keys(pluginManifest.variables?.properties ?? {})
    );

    const mcpRef =
      typeof pluginManifest.mcpServers === "string"
        ? pluginManifest.mcpServers
        : (await pathExists(path.join(pluginDir, "mcp.json")))
          ? "mcp.json"
          : null;

    if (mcpRef !== null) {
      if (!isSafeRelativeSubpath(mcpRef)) {
        errors.push(
          `${entry.name}: mcpServers path "${mcpRef}" must be a clean relative path.`
        );
      } else {
        const mcpPath = path.join(pluginDir, mcpRef);
        const { data: mcpData, raw: mcpRaw } = await readJson(
          mcpPath,
          `${entry.name} ${mcpRef}`,
          errors
        );
        if (mcpData && mcpRaw) {
          if (
            !mcpData.mcpServers ||
            typeof mcpData.mcpServers !== "object" ||
            Object.keys(mcpData.mcpServers).length === 0
          ) {
            errors.push(
              `${entry.name}: ${mcpRef} must define a non-empty "mcpServers" object.`
            );
          }
          if (SECRET_TOKEN_RE.test(mcpRaw)) {
            errors.push(
              `${entry.name}: ${mcpRef} appears to contain a hardcoded credential.`
            );
          }
          for (const match of mcpRaw.matchAll(/\$\{([^}]+)\}/g)) {
            const expr = match[1];
            if (expr.startsWith("env:") || BUILTIN_MCP_VARS.has(expr)) {
              continue;
            }
            if (!declaredVars.has(expr)) {
              errors.push(
                `${entry.name}: ${mcpRef} references "\${${expr}}" which is not declared in plugin.json variables.properties.`
              );
            }
          }
        }
      }
    }

    const skillsDir = path.join(pluginDir, "skills");
    if (await isDirectory(skillsDir)) {
      const skillEntries = await fs.readdir(skillsDir, { withFileTypes: true });
      for (const dirent of skillEntries) {
        if (!dirent.isDirectory()) {
          continue;
        }
        const skillFolder = dirent.name;
        const skillFile = path.join(skillsDir, skillFolder, "SKILL.md");
        if (!(await pathExists(skillFile))) {
          errors.push(
            `${entry.name}: skill directory skills/${skillFolder} is missing SKILL.md.`
          );
          continue;
        }
        const rawSkill = await fs.readFile(skillFile, "utf8");
        const fm = parseFrontmatter(rawSkill);
        if (!fm) {
          errors.push(
            `${entry.name}: skills/${skillFolder}/SKILL.md is missing YAML frontmatter.`
          );
          continue;
        }
        if (
          !fm.name ||
          fm.name !== skillFolder ||
          fm.name.length > 64 ||
          !SKILL_NAME_RE.test(fm.name)
        ) {
          errors.push(
            `${entry.name}: skills/${skillFolder}/SKILL.md frontmatter "name" ("${fm.name ?? ""}") must match folder "${skillFolder}".`
          );
        }
        if (
          !fm.description ||
          fm.description === ">-" ||
          fm.description === ">" ||
          fm.description === "|" ||
          fm.description.length > 1024
        ) {
          errors.push(
            `${entry.name}: skills/${skillFolder}/SKILL.md frontmatter must have a single-line "description" (1–1024 chars).`
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const targetRoot = process.argv[2]
    ? path.resolve(process.argv[2])
    : process.cwd();
  const result = await validateMarketplaceRepo(targetRoot);
  if (!result.valid) {
    console.error("Plugin marketplace validation failed:");
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
  console.log("Plugin marketplace validation passed.");
}
