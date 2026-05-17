export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="animate-float-delayed absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="animate-pulse-glow absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/10 blur-[80px]" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15)_0%,_transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-32">
        <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
          Agenție marketing digital · Alba Iulia
        </div>

        <h1 className="animate-fade-up-delay-1 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-7xl">
          Transformăm brandurile în{" "}
          <span className="animate-gradient-text bg-gradient-to-r from-white via-violet-300 to-violet-500 bg-clip-text text-transparent">
            experiențe digitale
          </span>{" "}
          memorabile
        </h1>

        <p className="animate-fade-up-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          Strategie, creativitate și rezultate măsurabile pentru afaceri din Alba
          Iulia și din toată România. Creștem vizibilitatea ta online, pas cu pas.
        </p>

        <div className="animate-fade-up-delay-3 mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full bg-violet-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-600/30 transition-all hover:bg-violet-500 hover:shadow-violet-500/40"
          >
            Începe proiectul tău
          </a>
          <a
            href="#servicii"
            className="inline-flex items-center justify-center rounded-full border border-violet-500/40 px-8 py-4 text-base font-medium text-white transition-all hover:border-violet-400 hover:bg-violet-500/10"
          >
            Descoperă serviciile
          </a>
        </div>

        <div className="animate-fade-up-delay-3 mt-16 grid grid-cols-3 gap-8 border-t border-violet-500/20 pt-12 sm:max-w-lg">
          {[
            { value: "120+", label: "Proiecte livrate" },
            { value: "8+", label: "Ani experiență" },
            { value: "98%", label: "Clienți mulțumiți" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
