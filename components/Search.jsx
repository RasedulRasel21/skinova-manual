"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchIndex } from "@/lib/manual";

const LIMIT = 8;

export default function Search() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return searchIndex
      .map((entry) => {
        // Title matches outrank a hit buried in a settings label.
        const inTitle = entry.title.toLowerCase().includes(q);
        const inTerms = entry.terms.includes(q);
        if (!inTitle && !inTerms) return null;
        return { ...entry, score: inTitle ? 0 : 1 };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title))
      .slice(0, LIMIT);
  }, [query]);

  // Cmd/Ctrl+K focuses search from anywhere, matching docs-site convention.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, []);

  const go = (href) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  function onKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active].href);
    }
  }

  const showList = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search the manual
      </label>
      <div className="relative">
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          value={query}
          placeholder="Search settings and sections…"
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results.length ? `${listId}-${active}` : undefined}
          className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted focus:border-rose"
        />
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lg"
        >
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted">
              Nothing matches “{query.trim()}”.
            </li>
          )}
          {results.map((entry, i) => (
            <li key={entry.href} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <Link
                href={entry.href}
                onClick={() => go(entry.href)}
                onMouseEnter={() => setActive(i)}
                className={`flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm ${
                  i === active ? "bg-cream-soft" : ""
                }`}
              >
                <span className="font-medium">{entry.title}</span>
                <span className="shrink-0 text-xs text-muted">{entry.group}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
