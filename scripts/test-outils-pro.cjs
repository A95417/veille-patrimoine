const fs = require("fs"), vm = require("vm"), D = require("path").join(__dirname, "../public/");
const ctx = { console, module: undefined }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(D + "outils-fiches.js", "utf8") + "\n" + fs.readFileSync(D + "outils-pro.js", "utf8") + "\n;globalThis.T={impotRevenu,surtaxePV,cehr,abattSalaire,abattPensions,OUTILS_PRO,baremeProgressif};", ctx);
const { impotRevenu, surtaxePV, cehr, abattSalaire, abattPensions, OUTILS_PRO } = ctx.T;
let ok = 0, ko = 0; const eq = (nom, a, b, tol = 0.01) => { if (Math.abs(a - b) <= tol) ok++; else { ko++; console.log("ÉCHEC", nom, a, "≠", b); } };
// Service-public F31130 : célibataire, RFR 400 000 € → 4 500 €
eq("CEHR exemple officiel", cehr(400000, false), 4500);
eq("CEHR couple 600 000", cehr(600000, true), 3000);
// Barème : personne seule 30 000 €
eq("IR seul 30 000", impotRevenu(30000, false, 0, false).net, (29579 - 11600) * .11 + (30000 - 29579) * .3);
// Décote : personne seule 20 000 € → 924 − (897 − 45,25 % × 924)
eq("IR décote", impotRevenu(20000, false, 0, false).net, 924 - (897 - .4525 * 924));
// Non recouvré sous 61 €
eq("IR < 61", impotRevenu(13000, false, 0, false).net, 0);
// Plafonnement : couple 2 enfants, 150 000 € → avantage limité à 2 × 1 807
{ const R = impotRevenu(150000, true, 2, false); const sansQF = ctx.T.baremeProgressif(75000, [[11600,0],[29579,.11],[84577,.3],[181917,.41],[Infinity,.45]]) * 2; eq("IR plafonnement", R.net, Math.max(R.brutQF, sansQF - 3614)); console.log("  couple 2 enf 150k : plafonné =", R.plafonne, Math.round(R.net)); }
// Parent isolé, 1 enfant : 2 parts, avantage max 4 262 €
{ const R = impotRevenu(100000, false, 1, true); eq("parts isolé", R.parts, 2); eq("avantage isolé", R.avantageMax, 4262); }
{ const R = impotRevenu(100000, false, 2, true); eq("avantage isolé 2 enf (6 069 € selon Service-public)", R.avantageMax, 6069); }
eq("couple 3 enfants = 4 parts", impotRevenu(50000, true, 3, false).parts, 4);
// Abattements 10 %
eq("abatt salaire min", abattSalaire(3000), 509); eq("abatt salaire max", abattSalaire(300000), 14555); eq("abatt salaire 40 000", abattSalaire(40000), 4000);
eq("abatt pensions plafond foyer", abattPensions([40000, 30000]), 4439); eq("abatt pensions min", abattPensions([2000]), 454);
// Surtaxe (notice 2048-IMM)
eq("surtaxe 50 000", surtaxePV(50000), 0); eq("surtaxe 55 000", surtaxePV(55000), 850); eq("surtaxe 80 000", surtaxePV(80000), 1600);
eq("surtaxe 105 000", surtaxePV(105000), 2650); eq("surtaxe 300 000", surtaxePV(300000), 18000);
eq("surtaxe continuité 60 000", surtaxePV(60000), 1200); eq("surtaxe continuité 260 000", surtaxePV(260000), 15600);
console.log(`${ok} vérifications réussies, ${ko} échec(s)`); process.exit(ko ? 1 : 0);
