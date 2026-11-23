import Link from "next/link";
import { nav, readingOrder, theme, totals } from "@/lib/manual";

const GROUP_INTRO = {
  general: "Store-wide settings: colour schemes, type, motion, cards and cart. They apply on every page.",
  sections: "Add these to any page from the theme editor's section picker, as often as you like.",
  "template-sections":
    "Built into a specific template. Edit them from the template they belong to rather than the section picker.",
};

export default function ManualHome() {
  const first = readingOrder[0];

  return (
    <article>
      <header>
        <p className="label text-muted">Theme manual · {theme.author}</p>
        <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.03em] sm:text-7xl">
          {theme.name} <span className="accent">manual</span>
        </h1>
        <p className="mt-6 max-w-prose text-[17px] leading-relaxed text-muted-strong">
          Everything you can configure in {theme.name}, read straight from the
          theme itself. Each page mirrors a panel in the Shopify theme editor and
          lists every setting it holds, with its type and default value.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={first.href}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-85"
        >
          Start with {first.title} →
        </Link>
        {theme.supportUrl && (
          <a
            href={theme.supportUrl}
            className="rounded-full border border-foreground px-6 py-3 text-sm font-bold transition-colors hover:bg-tint"
          >
            Contact support
          </a>
        )}
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {[
          ["Sections", totals.sections],
          ["Theme settings", totals.themeSettings],
          ["Section settings", totals.sectionSettings],
          ["Block settings", totals.blockSettings],
        ].map(([label, value]) => (
          <div key={label} className="bg-paper px-5 py-5">
            <dt className="label text-muted">{label}</dt>
            <dd className="mt-2 text-4xl font-black tabular-nums tracking-tight">{value}</dd>
          </div>
        ))}
      </dl>

      {nav.map((group, gi) => (
        <section key={group.id} className="mt-16">
          <div className="flex items-baseline gap-4 border-b-[1.5px] border-foreground pb-3">
            <span className="label text-muted tabular-nums">0{gi + 1}</span>
            <h2 className="text-3xl font-black tracking-tight">{group.title}</h2>
            <span className="label ml-auto text-muted tabular-nums">{group.items.length} pages</span>
          </div>
          <p className="mt-4 text-[15px] text-muted-strong">{GROUP_INTRO[group.id]}</p>
          <ul className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between bg-paper px-5 py-3.5 text-[15px] font-semibold transition-colors hover:bg-tint"
                >
                  {item.title}
                  <span aria-hidden="true" className="text-muted transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
