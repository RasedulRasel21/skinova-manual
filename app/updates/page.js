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
    summary: "First release.",
    changes: ["Initial version of the theme."],
  },
];

export default function UpdatesPage() {
  return (
    <article>
      <header className="text-center">
        <p className="text-sm font-semibold text-muted-strong">{theme.name}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Latest updates
        </h1>
        <p className="mx-auto mt-5 max-w-prose text-left text-[15px] leading-relaxed text-muted-strong">
          Every change to {theme.name}, newest first. Updating your theme in the
          Shopify admin brings you to the version at the top of this list.
        </p>
      </header>

      <ol className="mt-12 space-y-10">
        {releases.map((release) => (
          <li key={release.version} className="border-t border-line pt-8 first:border-0 first:pt-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl font-bold tabular-nums">{release.version}</h2>
              <span className="text-sm text-muted">{release.date}</span>
            </div>
            <p className="mt-2 text-[15px] text-muted-strong">{release.summary}</p>
            <ul className="mt-4 space-y-2">
              {release.changes.map((change) => (
                <li key={change} className="flex gap-3 text-[15px] leading-relaxed">
                  <span aria-hidden="true" className="select-none text-rose">
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
