// DER : outils de l'administrateur. Dépôt d'une nouvelle version préparée en dehors du site (contrôle strict,
// résumé des changements avant de valider) et historique des versions. Aucune donnée client ici.
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const brut = (s) => String(s ?? "").replace(/\*+/g, "").trim();
  const gras = (s) => /^\*\*.+\*\*$/.test(String(s || "").trim());

  // ---------------------------------------------------------------- résumé des changements entre deux versions
  function diff(A, B) {
    const out = [];
    const secA = new Map((A?.sections || []).map((s) => [s.id, s])), secB = new Map((B.sections || []).map((s) => [s.id, s]));
    for (const [id, s] of secB) if (!secA.has(id)) out.push(`➕ Nouvelle section : ${s.titre}`);
    for (const [id, s] of secA) if (!secB.has(id)) out.push(`➖ Section retirée : ${s.titre}`);
    for (const [id, b] of secB) {
      const a = secA.get(id); if (!a) continue;
      if (a.titre !== b.titre) out.push(`✏️ Titre : « ${a.titre} » → « ${b.titre} »`);
      const par = (s, t) => s.blocs.filter((x) => x.t === t);
      // partenaires
      par(b, "partenaires").forEach((tb, k) => {
        const ta = par(a, "partenaires")[k];
        const na = new Map((ta?.lignes || []).map((l) => [brut(l[0]), l])), nb = new Map(tb.lignes.map((l) => [brut(l[0]), l]));
        const ajout = [...nb.keys()].filter((n) => !na.has(n)), retrait = [...na.keys()].filter((n) => !nb.has(n));
        if (ajout.length) out.push(`➕ ${b.titre} · partenaires ajoutés : ${ajout.join(", ")}`);
        if (retrait.length) out.push(`➖ ${b.titre} · partenaires retirés : ${retrait.join(", ")}`);
        for (const [n, l] of nb) {
          const o = na.get(n); if (!o) continue;
          if (gras(o[0]) !== gras(l[0])) out.push(`✏️ ${b.titre} · ${n} : ${gras(l[0]) ? "devient" : "n'est plus"} une relation significative (gras)`);
          const ch = [1, 2, 3].filter((i) => o[i] !== l[i]);
          if (ch.length) out.push(`✏️ ${b.titre} · ${n} : ${ch.map((i) => `${["", "nature", "type d'accord", "rémunération"][i]} « ${o[i]} » → « ${l[i]} »`).join(" ; ")}`);
        }
      });
      // garanties
      par(b, "garanties").forEach((gb, k) => {
        const ga = par(a, "garanties")[k];
        gb.lignes.forEach((l, i) => { const o = ga?.lignes?.[i]; if (!o) { out.push(`➕ ${b.titre} · garantie : ${l[0]}`); return; }
          if (o.join("|") !== l.join("|")) out.push(`✏️ ${b.titre} · garantie « ${brut(l[0]).slice(0, 50)} » : ${o[1]} / ${o[2]} → ${l[1]} / ${l[2]}${o[0] !== l[0] ? " (libellé modifié)" : ""}`); });
      });
      // numéros (ORIAS, carte T)
      par(b, "cle").forEach((cb, k) => { const ca = par(a, "cle")[k]; if (!ca || ca.x !== cb.x) out.push(`✏️ ${b.titre} · « ${brut(ca?.x || "")} » → « ${brut(cb.x)} »`); });
      // autres textes
      const txt = (s) => s.blocs.filter((x) => !["partenaires", "garanties", "cle"].includes(x.t)).map((x) => JSON.stringify(x));
      const ta = txt(a), tb = txt(b);
      const nChange = Math.max(ta.length, tb.length) - ta.filter((x, i) => x === tb[i]).length;
      if (nChange) out.push(`✏️ ${b.titre} : ${nChange} paragraphe${nChange > 1 ? "s" : ""} modifié${nChange > 1 ? "s" : ""}`);
    }
    return out;
  }

  // ---------------------------------------------------------------- boîtes de dialogue
  function boite(html, large) {
    const d = document.createElement("dialog"); d.className = "der-dialogue" + (large ? " large" : "");
    d.innerHTML = html; document.body.appendChild(d);
    d.addEventListener("close", () => d.remove());
    d.showModal(); return d;
  }
  // Confirme un nouveau texte : contrôle par le serveur, résumé des changements, puis enregistrement.
  async function confirmer(ancien, nouveau, apres) {
    const corps = JSON.stringify(nouveau);
    const v = await fetch("/api/der/contenu?verifier=1", { method: "POST", headers: { "Content-Type": "application/json" }, body: corps, credentials: "same-origin" });
    const jv = await v.json().catch(() => ({}));
    if (!v.ok) { boite(`<h2>Texte refusé</h2><p>${esc(jv.erreur || "Le texte n'est pas valide.")}</p><p class="petit">Rien n'a été modifié : le DER actuel reste en place.</p><div class="der-ligne-boutons"><button type="button" class="bouton" data-f>Fermer</button></div>`).querySelector("[data-f]").onclick = (e) => e.target.closest("dialog").close(); return; }
    const ch = diff(ancien, nouveau);
    const d = boite(`<h2>Vérifiez les changements</h2>
      ${ch.length ? `<ul class="der-diff">${ch.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "<p>Aucun changement par rapport au texte actuel.</p>"}
      <p class="petit">La version actuelle sera gardée dans l'historique : vous pourrez y revenir.</p>
      <div class="der-ligne-boutons"><button type="button" class="bouton bouton-discret" data-r="non">Annuler</button><button type="button" class="bouton" data-r="oui" ${ch.length ? "" : "disabled"}>Mettre en ligne cette version</button></div>`, true);
    d.querySelector('[data-r="non"]').onclick = () => d.close();
    d.querySelector('[data-r="oui"]').onclick = async (e) => {
      e.target.disabled = true; e.target.textContent = "Enregistrement…";
      const r = await fetch("/api/der/contenu", { method: "POST", headers: { "Content-Type": "application/json" }, body: corps, credentials: "same-origin" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { e.target.textContent = j.erreur || "Échec"; return; }
      d.close(); apres?.();
    };
  }
  async function importer(fichier, ancien, apres) {
    let n;
    try { n = JSON.parse(await fichier.text()); } catch { boite(`<h2>Fichier illisible</h2><p>Ce fichier n'est pas un texte de DER (JSON).</p><div class="der-ligne-boutons"><button type="button" class="bouton" onclick="this.closest('dialog').close()">Fermer</button></div>`); return; }
    delete n.importe_le; delete n.par;
    await confirmer(ancien, n, apres);
  }

  // ---------------------------------------------------------------- historique
  function historique(liste, apres) {
    const d = boite(`<h2>Versions précédentes du DER</h2>${liste.length ? `<ul class="der-diff">${liste.map((h, i) => `<li><span>${esc(h.version || "Version")} · importée le ${h.importe_le ? new Date(h.importe_le).toLocaleDateString("fr-FR") : "?"}${h.par ? " par " + esc(h.par) : ""}</span>
      <button type="button" class="puce" data-i="${i}">Revenir à cette version</button></li>`).join("")}</ul>` : "<p>Aucune version précédente.</p>"}
      <div class="der-ligne-boutons"><button type="button" class="bouton bouton-discret" data-f>Fermer</button></div>`, true);
    d.querySelector("[data-f]").onclick = () => d.close();
    d.querySelectorAll("[data-i]").forEach((b) => b.onclick = async () => {
      b.disabled = true; b.textContent = "…";
      const r = await fetch("/api/der/restaurer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ index: Number(b.dataset.i) }), credentials: "same-origin" });
      if (r.ok) { d.close(); apres?.(); } else b.textContent = "Échec";
    });
  }
  window.DerAdmin = { diff, importer, historique, boite };
})();
