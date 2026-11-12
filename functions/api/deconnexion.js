import { json, memeOrigine, fermerSession, cookieVide } from '../../lib/securite.js';

export async function onRequestPost({ request, env }) {
  if (!memeOrigine(request)) return json({ erreur: 'origine' }, 403);
  await fermerSession(request, env);
  return json({ ok: true }, 200, { 'Set-Cookie': cookieVide });
}
