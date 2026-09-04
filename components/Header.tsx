"use client";

import { useState } from "react";

const links = [
  { href: "#audiences", label: "Who it's for" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
            CB
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            CampusBridge
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#audiences"
          className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 md:inline-flex"
        >
          Get started
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-900 md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2 py-2 hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#audiences"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-slate-900 px-4 py-2 text-center text-white"
            >
              Get started
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
