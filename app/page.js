import Link from "next/link";
import { nav, readingOrder, theme, totals } from "@/lib/manual";

export default function ManualHome() {
  const first = readingOrder[0];

  return (
    <article>
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {theme.name} theme manual
        </h1>
        <p className="mx-auto mt-5 max-w-prose text-[15px] leading-relaxed text-muted-strong">
          Everything you can configure in {theme.name}, straight from the theme
          itself. Each page mirrors a panel in the Shopify theme editor and lists
          every setting it contains, with its type and default value.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={first.href}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
        >
          Start with {first.title}
        </Link>
        {theme.supportUrl && (
          <a
            href={theme.supportUrl}
            className="rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:bg-cream-soft"
          >
            Contact support
          </a>
        )}
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {[
          ["Sections", totals.sections],
          ["Theme settings", totals.themeSettings],
          ["Section settings", totals.sectionSettings],
          ["Block settings", totals.blockSettings],
        ].map(([label, value]) => (
          <div key={label} className="bg-white px-4 py-4 text-center">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {nav.map((group) => (
        <section key={group.id} className="mt-14">
          <h2 className="text-2xl font-bold">{group.title}</h2>
          <p className="mt-2 text-[15px] text-muted-strong">
            {group.id === "general" &&
              "Store-wide settings that apply across every page."}
            {group.id === "sections" &&
              "Add these to any page from the theme editor's section picker."}
            {group.id === "template-sections" &&
              "Built into a specific template. Edit them from the template they belong to rather than the section picker."}
          </p>
          <ul className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block bg-white px-4 py-3 text-[15px] font-medium transition-colors hover:bg-cream-soft"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
