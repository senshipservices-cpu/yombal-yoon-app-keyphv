
/**
 * Centralized Text Content System
 * 
 * This file contains ALL text content used in the Yombal Yoon app.
 * DO NOT hardcode text strings in components - always use this system.
 * 
 * Usage:
 *   import { strings } from '@/locales/strings';
 *   <Text>{strings.common.buttons.save}</Text>
 */

export const strings = {
  /**
   * Common strings used across the app
   */
  common: {
    buttons: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      submit: 'Soumettre',
      send: 'Envoyer',
      retry: 'Réessayer',
      refresh: 'Actualiser',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      viewDetails: 'Voir les détails',
      viewAll: 'Voir tout',
      loadMore: 'Charger plus',
      ok: 'OK',
      yes: 'Oui',
      no: 'Non',
      continue: 'Continuer',
      skip: 'Passer',
      done: 'Terminé',
      apply: 'Appliquer',
      reset: 'Réinitialiser',
    },
    
    labels: {
      name: 'Nom',
      fullName: 'Nom complet',
      phone: 'Téléphone',
      email: 'Email',
      address: 'Adresse',
      city: 'Ville',
      region: 'Région',
      date: 'Date',
      time: 'Heure',
      price: 'Prix',
      total: 'Total',
      description: 'Description',
      status: 'Statut',
      details: 'Détails',
      notes: 'Notes',
      optional: 'Optionnel',
      required: 'Obligatoire',
    },
    
    placeholders: {
      enterName: 'Entrez votre nom',
      enterPhone: 'Entrez votre numéro',
      enterEmail: 'Entrez votre email',
      enterAddress: 'Entrez une adresse',
      selectCity: 'Sélectionnez une ville',
      selectRegion: 'Sélectionnez une région',
      selectDate: 'Sélectionnez une date',
      selectTime: 'Sélectionnez une heure',
      enterDescription: 'Entrez une description',
      search: 'Rechercher...',
      typeHere: 'Tapez ici...',
    },
    
    messages: {
      loading: 'Chargement...',
      saving: 'Enregistrement...',
      sending: 'Envoi...',
      processing: 'Traitement...',
      success: 'Succès !',
      error: 'Erreur',
      noData: 'Aucune donnée disponible',
      noResults: 'Aucun résultat trouvé',
      comingSoon: 'Bientôt disponible',
      underMaintenance: 'En maintenance',
    },
    
    units: {
      fcfa: 'FCFA',
      km: 'km',
      minutes: 'min',
      hours: 'h',
      days: 'jours',
      seats: 'places',
    },
  },
  
  /**
   * Error messages
   */
  errors: {
    network: {
      title: 'Erreur de connexion',
      message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      offline: 'Vous êtes hors ligne',
    },
    
    validation: {
      required: 'Ce champ est obligatoire',
      invalidPhone: 'Numéro de téléphone invalide',
      invalidEmail: 'Adresse email invalide',
      minLength: 'Trop court',
      maxLength: 'Trop long',
      invalidFormat: 'Format invalide',
      mustBePositive: 'Doit être positif',
      mustBeGreaterThan: 'Doit être supérieur à',
      mustBeLessThan: 'Doit être inférieur à',
    },
    
    autocomplete: {
      title: 'Erreur d\'autocomplétion',
      message: 'Impossible de charger les suggestions d\'adresses',
      noResults: 'Aucune adresse trouvée',
      tryAgain: 'Veuillez réessayer',
    },
    
    otp: {
      title: 'Erreur OTP',
      invalidCode: 'Code OTP invalide',
      expired: 'Code OTP expiré',
      tooManyAttempts: 'Trop de tentatives. Réessayez plus tard.',
      sendFailed: 'Échec de l\'envoi du code OTP',
    },
    
    supabase: {
      title: 'Erreur de base de données',
      message: 'Une erreur est survenue lors de l\'accès aux données',
      connectionFailed: 'Impossible de se connecter à la base de données',
      queryFailed: 'Échec de la requête',
    },
    
    payment: {
      title: 'Erreur de paiement',
      insufficientFunds: 'Solde insuffisant',
      paymentFailed: 'Le paiement a échoué',
      invalidAmount: 'Montant invalide',
      methodNotAvailable: 'Méthode de paiement non disponible',
    },
    
    generic: {
      title: 'Une erreur est survenue',
      message: 'Veuillez réessayer plus tard',
      tryAgain: 'Réessayer',
    },
  },
  
  /**
   * Success messages
   */
  success: {
    saved: 'Enregistré avec succès',
    updated: 'Mis à jour avec succès',
    deleted: 'Supprimé avec succès',
    sent: 'Envoyé avec succès',
    published: 'Publié avec succès',
    cancelled: 'Annulé avec succès',
    confirmed: 'Confirmé avec succès',
    paymentCompleted: 'Paiement effectué avec succès',
    profileUpdated: 'Profil mis à jour',
    phoneVerified: 'Numéro vérifié avec succès',
  },
  
  /**
   * Navigation & Tabs
   */
  navigation: {
    tabs: {
      home: 'Accueil',
      covoiturage: 'Covoiturage',
      colis: 'Colis',
      livraison: 'Livraison',
      profile: 'Profil',
    },
    
    screens: {
      home: 'Accueil',
      covoiturage: 'Covoiturage',
      colis: 'Envoi de Colis',
      livraison: 'Livraison 14 Régions',
      profile: 'Mon Profil',
      wallet: 'Mon Wallet',
      notifications: 'Notifications',
      settings: 'Paramètres',
      help: 'Aide',
    },
  },
  
  /**
   * Covoiturage (Carpooling) module
   */
  covoiturage: {
    title: 'Covoiturage',
    subtitle: 'Partagez vos trajets',
    
    publish: {
      title: 'Publier un trajet',
      departure: 'Départ',
      arrival: 'Arrivée',
      date: 'Date',
      time: 'Heure',
      seats: 'Nombre de places',
      pricePerSeat: 'Prix par place',
      vehicleType: 'Type de véhicule',
      stops: 'Arrêts intermédiaires',
      publish: 'Publier le trajet',
      success: 'Trajet publié avec succès',
    },
    
    search: {
      title: 'Rechercher un trajet',
      from: 'Départ',
      to: 'Arrivée',
      date: 'Date',
      passengers: 'Passagers',
      search: 'Rechercher',
      noResults: 'Aucun trajet trouvé',
      noResultsMessage: 'Aucun trajet ne correspond à votre recherche',
    },
    
    booking: {
      title: 'Réserver',
      passengers: 'Nombre de passagers',
      totalPrice: 'Prix total',
      book: 'Réserver',
      success: 'Réservation effectuée avec succès',
      pending: 'En attente de confirmation',
      accepted: 'Réservation acceptée',
      refused: 'Réservation refusée',
    },
    
    myRides: {
      title: 'Mes Trajets',
      asDriver: 'En tant que conducteur',
      asPassenger: 'En tant que passager',
      noRides: 'Aucun trajet',
      noRidesMessage: 'Vous n\'avez pas encore publié de trajet',
    },
    
    details: {
      driver: 'Conducteur',
      departure: 'Départ',
      arrival: 'Arrivée',
      dateTime: 'Date et heure',
      availableSeats: 'Places disponibles',
      pricePerSeat: 'Prix par place',
      vehicleType: 'Véhicule',
      stops: 'Arrêts',
      bookings: 'Réservations',
    },
  },
  
  /**
   * Colis (Parcel) module
   */
  colis: {
    title: 'Envoi de Colis',
    subtitle: 'Envoyez vos colis rapidement',
    
    send: {
      title: 'Envoyer un colis',
      senderInfo: 'Informations expéditeur',
      senderName: 'Nom de l\'expéditeur',
      senderPhone: 'Téléphone expéditeur',
      recipientInfo: 'Informations destinataire',
      recipientName: 'Nom du destinataire',
      recipientPhone: 'Téléphone destinataire',
      pickupAddress: 'Adresse de récupération',
      dropoffAddress: 'Adresse de livraison',
      description: 'Description du colis',
      estimatedPrice: 'Prix estimé',
      send: 'Envoyer',
      success: 'Demande envoyée avec succès',
    },
    
    myParcels: {
      title: 'Mes Colis',
      sent: 'Colis envoyés',
      toDeliver: 'Colis à livrer',
      noParcels: 'Aucun colis',
      noParcelsMessage: 'Vous n\'avez pas encore envoyé de colis',
    },
    
    driver: {
      title: 'Livraisons',
      pendingRequests: 'Demandes en attente',
      myDeliveries: 'Mes livraisons',
      accept: 'Accepter',
      refuse: 'Refuser',
      startPickup: 'Aller récupérer',
      confirmPickup: 'Confirmer récupération',
      startDelivery: 'Commencer livraison',
      confirmDelivery: 'Confirmer livraison',
      noRequests: 'Aucune demande',
      noRequestsMessage: 'Aucune demande de livraison pour le moment',
    },
    
    tracking: {
      title: 'Suivi du colis',
      status: {
        pending: 'En attente',
        assigned: 'Assigné',
        accepted: 'Accepté',
        refused: 'Refusé',
        en_route_pickup: 'En route vers récupération',
        picked_up: 'Récupéré',
        en_route_delivery: 'En route vers livraison',
        delivering: 'En cours de livraison',
        delivered: 'Livré',
        cancelled: 'Annulé',
      },
    },
    
    payment: {
      title: 'Paiement livraison',
      totalAmount: 'Montant total',
      commission: 'Commission Yombal Yoon',
      driverAmount: 'Montant livreur',
      paymentMethod: 'Méthode de paiement',
      confirmPayment: 'Confirmer le paiement',
      success: 'Paiement effectué avec succès',
    },
  },
  
  /**
   * Livraison (Delivery) module
   */
  livraison: {
    title: 'Livraison 14 Régions',
    subtitle: 'Livraison inter-régions',
    
    send: {
      title: 'Envoyer un colis',
      departureRegion: 'Région de départ',
      destinationRegion: 'Région de destination',
      destinationCity: 'Ville de destination',
      senderInfo: 'Informations expéditeur',
      recipientInfo: 'Informations destinataire',
      description: 'Description',
      estimatedPrice: 'Prix estimé',
      estimatedDelivery: 'Délai estimé',
      days: 'jours',
      send: 'Envoyer',
      success: 'Demande envoyée avec succès',
    },
    
    tracking: {
      title: 'Suivi',
      status: {
        pending: 'En attente',
        assigned: 'Assigné',
        in_transit: 'En transit',
        delivered: 'Livré',
        cancelled: 'Annulé',
      },
    },
  },
  
  /**
   * Wallet module
   */
  wallet: {
    title: 'Mon Wallet Yombal Yoon',
    
    balance: {
      available: 'Solde disponible',
      pending: 'Solde en attente',
      total: 'Total',
    },
    
    actions: {
      recharge: 'Recharger',
      withdraw: 'Retirer',
      history: 'Historique',
    },
    
    recharge: {
      title: 'Recharger mon wallet',
      amount: 'Montant',
      method: 'Méthode de paiement',
      phoneNumber: 'Numéro de téléphone',
      confirm: 'Confirmer la recharge',
      success: 'Demande de recharge envoyée',
      pending: 'Recharge en attente de validation',
    },
    
    withdrawal: {
      title: 'Retirer de l\'argent',
      amount: 'Montant',
      method: 'Méthode de retrait',
      phoneNumber: 'Numéro de téléphone',
      confirm: 'Demander le retrait',
      success: 'Demande de retrait envoyée',
      pending: 'Retrait en attente de traitement',
      minAmount: 'Montant minimum',
      maxAmount: 'Montant maximum',
      insufficientFunds: 'Solde insuffisant',
    },
    
    history: {
      title: 'Historique des transactions',
      type: {
        gain: 'Gain',
        commission: 'Commission',
        retrait: 'Retrait',
        recharge: 'Recharge',
        penalite: 'Pénalité',
      },
      noTransactions: 'Aucune transaction',
      noTransactionsMessage: 'Votre historique de transactions est vide',
    },
    
    earnings: {
      title: 'Mes gains',
      covoiturage: 'Covoiturage',
      colis: 'Colis',
      totalEarned: 'Total encaissé',
      commission: 'Commission Yombal Yoon',
      netAmount: 'Net',
    },
  },
  
  /**
   * Profile module
   */
  profile: {
    title: 'Mon Profil',
    
    personalInfo: {
      title: 'Informations personnelles',
      fullName: 'Nom complet',
      phone: 'Téléphone',
      email: 'Email',
      avatar: 'Photo de profil',
      edit: 'Modifier',
      save: 'Enregistrer',
      success: 'Profil mis à jour',
    },
    
    roles: {
      title: 'Mes rôles',
      driver: 'Conducteur',
      passenger: 'Passager',
      delivery: 'Livreur Colis',
      sender: 'Expéditeur',
    },
    
    security: {
      title: 'Sécurité',
      phoneVerification: 'Vérification téléphone',
      verified: 'Vérifié',
      notVerified: 'Non vérifié',
      verify: 'Vérifier',
      otp: 'Code OTP',
      sendOTP: 'Envoyer le code',
      verifyOTP: 'Vérifier le code',
    },
    
    menu: {
      wallet: 'Mon Wallet',
      myRides: 'Mes Trajets',
      myParcels: 'Mes Colis',
      notifications: 'Notifications',
      settings: 'Paramètres',
      help: 'Aide & Support',
      feedback: 'Donner mon avis',
      about: 'À propos',
      logout: 'Déconnexion',
    },
    
    stats: {
      trips: 'Trajets',
      deliveries: 'Livraisons',
      rating: 'Note',
      points: 'Points',
    },
  },
  
  /**
   * Notifications
   */
  notifications: {
    title: 'Notifications',
    markAllRead: 'Tout marquer comme lu',
    clearAll: 'Tout effacer',
    empty: 'Aucune notification',
    emptyMessage: 'Vous n\'avez pas encore de notifications',
    
    types: {
      reservation_created: 'Nouvelle réservation',
      reservation_accepted: 'Réservation acceptée',
      reservation_refused: 'Réservation refusée',
      ride_cancelled: 'Trajet annulé',
      parcel_assignment: 'Nouvelle demande de colis',
      parcel_accepted: 'Colis accepté',
      parcel_picked_up: 'Colis récupéré',
      parcel_delivered: 'Colis livré',
      parcel_already_taken: 'Colis déjà pris',
      payment_received: 'Paiement reçu',
      wallet_recharged: 'Wallet rechargé',
      withdrawal_completed: 'Retrait effectué',
    },
  },
  
  /**
   * Settings
   */
  settings: {
    title: 'Paramètres',
    
    general: {
      title: 'Général',
      language: 'Langue',
      notifications: 'Notifications',
      darkMode: 'Mode sombre',
    },
    
    privacy: {
      title: 'Confidentialité',
      shareLocation: 'Partager ma position',
      showPhone: 'Afficher mon numéro',
      showEmail: 'Afficher mon email',
    },
    
    about: {
      title: 'À propos',
      version: 'Version',
      termsOfService: 'Conditions d\'utilisation',
      privacyPolicy: 'Politique de confidentialité',
      licenses: 'Licences',
    },
  },
  
  /**
   * Help & Support
   */
  help: {
    title: 'Aide & Support',
    
    contact: {
      title: 'Nous contacter',
      phone: 'Téléphone',
      email: 'Email',
      whatsapp: 'WhatsApp',
      hours: 'Horaires',
    },
    
    faq: {
      title: 'Questions fréquentes',
      howToPublishRide: 'Comment publier un trajet ?',
      howToSendParcel: 'Comment envoyer un colis ?',
      howToRecharge: 'Comment recharger mon wallet ?',
      howToWithdraw: 'Comment retirer de l\'argent ?',
      paymentMethods: 'Quelles méthodes de paiement ?',
      commissions: 'Quelles sont les commissions ?',
    },
    
    feedback: {
      title: 'Donner mon avis',
      type: 'Type',
      suggestion: 'Suggestion',
      bug: 'Bug',
      other: 'Autre',
      message: 'Message',
      contact: 'Contact (optionnel)',
      send: 'Envoyer',
      success: 'Merci pour votre retour !',
    },
  },
  
  /**
   * Location & Permissions
   */
  location: {
    permission: {
      title: 'Localisation désactivée',
      message: 'La localisation automatique n\'est pas disponible, mais vous pouvez toujours utiliser l\'application en saisissant vos adresses manuellement.',
      info: 'Pour activer la localisation automatique, vous pouvez modifier les paramètres de votre appareil.',
      openSettings: 'Ouvrir les paramètres',
      continue: 'Continuer sans localisation',
    },
    
    searching: 'Recherche de votre position...',
    found: 'Position trouvée',
    notFound: 'Position non trouvée',
  },
  
  /**
   * Empty States
   */
  emptyStates: {
    noRides: 'Aucun trajet',
    noRidesMessage: 'Aucun trajet disponible pour le moment',
    
    noReservations: 'Aucune réservation',
    noReservationsMessage: 'Vous n\'avez pas encore de réservations',
    
    noParcels: 'Aucun colis',
    noParcelsMessage: 'Vous n\'avez pas encore de colis',
    
    noDeliveries: 'Aucune livraison',
    noDeliveriesMessage: 'Aucune demande de livraison pour le moment',
    
    noNotifications: 'Aucune notification',
    noNotificationsMessage: 'Vous n\'avez pas encore de notifications',
    
    noTransactions: 'Aucune transaction',
    noTransactionsMessage: 'Votre historique est vide',
  },
  
  /**
   * Test Mode
   */
  testMode: {
    banner: 'MODE TEST',
    message: 'L\'application est en mode test. Les commissions sont désactivées.',
    commissionsDisabled: 'Commissions désactivées (0%)',
    commissionsEnabled: 'Commissions activées',
  },
} as const;

/**
 * Type-safe string accessor
 * This ensures you can't access non-existent strings
 */
export type StringKey = keyof typeof strings;

/**
 * Helper function to get nested strings
 * Usage: getString('common.buttons.save')
 */
export function getString(path: string): string {
  const keys = path.split('.');
  let value: any = strings;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`String not found: ${path}`);
      return path;
    }
  }
  
  return typeof value === 'string' ? value : path;
}

/**
 * Helper hook for React components
 */
export function useStrings() {
  return {
    strings,
    getString,
  };
}
