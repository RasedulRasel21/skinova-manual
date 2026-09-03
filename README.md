# Skinova theme manual

Merchant-facing documentation for the Skinova Shopify theme. Next.js 16 (App
Router), Tailwind v4, fully static — every page is prerendered, so it deploys to
Vercel with no server runtime.

This lives inside the theme repo but is **git-ignored by it** (`ultimate-doc/`
in the theme's `.gitignore`). Give it its own repo and its own Vercel project.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export check — 54 pages
npm run lint
```

## Where the content comes from

Every setting name, type, default and help string is read from the theme's own
schemas rather than retyped. The Theme Store requires documentation to be
"consistent with the copy in the theme settings", and generating it removes the
chance of drift.

```bash
npm run extract          # reads ../sections/*.liquid + ../config/settings_schema.json
                         # writes data/theme-schema.json
```

`data/theme-schema.json` is committed. Vercel builds from it and never needs the
theme repo. Re-run `npm run extract` and commit the result whenever the theme's
schemas change; if the theme lives elsewhere, set `THEME_PATH`.

The extractor also reports two things worth acting on:

- unresolved `t:` keys — a schema references a translation that
  `locales/en.default.schema.json` doesn't define
- literal schema labels — settings whose `label` is plain English rather than a
  `t:` key, so a merchant can't translate them (currently 930 of them)

## Routes

| Route | Pages | Source |
| --- | --- | --- |
| `/` | 1 | manual index |
| `/general/[slug]` | 7 | theme settings groups |
| `/sections/[slug]` | 42 | one per section |
| `/updates` | 1 | release notes |

Reading order is derived in `lib/manual.js`, which also drives the sidebar, the
previous/next cards and the search index — add a page there and it appears in
all three.

## What still needs writing by hand

The generated part is the settings lists. Two things are yours:

1. **Screenshots.** `<Screenshot />` renders a dashed placeholder until you pass
   a `src`. Drop images into `public/screenshots/` and pass
   `src="/screenshots/typography.png"`. The placeholder names what's missing, so
   an unfinished page is visible rather than silently bare.
2. **Release notes.** `app/updates/page.js` holds a `releases` array. Add an
   entry each time `theme_version` changes in the theme's
   `config/settings_schema.json` — the Theme Store requires release notes with
   every submission and update.

## Structure

```
app/
  layout.js              header, sidebar, search, footer
  page.js                manual index
  general/[slug]/        theme settings groups
  sections/[slug]/       one page per section
  updates/               release notes
components/
  Sidebar.jsx            collapsible nav (client)
  Search.jsx             combobox, Cmd/Ctrl+K (client)
  SettingsList.jsx       the numbered settings list
  PageShell.jsx          header, Customizer path, screenshot, next/prev
lib/manual.js            nav tree, reading order, search index, formatting
scripts/extract-schema.mjs
data/theme-schema.json   generated — commit it
```

Colours in `app/globals.css` mirror the theme's own `--g-*` tokens from
`snippets/css-variables.liquid`, so the manual reads as part of Skinova.
