import { Archivo, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Search from "@/components/Search";
import { theme } from "@/lib/manual";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: "italic" });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata = {
  title: {
    default: `${theme.name} theme manual`,
    template: `%s · ${theme.name} manual`,
  },
  description: `Setup and customization guide for the ${theme.name} Shopify theme by ${theme.author}.`,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrument.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#manual-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-foreground focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="text-xl font-black uppercase tracking-tight">{theme.name}</span>
              <span className="label text-muted">Manual · v{theme.version}</span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/updates" className="font-medium text-muted-strong hover:text-foreground">
                Updates
              </Link>
              {theme.supportUrl && (
                <a
                  href={theme.supportUrl}
                  className="rounded-full bg-accent px-5 py-2.5 font-bold text-white transition-opacity hover:opacity-90"
                >
                  Get support
                </a>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-10 lg:flex-row lg:gap-14">
          <aside className="lg:w-60 lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <Sidebar />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl">
              <Search />
              <main id="manual-content" tabIndex={-1} className="mt-10">
                {children}
              </main>
            </div>
          </div>
        </div>

        <footer className="mt-10 bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-6 pb-8 pt-12">
            <p aria-hidden="true" className="select-none text-[clamp(56px,14vw,200px)] font-black uppercase leading-[0.8] tracking-[-0.04em]">
              {theme.name}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/70">
              <span>
                {theme.name} {theme.version} — manual by {theme.author}.
              </span>
              <span className="label">A Shopify theme for fashion stores</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
