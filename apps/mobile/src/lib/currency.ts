const EUR_MAD_FALLBACK = 10.85;

/** Convertit EUR → MAD pour CMI (taux API Frankfurter + fallback). */
export async function convertEURtoMAD(amountEur: number): Promise<number> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=MAD');
    if (res.ok) {
      const json = (await res.json()) as { rates?: { MAD?: number } };
      const rate = json.rates?.MAD;
      if (rate && rate > 0) return Math.round(amountEur * rate * 100) / 100;
    }
  } catch {
    // fallback
  }
  return Math.round(amountEur * EUR_MAD_FALLBACK * 100) / 100;
}
