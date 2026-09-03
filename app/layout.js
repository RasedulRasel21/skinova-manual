import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Search from "@/components/Search";
import { theme } from "@/lib/manual";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#manual-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-foreground focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <header className="border-b border-line">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
            <Link href="/" className="text-lg font-bold tracking-tight">
              {theme.name}
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/updates" className="text-muted-strong hover:text-foreground">
                Updates
              </Link>
              {theme.supportUrl && (
                <a
                  href={theme.supportUrl}
                  className="rounded-full bg-foreground px-4 py-2 font-medium text-white transition-opacity hover:opacity-85"
                >
                  Get support
                </a>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-10 lg:flex-row lg:gap-14">
          <aside className="lg:w-60 lg:shrink-0">
            <div className="lg:sticky lg:top-10">
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

        <footer className="border-t border-line">
          <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-muted">
            {theme.name} {theme.version} — manual by {theme.author}.
          </div>
        </footer>
      </body>
    </html>
  );
}
