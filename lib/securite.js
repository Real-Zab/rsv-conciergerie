// Outils communs aux fonctions serveur : mots de passe, sessions, réponses.
const ITERATIONS = 100000; // maximum accepté par Cloudflare Workers pour PBKDF2
const DUREE_SESSION = 60 * 60 * 24 * 30; // 30 jours, en secondes
export const COOKIE = '__Host-rsv_session';

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (s) => new Uint8Array(s.match(/.{2}/g).map((h) => parseInt(h, 16)));

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }
  });
}

// Refuse les envois venant d'un autre site (protection CSRF).
export function memeOrigine(request) {
  const origine = request.headers.get('Origin');
  if (!origine) return false;
  try { return new URL(origine).host === new URL(request.url).host; } catch { return false; }
}

export async function lireJson(request) {
  const type = request.headers.get('Content-Type') || '';
  if (!type.includes('application/json')) return null;
  const texte = await request.text();
  if (texte.length > 20000) return null;
  try { const o = JSON.parse(texte); return o && typeof o === 'object' ? o : null; } catch { return null; }
}

export const texte = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const emailValide = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 160;

async function deriver(motDePasse, sel, iterations) {
  const cle = await crypto.subtle.importKey('raw', enc.encode(motDePasse), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sel, iterations }, cle, 256);
}

export async function hacherMotDePasse(motDePasse) {
  const sel = crypto.getRandomValues(new Uint8Array(16));
  return { hash: hex(await deriver(motDePasse, sel, ITERATIONS)), sel: hex(sel), iterations: ITERATIONS };
}

export async function verifierMotDePasse(motDePasse, membre) {
  const calcule = new Uint8Array(await deriver(motDePasse, unhex(membre.mdp_sel), membre.mdp_iterations));
  const attendu = unhex(membre.mdp_hash);
  if (calcule.length !== attendu.length) return false;
  let diff = 0;
  for (let i = 0; i < calcule.length; i++) diff |= calcule[i] ^ attendu[i];
  return diff === 0;
}

const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

// Le jeton n'est jamais stocké en clair : la base ne garde que son empreinte.
export async function ouvrirSession(env, membreId) {
  const jeton = hex(crypto.getRandomValues(new Uint8Array(32)));
  const expire = Math.floor(Date.now() / 1000) + DUREE_SESSION;
  await env.DB.prepare('INSERT INTO sessions (jeton_hash, membre_id, expire_le) VALUES (?, ?, ?)')
    .bind(await sha256(jeton), membreId, expire).run();
  return `${COOKIE}=${jeton}; Path=/; Max-Age=${DUREE_SESSION}; HttpOnly; Secure; SameSite=Lax`;
}

export const cookieVide = `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

function jetonDe(request) {
  const m = (request.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([a-f0-9]{64})'));
  return m ? m[1] : null;
}

export async function membreConnecte(request, env) {
  const jeton = jetonDe(request);
  if (!jeton) return null;
  const maintenant = Math.floor(Date.now() / 1000);
  return env.DB.prepare(
    `SELECT m.id, m.nom, m.email, m.formule, m.statut FROM sessions s
     JOIN membres m ON m.id = s.membre_id
     WHERE s.jeton_hash = ? AND s.expire_le > ? AND m.statut != 'suspendu'`
  ).bind(await sha256(jeton), maintenant).first();
}

export async function fermerSession(request, env) {
  const jeton = jetonDe(request);
  if (jeton) await env.DB.prepare('DELETE FROM sessions WHERE jeton_hash = ?').bind(await sha256(jeton)).run();
}

export const profil = (m) => ({ nom: m.nom, email: m.email, formule: m.formule, statut: m.statut });

// Limite simple : au plus `max` essais par clé sur `fenetre` secondes.
export async function tropDEssais(env, cle, max, fenetre) {
  const maintenant = Math.floor(Date.now() / 1000);
  await env.DB.prepare('DELETE FROM essais WHERE quand < ?').bind(maintenant - 86400).run();
  const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM essais WHERE cle = ? AND quand > ?')
    .bind(cle, maintenant - fenetre).first();
  return r.n >= max;
}
export async function noterEssai(env, cle) {
  await env.DB.prepare('INSERT INTO essais (cle, quand) VALUES (?, ?)').bind(cle, Math.floor(Date.now() / 1000)).run();
}
export const adresseIp = (request) => request.headers.get('CF-Connecting-IP') || 'inconnue';
