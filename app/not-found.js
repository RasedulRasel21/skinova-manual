import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <article>
      <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.03em] sm:text-5xl">
        We can&apos;t find that page
      </h1>
      <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-muted-strong">
        The page may have moved, or the section it documented may have been
        renamed. Try the search box above, or start from the manual index.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-85"
      >
        Back to the manual
      </Link>
    </article>
  );
}
