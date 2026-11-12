import { json, memeOrigine, lireJson, texte, emailValide, hacherMotDePasse, ouvrirSession, profil, tropDEssais, noterEssai, adresseIp } from '../../lib/securite.js';

// Demande d'adhésion : crée un compte "en attente", que la conciergerie active ensuite.
export async function onRequestPost({ request, env }) {
  if (!memeOrigine(request)) return json({ erreur: 'origine' }, 403);
  const d = await lireJson(request);
  if (!d) return json({ erreur: 'format' }, 400);

  const nom = texte(d.nom, 120);
  const email = texte(d.email, 160).toLowerCase();
  const telephone = texte(d.telephone, 40);
  const formule = d.formule === 'entreprise' ? 'entreprise' : 'privee';
  const mdp = typeof d.mot_de_passe === 'string' ? d.mot_de_passe : '';
  if (!nom || !emailValide(email) || mdp.length < 10 || mdp.length > 200) return json({ erreur: 'champs' }, 400);

  const cle = 'inscription:' + adresseIp(request);
  if (await tropDEssais(env, cle, 5, 3600)) return json({ erreur: 'limite' }, 429);
  await noterEssai(env, cle);

  const existe = await env.DB.prepare('SELECT id FROM membres WHERE email = ?').bind(email).first();
  if (existe) return json({ erreur: 'existe' }, 409);

  const h = await hacherMotDePasse(mdp);
  const r = await env.DB.prepare(
    'INSERT INTO membres (email, nom, telephone, formule, mdp_hash, mdp_sel, mdp_iterations) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(email, nom, telephone, formule, h.hash, h.sel, h.iterations).run();

  const cookie = await ouvrirSession(env, r.meta.last_row_id);
  return json({ membre: profil({ nom, email, formule, statut: 'en_attente' }) }, 201, { 'Set-Cookie': cookie });
}
