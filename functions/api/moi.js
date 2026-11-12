import { json, membreConnecte, profil } from '../../lib/securite.js';

export async function onRequestGet({ request, env }) {
  const m = await membreConnecte(request, env);
  return json({ membre: m ? profil(m) : null });
}
