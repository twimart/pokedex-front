import Keycloak from 'keycloak-js'

// Toutes les infos de connexion sont injectées via les variables d'environnement Vite.
// Le client Keycloak est centralisé pour être partagé partout dans l'application.
const keycloak = new Keycloak({
  // URL du serveur d'identité.
  url: import.meta.env.VITE_KEYCLOAK_URL,
  // Realm de l'application dans Keycloak.
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  // Identifiant du client public côté Keycloak.
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
})

export default keycloak
