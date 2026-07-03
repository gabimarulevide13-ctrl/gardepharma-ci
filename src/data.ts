// Data and Content for GardePharma CI
// Relying STRICTLY on user provided text and information. No external affiliations or pharmacies.

export const APPLICATION_INFO = {
  name: "GardePharma CI",
  tagline: "Votre santé, notre priorité ! 💚",
  description: "GardePharma CI est une application mobile gratuite conçue pour les Ivoiriens qui ont besoin de trouver rapidement une pharmacie de garde, même la nuit ou les jours fériés.",
  
  features: [
    {
      id: "pharmacies",
      icon: "🏥",
      title: "1. Pharmacies de garde",
      items: [
        "Géolocalisation automatique : Trouve les pharmacies les plus proches de vous",
        "Recherche par commune/ville : Cherchez une pharmacie dans un quartier spécifique (ex: Cocody, Plateau, Adjamé…)",
        "Liste actualisée : Pharmacies organisées par périodes de 7 jours",
        "Informations complètes : Adresses, coordonnées et horaires clairs"
      ]
    },
    {
      id: "dictionary",
      icon: "💊",
      title: "2. Dictionnaire des médicaments",
      items: [
        "Recherche intelligente : Trouvez un médicament par son nom",
        "Base de données complète : Informations sur des milliers de médicaments"
      ]
    },
    {
      id: "prices",
      icon: "💰",
      title: "3. Prix des médicaments",
      items: [
        "Prix publics : Voir le prix standard des médicaments",
        "Prix MUGEFCI : Tarifs pour les assurés MUGEFCI",
        "Couverture CMU : Indique si un médicament est couvert par la CMU"
      ]
    },
    {
      id: "cart",
      icon: "🛒",
      title: "4. Panier et validation",
      items: [
        "Ajouter des médicaments : Créez votre panier",
        "Calcul automatique : Montant total avec ou sans assurance",
        "Validation du panier : Confirmez votre sélection"
      ]
    },
    {
      id: "prescription",
      icon: "📋",
      title: "5. Bibliothèque d'ordonnances",
      items: [
        "Sauvegarde des ordonnances : Enregistrez vos paniers validés",
        "Historique complet : Voir toutes vos ordonnances passées",
        "Suppression : Supprimez une ou plusieurs ordonnances (sélection multiple)",
        "Stockage local : Données sauvegardées sur votre téléphone"
      ]
    },
    {
      id: "darkmode",
      icon: "🌙",
      title: "6. Mode sombre",
      items: [
        "Thème clair/sombre : Choisissez votre préférence",
        "Adaptatif : Suit les paramètres système"
      ]
    }
  ],

  securityAndTrust: [
    {
      title: "Politique de confidentialité",
      description: "Lien accessible depuis l'écran \"À propos\"."
    },
    {
      title: "Données sécurisées",
      description: "Informations stockées localement ou sur Supabase."
    },
    {
      title: "Pas d'affiliation",
      description: "GardePharma CI n'est affiliée à aucun organisme officiel."
    }
  ],

  contact: {
    email: "GardePharma@proton.me",
    whatsApp: "+225 059 45 99 817",
    description: "Suggestions ou bugs : Contactez-nous facilement !"
  },

  whyChooseUs: [
    {
      title: "24h/24",
      description: "Pharmacies disponibles jour et nuit"
    },
    {
      title: "Recherche rapide",
      description: "Trouvez instantanément ce que vous cherchez"
    },
    {
      title: "Fiable",
      description: "Informations vérifiées et mises à jour automatiquement"
    }
  ]
};

export const PRIVACY_POLICY = `
### Politique de Confidentialité • GardePharma CI

GardePharma CI s'engage à assurer la sécurité et la confidentialité de vos données personnelles.

- **Stockage Local & Supabase** : Les informations liées à vos ordonnances et vos préférences de recherche sont stockées localement sur votre téléphone ou de manière sécurisée via notre backend de synchronisation optionnel Supabase.
- **Géolocalisation** : La géolocalisation automatique est traitée localement sur votre appareil pour afficher les officines de garde les plus proches sans qu'aucune donnée de localisation ne soit revendue ou transmise à des tiers.
- **Absence d'Affiliation** : GardePharma CI est une initiative indépendante et n'est affiliée à aucun organisme public ou gouvernemental, ni à aucune pharmacie ou syndicat officinal.
`;

export const TERMS_OF_SERVICE = `
### Conditions Générales • GardePharma CI

- **Usage Gratuit** : GardePharma CI est une application mobile gratuite conçue pour faciliter l'accès à l'information sur les pharmacies de garde et les médicaments en Côte d'Ivoire.
- **Responsabilité** : Les informations fournies le sont à titre purement indicatif. L'application n'étant pas affiliée directement aux pharmacies physiques, l'exactitude absolue en temps réel dépend des mises à jour des bases de données.
- **Données** : Vos ordonnances stockées localement sont sous votre responsabilité exclusive.
`;
