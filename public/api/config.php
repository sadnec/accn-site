<?php
// Réglages du script d'envoi des formulaires (envoi.php).
// Ce fichier ne contient aucun mot de passe : l'envoi passe par la fonction mail() de l'hébergeur.
return [
    // Adresse qui reçoit les demandes (devis, contact, questionnaires)
    'destinataire' => 'contact@accn-assurances.cm',

    // Adresse d'expédition : doit être une boîte existante du même domaine, créée dans cPanel,
    // sinon les messages risquent d'arriver en spam ou d'être refusés.
    'expediteur' => 'site@accn-assurances.cm',
    'nom_expediteur' => 'Site ACCN',

    // Copie cachée facultative (laisser vide si inutile)
    'copie_cachee' => '',

    // Pièces jointes (carte grise, passeport…)
    'taille_max_fichier' => 5 * 1024 * 1024,   // 5 Mo par fichier
    'taille_max_totale' => 10 * 1024 * 1024,   // 10 Mo par demande
    'types_autorises' => [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/heic' => 'heic',
        'image/heif' => 'heif',
        'application/pdf' => 'pdf',
    ],

    // Anti-abus : nombre d'envois par adresse IP sur une période, et durée minimale de remplissage
    'limite_envois' => 5,
    'periode_secondes' => 600,
    'duree_minimale_ms' => 3000,

    // Passe l'expéditeur à sendmail (-f). À mettre à false si l'hébergeur le refuse.
    'parametre_f' => true,
];
