import { json, memeOrigine, lireJson, texte, verifierMotDePasse, ouvrirSession, profil, tropDEssais, noterEssai, adresseIp } from '../../lib/securite.js';

export async function onRequestPost({ request, env }) {
  if (!memeOrigine(request)) return json({ erreur: 'origine' }, 403);
  const d = await lireJson(request);
  if (!d) return json({ erreur: 'format' }, 400);

  const email = texte(d.email, 160).toLowerCase();
  const mdp = typeof d.mot_de_passe === 'string' ? d.mot_de_passe.slice(0, 200) : '';
  if (!email || !mdp) return json({ erreur: 'champs' }, 400);

  // 5 échecs par e-mail ou 20 par adresse IP sur 15 minutes.
  const cles = ['connexion:' + email, 'connexion-ip:' + adresseIp(request)];
  if (await tropDEssais(env, cles[0], 5, 900) || await tropDEssais(env, cles[1], 20, 900)) return json({ erreur: 'limite' }, 429);

  const m = await env.DB.prepare('SELECT * FROM membres WHERE email = ?').bind(email).first();
  const bon = m ? await verifierMotDePasse(mdp, m) : false;
  if (!bon) {
    await noterEssai(env, cles[0]); await noterEssai(env, cles[1]);
    return json({ erreur: 'identifiants' }, 401); // même réponse que le compte existe ou non
  }
  if (m.statut === 'suspendu') return json({ erreur: 'suspendu' }, 403);

  const cookie = await ouvrirSession(env, m.id);
  return json({ membre: profil(m) }, 200, { 'Set-Cookie': cookie });
}
