/**
 * Reports which manual screenshots exist and which are still missing.
 *
 *   npm run screenshots
 *
 * Matching is loose — "FAQ grid.png", "faq-grid.png" and "FAQ Grid.PNG" all
 * resolve to the faq-grid section — so anything listed as MISSING really is
 * absent, and anything listed as UNMATCHED is a filename typo.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const SHOTS = path.join(ROOT, "public", "screenshots");
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

const schema = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "theme-schema.json"), "utf8")
);
// Sections deliberately documented without imagery.
const imageless = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, "data", "no-screenshots.json"), "utf8")).sections
);

const normalise = (v) =>
  String(v)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function readFolder(folder) {
  const map = new Map();
  let entries;
  try {
    entries = fs.readdirSync(path.join(SHOTS, folder), { withFileTypes: true });
  } catch {
    return map;
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!EXTENSIONS.has(ext)) continue;
    map.set(normalise(entry.name.slice(0, -ext.length)), entry.name);
  }
  return map;
}

const folders = {
  section: readFolder("section"),
  "section-adding": readFolder("section-adding"),
  general: readFolder("general"),
};

const claimed = { section: new Set(), "section-adding": new Set(), general: new Set() };

function match(folder, candidates) {
  for (const candidate of candidates) {
    const key = normalise(candidate);
    if (folders[folder].has(key)) {
      claimed[folder].add(key);
      return folders[folder].get(key);
    }
  }
  return null;
}

const rows = [];
for (const section of schema.sections) {
  const keys = [section.slug, section.handle, section.title];
  rows.push({
    name: section.title,
    handle: section.handle,
    addable: section.addable,
    wanted: section.addable && !imageless.has(section.handle),
    preview: match("section", keys),
    adding: match("section-adding", keys),
  });
}
const generalRows = schema.themeSettings.map((group) => ({
  name: group.title,
  file: match("general", [group.slug, group.title]),
}));

/* ------------------------------------------------------------------ report */

const has = (v) => (v ? "yes" : "—  ");
const pad = (s, n) => String(s).padEnd(n);

console.log("\nSECTION SCREENSHOTS");
console.log(pad("section", 26) + pad("preview", 9) + pad("adding", 9) + "addable");
console.log("-".repeat(52));
for (const r of rows) {
  const kind = !r.addable ? "template" : r.wanted ? "yes" : "no images";
  console.log(pad(r.name, 26) + pad(has(r.preview), 9) + pad(has(r.adding), 9) + kind);
}

console.log("\nTHEME SETTINGS SCREENSHOTS");
for (const r of generalRows) console.log("  " + pad(r.name, 20) + has(r.file));

const missingPreview = rows.filter((r) => !r.preview && r.wanted);
const missingAdding = rows.filter((r) => !r.adding && r.wanted);
const missingGeneral = generalRows.filter((r) => !r.file);

console.log("\n" + "=".repeat(52));
const wanted = rows.filter((r) => r.wanted);
console.log(`previews        ${wanted.length - missingPreview.length}/${wanted.length} (illustrated sections only)`);
console.log(`adding flows    ${wanted.length - missingAdding.length}/${wanted.length} (illustrated sections only)`);
console.log(`theme settings  ${generalRows.length - missingGeneral.length}/${generalRows.length}`);

const list = (label, items) => {
  if (!items.length) return;
  console.log(`\nMISSING ${label} (${items.length}):`);
  for (const i of items) console.log(`  ${i.name ?? i}`);
};
list("previews — public/screenshots/section/", missingPreview);
list("adding flows — public/screenshots/section-adding/", missingAdding);
list("theme settings — public/screenshots/general/", missingGeneral);

const unmatched = [];
for (const [folder, table] of Object.entries(folders))
  for (const [key, file] of table)
    if (!claimed[folder].has(key)) unmatched.push(`${folder}/${file}`);

if (unmatched.length) {
  console.log(`\nUNMATCHED FILES (${unmatched.length}) — no section has this name, likely a typo:`);
  for (const f of unmatched) console.log(`  ${f}`);
}
console.log("");
