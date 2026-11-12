# RSV Conciergerie — site à déployer

## Contenu du dossier

- `public/` : le site (20 pages, 10 en français et 10 en anglais sous `/en/`).
- `functions/` et `lib/` : le serveur de l'espace membre et des demandes de réservation.
- `schema.sql` : la structure de la base de données.
- `outils/` : le générateur des pages. Les textes sont dans `outils/textes.json` et `outils/build.mjs`.

## Mise en ligne sur Cloudflare Pages (tout se fait dans le navigateur)

1. **GitHub** : créer un dépôt, puis y glisser-déposer tout le contenu de ce dossier.
2. **Cloudflare > Workers & Pages > Créer > Pages > Connecter à Git** : choisir le dépôt.
   - Commande de build : laisser vide.
   - Répertoire de sortie : `public`
3. **Cloudflare > Stockage et bases de données > D1 > Créer une base** : la nommer `rsv-conciergerie`.
   Ouvrir son onglet **Console**, coller tout le contenu de `schema.sql`, exécuter.
4. **Projet Pages > Paramètres > Liaisons > Ajouter > Base de données D1** :
   - Nom de la variable : `DB` (en majuscules, exactement)
   - Base : `rsv-conciergerie`
5. **Déploiements > Relancer le déploiement** pour que la liaison soit prise en compte.

Sans les étapes 3 à 5, le site s'affiche mais la connexion, l'adhésion et l'envoi des demandes échouent.

## Au quotidien (console D1)

Voir les demandes de réservation :

    SELECT * FROM demandes ORDER BY id DESC;

Voir les demandes d'adhésion en attente :

    SELECT id, nom, email, telephone, formule, cree_le FROM membres WHERE statut = 'en_attente';

Activer un membre (remplacer 1 par son id) :

    UPDATE membres SET statut = 'actif' WHERE id = 1;

## Ce qui reste à fournir ou à construire

- Textes entre crochets, photos et vidéo : le site n'est pas prêt pour le public tant qu'ils sont là.
- Liens des réseaux sociaux : dans `outils/build.mjs`, ligne `SOCIALS`.
- Alerte à chaque nouvelle demande (e-mail ou WhatsApp) : aujourd'hui elles sont seulement enregistrées.
- Mot de passe oublié, paiement de l'adhésion, contenu réservé aux membres.
- Mentions légales et politique de confidentialité.
