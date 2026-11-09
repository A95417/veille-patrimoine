// Client minimal pour l'API Gemini (Google AI Studio, offre gratuite).
// Choisit automatiquement les modèles disponibles, gère le rythme et les quotas.

const API = "https://generativelanguage.googleapis.com/v1beta";
const CLE = process.env.GEMINI_API_KEY || "";

// Limites de l'offre gratuite relevées dans AI Studio le 09/11/2026 (marge de sécurité incluse).
export const LIMITES = {
  lite: { par_jour: 470, par_minute: 13 },   // Flash-Lite : 500/jour, 15/min
  fort: { par_jour: 18, par_minute: 4 },     // Flash : 20/jour, 5/min
};

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const version = (nom) => {
  const m = nom.match(/gemini-(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
};

// Liste les modèles accessibles avec la clé, et retient :
//  - "principal" et "relais" : les deux Flash-Lite les plus récents (gros quota quotidien) ;
//  - "fort" : le Flash (non Lite) le plus récent (petit quota, meilleure qualité).
export async function choisirModeles() {
  const r = await fetch(`${API}/models?pageSize=200`, { headers: { "x-goog-api-key": CLE } });
  if (!r.ok) throw new Error(`Liste des modèles impossible (HTTP ${r.status}) : ${(await r.text()).slice(0, 200)}`);
  const { models = [] } = await r.json();
  const texte = models
    .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""))
    .filter((n) => /^gemini-\d/.test(n) && !/(tts|image|audio|live|embedding|robotics|native|computer|vision|transcribe|translate)/i.test(n));
  // Plus récent d'abord ; à version égale, version stable avant "preview", puis nom le plus court.
  const tri = (l) => [...l].sort((a, b) =>
    version(b) - version(a) || /preview|exp/.test(a) - /preview|exp/.test(b) || a.length - b.length);
  const lites = tri(texte.filter((n) => /flash-lite/.test(n)));
  const flashs = tri(texte.filter((n) => /flash/.test(n) && !/lite/.test(n)));
  const choix = { principal: lites[0], relais: lites.find((n) => version(n) !== version(lites[0])) || lites[1], fort: flashs[0] };
  if (!choix.principal) throw new Error("Aucun modèle Flash-Lite trouvé avec cette clé.");
  return choix;
}

// Un appel à Gemini qui renvoie du JSON conforme au schéma demandé.
// Erreurs : { quota: true } si le quota est atteint, sinon exception.
export async function generer(modele, consignes, contenu, schema) {
  const corps = {
    systemInstruction: { parts: [{ text: consignes }] },
    contents: [{ role: "user", parts: [{ text: contenu }] }],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json", responseSchema: schema, maxOutputTokens: 8192 },
  };
  for (let essai = 1; essai <= 2; essai++) {
    const r = await fetch(`${API}/models/${modele}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": CLE },
      body: JSON.stringify(corps),
    });
    if (r.status === 429) {
      const t = await r.text();
      const parJour = /PerDay|per day|daily/i.test(t);
      if (!parJour && essai === 1) { await pause(30000); continue; }   // limite par minute : on patiente
      return { quota: true, detail: t.slice(0, 300) };
    }
    if (r.status >= 500 && essai === 1) { await pause(5000); continue; }
    const t = await r.text();
    if (!r.ok) throw new Error(`Gemini ${modele} HTTP ${r.status} : ${t.slice(0, 300)}`);
    const d = JSON.parse(t);
    const texte = d.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    if (!texte) throw new Error(`Réponse vide (${d.candidates?.[0]?.finishReason || d.promptFeedback?.blockReason || "?"})`);
    return { donnees: JSON.parse(texte) };
  }
  return { quota: true };
}
