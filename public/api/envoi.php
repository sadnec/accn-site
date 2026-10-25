<?php
/**
 * Réception des formulaires du site ACCN (devis, contact, questionnaires détaillés).
 * Envoie chaque demande par e-mail au cabinet, pièces jointes comprises.
 * Réponse JSON : {"ok": true} ou {"ok": false, "erreur": "..."}.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$config = require __DIR__ . '/config.php';

function repondre(int $code, array $donnees): void
{
    http_response_code($code);
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

function erreur(int $code, string $message): void
{
    repondre($code, ['ok' => false, 'erreur' => $message]);
}

/** Retire les caractères de contrôle (sauf retours à la ligne et tabulations). */
function nettoyer(string $texte, int $longueurMax): string
{
    $texte = str_replace("\r\n", "\n", $texte);
    $texte = preg_replace('/[^\P{C}\n\t]/u', '', $texte) ?? '';
    return mb_substr(trim($texte), 0, $longueurMax);
}

/** Valeur sûre pour un en-tête d'e-mail (aucun saut de ligne possible). */
function enTete(string $valeur): string
{
    return trim(preg_replace('/[\r\n\t]+/', ' ', $valeur) ?? '');
}

function encoderMime(string $texte): string
{
    return '=?UTF-8?B?' . base64_encode($texte) . '?=';
}

// ---------------------------------------------------------------------------
// 1. Contrôles de la requête
// ---------------------------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    erreur(405, 'Méthode non autorisée.');
}

// Les formulaires ne peuvent être envoyés que depuis le site lui-même
$origine = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origine !== '') {
    $hoteOrigine = strtolower((string) parse_url($origine, PHP_URL_HOST));
    $hoteSite = strtolower((string) parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST));
    if ($hoteOrigine === '' || $hoteOrigine !== $hoteSite) {
        erreur(403, 'Origine non autorisée.');
    }
}

// Requête trop volumineuse : PHP vide alors $_POST et $_FILES
$longueur = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($longueur > 0 && empty($_POST) && empty($_FILES)) {
    erreur(413, 'Les fichiers envoyés sont trop volumineux.');
}

// Champ piège invisible : rempli uniquement par les robots. On fait semblant d'accepter.
if (trim((string) ($_POST['site_web'] ?? '')) !== '') {
    repondre(200, ['ok' => true]);
}

// Formulaire rempli trop vite : très probablement un robot
$duree = (int) ($_POST['_duree'] ?? 0);
if ($duree > 0 && $duree < $config['duree_minimale_ms']) {
    repondre(200, ['ok' => true]);
}

// ---------------------------------------------------------------------------
// 2. Limite d'envois par adresse IP
// ---------------------------------------------------------------------------
$ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
$fichierLimite = sys_get_temp_dir() . '/accn-envois-' . sha1($ip) . '.json';
$maintenant = time();
$envois = [];
if (is_file($fichierLimite)) {
    $envois = json_decode((string) file_get_contents($fichierLimite), true) ?: [];
}
$envois = array_values(array_filter($envois, fn ($t) => is_int($t) && $t > $maintenant - $config['periode_secondes']));
if (count($envois) >= $config['limite_envois']) {
    erreur(429, 'Trop de demandes envoyées. Merci de réessayer dans quelques minutes ou de nous écrire sur WhatsApp.');
}

// ---------------------------------------------------------------------------
// 3. Champs du formulaire
// ---------------------------------------------------------------------------
$nom = nettoyer((string) ($_POST['nom'] ?? ''), 200);
$telephone = nettoyer((string) ($_POST['telephone'] ?? ''), 30);
$email = nettoyer((string) ($_POST['email'] ?? ''), 200);

if ($nom === '' || $telephone === '') {
    erreur(422, 'Merci d’indiquer votre nom et votre numéro de téléphone.');
}
if (!preg_match('/^[0-9+ .()\-]{8,20}$/', $telephone)) {
    erreur(422, 'Le numéro de téléphone ne semble pas valide.');
}
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    erreur(422, 'L’adresse e-mail ne semble pas valide.');
}
if (count($_POST) > 150) {
    erreur(422, 'Formulaire invalide.');
}

$sujet = nettoyer((string) ($_POST['_subject'] ?? 'Demande depuis le site ACCN'), 150);
$page = nettoyer((string) ($_POST['_page'] ?? ''), 200);

// Le site envoie un résumé lisible (questions et réponses, par section).
// À défaut, on reconstitue la liste des champs.
$resume = nettoyer((string) ($_POST['_resume'] ?? ''), 20000);
if ($resume === '') {
    $lignes = [];
    foreach ($_POST as $cle => $valeur) {
        if (str_starts_with((string) $cle, '_') || $cle === 'site_web') {
            continue;
        }
        $valeur = is_array($valeur) ? implode(', ', array_map('strval', $valeur)) : (string) $valeur;
        $valeur = nettoyer($valeur, 5000);
        if ($valeur !== '') {
            $lignes[] = nettoyer((string) $cle, 60) . ' : ' . $valeur;
        }
    }
    $resume = implode("\n", $lignes);
}

// ---------------------------------------------------------------------------
// 4. Pièces jointes
// ---------------------------------------------------------------------------
$pieces = [];
$total = 0;
$finfo = new finfo(FILEINFO_MIME_TYPE);

foreach ($_FILES as $champ => $fichier) {
    // Normalise les champs simples et multiples
    $noms = (array) $fichier['name'];
    foreach (array_keys($noms) as $i) {
        $erreurEnvoi = (int) ((array) $fichier['error'])[$i];
        if ($erreurEnvoi === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($erreurEnvoi === UPLOAD_ERR_INI_SIZE || $erreurEnvoi === UPLOAD_ERR_FORM_SIZE) {
            erreur(413, 'Un fichier dépasse la taille autorisée.');
        }
        $chemin = (string) ((array) $fichier['tmp_name'])[$i];
        if ($erreurEnvoi !== UPLOAD_ERR_OK || !is_uploaded_file($chemin)) {
            erreur(422, 'Un fichier n’a pas pu être reçu. Merci de réessayer.');
        }
        $taille = (int) filesize($chemin);
        if ($taille > $config['taille_max_fichier']) {
            erreur(413, 'Chaque fichier doit faire moins de ' . intdiv($config['taille_max_fichier'], 1048576) . ' Mo.');
        }
        $total += $taille;
        if ($total > $config['taille_max_totale']) {
            erreur(413, 'L’ensemble des fichiers dépasse ' . intdiv($config['taille_max_totale'], 1048576) . ' Mo.');
        }
        $type = (string) $finfo->file($chemin);
        if (!isset($config['types_autorises'][$type])) {
            erreur(422, 'Format de fichier non accepté. Formats autorisés : photo (JPG, PNG, WEBP, HEIC) ou PDF.');
        }
        $base = pathinfo((string) $noms[$i], PATHINFO_FILENAME);
        $base = preg_replace('/[^A-Za-z0-9._-]+/', '_', $base) ?: 'document';
        $pieces[] = [
            'nom' => mb_substr(nettoyer((string) $champ, 40) . '-' . $base, 0, 80) . '.' . $config['types_autorises'][$type],
            'type' => $type,
            'contenu' => (string) file_get_contents($chemin),
        ];
    }
}

// ---------------------------------------------------------------------------
// 5. Composition et envoi de l'e-mail
// ---------------------------------------------------------------------------
$texte = $resume
    . "\n\n--\n"
    . 'Envoyé depuis le site ACCN le ' . date('d/m/Y à H:i')
    . ($page !== '' ? "\nPage : " . $page : '')
    . ($pieces ? "\nPièces jointes : " . count($pieces) : '')
    . ($email !== '' ? "\nRépondre directement à cet e-mail écrit à " . $email . '.' : '');

$frontiere = 'accn_' . bin2hex(random_bytes(12));
$entetes = [
    'From: ' . enTete($config['nom_expediteur']) . ' <' . enTete($config['expediteur']) . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' . $frontiere . '"',
    'X-Mailer: Site ACCN',
];
if ($email !== '') {
    $entetes[] = 'Reply-To: ' . encoderMime(enTete($nom)) . ' <' . enTete($email) . '>';
}
if ($config['copie_cachee'] !== '') {
    $entetes[] = 'Bcc: ' . enTete($config['copie_cachee']);
}

$corps = '--' . $frontiere . "\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n"
    . "Content-Transfer-Encoding: base64\r\n\r\n"
    . chunk_split(base64_encode(str_replace("\n", "\r\n", $texte)));

foreach ($pieces as $piece) {
    $corps .= '--' . $frontiere . "\r\n"
        . 'Content-Type: ' . $piece['type'] . '; name="' . $piece['nom'] . "\"\r\n"
        . "Content-Transfer-Encoding: base64\r\n"
        . 'Content-Disposition: attachment; filename="' . $piece['nom'] . "\"\r\n\r\n"
        . chunk_split(base64_encode($piece['contenu']));
}
$corps .= '--' . $frontiere . "--\r\n";

$objet = encoderMime(enTete($sujet . ' – ' . $nom));
$parametres = $config['parametre_f'] ? '-f' . enTete($config['expediteur']) : '';

$envoye = mail(enTete($config['destinataire']), $objet, $corps, implode("\r\n", $entetes), $parametres);

if (!$envoye) {
    error_log('ACCN : échec de mail() pour une demande depuis ' . $page);
    erreur(500, 'Le message n’a pas pu être envoyé. Merci de réessayer ou de nous écrire sur WhatsApp.');
}

$envois[] = $maintenant;
@file_put_contents($fichierLimite, json_encode($envois), LOCK_EX);

repondre(200, ['ok' => true]);
