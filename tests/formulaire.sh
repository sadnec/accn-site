#!/usr/bin/env bash
# Tests du script d'envoi des formulaires (public/api/envoi.php).
# Lance le serveur PHP intégré ; les e-mails sont écrits dans un fichier au lieu d'être envoyés.
# Utilisation : bash tests/formulaire.sh   (PHP 8 et curl nécessaires)
set -u

TMP=$(mktemp -d)
MAILS="$TMP/mails.eml"
cat > "$TMP/sendmail" <<EOF
#!/bin/sh
cat >> "$MAILS"
printf '\n=====FIN=====\n' >> "$MAILS"
EOF
chmod +x "$TMP/sendmail"
: > "$MAILS"

PORT=8765
URL="http://127.0.0.1:$PORT/api/envoi.php"
# Mêmes limites d'envoi que public/api/.user.ini
php -d sendmail_path="$TMP/sendmail" -d sys_temp_dir="$TMP" -d upload_max_filesize=10M -d post_max_size=12M \
  -S 127.0.0.1:$PORT -t public > "$TMP/server.log" 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null; rm -rf "$TMP"' EXIT
sleep 1

ECHECS=0
nb_mails() { grep -c '^=====FIN=====$' "$MAILS"; }
verifier() { # verifier "description" condition...
  local desc=$1; shift
  if "$@"; then echo "OK    $desc"; else echo "ÉCHEC $desc"; ECHECS=$((ECHECS + 1)); fi
}
code() { curl -s -o "$TMP/rep.json" -w '%{http_code}' "$@"; }
VALIDE=(-F nom="Jean Test" -F telephone="+237 677 00 00 00" -F email="jean@example.com" -F _duree=5000 -F "_subject=Demande de devis – site ACCN" -F "_resume=Besoin : Assurance Automobile")

c=$(code -X GET "$URL");                                          verifier "GET refusé (405)" [ "$c" = 405 ]
c=$(code -F telephone="+237 677 00 00 00" -F _duree=5000 "$URL"); verifier "nom manquant refusé (422)" [ "$c" = 422 ]
c=$(code -F nom=Jean -F telephone=abc -F _duree=5000 "$URL");      verifier "téléphone invalide refusé (422)" [ "$c" = 422 ]
c=$(code -F nom=Jean -F telephone="+237 677 00 00 00" -F email=pasunemail -F _duree=5000 "$URL")
verifier "e-mail invalide refusé (422)" [ "$c" = 422 ]
c=$(code -H "Origin: https://autre-site.example" "${VALIDE[@]}" "$URL"); verifier "autre origine refusée (403)" [ "$c" = 403 ]

c=$(code "${VALIDE[@]}" "$URL")
verifier "demande valide acceptée (200)" [ "$c" = 200 ]
verifier "réponse JSON ok:true" grep -q '"ok":true' "$TMP/rep.json"
verifier "un e-mail envoyé" [ "$(nb_mails)" = 1 ]
verifier "e-mail adressé au cabinet" grep -q '^To: contact@accn-assurances.cm' "$MAILS"
verifier "Reply-To vers le visiteur" grep -q '^Reply-To: .*<jean@example.com>' "$MAILS"
verifier "objet encodé en UTF-8" grep -q '^Subject: =?UTF-8?B?' "$MAILS"
verifier "résumé présent dans le corps" grep -q "$(printf 'Besoin : Assurance Automobile' | base64 | cut -c1-20)" "$MAILS"

c=$(code -F site_web="http://spam.example" "${VALIDE[@]}" "$URL")
verifier "champ piège : réponse 200 sans envoi" [ "$c" = 200 -a "$(nb_mails)" = 1 ]
c=$(code -F nom=Bot -F telephone="+237 600 00 00 00" -F _duree=300 "$URL")
verifier "envoi trop rapide : réponse 200 sans envoi" [ "$c" = 200 -a "$(nb_mails)" = 1 ]

printf '%%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%%%EOF\n' > "$TMP/carte.pdf"
c=$(code "${VALIDE[@]}" -F "carte_grise=@$TMP/carte.pdf;type=application/pdf" "$URL")
verifier "PDF joint accepté (200)" [ "$c" = 200 ]
verifier "pièce jointe dans l'e-mail" grep -q 'Content-Disposition: attachment; filename="carte_grise-carte.pdf"' "$MAILS"

printf 'texte' > "$TMP/note.txt"
c=$(code "${VALIDE[@]}" -F "carte_grise=@$TMP/note.txt;type=application/pdf" "$URL")
verifier "fichier texte déguisé refusé (422)" [ "$c" = 422 ]
head -c $((6 * 1024 * 1024)) /dev/zero | tr '\0' 'a' > "$TMP/gros.pdf"
c=$(code "${VALIDE[@]}" -F "passeport=@$TMP/gros.pdf" "$URL")
verifier "fichier de plus de 5 Mo refusé (413)" [ "$c" = 413 ]

c=$(code -F nom="Jean" -F $'telephone=+237 677 00 00 00' -F $'email=jean@example.com\r\nBcc: victime@example.com' -F _duree=5000 "$URL")
verifier "injection d'en-tête via l'e-mail refusée" [ "$c" = 422 ]

# 2 envois réussis jusqu'ici : 3 de plus atteignent la limite de 5, le suivant est bloqué
for i in 1 2 3; do code "${VALIDE[@]}" "$URL" > /dev/null; done
c=$(code "${VALIDE[@]}" "$URL"); verifier "limite d'envois par IP (429)" [ "$c" = 429 ]

if [ "$ECHECS" -gt 0 ]; then
  echo "---- journal du serveur PHP"; cat "$TMP/server.log"
  echo "$ECHECS test(s) en échec"; exit 1
fi
echo "Tous les tests sont passés."
