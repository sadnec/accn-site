# Nouveau site ACCN

Site statique (HTML, CSS, JavaScript sans dépendance), construit à partir des maquettes Stitch et du mail d'instruction. Les formulaires sont envoyés par e-mail grâce à un petit script PHP, prévu pour un hébergement cPanel (o2switch, Hostinger…).

## Dossiers

| Élément | Rôle |
|---|---|
| `public/` | **Le site à mettre en ligne** (publié automatiquement, voir plus bas). |
| `build.mjs` | Génère les pages HTML de `public/` : textes, offres, FAQ, questionnaires, coordonnées. |
| `public/assets/css/style.css` | Styles (couleurs du logo : `#333399` et `#993300`) et animations. |
| `public/assets/js/main.js` | Menu, formulaires, validation, envoi, animations. |
| `public/api/envoi.php` | Reçoit les formulaires et les envoie par e-mail au cabinet (pièces jointes comprises). |
| `public/api/config.php` | Réglages de l'envoi : adresse destinataire, expéditeur, taille des fichiers, anti-abus. |
| `public/.htaccess` | HTTPS obligatoire, compression, cache, sécurité, page 404. |
| `tests/formulaire.sh` | Tests automatiques du script PHP (lancés par GitHub à chaque envoi). |
| `serve.mjs` | Petit serveur pour voir le site en local (sans PHP). |

## Modifier un texte

Les textes sont dans `build.mjs` (coordonnées `SITE`, offres `OFFERS`, questions `FAQ`, questionnaires détaillés `QUESTIONNAIRES`). Après modification :

```bash
node build.mjs
```

Pour voir le site : `node serve.mjs`, puis ouvrir http://localhost:4173. En local, sur Netlify et sur GitHub Pages (pas de PHP), les formulaires préparent la demande dans WhatsApp au lieu de l'envoyer par e-mail.

## Mise en ligne sur l'hébergement cPanel

### 1. Chez l'hébergeur (o2switch, Hostinger…)

1. Prendre l'offre au nom d'ACCN et y rattacher le domaine (`accn-assurances.cm`). Si le `.cm` est acheté chez un registraire camerounais, pointer ses serveurs DNS vers ceux de l'hébergeur.
2. Activer le certificat **SSL** (Let's Encrypt / AutoSSL) pour le domaine et `www`.
3. Créer les boîtes e-mail :
   - `contact@accn-assurances.cm` : reçoit les demandes du site ;
   - `site@accn-assurances.cm` : adresse d'expédition des formulaires (doit exister, sinon les messages partent en spam).
4. Dans cPanel, outil **Email Deliverability** (ou « Authentification des e-mails ») : activer **SPF** et **DKIM** pour le domaine.
5. Vérifier que la version de PHP est **8.0 ou plus** (sélecteur de version PHP de cPanel).
6. Créer un **compte FTP** dédié au déploiement, limité au dossier `public_html`. Noter le serveur, l'identifiant et le mot de passe.

### 2. Dans GitHub (dépôt → *Settings → Secrets and variables → Actions*)

**Secrets** (jamais visibles une fois enregistrés) :

| Nom | Valeur |
|---|---|
| `FTP_SERVER` | Serveur FTP de l'hébergeur (ex. `ftp.accn-assurances.cm`) |
| `FTP_USERNAME` | Identifiant du compte FTP |
| `FTP_PASSWORD` | Mot de passe du compte FTP |

**Variables** (facultatives) :

| Nom | Valeur | Par défaut |
|---|---|---|
| `FTP_SERVER_DIR` | Dossier du site sur le serveur. Si le compte FTP s'ouvre directement dans `public_html`, mettre `./`. | `./public_html/` |
| `FTP_PROTOCOL` | `ftps` (recommandé) ou `ftp` si l'hébergeur ne gère pas le chiffrement | `ftps` |
| `SITE_URL` | Adresse définitive, ex. `https://accn-assurances.cm` (liens canoniques + `sitemap.xml`) | — |
| `SITE_INDEXABLE` | `true` le jour du lancement pour autoriser Google | `false` |

### 3. Publication

Chaque envoi sur la branche `main` lance le workflow **« Hébergement (tests + déploiement FTP) »** :
1. tests du script PHP (`tests/formulaire.sh`) ;
2. si les tests passent et que les secrets FTP existent : génération des pages puis envoi de `public/` sur l'hébergement. Seuls les fichiers modifiés sont renvoyés.

Le déploiement peut aussi être lancé à la main : onglet *Actions* → le workflow → *Run workflow*.

### 4. Vérifier après la première mise en ligne

- Le site s'ouvre en `https://` (et `http://` redirige vers `https://`).
- Envoyer une demande de devis test **avec une pièce jointe** : elle doit arriver dans `contact@`, avec la pièce jointe, et le bouton « Répondre » doit viser l'adresse du visiteur.
- Si l'e-mail n'arrive pas : regarder les spams, vérifier que `site@` existe et que SPF/DKIM sont actifs. Si l'hébergeur refuse le paramètre d'expéditeur, mettre `'parametre_f' => false` dans `public/api/config.php`.

## À compléter avant le lancement

1. **Page Facebook** : renseigner `facebook` dans `SITE` (`build.mjs`).
2. **Logos partenaires** : remplacer les 6 emplacements « Logo partenaire » (fonction `partnersBand` dans `build.mjs`) par les logos fournis par ACCN, avec l'accord des compagnies.
3. **Photos** : les images actuelles viennent de l'ancien site. Des photos réelles du cabinet sont recommandées.
4. **Mentions légales et politique de confidentialité** : à ajouter quand ACCN aura fourni les informations (raison sociale, RCCM, NIU, agrément, traitement des données des formulaires).
5. **Référencement** : passer la variable `SITE_INDEXABLE` à `true` et renseigner `SITE_URL` le jour du lancement.

## Versions de présentation

Le site est aussi publié, sans envoi d'e-mails, sur Netlify (https://accn-assurances.netlify.app/) et GitHub Pages (https://sadnec.github.io/accn-site/). Elles ne sont pas indexées par Google.
