const footerLinks = {
  Servicii: [
    { label: "Social Media", href: "#servicii" },
    { label: "SEO & Content", href: "#servicii" },
    { label: "Branding", href: "#servicii" },
    { label: "Campanii PPC", href: "#servicii" },
  ],
  Companie: [
    { label: "Despre noi", href: "#" },
    { label: "Testimoniale", href: "#testimoniale" },
    { label: "Contact", href: "#contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-violet-500/20 bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-bold text-white">
                V
              </span>
              <span className="text-lg font-semibold text-white">
                Violet<span className="text-violet-400">Studio</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm leading-relaxed text-zinc-400">
              Agenție de marketing digital din Alba Iulia. Ajutăm afaceri locale
              și naționale să crească prin strategii digitale eficiente.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-violet-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-violet-500/20 pt-8 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Violet Studio. Toate drepturile rezervate.
          </p>
          <div className="flex gap-4">
            {["Instagram", "Facebook", "LinkedIn"].map((social) => (
              <a
                key={social}
                href="#"
                aria-label={social}
                className="text-sm text-zinc-500 transition-colors hover:text-violet-400"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
