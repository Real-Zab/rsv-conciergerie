// Génère les pages du site (français à la racine, anglais sous /en/) dans public/.
// Usage : node outils/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'public');
const T = JSON.parse(fs.readFileSync(path.join(here, 'textes.json'), 'utf8'));

// Textes ajoutés pour la version déployée (titres de pages, espace membre, messages).
const X = {
  fr: {
    site: 'RSV Conciergerie',
    titles: { home: 'Location premium et conciergerie à Dakar', res: 'Résidences', veh: 'Véhicules', exp: 'Expériences', book: 'Réserver sur mesure', member: 'Adhésion', events: 'Agence événementielle', about: 'À propos', legal: 'Mentions légales', login: 'Espace membre' },
    desc: {
      home: 'Résidences, véhicules avec chauffeur et expériences privées à Dakar et au Sénégal, réunis par un concierge dédié.',
      res: 'Villas et appartements de standing à Dakar, Saly et dans le Sine Saloum, préparés avant votre arrivée.',
      veh: 'Berline avec chauffeur, SUV, van VIP et transfert aéroport AIBD, pour une heure ou tout le séjour.',
      exp: 'Gorée, Lac Rose, sorties en mer, tables et spa : des expériences privées organisées pour vous seuls.',
      book: 'Composez votre séjour en ligne : un concierge ajuste chaque détail avec vous avant de confirmer.',
      member: 'Deux formules d’adhésion, privée et entreprise, avec des avantages réservés aux membres.',
      events: 'L’agence événementielle de RSV Conciergerie organise vos événements de bout en bout.',
      about: 'RSV Conciergerie, une maison sénégalaise au service de vos séjours.',
      legal: 'Mentions légales et politique de confidentialité de RSV Conciergerie.',
      login: 'Connexion à l’espace membre RSV Conciergerie et demande d’adhésion.'
    },
    skip: 'Aller au contenu', sent: 'Demande envoyée', chooseLang: 'Français',
    err0: 'L’envoi n’a pas abouti. Vérifiez votre connexion puis réessayez.',
    err400: 'Certains champs sont incomplets. Vérifiez-les puis réessayez.',
    err429: 'Trop de tentatives. Réessayez dans quelques minutes.',
    loginErr401: 'E-mail ou mot de passe incorrect.',
    loginErr403: 'Ce compte est suspendu. Contactez la conciergerie.',
    signH2: 'Demander l’adhésion', signName: 'Nom complet', signPhone: 'Téléphone ou WhatsApp', signPlan: 'Formule',
    signPass: 'Mot de passe', signPassHint: '10 caractères minimum.', signBtn: 'Envoyer ma demande d’adhésion',
    signErr409: 'Un compte existe déjà avec cet e-mail. Connectez-vous.',
    signNote: 'Votre demande est étudiée par la conciergerie, qui vous contacte pour l’activer.',
    accEyebrow: 'Espace membre', accHello: 'Bienvenue,', accMail: 'E-mail', accPlan: 'Formule', accStatus: 'Statut',
    stPending: 'Demande en cours d’étude', stActive: 'Adhésion active', stSuspended: 'Suspendue',
    accSoon: '[Avantages membres, réservations et factures : à construire]', logout: 'Se déconnecter',
    planPrivTxt: '[Avantages, tarif et conditions]', planCorpTxt: '[Avantages, tarif et conditions]'
  },
  en: {
    site: 'RSV Conciergerie',
    titles: { home: 'Premium rentals and concierge in Dakar', res: 'Residences', veh: 'Vehicles', exp: 'Experiences', book: 'Book your stay', member: 'Membership', events: 'Events agency', about: 'About', legal: 'Legal notice', login: 'Member area' },
    desc: {
      home: 'Residences, chauffeured vehicles and private experiences in Dakar and Senegal, arranged by a dedicated concierge.',
      res: 'Villas and high-end apartments in Dakar, Saly and the Sine Saloum, prepared before you arrive.',
      veh: 'Chauffeured sedan, SUV, VIP van and AIBD airport transfer, for an hour or your whole stay.',
      exp: 'Gorée, Lac Rose, boat trips, dining and spa: private experiences arranged for you alone.',
      book: 'Plan your stay online: a concierge adjusts every detail with you before confirming.',
      member: 'Two membership plans, private and corporate, with benefits reserved for members.',
      events: 'The RSV Conciergerie events agency organises your events from start to finish.',
      about: 'RSV Conciergerie, a Senegalese house at the service of your stays.',
      legal: 'Legal notice and privacy policy of RSV Conciergerie.',
      login: 'Sign in to the RSV Conciergerie member area or request membership.'
    },
    skip: 'Skip to content', sent: 'Request sent', chooseLang: 'English',
    err0: 'Your request could not be sent. Check your connection and try again.',
    err400: 'Some fields are incomplete. Check them and try again.',
    err429: 'Too many attempts. Try again in a few minutes.',
    loginErr401: 'Incorrect email or password.',
    loginErr403: 'This account is suspended. Contact the concierge.',
    signH2: 'Request membership', signName: 'Full name', signPhone: 'Phone or WhatsApp', signPlan: 'Plan',
    signPass: 'Password', signPassHint: '10 characters minimum.', signBtn: 'Send my membership request',
    signErr409: 'An account already exists with this email. Sign in.',
    signNote: 'The concierge reviews your request and contacts you to activate it.',
    accEyebrow: 'Member area', accHello: 'Welcome,', accMail: 'Email', accPlan: 'Plan', accStatus: 'Status',
    stPending: 'Request under review', stActive: 'Active membership', stSuspended: 'Suspended',
    accSoon: '[Member benefits, bookings and invoices: to be built]', logout: 'Sign out',
    planPrivTxt: '[Benefits, price and terms]', planCorpTxt: '[Benefits, price and terms]'
  }
};

const SLUG = {
  home: ['', ''], res: ['residences', 'residences'], veh: ['vehicules', 'vehicles'], exp: ['experiences', 'experiences'],
  book: ['reserver', 'book'], member: ['adhesion', 'membership'], events: ['evenements', 'events'],
  about: ['a-propos', 'about'], legal: ['mentions-legales', 'legal'], login: ['espace-membre', 'member-area']
};
const url = (page, lang) => (lang === 'en' ? '/en/' : '/') + SLUG[page][lang === 'en' ? 1 : 0];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ICON = {
  burger: '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><path d="M2 6h20M2 12h20M2 18h20" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  chevron: '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  theme: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg>',
  login: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path d="M3 12h11M10 8l4 4-4 4M14 4h6v16h-6" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>'
};
// Liens des réseaux : à remplacer par les comptes RSV.
const SOCIALS = [['instagram', 'Instagram', '#'], ['tiktok', 'TikTok', '#'], ['facebook', 'Facebook', '#'], ['youtube', 'YouTube', '#'], ['x', 'X', '#']];

function layout(page, lang, body) {
  const t = T[lang], x = X[lang], other = lang === 'en' ? 'fr' : 'en';
  const nav = [['res', t.nav[0]], ['veh', t.nav[1]], ['exp', t.nav[2]], ['book', t.nav[3]]];
  const more = [['member', t.more[0]], ['events', t.more[1]], ['exp', t.more[2], '#offres'], ['about', t.more[3]], ['book', t.more[4]], ['legal', t.more[5]]];
  const cur = (p) => (p === page ? ' aria-current="page"' : '');
  const title = page === 'home' ? `${x.site} · ${x.titles.home}` : `${x.titles[page]} · ${x.site}`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(x.desc[page])}">
<link rel="alternate" hreflang="fr" href="${url(page, 'fr')}">
<link rel="alternate" hreflang="en" href="${url(page, 'en')}">
<link rel="alternate" hreflang="x-default" href="${url(page, 'fr')}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(x.desc[page])}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#FFFFFF">
<link rel="preload" href="/assets/fonts/jost-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/bodoni-moda-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
<script src="/assets/theme.js"></script>
</head>
<body>
<a class="sr" href="#contenu">${esc(x.skip)}</a>
<header class="head">
<div class="head__left">
<button type="button" class="icon-btn" data-burger aria-expanded="false" aria-controls="volet" aria-label="${esc(t.openMenu)}">${ICON.burger}</button>
<a class="logo" href="${url('home', lang)}" aria-label="${esc(x.site)}">RSV</a>
</div>
<nav class="bar" aria-label="${esc(t.navAria)}">
${nav.map(([p, l]) => `<a href="${url(p, lang)}"${cur(p)}>${esc(l)}</a>`).join('\n')}
<a class="btn btn--sm" href="${url('book', lang)}">${esc(t.book)}</a>
</nav>
<div class="head__right">
<div class="lang" data-lang>
<button type="button" class="lang__btn" aria-expanded="false" aria-label="${esc(t.langAria)}"><span>${lang.toUpperCase()}</span>${ICON.chevron}</button>
<div class="lang__list">
<a href="${url(page, 'fr')}" lang="fr" hreflang="fr"${lang === 'fr' ? ' aria-current="true"' : ''}>Français</a>
<a href="${url(page, 'en')}" lang="en" hreflang="en"${lang === 'en' ? ' aria-current="true"' : ''}>English</a>
</div>
</div>
<button type="button" class="icon-btn" data-theme-toggle aria-pressed="false" aria-label="${esc(t.themeDark)}" data-dark="${esc(t.themeDark)}" data-light="${esc(t.themeLight)}">${ICON.theme}</button>
</div>
</header>
<button type="button" class="veil" data-veil hidden aria-label="${esc(t.closeMenu)}"></button>
<nav class="drawer" id="volet" data-drawer hidden aria-label="${esc(t.menuAria)}">
<div class="drawer__site">
${nav.map(([p, l]) => `<a href="${url(p, lang)}"${cur(p)}>${esc(l)}</a>`).join('\n')}
<a class="btn btn--full" href="${url('book', lang)}">${esc(t.book)}</a>
</div>
${more.map(([p, l, h]) => `<a href="${url(p, lang)}${h || ''}">${esc(l)}</a>`).join('\n')}
<a class="drawer__login" href="${url('login', lang)}"><span>${esc(t.loginLabel)}</span>${ICON.login}</a>
</nav>
<main id="contenu">
${body}
</main>
<footer class="foot">
<nav class="acc-list" aria-label="${esc(t.footNav)}">
<details><summary>${esc(t.footMem)}</summary><div class="links">
<a href="${url('member', lang)}#privee">${esc(t.memPriv)}</a>
<a href="${url('member', lang)}#entreprise">${esc(t.memCorp)}</a>
<a href="${url('login', lang)}#adhesion">${esc(t.memCta)}</a>
</div></details>
<details><summary>${esc(t.footSrv)}</summary><div class="links">
<a href="${url('res', lang)}">${esc(t.nav[0])}</a>
<a href="${url('veh', lang)}">${esc(t.nav[1])}</a>
<a href="${url('exp', lang)}">${esc(t.nav[2])}</a>
<a href="${url('events', lang)}">${esc(t.more[1])}</a>
</div></details>
<details><summary>${esc(t.footCtc)}</summary><div class="links">
<a href="${url('book', lang)}">${esc(t.footAsk)}</a>
<span>${esc(t.bkWa)}</span>
<a href="${url('legal', lang)}">${esc(t.more[5])}</a>
</div></details>
</nav>
<div class="follow">
<div class="follow__t">${esc(t.follow)}</div>
<ul class="socials">
${SOCIALS.map(([k, n, h]) => `<li><a class="rs-${k}" href="${h}" aria-label="${n}"${h === '#' ? '' : ' target="_blank" rel="noopener"'}></a></li>`).join('\n')}
</ul>
</div>
<div class="copy">© 2026 RSV Conciergerie. ${esc(t.rights)}</div>
</footer>
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

const ph = (tag, txt, cls = '') => `<div class="ph ${cls}"><div class="ph__tag">${esc(tag)}</div><div class="ph__txt">${esc(txt)}</div></div>`;

const pages = {
  home: (lang, t) => `<div class="split">
<section class="pane pane--center">
<div class="eyebrow">${esc(t.homeEyebrow)}</div>
<h1 class="h1 h1--home">${esc(t.homeH1a)}<br>${esc(t.homeH1b)} <em class="acc">${esc(t.homeH1c)}</em>.</h1>
<p class="lead">${esc(t.homeP)}</p>
<div class="btn-row">
<a class="btn btn--full" href="${url('book', lang)}">${esc(t.ctaPlan)}</a>
<a class="btn" href="${url('res', lang)}">${esc(t.ctaRes)}</a>
</div>
</section>
${ph(t.videoTag, t.videoText, 'media')}
</div>
<nav class="doors" aria-label="${esc(t.doorsAria)}">
${t.doors.map((d, i) => `<a class="door" href="${url(['res', 'veh', 'exp', 'book'][i], lang)}"><span class="door__k">${esc(d[0])}</span><span class="door__t">${esc(d[1])}</span><span class="door__l">${esc(d[2])}</span></a>`).join('\n')}
</nav>`,

  res: (lang, t) => `<div class="split">
<section class="pane">
<div class="stack">
<div class="eyebrow">${esc(t.resEyebrow)}</div>
<h1 class="h1">${esc(t.resH1)}</h1>
</div>
<div class="picks">
${t.res.map((r, i) => `<button type="button" class="pick" data-pick="r${i}" aria-pressed="${i === 0}"><span class="pick__n">${esc(r[0])}</span><span class="caps">${esc(r[1])}</span></button>`).join('\n')}
</div>
<p>${esc(t.resNote)}</p>
</section>
<div class="detail">
${t.res.map((r, i) => `<article data-panel="r${i}"${i ? ' hidden' : ''} class="detail__one">
${ph(t.photoTag, r[2])}
<div class="detail__body">
<div class="detail__top"><h2 class="detail__h">${esc(r[0])}</h2><span class="caps acc">${esc(r[1])}</span></div>
<p>${esc(r[3])}</p>
<div class="facts"><span>${esc(t.fCap)}</span><span>${esc(t.fBed)}</span><span>${esc(t.fNight)}</span></div>
<div class="btn-row">
<a class="btn btn--full" href="${url('book', lang)}">${esc(t.ctaPlan)}</a>
<a class="btn" href="${url('veh', lang)}">${esc(t.ctaAddVeh)}</a>
</div>
</div>
</article>`).join('\n')}
</div>
</div>`,

  veh: (lang, t) => `<section class="intro">
<div class="stack">
<div class="eyebrow">${esc(t.vehEyebrow)}</div>
<h1 class="h1">${esc(t.vehH1)}</h1>
</div>
<p class="lead">${esc(t.vehP)}</p>
</section>
<section class="cells">
${t.veh.map((v) => `<article class="card">
${ph(t.photoTag, v[0])}
<div class="card__body">
<h2 class="card__h">${esc(v[1])}</h2>
<p>${esc(v[2])}</p>
<div class="caps">${esc(v[3])}</div>
<a class="link-acc" href="${url('book', lang)}">${esc(t.bookArrow)}</a>
</div>
</article>`).join('\n')}
</section>`,

  exp: (lang, t) => `<div class="split">
<section class="pane pane--narrow pane--between">
<div class="stack stack--lg">
<div class="eyebrow">${esc(t.expEyebrow)}</div>
<h1 class="h1">${esc(t.expH1a)} <em class="acc">${esc(t.expH1b)}</em>.</h1>
<p class="lead">${esc(t.expP)}</p>
</div>
<div class="btn-row"><a class="btn btn--full" href="${url('book', lang)}">${esc(t.expCta)}</a></div>
</section>
<section class="cells cells--side">
${t.exp.map((e, i) => `<a class="ph tile" href="${url('book', lang)}"${i === 5 ? ' id="offres"' : ''}><span class="ph__tag">${esc(e[0])}</span><span class="tile__t">${esc(e[1])}</span><span class="ph__txt">${esc(e[2])}</span></a>`).join('\n')}
</section>
</div>`,

  book: (lang, t, x) => `<div class="split">
<section class="pane pane--narrow pane--between">
<div class="stack stack--lg">
<div class="eyebrow">${esc(t.bkEyebrow)}</div>
<h1 class="h1">${esc(t.bkH1)}</h1>
<p class="lead">${esc(t.bkP)}</p>
</div>
<div class="contact">
<div class="ph__tag">${esc(t.bkTalk)}</div>
<div>${esc(t.bkWa)}</div><div>${esc(t.bkTel)}</div><div>${esc(t.bkMail)}</div><div>${esc(t.bkDelay)}</div>
</div>
</section>
<section class="pane pane--wide pane--line">
<form class="form" data-form="demande" data-api="/api/demandes" data-e0="${esc(x.err0)}" data-e400="${esc(x.err400)}" data-e429="${esc(x.err429)}" novalidate>
<fieldset>
<legend class="legend">${esc(t.bkIncludes)}</legend>
<div class="chips">
${t.chips.map((c, i) => `<label class="chip"><input type="checkbox" name="inclus" value="${['residence', 'vehicule', 'experiences', 'libre'][i]}"${i < 2 ? ' checked' : ''}><span>${esc(c)}</span></label>`).join('\n')}
</div>
</fieldset>
<div class="row">
<div class="field"><label for="arrivee">${esc(t.bkIn)}</label><input id="arrivee" name="arrivee" type="date"></div>
<div class="field"><label for="depart">${esc(t.bkOut)}</label><input id="depart" name="depart" type="date"></div>
<div class="field"><label for="voyageurs">${esc(t.bkGuests)}</label><input id="voyageurs" name="voyageurs" type="number" min="1" max="99" value="2" inputmode="numeric"></div>
</div>
<div class="field"><label for="souhaits">${esc(t.bkWishes)}</label><textarea id="souhaits" name="souhaits" rows="4" maxlength="2000"></textarea><div class="hint">${esc(t.bkHint)}</div></div>
<div class="row">
<div class="field"><label for="nom">${esc(t.bkName)}</label><input id="nom" name="nom" type="text" autocomplete="name" maxlength="120" required></div>
<div class="field"><label for="contact">${esc(t.bkContact)}</label><input id="contact" name="contact" type="text" maxlength="160" required></div>
</div>
<p class="msg" data-msg role="alert" hidden></p>
<div class="btn-row"><button type="submit" class="btn btn--full">${esc(t.bkSend)}</button></div>
<div class="hint">${esc(t.bkNoPay)}</div>
</form>
<div class="done" data-done tabindex="-1" hidden>
<div class="eyebrow">${esc(t.okEyebrow)}</div>
<h2 class="h2">${esc(t.okH2)}</h2>
<p class="lead">${esc(t.okP)}</p>
<div class="btn-row"><button type="button" class="btn" data-again>${esc(t.okBack)}</button></div>
</div>
</section>
</div>`,

  member: (lang, t, x) => `<section class="pane info">
<div class="eyebrow">${esc(t.memEyebrow)}</div>
<h1 class="h1">${esc(t.memH1)}</h1>
<div class="plans">
<article class="plan" id="privee"><h2 class="card__h">${esc(t.memPriv)}</h2><p>${esc(x.planPrivTxt)}</p></article>
<article class="plan" id="entreprise"><h2 class="card__h">${esc(t.memCorp)}</h2><p>${esc(x.planCorpTxt)}</p></article>
</div>
<p class="lead">${esc(t.memLines[2])}</p>
<div class="btn-row">
<a class="btn btn--full" href="${url('login', lang)}#adhesion">${esc(t.memCta)}</a>
<a class="btn" href="${url('book', lang)}">${esc(t.book)}</a>
</div>
</section>`,

  events: (lang, t) => infoPage(t.evEyebrow, t.evH1, t.evLines, [url('book', lang), t.evCta]),
  about: (lang, t) => infoPage(t.aboutEyebrow, t.aboutH1, t.aboutLines),
  legal: (lang, t) => infoPage(t.legalEyebrow, t.legalH1, t.legalLines),

  login: (lang, t, x) => `<section class="pane info" data-member>
<div data-guest class="stack stack--lg">
<h1 class="h1">${esc(t.loginLabel)}</h1>
<div class="member">
<section>
<h2>${esc(t.loginH1)}</h2>
<form class="form" data-form="connexion" data-api="/api/connexion" data-e0="${esc(x.err0)}" data-e400="${esc(x.err400)}" data-e401="${esc(x.loginErr401)}" data-e403="${esc(x.loginErr403)}" data-e429="${esc(x.err429)}" novalidate>
<div class="field"><label for="c-email">${esc(t.loginMail)}</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
<div class="field"><label for="c-mdp">${esc(t.loginPass)}</label><input id="c-mdp" name="mot_de_passe" type="password" autocomplete="current-password" required></div>
<p class="msg" data-msg role="alert" hidden></p>
<button type="submit" class="btn btn--full btn--block">${esc(t.loginBtn)}</button>
</form>
</section>
<section id="adhesion">
<h2>${esc(x.signH2)}</h2>
<form class="form" data-form="inscription" data-api="/api/inscription" data-e0="${esc(x.err0)}" data-e400="${esc(x.err400)}" data-e409="${esc(x.signErr409)}" data-e429="${esc(x.err429)}" novalidate>
<div class="field"><label for="i-nom">${esc(x.signName)}</label><input id="i-nom" name="nom" type="text" autocomplete="name" maxlength="120" required></div>
<div class="field"><label for="i-email">${esc(t.loginMail)}</label><input id="i-email" name="email" type="email" autocomplete="email" maxlength="160" required></div>
<div class="field"><label for="i-tel">${esc(x.signPhone)}</label><input id="i-tel" name="telephone" type="tel" autocomplete="tel" maxlength="40"></div>
<div class="field"><label for="i-formule">${esc(x.signPlan)}</label><select id="i-formule" name="formule"><option value="privee">${esc(t.memPriv)}</option><option value="entreprise">${esc(t.memCorp)}</option></select></div>
<div class="field"><label for="i-mdp">${esc(x.signPass)}</label><input id="i-mdp" name="mot_de_passe" type="password" autocomplete="new-password" minlength="10" maxlength="200" required><div class="hint">${esc(x.signPassHint)}</div></div>
<p class="msg" data-msg role="alert" hidden></p>
<button type="submit" class="btn btn--block">${esc(x.signBtn)}</button>
<div class="hint">${esc(x.signNote)}</div>
</form>
</section>
</div>
<p class="lead">${esc(t.loginNote)}</p>
<div class="btn-row"><a class="btn" href="${url('book', lang)}">${esc(t.book)}</a></div>
</div>
<div data-account class="stack stack--lg" hidden data-fprivee="${esc(t.memPriv)}" data-fentreprise="${esc(t.memCorp)}" data-senattente="${esc(x.stPending)}" data-sactif="${esc(x.stActive)}" data-ssuspendu="${esc(x.stSuspended)}">
<div class="eyebrow">${esc(x.accEyebrow)}</div>
<h1 class="h1">${esc(x.accHello)} <span data-m-nom></span></h1>
<div class="kv">
<div><span class="caps">${esc(x.accMail)}</span><span data-m-email></span></div>
<div><span class="caps">${esc(x.accPlan)}</span><span data-m-formule></span></div>
<div><span class="caps">${esc(x.accStatus)}</span><span data-m-statut></span></div>
</div>
<p>${esc(x.accSoon)}</p>
<div class="btn-row">
<a class="btn btn--full" href="${url('book', lang)}">${esc(t.book)}</a>
<button type="button" class="btn" data-logout>${esc(x.logout)}</button>
</div>
</div>
</section>`
};

function infoPage(eyebrow, h1, lines, cta) {
  return `<section class="pane info">
<div class="eyebrow">${esc(eyebrow)}</div>
<h1 class="h1">${esc(h1)}</h1>
<div class="lines">
${lines.map((l) => `<div>${esc(l)}</div>`).join('\n')}
</div>
${cta ? `<div class="btn-row"><a class="btn btn--full" href="${cta[0]}">${esc(cta[1])}</a></div>` : ''}
</section>`;
}

let n = 0;
for (const lang of ['fr', 'en']) {
  for (const page of Object.keys(pages)) {
    const slug = SLUG[page][lang === 'en' ? 1 : 0] || 'index';
    const file = path.join(out, lang === 'en' ? 'en' : '', slug + '.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, layout(page, lang, pages[page](lang, T[lang], X[lang])));
    n++;
  }
}
console.log(n + ' pages générées');
