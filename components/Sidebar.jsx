"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/lib/manual";

function Group({ group, pathname, defaultOpen }) {
  const panelId = `nav-${group.id}`;
  const holdsCurrentPage = group.items.some((item) => item.href === pathname);

  const [open, setOpen] = useState(defaultOpen || holdsCurrentPage);
  const [lastPath, setLastPath] = useState(pathname);

  // Opening the group that contains the current page keeps the active link
  // reachable after arriving from search or a Next card. Adjusting state
  // during render (React's documented pattern for reacting to a changed prop)
  // rather than in an effect avoids a second render pass.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (holdsCurrentPage) setOpen(true);
  }

  return (
    <div className="border-b border-line py-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-2 py-3 text-left text-base font-semibold"
      >
        {group.title}
        <svg
          viewBox="0 0 12 8"
          aria-hidden="true"
          className={`h-2 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <ul id={panelId} hidden={!open} className="pb-2">
        {group.items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded py-1.5 pl-3 text-sm transition-colors ${
                  active
                    ? "font-semibold text-foreground"
                    : "text-muted-strong hover:text-foreground"
                }`}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Manual" className="text-foreground">
      <Link
        href="/updates"
        className="mb-6 flex items-center gap-2 rounded-lg border border-line px-4 py-3 text-sm font-medium transition-colors hover:bg-cream-soft"
      >
        <span className="rounded bg-rose px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
          New
        </span>
        Latest updates
      </Link>

      {nav.map((group) => (
        <Group
          key={group.id}
          group={group}
          pathname={pathname}
          // "Sections" is the group people arrive for, so it starts open.
          defaultOpen={group.id === "sections"}
        />
      ))}
    </nav>
  );
}
