import Link from "next/link";
import { theme } from "@/lib/manual";

export const metadata = {
  title: "FAQ",
  description: `Answers to common questions about the ${theme.name} Shopify theme.`,
};

/**
 * Merchant FAQ. The Theme Store asks for an FAQ and a clear support policy in
 * the documentation; keep every answer consistent with the setting labels in
 * the theme editor.
 */
const groups = [
  {
    title: "Getting started",
    items: [
      {
        q: "Which preset should I start with?",
        a: "Oblique is the editorial default: off-white paper, black type and a cobalt accent. Club is loud, in cobalt and acid green, built for drops and streetwear. Hush is quiet, with soft whites, contact-sheet product cards and the Still motion preset. You can switch presets later in the theme editor's Theme settings; this changes colors, fonts and other style settings, not your sections.",
      },
      {
        q: "Why doesn't my store look like the demo after installing?",
        a: "Presets bring the layout, colors and fonts, but not the demo photos, products or pages. Add your own images in each section, and pick your collections and products in the sections that use them. Until then, sections show placeholders so you can see the layout.",
      },
      {
        q: "How do I change the store name in the header and footer?",
        a: "The large wordmark uses your store name from Settings > General in the Shopify admin. To show a different word in the footer, fill in Wordmark text in the Footer section. To use an image instead, upload a logo in the Header section.",
      },
    ],
  },
  {
    title: "Design and motion",
    items: [
      {
        q: "How do I turn the animation down or off?",
        a: "Open Theme settings > Motion and pick a motion preset: Kinetic, Editorial or Still. Still removes all movement. Shoppers who have asked their device for reduced motion always get Still, and the pause motion button lets anyone stop looping motion.",
      },
      {
        q: "How do I change colors across the whole store?",
        a: "Edit the color schemes in Theme settings > Color schemes. Every section picks one of these schemes, so a change there updates every section that uses it.",
      },
      {
        q: "Why are my product photos black and white?",
        a: "Theme settings > Images > Photo treatment is set to Monochrome. Color returns on hover, and product pages and the cart always show true color. Choose None to show color everywhere.",
      },
    ],
  },
  {
    title: "Products and cart",
    items: [
      {
        q: "Why don't filters show on my collection pages?",
        a: "Filters come from Shopify's Search & Discovery app, which is free. Install it, then add filters such as Availability, Price, Size and Color. The theme shows them on collection and search pages automatically.",
      },
      {
        q: "How do I show a countdown for an upcoming drop?",
        a: "Create a date or date and time product metafield, for example custom.drop_date, and enter its name in Theme settings > Product cards > Drop date metafield. Products with a future date show a countdown and can't be bought until then.",
      },
      {
        q: "How do I set up free shipping progress and gift wrap?",
        a: "Open Theme settings > Cart. Enter the order total for free shipping to show a progress meter in the cart page and drawer, and pick a product to offer as gift wrap. Leave the threshold at 0 to hide the meter.",
      },
      {
        q: "Why don't I see the Follow on Shop button or Shop Pay Installments?",
        a: "Both come from Shop Pay. Turn on Shop Pay in Settings > Payments in the Shopify admin, and they appear on your storefront.",
      },
    ],
  },
  {
    title: "Updates and support",
    items: [
      {
        q: "How do I update the theme?",
        a: "When a new version is out, Shopify shows an update notice in Online Store > Themes. Updating adds a new copy of the theme with your settings and content, so you can check it before publishing. See Latest updates for what changed.",
      },
      {
        q: "Can I edit the theme code?",
        a: "You can, but duplicate your theme first, and keep the copy as a backup. Code changes aren't covered by support and are lost when you update. For custom work, we recommend hiring a Shopify Partner.",
      },
      {
        q: "What does support cover?",
        a: `We fix bugs in ${theme.name} and answer questions about its features and settings, at no cost. Support doesn't cover custom code, third-party apps or design work. Contact us through the support form and include your store URL.`,
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <article>
      <header>
        <p className="label text-muted">{theme.name}</p>
        <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.03em] sm:text-5xl">
          Frequently asked <span className="accent">questions</span>
        </h1>
        <p className="mt-5 max-w-prose text-[16px] leading-relaxed text-muted-strong">
          Quick answers to what merchants ask most. If your question isn't here,{" "}
          {theme.supportUrl ? (
            <a href={theme.supportUrl} className="font-semibold text-foreground underline underline-offset-4">
              contact support
            </a>
          ) : (
            "contact support"
          )}
          .
        </p>
      </header>

      {groups.map((group, gi) => (
        <section key={group.title} className="mt-14">
          <div className="flex items-baseline gap-4 border-b-[1.5px] border-foreground pb-3">
            <span className="label text-muted tabular-nums">0{gi + 1}</span>
            <h2 className="text-2xl font-black tracking-tight">{group.title}</h2>
          </div>
          <div className="mt-2 divide-y divide-line">
            {group.items.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-semibold">
                  {item.q}
                  <span aria-hidden="true" className="text-xl text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted-strong">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-14 text-[15px] text-muted-strong">
        Looking for a specific setting? Every section and theme setting has its own page, starting from the{" "}
        <Link href="/" className="font-semibold text-foreground underline underline-offset-4">
          manual home
        </Link>
        .
      </p>
    </article>
  );
}
