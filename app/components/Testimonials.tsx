const testimonials = [
  {
    quote:
      "De când lucrăm cu Violet Studio, traficul pe site a crescut cu 180%. Echipa înțelege perfect piața locală din Alba Iulia.",
    author: "Maria Popescu",
    role: "CEO, Popescu Design SRL",
    initials: "MP",
  },
  {
    quote:
      "Campaniile de social media au adus clienți noi în fiecare săptămână. Profesionalism, creativitate și rezultate concrete.",
    author: "Andrei Mureșan",
    role: "Fondator, Mureșan Auto",
    initials: "AM",
  },
  {
    quote:
      "Rebranding-ul complet ne-a poziționat ca lideri în domeniu. Recomand cu încredere oricărei afaceri din zonă.",
    author: "Elena Diaconu",
    role: "Manager, Diaconu Pharma",
    initials: "ED",
  },
];

export default function Testimonials() {
  return (
    <section id="testimoniale" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Testimoniale
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ce spun clienții noștri
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Peste 120 de afaceri din Alba Iulia și din țară ne-au ales parteneri de încredere.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote
              key={t.author}
              className="flex flex-col rounded-2xl border border-violet-500/20 bg-surface-elevated p-8"
            >
              <div className="mb-4 flex gap-1 text-violet-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="flex-1 leading-relaxed text-zinc-300">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6 flex items-center gap-4 border-t border-violet-500/20 pt-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/30 text-sm font-semibold text-violet-300">
                  {t.initials}
                </span>
                <div>
                  <cite className="not-italic font-semibold text-white">{t.author}</cite>
                  <p className="text-sm text-zinc-500">{t.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
