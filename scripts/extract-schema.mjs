/**
 * Extracts the Skinova theme's settings schema into data/theme-schema.json.
 *
 * The manual has to stay "consistent with the copy in the theme settings"
 * (Shopify Theme Store requirement), so every setting name, default and help
 * string is read from the theme source rather than retyped. Run this whenever
 * the theme's schemas change, then commit the JSON — Vercel builds from the
 * committed file and never needs the theme repo.
 *
 *   npm run extract
 *
 * THEME_PATH overrides the default "../" if the theme lives elsewhere.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.resolve(HERE, "..", process.env.THEME_PATH ?? "..");
const OUT = path.join(HERE, "..", "data", "theme-schema.json");

/* ------------------------------------------------------------------ utils */

/** Shopify prepends an auto-generated /* … *​/ banner to some JSON files. */
const readJson = (p) =>
  JSON.parse(fs.readFileSync(p, "utf8").replace(/^\s*\/\*[\s\S]*?\*\//, ""));

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Settings that only structure the sidebar — never documented as controls. */
const PRESENTATIONAL = new Set(["header", "paragraph"]);

/* ------------------------------------------------- locale key resolution */

const schemaLocale = readJson(
  path.join(THEME, "locales", "en.default.schema.json")
);

const missingKeys = new Set();

/**
 * Schema strings are often "t:labels.page_width" rather than literal English.
 * Resolve them against en.default.schema.json so the manual shows what the
 * merchant actually sees in the Customizer.
 */
function t(value) {
  if (typeof value !== "string") return value;
  if (!value.startsWith("t:")) return value;
  const key = value.slice(2);
  const resolved = key
    .split(".")
    .reduce((node, part) => (node == null ? undefined : node[part]), schemaLocale);
  if (typeof resolved !== "string") {
    missingKeys.add(key);
    return key; // surface the key rather than an empty label
  }
  return resolved;
}

/* --------------------------------------------------------- setting shape */

function normaliseSetting(raw) {
  const setting = {
    id: raw.id ?? null,
    type: raw.type,
    label: t(raw.label) ?? null,
    info: t(raw.info) ?? null,
    default: raw.default ?? null,
    unit: raw.unit ?? null,
  };
  if (raw.type === "range") {
    setting.range = { min: raw.min, max: raw.max, step: raw.step };
  }
  if (Array.isArray(raw.options)) {
    setting.options = raw.options.map((o) => ({
      value: o.value,
      label: t(o.label),
    }));
  }
  // A literal (non "t:") label means the string can't be translated by a
  // merchant. Worth surfacing — reviewers read these labels too.
  setting.untranslated =
    typeof raw.label === "string" && !raw.label.startsWith("t:");
  return setting;
}

/**
 * `header` entries visually group the settings that follow them in the
 * Customizer. Rebuild those groups so each manual page can mirror the panel.
 */
function groupSettings(list = []) {
  const groups = [];
  let current = { title: null, settings: [] };
  for (const raw of list) {
    if (raw.type === "header") {
      if (current.settings.length) groups.push(current);
      current = { title: t(raw.content), settings: [] };
      continue;
    }
    if (PRESENTATIONAL.has(raw.type)) continue;
    current.settings.push(normaliseSetting(raw));
  }
  if (current.settings.length) groups.push(current);
  return groups;
}

const countSettings = (groups) =>
  groups.reduce((n, g) => n + g.settings.length, 0);

/* ----------------------------------------------------------- theme settings */

const settingsSchema = readJson(
  path.join(THEME, "config", "settings_schema.json")
);
const themeInfo = settingsSchema.find((g) => g.name === "theme_info") ?? {};

const themeSettings = settingsSchema
  .filter((g) => g.name !== "theme_info")
  .map((group) => {
    const title = t(group.name);
    return {
      slug: slugify(title),
      title,
      groups: groupSettings(group.settings),
    };
  });

/* ------------------------------------------------ where each section is used */

/**
 * A section with no presets can only be reached through the template that
 * already contains it, so the manual needs to name that template. Build the
 * reverse index from the JSON templates and section groups.
 */
const usage = {};
function noteUsage(dir, file, label) {
  let doc;
  try {
    doc = readJson(path.join(THEME, dir, file));
  } catch {
    return;
  }
  for (const section of Object.values(doc.sections ?? {})) {
    if (!section?.type) continue;
    (usage[section.type] ??= new Set()).add(label);
  }
}
for (const file of fs.readdirSync(path.join(THEME, "templates"))) {
  if (file.endsWith(".json")) noteUsage("templates", file, file.replace(/.json$/, ""));
}
for (const file of fs.readdirSync(path.join(THEME, "sections"))) {
  if (file.endsWith("-group.json")) {
    noteUsage("sections", file, file.replace(/-group.json$/, "") + " group");
  }
}

/**
 * A few sections are rendered straight from the layout rather than a template,
 * so they appear on every page. Others are never placed on a page at all and
 * exist only for the Section Rendering API — those have nothing to set up.
 */
const layoutRendered = new Set();
for (const file of fs.readdirSync(path.join(THEME, "layout"))) {
  if (!file.endsWith(".liquid")) continue;
  const source = fs.readFileSync(path.join(THEME, "layout", file), "utf8");
  for (const m of source.matchAll(/\{%-?\s*section\s+['"]([a-z0-9_-]+)['"]/g)) {
    layoutRendered.add(m[1]);
  }
}

/* ---------------------------------------------------------------- sections */

const SCHEMA_RE = /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/;

const sections = [];
const failed = [];

for (const file of fs.readdirSync(path.join(THEME, "sections")).sort()) {
  if (!file.endsWith(".liquid")) continue;
  const handle = file.replace(/\.liquid$/, "");
  const source = fs.readFileSync(path.join(THEME, "sections", file), "utf8");
  const match = source.match(SCHEMA_RE);
  if (!match) continue; // section groups and helpers carry no schema

  let schema;
  try {
    schema = JSON.parse(match[1]);
  } catch (error) {
    failed.push({ handle, error: error.message });
    continue;
  }

  const title = t(schema.name) ?? handle;
  const groups = groupSettings(schema.settings);
  const blocks = (schema.blocks ?? [])
    .filter((b) => b.type !== "@app" && b.type !== "@theme")
    .map((b) => ({
      type: b.type,
      name: t(b.name) ?? b.type,
      groups: groupSettings(b.settings),
    }));

  sections.push({
    handle,
    slug: slugify(handle),
    title,
    // Sections without presets can't be added from the section picker — they
    // belong to a specific template. Merchants need to know which is which.
    addable: Array.isArray(schema.presets) && schema.presets.length > 0,
    maxBlocks: schema.max_blocks ?? null,
    acceptsAppBlocks: (schema.blocks ?? []).some((b) => b.type === "@app"),
    // Templates and section groups this section already appears in.
    usedIn: [...(usage[handle] ?? [])].sort(),
    renderedInLayout: layoutRendered.has(handle),
    settingCount: countSettings(groups),
    blockSettingCount: blocks.reduce((n, b) => n + countSettings(b.groups), 0),
    groups,
    blocks,
  });
}

/* ------------------------------------------------------------------ output */

const addable = sections.filter((s) => s.addable);
const templateOnly = sections.filter((s) => !s.addable);

const payload = {
  generatedAt: new Date().toISOString(),
  theme: {
    name: themeInfo.theme_name ?? null,
    version: themeInfo.theme_version ?? null,
    author: themeInfo.theme_author ?? null,
    documentationUrl: themeInfo.theme_documentation_url ?? null,
    supportUrl: themeInfo.theme_support_url ?? null,
  },
  totals: {
    sections: sections.length,
    addableSections: addable.length,
    templateSections: templateOnly.length,
    themeSettings: themeSettings.reduce((n, g) => n + countSettings(g.groups), 0),
    sectionSettings: sections.reduce((n, s) => n + s.settingCount, 0),
    blockSettings: sections.reduce((n, s) => n + s.blockSettingCount, 0),
  },
  themeSettings,
  sections,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");

/* ------------------------------------------------------------------ report */

const { totals } = payload;
console.log(`theme        ${payload.theme.name} ${payload.theme.version}`);
console.log(`sections     ${totals.sections} (${totals.addableSections} addable, ${totals.templateSections} template-only)`);
console.log(`settings     ${totals.themeSettings} theme + ${totals.sectionSettings} section + ${totals.blockSettings} block`);
console.log(`written      ${path.relative(process.cwd(), OUT)}`);

if (failed.length) {
  console.warn(`\n${failed.length} schema(s) failed to parse:`);
  for (const f of failed) console.warn(`  ${f.handle}: ${f.error}`);
  process.exitCode = 1;
}

if (missingKeys.size) {
  console.warn(`\n${missingKeys.size} unresolved t: key(s) — add to locales/en.default.schema.json:`);
  for (const k of [...missingKeys].sort()) console.warn(`  ${k}`);
}

const untranslated = [];
for (const s of sections) {
  const scan = (groups, where) => {
    for (const g of groups)
      for (const st of g.settings)
        if (st.untranslated) untranslated.push(`${s.handle}${where} ${st.id ?? st.type}: "${st.label}"`);
  };
  scan(s.groups, "");
  for (const b of s.blocks) scan(b.groups, ` [${b.type}]`);
}
if (untranslated.length) {
  console.warn(`\n${untranslated.length} schema label(s) are literal strings, not t: keys:`);
  for (const line of untranslated.slice(0, 15)) console.warn(`  ${line}`);
  if (untranslated.length > 15) console.warn(`  … ${untranslated.length - 15} more`);
}
