import type { Currency } from "./types";
import { DEFAULT_RATES } from "./calc";

// Fetch live FX rates and return the value of 1 unit of each currency in RON.
// Uses the free, no-key Frankfurter API (ECB data). Falls back gracefully.
export async function fetchLiveRates(): Promise<Record<Currency, number> | null> {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?base=RON&symbols=EUR,USD,GBP,CHF",
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: Record<string, number> };
    if (!data.rates) return null;
    const out: Record<Currency, number> = { ...DEFAULT_RATES, RON: 1 };
    for (const c of ["EUR", "USD", "GBP", "CHF"] as Currency[]) {
      const perRon = data.rates[c];
      if (perRon && perRon > 0) out[c] = 1 / perRon; // value of 1 unit in RON
    }
    return out;
  } catch {
    return null;
  }
}
