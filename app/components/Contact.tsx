"use client";

import { FormEvent, useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.12)_0%,_transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
              Contact
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Hai să discutăm despre proiectul tău
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Completează formularul și te contactăm în maximum 24 de ore cu o
              propunere personalizată.
            </p>

            <ul className="mt-10 space-y-4">
              <li className="flex items-center gap-3 text-zinc-300">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </span>
                Str. Unirii 12, Alba Iulia, 510010
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                contact@violetstudio.ro
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </span>
                +40 758 123 456
              </li>
            </ul>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-violet-500/30 bg-violet-600/10 p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-600/30">
                <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Mulțumim!</h3>
              <p className="mt-2 text-zinc-400">
                Mesajul tău a fost trimis. Te contactăm în curând.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-violet-500/20 bg-surface-elevated p-8"
            >
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-300">
                    Nume complet
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Ion Popescu"
                    className="w-full rounded-xl border border-violet-500/20 bg-background px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="ion@exemplu.ro"
                    className="w-full rounded-xl border border-violet-500/20 bg-background px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-zinc-300">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="07xx xxx xxx"
                    className="w-full rounded-xl border border-violet-500/20 bg-background px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-zinc-300">
                    Mesaj
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    placeholder="Spune-ne despre proiectul tău..."
                    className="w-full resize-none rounded-xl border border-violet-500/20 bg-background px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-violet-600 py-4 text-base font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/25"
                >
                  Trimite mesajul
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
