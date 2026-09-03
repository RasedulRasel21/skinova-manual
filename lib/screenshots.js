import fs from "node:fs";
import path from "node:path";

/**
 * Resolves screenshots by section at build time.
 *
 *   public/screenshots/section/         the section on a storefront
 *   public/screenshots/section-adding/  the Add section flow in the editor
 *   public/screenshots/general/         a Theme settings panel
 *
 * Filenames are matched loosely, so they can be named the way you'd label them
 * while taking them — "FAQ grid.png", "faq-grid.png" and "FAQ Grid.PNG" all
 * resolve to the faq-grid section. Run `npm run screenshots` for a coverage
 * report and a list of filenames that match nothing.
 */
const ROOT = path.join(process.cwd(), "public", "screenshots");
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

/**
 * Production reads the folders once — the file set can't change mid-build.
 * Development re-reads on every lookup so a screenshot dropped in while the
 * dev server is running shows up on refresh instead of needing a restart.
 */
const CACHE_LISTINGS = process.env.NODE_ENV === "production";

const normalise = (value) =>
  String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function readFolder(folder) {
  const found = new Map();
  let entries;
  try {
    entries = fs.readdirSync(path.join(ROOT, folder), { withFileTypes: true });
  } catch {
    return found; // folder not created yet — every lookup simply misses
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!EXTENSIONS.has(ext)) continue;
    const key = normalise(entry.name.slice(0, -ext.length));
    // encodeURI keeps filenames with spaces working as URLs.
    found.set(key, encodeURI(`/screenshots/${folder}/${entry.name}`));
  }
  return found;
}

const cache = new Map();

function listing(folder) {
  if (CACHE_LISTINGS && cache.has(folder)) return cache.get(folder);
  const table = readFolder(folder);
  if (CACHE_LISTINGS) cache.set(folder, table);
  return table;
}

function lookup(folder, candidates) {
  const table = listing(folder);
  for (const candidate of candidates) {
    if (!candidate) continue;
    const hit = table.get(normalise(candidate));
    if (hit) return hit;
  }
  return null;
}

/** The section as it appears on a storefront. Matches on slug, handle or title. */
export const sectionPreview = (section) =>
  lookup("section", [section.slug, section.handle, section.title]);

/** The Add section flow for that section. */
export const sectionAdding = (section) =>
  lookup("section-adding", [section.slug, section.handle, section.title]);

/** A Theme settings panel. */
export const generalScreenshot = (group) =>
  lookup("general", [group.slug, group.title]);
