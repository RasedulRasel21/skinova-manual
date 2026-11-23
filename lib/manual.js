import schema from "@/data/theme-schema.json";
import noScreenshots from "@/data/no-screenshots.json";

/**
 * Sections documented in words only. Template sections are imageless by
 * definition; this covers addable ones we have deliberately chosen not to
 * illustrate.
 */
const IMAGELESS = new Set(noScreenshots.sections);

/** True when the page should render screenshot slots at all. */
export const hasScreenshots = (section) =>
  section.addable && !IMAGELESS.has(section.handle);

export const theme = schema.theme;
export const totals = schema.totals;

/**
 * The manual's navigation. Three groups, mirroring how a merchant thinks about
 * the Customizer: global settings, sections they can add themselves, and
 * sections that are fixed to a template.
 */
export const nav = [
  {
    id: "general",
    title: "General",
    items: schema.themeSettings.map((group) => ({
      slug: group.slug,
      title: group.title,
      href: `/general/${group.slug}`,
    })),
  },
  {
    id: "sections",
    title: "Sections",
    items: schema.sections
      .filter((s) => s.addable)
      .map((s) => ({ slug: s.slug, title: s.title, href: `/sections/${s.slug}` })),
  },
  {
    id: "template-sections",
    title: "Template sections",
    items: schema.sections
      .filter((s) => !s.addable)
      .map((s) => ({ slug: s.slug, title: s.title, href: `/sections/${s.slug}` })),
  },
];

/** Flattened reading order, so every page can offer a "Next" link. */
export const readingOrder = nav.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.title }))
);

export function neighbours(href) {
  const i = readingOrder.findIndex((entry) => entry.href === href);
  if (i === -1) return { previous: null, next: null };
  return {
    previous: i > 0 ? readingOrder[i - 1] : null,
    next: i < readingOrder.length - 1 ? readingOrder[i + 1] : null,
  };
}

export const themeSettingGroups = schema.themeSettings;
export const sections = schema.sections;

export const getThemeSettingGroup = (slug) =>
  schema.themeSettings.find((g) => g.slug === slug) ?? null;

export const getSection = (slug) =>
  schema.sections.find((s) => s.slug === slug) ?? null;

/**
 * Flat index for the search box. Each setting is searchable by its own label
 * as well as the page it lives on, so "font" finds Typography and "sold out"
 * finds the card sections.
 */
export const searchIndex = [
  ...schema.themeSettings.map((group) => ({
    href: `/general/${group.slug}`,
    title: group.title,
    group: "General",
    terms: group.groups
      .flatMap((g) => [g.title, ...g.settings.map((s) => s.label)])
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  })),
  ...schema.sections.map((section) => ({
    href: `/sections/${section.slug}`,
    title: section.title,
    group: section.addable ? "Sections" : "Template sections",
    terms: [
      section.handle,
      ...section.groups.flatMap((g) => [g.title, ...g.settings.map((s) => s.label)]),
      ...section.blocks.flatMap((b) => [
        b.name,
        ...b.groups.flatMap((g) => [g.title, ...g.settings.map((s) => s.label)]),
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  })),
];

/** Human-readable name for a schema setting type, used in the settings list. */
const TYPE_LABELS = {
  checkbox: "toggle",
  color: "colour picker",
  color_background: "gradient picker",
  select: "dropdown",
  radio: "radio group",
  range: "slider",
  text: "text field",
  textarea: "multi-line text field",
  richtext: "rich text field",
  inline_richtext: "inline rich text field",
  html: "HTML field",
  image_picker: "image picker",
  video: "video picker",
  video_url: "video URL field",
  url: "link picker",
  font_picker: "font picker",
  collection: "collection picker",
  collection_list: "collection list picker",
  product: "product picker",
  product_list: "product list picker",
  blog: "blog picker",
  page: "page picker",
  link_list: "menu picker",
  liquid: "Liquid field",
  number: "number field",
  article: "article picker",
  metaobject: "metaobject picker",
};

export const typeLabel = (type) => TYPE_LABELS[type] ?? type.replace(/_/g, " ");

const RICH_TEXT = new Set(["richtext", "html", "inline_richtext", "liquid"]);
const MAX_DEFAULT_CHARS = 110;

/** Renders a setting's default in the form a merchant would recognise. */
export function formatDefault(setting) {
  const { default: value, unit, type, options } = setting;
  if (value === null || value === undefined || value === "") return null;
  if (type === "checkbox") return value ? "on" : "off";
  if (type === "color_scheme") return String(value).replace(/^scheme-(\d+)$/, "Scheme $1");
  if (type === "select" || type === "radio") {
    const match = options?.find((o) => String(o.value) === String(value));
    return match ? match.label : String(value);
  }
  if (unit) return `${value}${unit}`;

  let text = String(value);
  // Rich text defaults carry markup. Merchants see the rendered copy, not the
  // tags, so show that — and keep long paragraphs from swamping the list.
  if (RICH_TEXT.has(type)) {
    text = text
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>\s*<p>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (!text) return null;
  return text.length > MAX_DEFAULT_CHARS
    ? `${text.slice(0, MAX_DEFAULT_CHARS).trimEnd()}…`
    : text;
}
