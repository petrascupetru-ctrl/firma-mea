const services = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
    title: "Social Media Marketing",
    description:
      "Strategii de conținut, management pagini și campanii care construiesc comunități fidelizate pe Instagram, Facebook și LinkedIn.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    title: "SEO & Content Marketing",
    description:
      "Optimizare pentru motoarele de căutare, articole de blog și conținut care te aduce pe primele poziții în Google.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
    title: "Branding & Design",
    description:
      "Identitate vizuală, logo-uri și materiale grafice care diferențiază brandul tău și creează o impresie de durată.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Campanii PPC & Ads",
    description:
      "Google Ads, Meta Ads și remarketing cu bugete optimizate pentru conversii maxime și ROI măsurabil.",
  },
];

export default function Services() {
  return (
    <section id="servicii" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08)_0%,_transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Servicii
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Tot ce ai nevoie pentru succes online
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Soluții complete de marketing digital, adaptate afacerii tale din Alba Iulia.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.title}
              className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-surface-elevated p-8 transition-all duration-300 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10"
            >
              <div className="mb-5 inline-flex rounded-xl bg-violet-600/20 p-3 text-violet-400 transition-colors group-hover:bg-violet-600/30 group-hover:text-violet-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 leading-relaxed text-zinc-400">
                {service.description}
              </p>
              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-violet-600/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
