// TEST TEMPORAIRE : quels symboles l'offre gratuite de Twelve Data couvre-t-elle ? (sera supprimé)
const CLE = process.env.TWELVEDATA_API_KEY;
const candidats = {
  "CAC 40": ["FCHI", "CAC", "PX1"],
  "Euro Stoxx 50": ["SX5E", "STOXX50E", "ESTX50"],
  "S&P 500": ["SPX", "GSPC"],
  "Nasdaq": ["IXIC", "NDX"],
  "Dow Jones": ["DJI"],
  "Nikkei": ["N225", "NI225"],
  "EUR/USD": ["EUR/USD"],
  "Or": ["XAU/USD"],
  "Brent": ["XBR/USD", "BRENT", "BZ"],
  "Bitcoin": ["BTC/USD"],
  "OAT 10 ans": ["FR10Y", "FR10YT"],
  "Bund 10 ans": ["DE10Y", "DE10YT"],
  "Proxys ETF": ["EZU", "EWQ", "EWJ", "BNO"],
};
for (const [nom, symboles] of Object.entries(candidats)) {
  for (const s of symboles) {
    const r = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(s)}&apikey=${CLE}`);
    const d = await r.json();
    console.log(`${nom.padEnd(14)} ${s.padEnd(9)} → ${d.status === "error" ? "NON : " + (d.message || "").slice(0, 90)
      : `OUI ${d.name} | ${d.exchange} | clôture ${d.close} | veille ${d.previous_close} | ${d.percent_change}% | ${d.datetime}`}`);
    await new Promise((ok) => setTimeout(ok, 8000));   // 8 requêtes/minute maximum
  }
}
for (const q of ["CAC 40", "Euro Stoxx 50", "Nikkei 225", "Brent"]) {
  const r = await fetch(`https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(q)}&outputsize=6`);
  const d = await r.json();
  console.log(`Recherche « ${q} » :`, (d.data || []).map((x) => `${x.symbol} (${x.instrument_type}, ${x.exchange})`).join(" ; "));
}
