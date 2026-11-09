// Point d'entrée du site (le "serveur").
// Étape 1 : il renvoie simplement les pages du dossier "public"
// et une petite adresse de contrôle /api/sante.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Adresse de contrôle : permet de vérifier que le serveur répond.
    if (url.pathname === "/api/sante") {
      return Response.json({
        statut: "ok",
        message: "Le serveur de veille fonctionne.",
        heure_serveur: new Date().toISOString(),
      });
    }

    // Tout le reste : les pages du site (dossier public).
    return env.ASSETS.fetch(request);
  },
};
