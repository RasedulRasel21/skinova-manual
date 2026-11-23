import Link from "next/link";

/** Eyebrow + title, matching the Customizer's own hierarchy. */
export function PageHeader({ group, title, lead }) {
  return (
    <header>
      <p className="label text-muted">{group}</p>
      <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.03em] sm:text-5xl">{title}</h1>
      {lead && (
        <p className="mt-5 max-w-prose text-[16px] leading-relaxed text-muted-strong">
          {lead}
        </p>
      )}
    </header>
  );
}

/**
 * "To do X, go to Customizer → …" — the orienting line on every page. `lead`
 * varies because the same component introduces adding a section, finding one
 * that's fixed to a template, and opening a theme settings panel.
 */
export function CustomizerPath({ steps, lead = "To open these settings, go to" }) {
  return (
    <p className="mt-4 text-[15px] leading-relaxed text-muted-strong">
      {lead}{" "}
      <span className="whitespace-nowrap rounded bg-chip px-1.5 py-0.5 font-mono text-[13px] text-foreground">
        {steps.join(" → ")}
      </span>
      .
    </p>
  );
}

/**
 * Reserved space for a Customizer screenshot. Renders a labelled placeholder
 * until the image is dropped into /public/screenshots, so an unfinished page
 * is obvious rather than silently missing its illustration.
 */
export function Screenshot({ src, alt, optional = false }) {
  if (!src) {
    // The live manual never shows an empty slot; `npm run dev` does, so gaps stay visible while writing.
    if (optional || process.env.NODE_ENV === "production") return null;
    return (
      <div className="mt-6 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-line bg-tint px-6 py-10 text-center text-sm text-muted">
        Screenshot to add — {alt}
      </div>
    );
  }
  return (
    // Screenshots are local, fixed-size PNGs served straight from /public;
    // next/image would add a loader round-trip for no benefit here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="mt-6 w-full rounded-xl border border-line"
      loading="lazy"
    />
  );
}

/** Bottom-of-page link to the next entry in reading order. */
export function NextCard({ previous, next }) {
  if (!previous && !next) return null;
  return (
    <nav aria-label="Manual pagination" className="mt-16 flex flex-wrap gap-4 border-t border-line pt-8">
      {previous && (
        <Link
          href={previous.href}
          className="group flex flex-1 items-center gap-3 rounded-xl border border-line px-5 py-4 transition-colors hover:bg-tint"
        >
          <span aria-hidden="true" className="text-muted transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-muted">Previous</span>
            <span className="block truncate font-semibold">{previous.title}</span>
          </span>
        </Link>
      )}
      {next && (
        <Link
          href={next.href}
          className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-line px-5 py-4 text-right transition-colors hover:bg-tint"
        >
          <span className="min-w-0">
            <span className="block text-xs text-muted">Next</span>
            <span className="block truncate font-semibold">{next.title}</span>
          </span>
          <span aria-hidden="true" className="text-muted transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </nav>
  );
}
