# Nouveau site ACCN

Site statique (HTML, CSS, JavaScript sans dépendance), construit à partir des maquettes Stitch et du mail d'instruction.

## Dossiers

| Élément | Rôle |
|---|---|
| `public/` | **Le site à mettre en ligne** (à copier tel quel chez l'hébergeur). |
| `build.mjs` | Génère les pages HTML de `public/` : textes, offres, FAQ, coordonnées. |
| `public/assets/css/style.css` | Styles (couleurs du logo : `#333399` et `#993300`). |
| `public/assets/js/main.js` | Menu, formulaire de devis en deux parcours, validation et envoi. |
| `serve.mjs` | Petit serveur pour voir le site en local. |

## Modifier un texte

Les textes sont dans `build.mjs` (coordonnées `SITE`, offres `OFFERS`, questions `FAQ`, questionnaires détaillés `QUESTIONNAIRES`). Après modification :

```bash
node build.mjs
```

Pour voir le site : `node serve.mjs`, puis ouvrir http://localhost:4173.

## À compléter avant la mise en ligne

1. **Envoi des formulaires** : dans `public/assets/js/main.js`, renseigner `FORM_ENDPOINT` avec l'adresse du service qui recevra les demandes (Formspree, Web3Forms, script PHP de l'hébergeur…). Tant qu'il est vide, chaque demande est préparée dans WhatsApp (+237 675 780 245) et le visiteur n'a plus qu'à l'envoyer.
2. **Page Facebook** : renseigner `facebook` dans `SITE` (`build.mjs`), puis relancer `node build.mjs`.
3. **Logos partenaires** : remplacer les 6 emplacements « Logo partenaire » (fonction `partnersBand` dans `build.mjs`) par les logos fournis par ACCN, avec l'accord des compagnies.
4. **Photos** : les images actuelles viennent de l'ancien site. Des photos réelles du cabinet sont recommandées.
5. **Mentions légales et politique de confidentialité** : à ajouter quand ACCN aura fourni les informations (raison sociale, RCCM, NIU, agrément).
6. **Sitemap** : à générer une fois le nom de domaine choisi.
7. **Référencement** : la version de présentation demande à Google de ne pas l'indexer. Le jour du lancement, passer `indexable` à `true` dans `SITE` (`build.mjs`).

## Version de présentation en ligne

Chaque envoi sur la branche `main` republie automatiquement le site sur GitHub Pages : https://sadnec.github.io/accn-site/
