import { theme } from "@/lib/manual";

export const metadata = {
  title: "Latest updates",
  description: `Release notes for the ${theme.name} Shopify theme.`,
};

/**
 * Release notes. The Theme Store requires a version number and release notes
 * with every submission and update, so this doubles as the public changelog.
 * Add a new entry at the top each time theme_version changes in
 * config/settings_schema.json.
 */
const releases = [
  {
    version: "1.0.0",
    date: "Unreleased",
    summary: "First release of Oblique, a kinetic editorial theme for fashion stores.",
    changes: [
      "Three presets: Oblique, Club and Hush.",
      "Colour schemes, four type roles (heading, body, accent serif, mono label) and three motion presets: Kinetic, Editorial and Still.",
      "27 sections you can add anywhere, including Kinetic hero, Runway, Model spotlight, Complete the look, Feature explorer and Scrolling tapes.",
      "Product page blocks for fit, model switcher, material lens and cost per wear, plus quick view, recently viewed and a sticky add-to-bag bar.",
      "Cart drawer with free-shipping progress, gift wrap and Complete the look.",
      "Filtering and sorting on collection and search pages, predictive search in the header.",
      "Drop mode, pre-order labels and combined-listing links.",
      "Follow on Shop and social media icons in the footer.",
      "Translations for English, French, German, Italian and Spanish.",
    ],
  },
];

export default function UpdatesPage() {
  return (
    <article>
      <header>
        <p className="label text-muted">{theme.name}</p>
        <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.03em] sm:text-5xl">
          Latest <span className="accent">updates</span>
        </h1>
        <p className="mt-5 max-w-prose text-[16px] leading-relaxed text-muted-strong">
          Every change to {theme.name}, newest first. Updating your theme in the
          Shopify admin brings you to the version at the top of this list.
        </p>
      </header>

      <ol className="mt-12 space-y-10">
        {releases.map((release) => (
          <li key={release.version} className="border-t border-line pt-8 first:border-0 first:pt-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl font-black tracking-tight tabular-nums">{release.version}</h2>
              <span className="text-sm text-muted">{release.date}</span>
            </div>
            <p className="mt-2 text-[15px] text-muted-strong">{release.summary}</p>
            <ul className="mt-4 space-y-2">
              {release.changes.map((change) => (
                <li key={change} className="flex gap-3 text-[15px] leading-relaxed">
                  <span aria-hidden="true" className="select-none text-accent">
                    •
                  </span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}
