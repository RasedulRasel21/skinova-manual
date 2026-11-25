import Link from "next/link";
import SupportForm from "@/components/SupportForm";
import { theme } from "@/lib/manual";

export const metadata = {
  title: "Contact support",
  description: `Get help with the ${theme.name} Shopify theme from ${theme.author}.`,
};

export default function SupportPage() {
  return (
    <article>
      <header>
        <p className="label text-muted">{theme.name} · {theme.author}</p>
        <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.03em] sm:text-5xl">
          Contact <span className="accent">support</span>
        </h1>
        <p className="mt-5 max-w-prose text-[16px] leading-relaxed text-muted-strong">
          Tell us what&apos;s happening and we&apos;ll help. Support covers bugs in {theme.name} and questions about
          its features and settings. Many answers are already in the{" "}
          <Link href="/faq" className="font-semibold text-foreground underline underline-offset-4">
            FAQ
          </Link>
          .
        </p>
      </header>

      <div className="mt-10">
        <SupportForm themeName={theme.name} fallbackEmail={process.env.NEXT_PUBLIC_SUPPORT_EMAIL || null} />
      </div>
    </article>
  );
}
