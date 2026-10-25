// Génère les pages HTML du site ACCN dans ./public
// Utilisation : node build.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "public");

/* ==========================================================================
   Coordonnées du cabinet (à modifier ici uniquement)
   ========================================================================== */
const SITE = {
  name: "ACCN",
  phone: "+237 675 780 245",
  phoneHref: "+237675780245",
  whatsapp: "https://wa.me/237675780245",
  email: "contact@accn-assurances.cm",
  // Adresse de la page Facebook officielle (à renseigner)
  facebook: "",
  address: ["1er étage, Porte AA 110", "Rue Boué Lapeyre (Rue Mermoz)", "Akwa, Douala, Cameroun"],
  hours: "Du lundi au vendredi de 8h00 à 17h30",
  hoursShort: "Lun – Ven : 8h00 – 17h30",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rue+Bou%C3%A9+Lapeyre+Akwa+Douala+Cameroun",
  // Version de présentation : demande aux moteurs de recherche de ne pas indexer le site.
  // Passer à true le jour de la mise en ligne sur le domaine définitif.
  indexable: false,
};

/* ==========================================================================
   Icônes (SVG en ligne, style trait)
   ========================================================================== */
const ICONS = {
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  health: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  family: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  support: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
};
const BRANDS = {
  whatsapp: '<path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>',
  facebook: '<path fill="currentColor" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>',
};
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const brand = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${BRANDS[name]}</svg>`;

/* ==========================================================================
   Offres (textes du mail d'instruction)
   ========================================================================== */
const OFFERS = [
  {
    slug: "assurance-automobile",
    segment: "Particulier",
    name: "Assurance Automobile",
    menu: "Assurance Automobile",
    icon: "car",
    hook: "Roulez l’esprit tranquille, nous gérons votre sécurité.",
    detail: "Des garanties complètes et une assistance rapide en cas de sinistre à Douala et sur toutes vos routes.",
    description: [
      "L’assurance automobile est un produit essentiel pour protéger votre véhicule et vous-même en cas d’accident ou de dommages. En tant que courtier en assurance, nous comprenons l’importance de trouver la bonne couverture pour vos besoins spécifiques.",
      "Nous recherchons pour vous une protection complète en cas de sinistre, que ce soit pour des dommages matériels, des blessures corporelles ou des pertes financières.",
    ],
    covers: [
      ["Responsabilité civile", "Les dommages que vous causez à d’autres personnes ou à leurs biens avec votre véhicule."],
      ["Dommages au véhicule", "La réparation de votre véhicule après un accident, selon la formule choisie."],
      ["Protection des personnes", "La prise en charge des blessures corporelles du conducteur et des passagers."],
      ["Assistance en cas de sinistre", "Une assistance rapide à Douala et sur toutes vos routes."],
    ],
  },
  {
    slug: "sante-individuelle",
    segment: "Particulier",
    name: "Santé Individuelle",
    menu: "Santé Individuelle",
    icon: "health",
    hook: "Protégez votre santé et celle de vos proches, sans compromis.",
    detail: "Accédez aux meilleurs réseaux de soins et bénéficiez d'une prise en charge optimale de vos frais médicaux.",
    description: [
      "L’assurance santé individuelle est un produit essentiel pour protéger votre bien-être et celui de votre famille. Nous comprenons l’importance de garantir un accès à des soins de qualité sans compromettre votre budget.",
      "Nous vous proposons une couverture adaptée à vos besoins médicaux, que ce soit pour des consultations, des examens, des médicaments ou des hospitalisations.",
    ],
    covers: [
      ["Consultations", "Vos visites chez le médecin généraliste ou spécialiste."],
      ["Examens", "Analyses, imagerie et examens prescrits."],
      ["Médicaments", "La prise en charge de vos frais de pharmacie."],
      ["Hospitalisation", "Vos frais d’hospitalisation en cas de maladie ou de blessure."],
    ],
  },
  {
    slug: "assurance-voyage",
    segment: "Particulier",
    name: "Assurance Voyage",
    menu: "Assurance Voyage",
    icon: "plane",
    hook: "Explorez le monde en toute sérénité.",
    detail: "Une couverture médicale internationale et une assistance rapatriement conformes aux exigences de vos visas (Schengen, etc.).",
    description: [
      "L’assurance voyage protège les voyageurs contre les imprévus et les risques lors de leurs déplacements.",
      "Elle peut couvrir les frais médicaux à l’étranger, l’assistance rapatriement, la perte de bagages, l’annulation de voyage ou d’autres incidents pouvant survenir pendant le séjour.",
    ],
    covers: [
      ["Frais médicaux à l’étranger", "Une couverture médicale internationale pendant votre séjour."],
      ["Assistance rapatriement", "Votre retour organisé en cas de problème grave."],
      ["Conformité visa", "Des attestations conformes aux exigences de vos visas (Schengen, etc.)."],
      ["Bagages et annulation", "Selon la formule : perte de bagages et annulation de voyage."],
    ],
  },
  {
    slug: "assurance-vie-retraite",
    segment: "Particulier",
    name: "Assurance Vie / Retraite",
    menu: "Assurance Vie / Retraite",
    icon: "family",
    hook: "Anticipez l'avenir et sécurisez le futur de vos enfants.",
    detail: "Préparez votre retraite ou constituez un capital sécurisé pour financer les projets de votre famille.",
    description: [
      "L’assurance vie offre une protection financière à vos proches en cas de décès, mais vous permet aussi de préparer votre retraite.",
      "Elle garantit le versement d’un capital ou d’une rente aux bénéficiaires désignés, afin de les aider à faire face aux dépenses et aux charges financières.",
    ],
    covers: [
      ["Préparation de la retraite", "Constituez progressivement un complément de revenus pour plus tard."],
      ["Capital pour vos projets", "Financez les projets de votre famille, comme les études de vos enfants."],
      ["Protection de vos proches", "Le versement d’un capital ou d’une rente aux bénéficiaires désignés."],
    ],
  },
  {
    slug: "multirisque-professionnelle",
    segment: "Professionnel",
    name: "Multirisque Professionnelle & PME",
    menu: "Multirisque Professionnelle",
    icon: "building",
    hook: "Sécurisez votre activité face à tous les imprévus.",
    detail: "Incendie, vol, dégât des eaux ou bris de machine : protégez vos locaux, vos stocks et vos outils de travail.",
    description: [
      "La multirisque professionnelle regroupe dans un seul contrat les principales garanties dont votre entreprise a besoin pour protéger ses biens.",
      "Nous analysons votre activité et vos locaux pour vous proposer la couverture la plus adaptée, au meilleur prix du marché.",
    ],
    covers: [
      ["Incendie", "Vos locaux, vos stocks et vos équipements en cas d’incendie."],
      ["Vol", "Les biens de l’entreprise dérobés lors d’un vol."],
      ["Dégât des eaux", "Les dommages causés par l’eau à vos locaux et à vos marchandises."],
      ["Bris de machine", "Vos outils de travail et vos machines endommagés."],
    ],
  },
  {
    slug: "rc-chef-entreprise",
    segment: "Professionnel",
    name: "Responsabilité Civile (RC) Chef d'Entreprise",
    menu: "Responsabilité Civile Chef d’Entreprise",
    icon: "scale",
    hook: "Protégez votre entreprise contre les risques juridiques et financiers.",
    detail: "Couvrez les dommages causés à des tiers (clients, fournisseurs, employés) dans le cadre de vos activités professionnelles.",
    description: [
      "L’assurance Responsabilité Civile Chef d’Entreprise protège les dirigeants et les entreprises contre les risques liés à leur activité professionnelle.",
      "Elle intervient en cas de réclamation pour faute professionnelle, négligence ou erreur commise dans le cadre des fonctions de direction. Nous recherchons pour vous des garanties adaptées aux besoins spécifiques de votre entreprise.",
    ],
    covers: [
      ["Dommages causés aux tiers", "Clients, fournisseurs ou employés lésés dans le cadre de votre activité."],
      ["Faute et négligence", "Les réclamations liées à une faute, une négligence ou une erreur de direction."],
      ["Risques juridiques et financiers", "La protection de votre entreprise face aux conséquences d’une mise en cause."],
    ],
  },
  {
    slug: "flotte-automobile",
    segment: "Professionnel",
    name: "Flotte Automobile",
    menu: "Flotte Automobile",
    icon: "truck",
    hook: "Optimisez la gestion et la protection de vos véhicules professionnels.",
    detail: "Un contrat unique et simplifié pour couvrir l'ensemble de vos véhicules commerciaux, utilitaires ou de fonction.",
    description: [
      "L’assurance flotte automobile permet d’assurer tous les véhicules de votre entreprise avec un seul contrat, au lieu de gérer un contrat par véhicule.",
      "Nous comparons les offres du marché pour vous proposer des garanties adaptées à l’usage de chaque véhicule et une gestion simplifiée au quotidien.",
    ],
    covers: [
      ["Un contrat unique", "Tous vos véhicules regroupés pour une gestion simplifiée."],
      ["Véhicules commerciaux et utilitaires", "La protection des véhicules qui font tourner votre activité."],
      ["Véhicules de fonction", "Les véhicules mis à disposition de vos collaborateurs."],
      ["Accompagnement en cas de sinistre", "Nos équipes suivent vos déclarations jusqu’à l’indemnisation."],
    ],
  },
  {
    slug: "transport-marchandises",
    segment: "Professionnel",
    name: "Assurance Transport de Marchandises",
    menu: "Transport de Marchandises",
    icon: "package",
    hook: "Sécurisez vos flux commerciaux du port jusqu'à vos entrepôts.",
    detail: "Une couverture robuste pour vos marchandises importées ou exportées contre les risques de perte, vol ou avarie.",
    description: [
      "L’assurance transport de marchandises protège vos biens pendant leur acheminement, à l’import comme à l’export.",
      "Nous vous aidons à choisir la couverture adaptée à vos flux, du port jusqu’à vos entrepôts.",
    ],
    covers: [
      ["Perte", "Les marchandises perdues pendant le transport."],
      ["Vol", "Les marchandises dérobées au cours de l’acheminement."],
      ["Avarie", "Les marchandises endommagées pendant le transport."],
      ["Import et export", "Vos marchandises importées comme exportées."],
    ],
  },
];
const particuliers = OFFERS.filter((o) => o.segment === "Particulier");
const professionnels = OFFERS.filter((o) => o.segment === "Professionnel");
const offerUrl = (o) => `${o.slug}.html`;
const quoteUrl = (o) =>
  `devis.html?profil=${encodeURIComponent(o.segment)}&produit=${encodeURIComponent(o.menu)}`;

/* ==========================================================================
   Questionnaires détaillés (repris de l'ancien site, libellés corrigés)
   Types : text, tel, email, date, number, textarea, file, select, radio, checkbox, row
   showIf : [nom du champ, valeur] → le champ n'apparaît que pour cette réponse
   ========================================================================== */
const Q = {
  nom: { name: "nom", label: "Nom et prénom", required: true, autocomplete: "name" },
  raison: { name: "nom", label: "Nom ou raison sociale", required: true, autocomplete: "organization" },
  tel: { name: "telephone", label: "Téléphone / WhatsApp", type: "tel", required: true, autocomplete: "tel" },
  email: { name: "email", label: "Adresse e-mail", type: "email", autocomplete: "email" },
  niu: { name: "niu", label: "NIU (Numéro d’Identifiant Unique)" },
  naissance: { name: "date_naissance", label: "Date de naissance", type: "date" },
};
const OUI_NON = ["Oui", "Non"];
const TRANCHES = ["1 500 000 à 3 500 000 FCFA", "3 500 001 à 6 000 000 FCFA", "6 000 001 à 15 000 000 FCFA", "Plus de 15 000 000 FCFA"];
const row = (...fields) => ({ type: "row", fields });

const QUESTIONNAIRES = {
  "assurance-automobile": [
    { title: "Vos coordonnées", fields: [row(Q.nom, Q.tel), row(Q.email, Q.niu)] },
    {
      title: "Votre véhicule",
      fields: [{ name: "carte_grise", label: "Photo de votre carte grise", type: "file", help: "Photo ou PDF, 5 Mo maximum." }],
    },
    {
      title: "Garanties sollicitées",
      fields: [
        {
          name: "garanties",
          label: "Garanties souhaitées",
          help: "Cochez une ou plusieurs garanties.",
          type: "checkbox",
          cols: 2,
          options: ["Responsabilité civile", "Tous risques", "Bris de glace", "Vol", "Incendie", "Assistance", "Individuelle chauffeur"],
        },
      ],
    },
  ],
  "sante-individuelle": [
    { title: "Vos coordonnées", fields: [row(Q.nom, Q.tel), row(Q.email, Q.naissance), Q.niu] },
    {
      title: "Personnes à charge",
      fields: [
        { name: "enfants", label: "Avez-vous des enfants à charge ?", type: "radio", inline: true, options: OUI_NON },
        { name: "nombre_enfants", label: "Combien ?", type: "number", min: 1, showIf: ["enfants", "Oui"] },
      ],
    },
    {
      title: "Couverture souhaitée",
      fields: [
        { name: "couverture", label: "Couverture", type: "radio", inline: true, options: ["Nationale", "Internationale"] },
        { name: "taux", label: "Taux de couverture", type: "radio", inline: true, options: ["80 %", "100 %"] },
      ],
    },
    {
      title: "Votre santé",
      fields: [
        { name: "malade", label: "Tombez-vous régulièrement malade ?", type: "radio", inline: true, options: OUI_NON },
        { name: "ophtalmo", label: "Allez-vous régulièrement chez l’ophtalmologue ?", type: "radio", inline: true, options: OUI_NON },
      ],
    },
  ],
  "assurance-voyage": [
    { title: "Vos coordonnées", fields: [row(Q.nom, Q.tel), row(Q.email, Q.niu)] },
    {
      title: "Votre voyage",
      fields: [
        row(
          { name: "date_depart", label: "Date de départ du voyage", type: "date", required: true },
          { name: "duree", label: "Durée du voyage", required: true, placeholder: "Ex. : 15 jours" }
        ),
        { name: "zone", label: "Zone de destination", type: "select", required: true, options: ["Schengen", "Europe", "Afrique", "Monde entier"] },
        { name: "passeport", label: "Scan de votre passeport", type: "file", help: "Photo ou PDF, 5 Mo maximum." },
      ],
    },
  ],
  "assurance-vie-retraite": [
    { title: "Vos coordonnées", fields: [row(Q.nom, Q.tel), row(Q.email, Q.naissance), Q.niu] },
    {
      title: "Votre projet",
      fields: [
        {
          name: "objectifs",
          label: "Pourquoi voulez-vous une assurance vie ?",
          type: "checkbox",
          options: [
            "Épargne",
            "Avenir de mes enfants",
            "Assurer ma retraite",
            "Assurer mes frais funéraires en cas de décès",
            "Assurer les frais funéraires des membres de ma famille en cas de décès",
            "Percevoir des rentes à la fin de mon contrat",
          ],
        },
        { name: "garantie_deces", label: "Souhaitez-vous une garantie décès ?", type: "radio", inline: true, options: OUI_NON },
        { name: "revenu", label: "Revenu annuel", type: "radio", cols: 2, options: TRANCHES },
      ],
    },
  ],
  "rc-chef-entreprise": [
    { title: "Votre entreprise", fields: [row(Q.raison, Q.tel), Q.email, { name: "activites", label: "Activités", type: "textarea" }] },
    {
      title: "Chiffres clés",
      fields: [
        { name: "chiffre_affaires", label: "Chiffre d’affaires", type: "radio", cols: 2, options: TRANCHES },
        row(
          { name: "employes", label: "Nombre d’employés", type: "number", min: 0 },
          { name: "masse_salariale", label: "Masse salariale (FCFA)", type: "number", min: 0 }
        ),
      ],
    },
  ],
  "flotte-automobile": [
    { title: "Votre entreprise", fields: [row(Q.raison, Q.tel), Q.email, { name: "activites", label: "Activités", type: "textarea" }] },
    {
      title: "Votre flotte",
      fields: [
        row(
          { name: "nombre_vehicules", label: "Nombre de véhicules", type: "number", min: 2 },
          { name: "employes", label: "Nombre d’employés", type: "number", min: 0 }
        ),
        { name: "types_vehicules", label: "Types de véhicules", type: "textarea", placeholder: "Ex. : 3 utilitaires, 2 véhicules de fonction…" },
        { name: "masse_salariale", label: "Masse salariale (FCFA)", type: "number", min: 0 },
      ],
    },
  ],
  "transport-marchandises": [
    {
      title: "A. Souscripteur",
      fields: [
        row({ name: "nom", label: "Nom ou raison sociale du souscripteur", required: true, autocomplete: "organization" }, Q.tel),
        row({ name: "assure", label: "Assuré (si différent du souscripteur)" }, Q.email),
        row(Q.niu, { name: "rccm", label: "N° du registre du commerce (RCCM)" }),
      ],
    },
    { title: "B. Nature des marchandises", fields: [{ name: "nature", label: "Nature des marchandises", type: "textarea", required: true }] },
    {
      title: "C. Risques spéciaux",
      fields: [{ name: "risques", label: "Risques spéciaux auxquels les marchandises peuvent être exposées", type: "textarea", help: "Ex. : oxydation, déformation, coulage…" }],
    },
    {
      title: "D. Conditionnement",
      fields: [
        {
          name: "conditionnement",
          label: "Conditionnement des marchandises",
          type: "radio",
          cols: 2,
          options: ["Vrac", "Conventionnel", "Conteneur de groupage", "Conteneur complet de bout en bout", "Conteneur réfrigéré"],
        },
      ],
    },
    {
      title: "E. Poids et valeurs assurées",
      fields: [
        row({ name: "poids", label: "Poids (kg)", type: "number", min: 0 }, { name: "valeur_facture", label: "Valeur facture (FCFA)", type: "number", min: 0 }),
        row(
          { name: "valeur_expedition", label: "Valeur assurée par expédition – un voyage (FCFA)", type: "number", min: 0 },
          { name: "valeur_maximale", label: "Valeur assurée maximale – plusieurs voyages (FCFA)", type: "number", min: 0 }
        ),
      ],
    },
    {
      title: "F. Type de police",
      fields: [{ name: "police", label: "Type de police", type: "radio", cols: 2, options: ["Police au voyage", "Police d’abonnement", "Police tiers chargeurs", "Police annuelle"] }],
    },
    {
      title: "G. Garanties sollicitées",
      fields: [
        { name: "garantie_maritime", label: "Voie maritime", type: "radio", inline: true, options: ["FAP sauf", "Tous risques", "Autre"] },
        { name: "garantie_maritime_autre", label: "Précisez (voie maritime)", showIf: ["garantie_maritime", "Autre"] },
        { name: "garantie_aerienne", label: "Voie aérienne", type: "radio", inline: true, options: ["Événements majeurs", "Tous risques", "Autre"] },
        { name: "garantie_aerienne_autre", label: "Précisez (voie aérienne)", showIf: ["garantie_aerienne", "Autre"] },
        { name: "garantie_terrestre", label: "Voie terrestre", type: "radio", inline: true, options: ["Événements majeurs", "Tous risques"] },
      ],
    },
    {
      title: "H. Trajet",
      fields: [
        row({ name: "depart", label: "Départ (ville, pays)" }, { name: "lieu_embarquement", label: "Lieu d’embarquement ou de chargement", placeholder: "Magasin, port, aéroport…" }),
        row({ name: "arrivee", label: "Arrivée (ville, pays)" }, { name: "lieu_debarquement", label: "Lieu de débarquement", placeholder: "Magasin, port, aéroport…" }),
        row({ name: "date_depart", label: "Date de départ", type: "date" }, { name: "date_arrivee", label: "Date d’arrivée", type: "date" }),
        { name: "voyage_complementaire", label: "Voyage complémentaire : moyen de transport", help: "À remplir seulement s’il y a un voyage complémentaire." },
      ],
    },
    { title: "I. Transporteur", fields: [{ name: "transporteur", label: "Nom de la société de transport ou de la compagnie" }] },
    {
      title: "J. Estimation annuelle du volume de voyages",
      fields: [
        row({ name: "maritime_valeur", label: "Maritime – valeur annuelle (FCFA)", type: "number", min: 0 }, { name: "maritime_voyages", label: "Maritime – nombre de voyages par an", type: "number", min: 0 }),
        row({ name: "aerienne_valeur", label: "Aérienne – valeur annuelle (FCFA)", type: "number", min: 0 }, { name: "aerienne_voyages", label: "Aérienne – nombre de voyages par an", type: "number", min: 0 }),
        row({ name: "terrestre_valeur", label: "Terrestre – valeur annuelle (FCFA)", type: "number", min: 0 }, { name: "terrestre_voyages", label: "Terrestre – nombre de voyages par an", type: "number", min: 0 }),
      ],
    },
    {
      title: "K. Antécédents",
      fields: [
        { name: "deja_assure", label: "Avez-vous déjà été assuré en transport des facultés aériennes ?", type: "radio", inline: true, options: OUI_NON },
        { name: "ancienne_compagnie", label: "Si oui, dans quelle compagnie ?", showIf: ["deja_assure", "Oui"] },
        { name: "sinistres", label: "Avez-vous déjà eu des sinistres ?", type: "radio", inline: true, options: OUI_NON },
        { name: "sinistres_detail", label: "Si oui, lesquels ?", type: "textarea", showIf: ["sinistres", "Oui"] },
      ],
    },
  ],
};

/* ==========================================================================
   FAQ (textes du mail, coquilles corrigées)
   ========================================================================== */
const FAQ = [
  [
    "Est-ce que cela coûte plus cher de passer par ACCN ?",
    "Non, absolument pas. Le prix de votre contrat reste strictement le même. Notre cabinet se rémunère directement via des commissions versées par les compagnies d’assurances sur les contrats que nous gérons, conformément à la réglementation. Vous bénéficiez de notre expertise sans surcoût.",
  ],
  [
    "Quelle est la différence entre un agent et un courtier ?",
    "Un agent d’assurance travaille pour une seule compagnie et ne vend que ses produits. En tant que courtier, ACCN est totalement indépendant : nous représentons le client. Nous trions et comparons les offres de plusieurs assureurs du marché pour vous proposer la meilleure couverture au meilleur prix.",
  ],
  [
    "Que se passe-t-il en cas de sinistre ?",
    "Vous ne gérez pas vos démarches seul face à la compagnie d’assurance. Nos équipes prennent en charge votre dossier de sinistre de A à Z. Nous déclarons le sinistre, suivons l’expertise et défendons fermement vos intérêts pour que vous obteniez votre indemnisation le plus rapidement possible.",
  ],
  [
    "Quel est le délai pour obtenir un devis ?",
    "Il vous suffit de remplir notre formulaire en ligne ou de nous contacter directement par téléphone ou WhatsApp. Pour les demandes courantes (Auto, Voyage, Santé individuelle), nos conseillers vous formulent une proposition comparative en moins de 24h ouvrées.",
  ],
  [
    "Le cabinet ACCN est-il agréé ?",
    "Oui. Le cabinet ACCN est une structure de courtage réglementée, enregistrée et agréée par les autorités compétentes, en parfaite conformité avec le code des assurances de la zone CIMA (Conférence Interafricaine des Marchés d’Assurances).",
  ],
];

const ADVANTAGES = [
  ["shield", "Indépendance totale", "Nous choisissons l’offre la plus avantageuse pour vous, sans privilégier une compagnie plutôt qu’une autre."],
  ["clock", "Gain de temps et d’argent", "Nous comparons le marché en un temps record pour vous éviter des démarches fastidieuses."],
  ["support", "Accompagnement de bout en bout", "De la signature du contrat jusqu’au règlement rapide de vos sinistres, nos équipes restent à vos côtés."],
];

const ABOUT_TEXT =
  "Basé au cœur du quartier des affaires à Akwa, Douala, le cabinet ACCN est une société de conseil et de courtage en assurances dédiée aux particuliers et aux professionnels. Parce que le monde de l’assurance est complexe, notre rôle ne se limite pas à vous vendre un contrat. En tant que mandataire exclusif de nos clients auprès des plus grandes compagnies d’assurances de la place, nous analysons vos risques, négocions les meilleurs tarifs du marché et concevons des garanties sur-mesure adaptées à vos réalités.";

/* ==========================================================================
   Composants
   ========================================================================== */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Typographie française : espace insécable avant ? ! : ;
const fr = (s) => String(s).replace(/ ([?!:;])/g, "&nbsp;$1");

function navItem(href, label, active) {
  return `<a class="nav-link" href="${href}"${active === href ? ' aria-current="page"' : ""}>${label}</a>`;
}

function subNav(id, href, label, items, active) {
  const isActive = active === href || items.some((o) => offerUrl(o) === active);
  return `<li class="has-sub">
          <div class="nav-item">
            <a class="nav-link" href="${href}"${isActive ? ' aria-current="page"' : ""}>${label}</a>
            <button class="sub-toggle" type="button" aria-expanded="false" aria-controls="${id}" aria-label="Afficher les offres ${label}">${icon("chevron")}</button>
          </div>
          <ul class="submenu" id="${id}">
            ${items.map((o) => `<li><a href="${offerUrl(o)}"${active === offerUrl(o) ? ' aria-current="page"' : ""}>${o.menu}</a></li>`).join("\n            ")}
          </ul>
        </li>`;
}

function header(active) {
  return `<a class="skip-link" href="#contenu">Aller au contenu</a>
  <div class="topbar">
    <div class="container">
      <ul class="topbar-list">
        <li>${icon("phone")}<a href="tel:${SITE.phoneHref}">${SITE.phone}</a></li>
        <li>${icon("mail")}<a href="mailto:${SITE.email}">${SITE.email}</a></li>
      </ul>
      <ul class="topbar-list">
        <li>${icon("clock")}${SITE.hoursShort}</li>
        <li>${icon("pin")}Akwa, Douala</li>
      </ul>
    </div>
  </div>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="index.html"><img src="assets/img/logo-accn.png" alt="ACCN – Courtier en Assurance, retour à l’accueil" width="464" height="304"></a>
      <nav class="main-nav" id="menu-principal" aria-label="Navigation principale">
        <button class="nav-close" type="button" aria-label="Fermer le menu">${icon("close")}</button>
        <ul class="nav-list">
          <li>${navItem("index.html", "Accueil", active)}</li>
          ${subNav("sous-menu-particuliers", "particuliers.html", "Particuliers", particuliers, active)}
          ${subNav("sous-menu-professionnels", "professionnels.html", "Professionnels", professionnels, active)}
          <li>${navItem("qui-sommes-nous.html", "Qui sommes-nous ?", active)}</li>
          <li>${navItem("faq.html", "FAQ", active)}</li>
          <li>${navItem("contact.html", "Contact", active)}</li>
        </ul>
        <div class="nav-mobile-cta"><a class="btn btn-cta btn-block" href="devis.html">Demander un devis gratuit</a></div>
      </nav>
      <a class="btn btn-cta header-cta" href="devis.html">Demander un devis gratuit</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu-principal" aria-label="Ouvrir le menu">${icon("menu")}</button>
    </div>
  </header>
  <div class="nav-overlay" aria-hidden="true"></div>`;
}

function footer(quoteHref = "devis.html") {
  const fb = SITE.facebook || "#";
  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a class="footer-logo" href="index.html"><img src="assets/img/logo-accn.png" alt="ACCN – Courtier en Assurance" width="464" height="304" loading="lazy"></a>
        <p>Cabinet de conseil et de courtage en assurances au service des particuliers et des professionnels, à Akwa, Douala.</p>
        <div class="footer-social">
          <a href="${fb}" target="_blank" rel="noopener" aria-label="ACCN sur Facebook">${brand("facebook")}</a>
          <a href="${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="Écrire à ACCN sur WhatsApp">${brand("whatsapp")}</a>
        </div>
      </div>
      <div>
        <h2>Particuliers</h2>
        <ul class="footer-links">
          ${particuliers.map((o) => `<li><a href="${offerUrl(o)}">${o.menu}</a></li>`).join("\n          ")}
        </ul>
      </div>
      <div>
        <h2>Professionnels</h2>
        <ul class="footer-links">
          ${professionnels.map((o) => `<li><a href="${offerUrl(o)}">${o.menu}</a></li>`).join("\n          ")}
        </ul>
      </div>
      <div>
        <h2>Nous trouver</h2>
        <ul class="footer-coords">
          <li>${icon("pin")}<span>${SITE.address.join("<br>")}</span></li>
          <li>${icon("phone")}<a href="tel:${SITE.phoneHref}">${SITE.phone}</a></li>
          <li>${icon("mail")}<a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li>${icon("clock")}<span>${SITE.hours}</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <span>© ${new Date().getFullYear()} ACCN – Courtier en Assurance. Tous droits réservés.</span>
        <span><a href="qui-sommes-nous.html">Qui sommes-nous ?</a> · <a href="faq.html">FAQ</a> · <a href="contact.html">Contact</a></span>
      </div>
    </div>
  </footer>

  <div class="floating">
    <a class="fab fab-fb" href="${fb}" target="_blank" rel="noopener" aria-label="Notre page Facebook">${brand("facebook")}</a>
    <a class="fab fab-wa" href="${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="Discuter avec un conseiller sur WhatsApp">${brand("whatsapp")}</a>
  </div>
  <div class="mobile-cta"><a class="btn btn-cta btn-block" href="${quoteHref}">Demander un devis gratuit</a></div>`;
}

function layout({ file, title, description, active, quoteHref, body }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>document.documentElement.classList.add("js")</script>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#333399">${SITE.indexable ? "" : '\n  <meta name="robots" content="noindex, nofollow">'}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:locale" content="fr_FR">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  ${header(active ?? file)}
  <main id="contenu">
${body}
  </main>
  ${footer(quoteHref)}
  <script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}

function pageHero({ crumbs, title, hook, lead }) {
  return `    <section class="page-hero">
      <div class="container">
        <ol class="breadcrumb" aria-label="Fil d’Ariane">
          <li><a href="index.html">Accueil</a></li>
          ${crumbs.map(([label, href]) => (href ? `<li><a href="${href}">${label}</a></li>` : `<li aria-current="page">${label}</li>`)).join("\n          ")}
        </ol>
        <h1>${title}</h1>
        ${hook ? `<p class="offer-hook">« ${hook} »</p>` : ""}
        ${lead ? `<p class="lead">${lead}</p>` : ""}
      </div>
    </section>`;
}

function offerCard(o) {
  return `<article class="card offer-card">
            <span class="icon-pill">${icon(o.icon)}</span>
            <h2><a href="${offerUrl(o)}">${o.name}</a></h2>
            <p class="offer-hook">${o.hook}</p>
            <p class="offer-detail">${o.detail}</p>
            <div class="offer-actions">
              <a class="btn btn-cta btn-sm" href="${quoteUrl(o)}">Demander un devis</a>
              <a class="link-arrow" href="${offerUrl(o)}">En savoir plus ${icon("arrow")}</a>
            </div>
          </article>`;
}

function offerWideCard(o) {
  return `<article class="card offer-wide">
            <div class="offer-media"><img src="assets/img/${o.slug}.jpg" alt="" width="800" height="500" loading="lazy"></div>
            <div class="offer-body">
              <h2><a href="${offerUrl(o)}">${o.name}</a></h2>
              <p class="offer-hook">${o.hook}</p>
              <p class="offer-detail">${o.detail}</p>
              <div class="offer-actions">
                <a class="link-arrow" href="${offerUrl(o)}">Découvrir l’offre ${icon("arrow")}</a>
                <a class="btn btn-cta btn-sm" href="${quoteUrl(o)}">Demander un devis</a>
              </div>
            </div>
          </article>`;
}

function advantagesGrid(tag = "h3") {
  return `<div class="grid grid-3">
          ${ADVANTAGES.map(
            ([ic, t, d]) => `<article class="card advantage">
            <span class="icon-pill">${icon(ic)}</span>
            <${tag}>${t}</${tag}>
            <p>${d}</p>
          </article>`
          ).join("\n          ")}
        </div>`;
}

function faqList(items, openFirst = false) {
  return `<div class="faq-list">
          ${items
            .map(
              ([q, a], i) => `<details class="faq-item"${openFirst && i === 0 ? " open" : ""}>
            <summary>${fr(q)}</summary>
            <div class="faq-answer"><p>${a}</p></div>
          </details>`
            )
            .join("\n          ")}
        </div>`;
}

function partnersBand() {
  // Remplacer chaque emplacement par <li class="partner-slot"><img src="assets/img/partenaires/xxx.png" alt="Nom de la compagnie"></li>
  const slots = Array.from({ length: 6 }, () => `<li class="partner-slot">Logo partenaire</li>`).join("\n          ");
  return `<section class="section" aria-labelledby="titre-partenaires">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">Nos partenaires</span>
          <h2 id="titre-partenaires" class="title-rule">Les compagnies avec lesquelles nous travaillons</h2>
          <p class="muted">Nous comparons pour vous les offres des plus grandes compagnies d’assurances de la place.</p>
        </div>
        <div class="partners-marquee" data-marquee>
          <ul class="partners-track">
            ${slots}
          </ul>
        </div>
      </div>
    </section>`;
}

let formCount = 0;
function field({ name, label, type = "text", required = true, autocomplete, placeholder, pattern, inputmode }) {
  const id = `${name}-${formCount}`;
  const attrs = [
    `id="${id}"`,
    `name="${name}"`,
    `class="input"`,
    `type="${type}"`,
    required ? "required" : "",
    autocomplete ? `autocomplete="${autocomplete}"` : "",
    placeholder ? `placeholder="${placeholder}"` : "",
    pattern ? `pattern="${pattern}"` : "",
    inputmode ? `inputmode="${inputmode}"` : "",
  ].filter(Boolean);
  return `<div>
              <label class="field-label" for="${id}">${label}${required ? ' <span class="req" aria-hidden="true">*</span>' : ""}</label>
              <input ${attrs.join(" ")}>
            </div>`;
}
// Compatible avec le mode « v » des navigateurs récents (caractères spéciaux échappés)
const PHONE_PATTERN = "[0-9+ .\\(\\)\\-]{8,20}";

function quoteForm({ heading = "", subject = "Demande de devis – site ACCN" } = {}) {
  formCount++;
  const chips = (segment) =>
    OFFERS.filter((o) => o.segment === segment)
      .map(
        (o, i) => `<label class="chip"><input type="radio" name="produit" value="${esc(o.menu)}" data-label="Besoin"${i === 0 ? " required" : ""}><span>${o.menu}</span></label>`
      )
      .join("\n                ");
  return `<form class="form" data-form data-quote-form data-subject="${esc(subject)}">
            ${heading}
            <fieldset>
              <legend>1. Vous êtes</legend>
              <div class="choice-grid">
                <label class="choice"><input type="radio" name="profil" value="Particulier" checked data-label="Profil"><span>${icon("user")} Particulier</span></label>
                <label class="choice"><input type="radio" name="profil" value="Professionnel" data-label="Profil"><span>${icon("briefcase")} Professionnel</span></label>
              </div>
            </fieldset>
            <fieldset>
              <legend>2. Votre besoin <span class="req" aria-hidden="true">*</span></legend>
              <div class="chips" data-produits="Particulier">
                ${chips("Particulier")}
              </div>
              <div class="chips" data-produits="Professionnel" hidden>
                ${chips("Professionnel")}
              </div>
            </fieldset>
            <div class="form-row cols-2">
              ${field({ name: "nom", label: "Nom et prénom / Raison sociale", autocomplete: "name" })}
              ${field({ name: "telephone", label: "Téléphone / WhatsApp", type: "tel", autocomplete: "tel", placeholder: "+237 6XX XX XX XX", pattern: PHONE_PATTERN, inputmode: "tel" })}
            </div>
            ${field({ name: "email", label: "Adresse e-mail", type: "email", autocomplete: "email" })}
            <div>
              <label class="field-label" for="precisions-${formCount}">Précisions sur votre besoin (facultatif)</label>
              <textarea class="textarea" id="precisions-${formCount}" name="precisions" rows="3" placeholder="Ex. : type de véhicule, destination et dates du voyage, nombre de véhicules…"></textarea>
            </div>
            <button class="btn btn-cta btn-block" type="submit">Demander mon devis gratuit</button>
            <p class="form-note" data-form-note>Un conseiller ACCN vous recontacte rapidement.</p>
            <div class="form-status" role="status" aria-live="polite"></div>
          </form>`;
}

function offerForm(o) {
  formCount++;
  return `<form class="form" data-form data-subject="${esc(`Demande de devis ${o.menu} – site ACCN`)}">
            <input type="hidden" name="profil" value="${o.segment}" data-label="Profil">
            <input type="hidden" name="produit" value="${esc(o.menu)}" data-label="Besoin">
            ${field({ name: "nom", label: "Nom et prénom", autocomplete: "name" })}
            ${field({ name: "telephone", label: "Téléphone / WhatsApp", type: "tel", autocomplete: "tel", placeholder: "+237 6XX XX XX XX", pattern: PHONE_PATTERN, inputmode: "tel" })}
            ${field({ name: "email", label: "Adresse e-mail", type: "email", autocomplete: "email" })}
            <div>
              <label class="field-label" for="precisions-${formCount}">Précisions (facultatif)</label>
              <textarea class="textarea" id="precisions-${formCount}" name="precisions" rows="3"></textarea>
            </div>
            <button class="btn btn-cta btn-block" type="submit">Demander mon devis gratuit</button>
            <p class="form-note" data-form-note>Un conseiller ACCN vous recontacte rapidement.</p>
            <div class="form-status" role="status" aria-live="polite"></div>
          </form>`;
}

function contactForm() {
  formCount++;
  const subjects = ["Demande de devis", "Suivi de sinistre", "Question générale", "Prendre rendez-vous"];
  return `<form class="form" data-form data-subject="Message depuis le site ACCN">
            ${field({ name: "nom", label: "Votre Nom et Prénom", autocomplete: "name" })}
            <div class="form-row cols-2">
              ${field({ name: "telephone", label: "Votre Numéro de téléphone", type: "tel", autocomplete: "tel", placeholder: "+237 6XX XX XX XX", pattern: PHONE_PATTERN, inputmode: "tel" })}
              ${field({ name: "email", label: "Votre Adresse E-mail", type: "email", autocomplete: "email" })}
            </div>
            <div>
              <label class="field-label" for="sujet-${formCount}">Sujet de votre message <span class="req" aria-hidden="true">*</span></label>
              <select class="select" id="sujet-${formCount}" name="sujet" required>
                <option value="">Choisissez un sujet</option>
                ${subjects.map((s) => `<option>${s}</option>`).join("\n                ")}
              </select>
            </div>
            <div>
              <label class="field-label" for="message-${formCount}">Votre message <span class="req" aria-hidden="true">*</span></label>
              <textarea class="textarea" id="message-${formCount}" name="message" rows="5" required></textarea>
            </div>
            <button class="btn btn-cta btn-block" type="submit">Envoyer mon message</button>
            <p class="form-note" data-form-note></p>
            <div class="form-status" role="status" aria-live="polite"></div>
          </form>
          <p class="form-invite">Vous préférez échanger de vive voix ? Passez directement dans nos bureaux à Akwa ou cliquez sur l’icône WhatsApp pour démarrer une discussion instantanée avec un conseiller.</p>`;
}

function qField(f) {
  if (f.type === "row") return `<div class="form-row cols-2">${f.fields.map(qField).join("")}</div>`;
  const id = `${f.name}-${formCount}`;
  const type = f.type || "text";
  const req = f.required ? ' <span class="req" aria-hidden="true">*</span>' : "";
  const show = f.showIf ? ` data-show-if="${esc(f.showIf.join("|"))}" hidden` : "";
  const help = f.help ? `<span class="field-help" id="${id}-aide">${f.help}</span>` : "";
  const common = [
    `id="${id}"`,
    `name="${f.name}"`,
    `data-label="${esc(f.label)}"`,
    f.required ? "required" : "",
    f.help ? `aria-describedby="${id}-aide"` : "",
  ].filter(Boolean);

  if (type === "radio" || type === "checkbox") {
    const cls = ["options", f.inline ? "inline" : "", f.cols === 2 ? "cols-2" : ""].filter(Boolean).join(" ");
    return `<fieldset class="q-field"${show}>
                <legend>${fr(f.label)}${req}</legend>
                <div class="${cls}">
                  ${f.options
                    .map(
                      (opt, i) =>
                        `<label class="option"><input type="${type}" name="${f.name}" value="${esc(opt)}" data-label="${esc(f.label)}"${f.required && i === 0 ? " required" : ""}><span>${opt}</span></label>`
                    )
                    .join("\n                  ")}
                </div>
                ${help}
              </fieldset>`;
  }

  let control;
  if (type === "textarea") {
    control = `<textarea class="textarea" ${common.join(" ")} rows="3"${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ""}></textarea>`;
  } else if (type === "select") {
    control = `<select class="select" ${common.join(" ")}>
                  <option value="">Choisissez</option>
                  ${f.options.map((o) => `<option>${o}</option>`).join("\n                  ")}
                </select>`;
  } else {
    const extra = [
      `type="${type}"`,
      type === "file" ? 'accept="image/*,application/pdf" data-max-size="5242880"' : "",
      type === "tel" ? `pattern="${PHONE_PATTERN}" inputmode="tel" placeholder="+237 6XX XX XX XX"` : "",
      type === "number" ? 'inputmode="numeric"' : "",
      f.min !== undefined ? `min="${f.min}"` : "",
      f.autocomplete ? `autocomplete="${f.autocomplete}"` : "",
      f.placeholder && type !== "tel" ? `placeholder="${esc(f.placeholder)}"` : "",
    ].filter(Boolean);
    control = `<input class="input" ${common.join(" ")} ${extra.join(" ")}>`;
  }
  return `<div class="q-field"${show}>
                <label class="field-label" for="${id}">${fr(f.label)}${req}</label>
                ${control}
                ${help}
              </div>`;
}

function questionnaireForm(o) {
  formCount++;
  const sections = QUESTIONNAIRES[o.slug];
  return `<form class="form questionnaire" data-form data-subject="${esc(`Questionnaire ${o.name} – site ACCN`)}">
            <input type="hidden" name="profil" value="${o.segment}" data-label="Profil">
            <input type="hidden" name="produit" value="${esc(o.menu)}" data-label="Besoin">
            ${sections
              .map(
                (s) => `<section class="q-section" data-section="${esc(s.title)}">
              <h3>${s.title}</h3>
              ${s.fields.map(qField).join("\n              ")}
            </section>`
              )
              .join("\n            ")}
            <p class="form-note"><span class="req">*</span> Champs obligatoires. Les autres informations nous aident à affiner votre devis.</p>
            <button class="btn btn-cta btn-block" type="submit">Demander mon devis gratuit</button>
            <p class="form-note" data-form-note>Un conseiller ACCN vous recontacte rapidement.</p>
            <div class="form-status" role="status" aria-live="polite"></div>
          </form>`;
}

function quoteBand() {
  return `<section class="section quote-band" id="devis" aria-labelledby="titre-devis">
      <div class="container quote-grid">
        <div class="quote-intro">
          <span class="eyebrow">Devis gratuit</span>
          <h2 id="titre-devis">Demandez votre devis gratuit</h2>
          <p class="lead">Particulier ou professionnel, choisissez votre besoin : un conseiller ACCN compare les offres du marché et revient vers vous avec une proposition.</p>
          <ul class="check-list">
            <li>${icon("check")}<span>Un service sans surcoût pour vous</span></li>
            <li>${icon("check")}<span>Proposition comparative en moins de 24h ouvrées pour les demandes courantes (Auto, Voyage, Santé individuelle)</span></li>
            <li>${icon("check")}<span>Un interlocuteur unique, de la signature jusqu’au sinistre</span></li>
          </ul>
          <div class="quote-contact">
            <a href="tel:${SITE.phoneHref}">${icon("phone")} ${SITE.phone}</a>
            <a href="${SITE.whatsapp}" target="_blank" rel="noopener">${icon("chat")} Écrire sur WhatsApp</a>
          </div>
        </div>
        <div class="form-card">
          ${quoteForm()}
        </div>
      </div>
    </section>`;
}

function ctaBand(title, text) {
  return `<section class="section">
      <div class="container">
        <div class="cta-band">
          <div>
            <h2>${title}</h2>
            <p>${text}</p>
          </div>
          <div class="btn-row">
            <a class="btn btn-cta" href="devis.html">Demander un devis gratuit</a>
            <a class="btn btn-ghost-light" href="${SITE.whatsapp}" target="_blank" rel="noopener">${brand("whatsapp")} WhatsApp</a>
          </div>
        </div>
      </div>
    </section>`;
}

/* ==========================================================================
   Pages
   ========================================================================== */
const pages = [];

// ---- Accueil
pages.push({
  file: "index.html",
  title: "ACCN – Courtier en assurance à Douala | Particuliers et entreprises",
  description:
    "ACCN, cabinet de conseil et de courtage en assurances à Akwa, Douala. Nous comparons et négocions pour vous les meilleures garanties auto, santé, voyage, vie et entreprise.",
  body: `    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">Courtier en assurances · Akwa, Douala</span>
          <h1>Votre courtier de confiance pour une protection sur-mesure au Cameroun.</h1>
          <p class="lead">Particuliers ou entreprises, ACCN compare, négocie et trouve pour vous les meilleures garanties d’assurance au meilleur prix.</p>
          <div class="btn-row">
            <a class="btn btn-cta" href="devis.html">Demander un devis gratuit</a>
            <a class="btn btn-wa" href="${SITE.whatsapp}" target="_blank" rel="noopener">${brand("whatsapp")} Parler à un conseiller</a>
          </div>
          <ul class="trust-list">
            <li>${icon("checkCircle")}Courtier indépendant</li>
            <li>${icon("checkCircle")}Devis gratuit</li>
            <li>${icon("checkCircle")}Aucun surcoût pour vous</li>
          </ul>
        </div>
        <div class="hero-media">
          <img src="assets/img/hero-conseil.jpg" alt="Un conseiller échange avec une cliente" width="960" height="760" fetchpriority="high">
          <div class="hero-badge">${icon("pin")}<span><strong>Cabinet basé à Akwa</strong>Rue Boué Lapeyre, Douala</span></div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="titre-avantages">
      <div class="container">
        <h2 id="titre-avantages" class="visually-hidden">Nos engagements</h2>
        ${advantagesGrid()}
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="titre-particuliers">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Espace Particuliers</span>
          <h2 id="titre-particuliers" class="title-rule">Assurances pour les particuliers</h2>
          <p class="muted">Protégez votre véhicule, votre santé, vos voyages et l’avenir de votre famille. <a class="link-arrow" href="particuliers.html">Voir l’espace Particuliers ${icon("arrow")}</a></p>
        </div>
        <div class="grid grid-4">
          ${particuliers.map(offerCard).join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="titre-professionnels">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Espace Professionnels</span>
          <h2 id="titre-professionnels" class="title-rule">Assurances pour les professionnels</h2>
          <p class="muted">Protégez vos locaux, votre responsabilité, vos véhicules et vos marchandises. <a class="link-arrow" href="professionnels.html">Voir l’espace Professionnels ${icon("arrow")}</a></p>
        </div>
        <div class="grid grid-4">
          ${professionnels.map(offerCard).join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="titre-apropos">
      <div class="container split">
        <div>
          <span class="eyebrow">Qui sommes-nous ?</span>
          <h2 id="titre-apropos" class="title-rule">L’expertise ACCN au service de votre sérénité</h2>
          <p>Basé au cœur du quartier des affaires à Akwa, Douala, le cabinet ACCN est une société de conseil et de courtage en assurances dédiée aux particuliers et aux professionnels.</p>
          <p class="muted">En tant que mandataire exclusif de nos clients auprès des plus grandes compagnies d’assurances de la place, nous analysons vos risques, négocions les meilleurs tarifs du marché et concevons des garanties sur-mesure adaptées à vos réalités.</p>
          <a class="btn btn-outline" href="qui-sommes-nous.html">Découvrir le cabinet</a>
        </div>
        <div class="split-media">
          <img src="assets/img/cabinet-conseil.jpg" alt="Étude d’un dossier d’assurance" width="800" height="600" loading="lazy">
        </div>
      </div>
    </section>

${quoteBand()}

${partnersBand()}

    <section class="section section-alt" aria-labelledby="titre-faq">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">Questions fréquentes</span>
          <h2 id="titre-faq" class="title-rule">Vos questions sur le courtage</h2>
        </div>
        ${faqList(FAQ.slice(0, 3))}
        <p class="faq-more"><a class="link-arrow" href="faq.html">Voir toutes les questions ${icon("arrow")}</a></p>
      </div>
    </section>`,
});

// ---- Particuliers / Professionnels
for (const [file, segment, title, lead, items, cta] of [
  [
    "particuliers.html",
    "Particuliers",
    "Assurances pour les particuliers",
    "Automobile, santé, voyage ou épargne : ACCN compare les offres du marché et vous propose les meilleures garanties pour vous et votre famille.",
    particuliers,
    ["Besoin d’un conseil ?", "Pour les demandes courantes (Auto, Voyage, Santé individuelle), nos conseillers vous formulent une proposition comparative en moins de 24h ouvrées."],
  ],
  [
    "professionnels.html",
    "Professionnels",
    "Assurances pour les professionnels",
    "Locaux, responsabilité, véhicules, marchandises : ACCN analyse les risques de votre activité et négocie pour vous les garanties les plus adaptées.",
    professionnels,
    ["Parlons de votre activité", "Un conseiller analyse vos risques et vous présente les offres les plus adaptées à votre entreprise."],
  ],
]) {
  pages.push({
    file,
    title: `${title} – ACCN, courtier en assurance à Douala`,
    description: `${lead}`,
    body: `${pageHero({ crumbs: [[segment]], title, lead })}

    <section class="section">
      <div class="container">
        <div class="grid grid-2">
          ${items.map(offerWideCard).join("\n          ")}
        </div>
      </div>
    </section>

${ctaBand(...cta)}`,
  });
}

// ---- Fiches produits
for (const o of OFFERS) {
  const segFile = o.segment === "Particulier" ? "particuliers.html" : "professionnels.html";
  const segLabel = o.segment === "Particulier" ? "Particuliers" : "Professionnels";
  const others = OFFERS.filter((x) => x.segment === o.segment && x !== o);
  pages.push({
    file: offerUrl(o),
    active: offerUrl(o),
    quoteHref: QUESTIONNAIRES[o.slug] ? "#questionnaire" : "#devis-offre",
    title: `${o.name} à Douala – ACCN, courtier en assurance`,
    description: `${o.hook} ${o.detail}`,
    body: `${pageHero({ crumbs: [[segLabel, segFile], [o.menu]], title: o.name, hook: o.hook, lead: o.detail })}

    <section class="section">
      <div class="container product-layout">
        <div class="product-main">
          <div>
            <img class="product-visual" src="assets/img/${o.slug}.jpg" alt="" width="800" height="500">
          </div>
          <div>
            <h2 class="title-rule">Notre accompagnement</h2>
            ${o.description.map((p) => `<p>${p}</p>`).join("\n            ")}
          </div>
          <div>
            <h2 class="title-rule">Ce qui peut être couvert</h2>
            <ul class="cover-grid">
              ${o.covers
                .map(([t, d]) => `<li class="cover-item">${icon("checkCircle")}<div><h3>${t}</h3><p>${d}</p></div></li>`)
                .join("\n              ")}
            </ul>
            <p class="cover-note">Les garanties exactes dépendent de la compagnie et de la formule retenues. Votre conseiller vous les détaille dans le devis.</p>
          </div>
          ${
            QUESTIONNAIRES[o.slug]
              ? `<div id="questionnaire">
            <h2 class="title-rule">Questionnaire détaillé</h2>
            <p class="muted">Plus votre demande est précise, plus notre proposition comparative sera juste. Vous pouvez aussi utiliser le formulaire rapide et compléter ces informations avec votre conseiller.</p>
            <div class="form-card">
              ${questionnaireForm(o)}
            </div>
          </div>`
              : ""
          }
          <div>
            <h2 class="title-rule">Pourquoi passer par ACCN ?</h2>
            ${advantagesGrid()}
          </div>
          <div>
            <h2 class="title-rule">Comment ça marche ?</h2>
            <ol class="steps cols-3">
              <li class="step"><h3>Votre demande</h3><p>Remplissez le formulaire ou contactez-nous par téléphone ou WhatsApp.</p></li>
              <li class="step"><h3>La comparaison</h3><p>Nous comparons et négocions les offres de plusieurs compagnies pour vous.</p></li>
              <li class="step"><h3>Le suivi</h3><p>Vous choisissez, nous gérons le contrat et restons à vos côtés en cas de sinistre.</p></li>
            </ol>
          </div>
        </div>
        <aside class="product-aside" aria-labelledby="titre-devis-offre">
          <div class="form-card" id="devis-offre">
            <h2 id="titre-devis-offre" style="font-size:1.4rem">${QUESTIONNAIRES[o.slug] ? "Demande rapide" : "Obtenir un devis gratuit"}</h2>
            <p class="muted" style="font-size:.95rem">${o.name}</p>
            ${offerForm(o)}
            ${QUESTIONNAIRES[o.slug] ? `<p class="form-note" style="margin-top:16px"><a class="link-arrow" href="#questionnaire">Ou remplissez le questionnaire détaillé ${icon("arrow")}</a></p>` : ""}
          </div>
          <div class="aside-help">
            <p><strong>Une question ?</strong> Nos conseillers vous répondent ${SITE.hours.toLowerCase()}.</p>
            <div class="btn-row">
              <a class="btn btn-outline btn-sm" href="tel:${SITE.phoneHref}">${icon("phone")} Appeler</a>
              <a class="btn btn-wa btn-sm" href="${SITE.whatsapp}" target="_blank" rel="noopener">${brand("whatsapp")} WhatsApp</a>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="titre-autres">
      <div class="container">
        <div class="section-head">
          <h2 id="titre-autres" class="title-rule">Autres assurances pour les ${segLabel.toLowerCase()}</h2>
        </div>
        <div class="grid grid-3">
          ${others.map(offerCard).join("\n          ")}
        </div>
      </div>
    </section>`,
  });
}

// ---- Qui sommes-nous ?
pages.push({
  file: "qui-sommes-nous.html",
  title: "Qui sommes-nous ? – ACCN, courtier en assurance à Akwa, Douala",
  description:
    "Le cabinet ACCN, basé à Akwa (Douala), est une société de conseil et de courtage en assurances indépendante, au service des particuliers et des professionnels.",
  body: `${pageHero({ crumbs: [["Qui sommes-nous ?"]], title: "L’expertise ACCN au service de votre sérénité" })}

    <section class="section">
      <div class="container split">
        <div>
          <span class="eyebrow">Le cabinet</span>
          <h2 class="title-rule">Un courtier indépendant au cœur d’Akwa</h2>
          <p>${ABOUT_TEXT}</p>
          <div class="btn-row">
            <a class="btn btn-cta" href="devis.html">Demander un devis gratuit</a>
            <a class="btn btn-outline" href="contact.html">Nous contacter</a>
          </div>
        </div>
        <div class="split-media">
          <img src="assets/img/cabinet-conseil.jpg" alt="Étude d’un dossier d’assurance" width="800" height="600" loading="lazy">
        </div>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="titre-avantages">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">Nos avantages</span>
          <h2 id="titre-avantages" class="title-rule">Pourquoi choisir ACCN ?</h2>
        </div>
        ${advantagesGrid()}
      </div>
    </section>

    <section class="section" aria-labelledby="titre-methode">
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow">Notre méthode</span>
          <h2 id="titre-methode" class="title-rule">Comment nous travaillons pour vous</h2>
        </div>
        <ol class="steps cols-4">
          <li class="step"><h3>Analyse de vos risques</h3><p>Nous étudions votre situation, votre activité et vos besoins réels.</p></li>
          <li class="step"><h3>Comparaison des assureurs</h3><p>Nous mettons en concurrence les offres de plusieurs compagnies.</p></li>
          <li class="step"><h3>Négociation</h3><p>Nous négocions les meilleurs tarifs et des garanties sur-mesure.</p></li>
          <li class="step"><h3>Suivi et sinistres</h3><p>Nous gérons votre contrat et défendons vos intérêts en cas de sinistre.</p></li>
        </ol>
      </div>
    </section>

${partnersBand()}

${ctaBand("Parlons de votre projet", "Particulier ou professionnel, un conseiller ACCN étudie votre besoin et vous propose les meilleures garanties.")}`,
});

// ---- FAQ
pages.push({
  file: "faq.html",
  title: "Questions fréquentes – ACCN, courtier en assurance à Douala",
  description:
    "Coût du courtage, différence entre agent et courtier, gestion des sinistres, délai de devis, agrément : les réponses d’ACCN à vos questions.",
  body: `${pageHero({ crumbs: [["FAQ"]], title: "Questions fréquentes", lead: "Tout ce qu’il faut savoir avant de confier vos assurances à un courtier." })}

    <section class="section">
      <div class="container">
        ${faqList(FAQ, true)}
      </div>
    </section>

${ctaBand("Vous ne trouvez pas votre réponse ?", "Nos conseillers sont à votre écoute par téléphone, WhatsApp ou directement dans nos bureaux à Akwa.")}`,
});

// ---- Contact
pages.push({
  file: "contact.html",
  title: "Contact – ACCN, courtier en assurance à Akwa, Douala",
  description: `Contactez le cabinet ACCN : ${SITE.address.join(", ")}. Téléphone et WhatsApp ${SITE.phone}. ${SITE.hours}.`,
  body: `${pageHero({
    crumbs: [["Contact"]],
    title: "Contactez le cabinet ACCN",
    lead: "Une question ? Un besoin urgent ? Nos conseillers sont à votre écoute pour vous guider dans vos choix d’assurance.",
  })}

    <section class="section">
      <div class="container contact-grid">
        <div>
          <h2 class="title-rule">Nos coordonnées</h2>
          <ul class="coord-list">
            <li><span class="icon-pill">${icon("pin")}</span><div><strong>Adresse de nos bureaux</strong>${SITE.address.join(", ")}.</div></li>
            <li><span class="icon-pill">${icon("phone")}</span><div><strong>Téléphone &amp; WhatsApp</strong><a href="tel:${SITE.phoneHref}">${SITE.phone}</a></div></li>
            <li><span class="icon-pill">${icon("mail")}</span><div><strong>E-mail professionnel</strong><a href="mailto:${SITE.email}">${SITE.email}</a></div></li>
            <li><span class="icon-pill">${icon("clock")}</span><div><strong>Horaires d’ouverture</strong>${SITE.hours}.</div></li>
          </ul>
          <div class="btn-row">
            <a class="btn btn-wa" href="${SITE.whatsapp}" target="_blank" rel="noopener">${brand("whatsapp")} Discuter sur WhatsApp</a>
            <a class="btn btn-outline" href="${SITE.mapsUrl}" target="_blank" rel="noopener">${icon("pin")} Voir sur la carte</a>
          </div>
        </div>
        <div class="form-card">
          <h2>Formulaire de message rapide</h2>
          ${contactForm()}
        </div>
      </div>
    </section>`,
});

// ---- Devis
pages.push({
  file: "devis.html",
  title: "Demander un devis gratuit – ACCN, courtier en assurance à Douala",
  description:
    "Demandez votre devis d’assurance gratuit : auto, santé, voyage, vie, multirisque, RC, flotte ou transport. ACCN compare les offres du marché pour vous.",
  body: `${pageHero({
    crumbs: [["Demander un devis"]],
    title: "Demander un devis gratuit",
    lead: "Choisissez votre profil et votre besoin : un conseiller ACCN compare les offres du marché et revient vers vous avec une proposition.",
  })}

    <section class="section">
      <div class="container product-layout">
        <div class="form-card">
          ${quoteForm({ heading: '<h2 style="font-size:1.5rem">Votre demande</h2>' })}
        </div>
        <aside class="product-aside">
          <div class="aside-help">
            <h2 style="font-size:1.2rem">Pourquoi passer par ACCN ?</h2>
            <ul class="check-list">
              ${ADVANTAGES.map(([, t, d]) => `<li>${icon("check")}<span><strong>${t}</strong> – ${d}</span></li>`).join("\n              ")}
            </ul>
            <p>Vous préférez nous parler directement ?</p>
            <div class="btn-row">
              <a class="btn btn-outline btn-sm" href="tel:${SITE.phoneHref}">${icon("phone")} ${SITE.phone}</a>
              <a class="btn btn-wa btn-sm" href="${SITE.whatsapp}" target="_blank" rel="noopener">${brand("whatsapp")} WhatsApp</a>
            </div>
          </div>
        </aside>
      </div>
    </section>`,
});

/* ==========================================================================
   Écriture
   ========================================================================== */
mkdirSync(OUT, { recursive: true });
for (const p of pages) {
  writeFileSync(join(OUT, p.file), layout(p), "utf8");
}
writeFileSync(
  join(OUT, "assets/img/favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#333399"/><text x="32" y="47" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="42" fill="#fff">A</text><rect x="14" y="52" width="36" height="3" fill="#993300"/></svg>`,
  "utf8"
);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\n${SITE.indexable ? "Allow" : "Disallow"}: /\n`, "utf8");

if (!SITE.facebook) console.warn("⚠  Adresse Facebook non renseignée (SITE.facebook) : les boutons Facebook pointent vers #.");
console.log(`${pages.length} pages générées dans ${OUT}`);
