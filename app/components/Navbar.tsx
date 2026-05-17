"use client";

import { useState, useEffect } from "react";

const links = [
  { href: "#servicii", label: "Servicii" },
  { href: "#testimoniale", label: "Testimoniale" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-violet-500/20 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-bold text-white shadow-lg shadow-violet-500/30">
            V
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            Violet<span className="text-violet-400">Studio</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="hidden rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/25 md:inline-flex"
        >
          Consultație gratuită
        </a>

        <button
          type="button"
          aria-label="Meniu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="inline-flex flex-col gap-1.5 p-2 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-white transition-all ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-white transition-all ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-white transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {open && (
        <div className="border-t border-violet-500/20 bg-background/95 px-6 py-6 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-lg text-zinc-300 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex rounded-full bg-violet-600 px-6 py-3 text-sm font-medium text-white"
              >
                Consultație gratuită
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
