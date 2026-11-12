import { json, memeOrigine, lireJson, texte, membreConnecte, tropDEssais, noterEssai, adresseIp } from '../../lib/securite.js';

const INCLUS = ['residence', 'vehicule', 'experiences', 'libre'];
const date = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

// Demande de réservation : ouverte à tous, membre ou non.
export async function onRequestPost({ request, env }) {
  if (!memeOrigine(request)) return json({ erreur: 'origine' }, 403);
  const d = await lireJson(request);
  if (!d) return json({ erreur: 'format' }, 400);

  const nom = texte(d.nom, 120);
  const contact = texte(d.contact, 160);
  if (!nom || contact.length < 5) return json({ erreur: 'champs' }, 400);

  const cle = 'demande:' + adresseIp(request);
  if (await tropDEssais(env, cle, 10, 3600)) return json({ erreur: 'limite' }, 429);
  await noterEssai(env, cle);

  const inclus = (Array.isArray(d.inclus) ? d.inclus : []).filter((v) => INCLUS.includes(v)).join(',');
  const voyageurs = Math.min(99, Math.max(1, parseInt(d.voyageurs, 10) || 1));
  const membre = await membreConnecte(request, env);

  await env.DB.prepare(
    'INSERT INTO demandes (membre_id, nom, contact, arrivee, depart, voyageurs, inclus, souhaits, langue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(membre ? membre.id : null, nom, contact, date(d.arrivee), date(d.depart), voyageurs, inclus, texte(d.souhaits, 2000), d.langue === 'en' ? 'en' : 'fr').run();

  return json({ ok: true }, 201);
}
