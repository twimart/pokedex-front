// Importation de la bibliothèque 'axios', un outil très populaire en JavaScript pour faire des requêtes HTTP (appels réseau) vers un serveur.
import axios from 'axios'
// Importation de notre instance Keycloak, qui gère l'authentification et détient le "token" (le jeton de connexion) si l'utilisateur est connecté.
import keycloak from '../auth/keycloak'

// Création d'une "instance" Axios commune à toute l'application. 
// Au lieu d'utiliser "axios.get()" directement partout, on passera par cette configuration centrale.
// Ça permet d'appliquer des règles générales à TOUTES nos requêtes réseau en un seul endroit.
const axiosInstance = axios.create()

// Ajout d'un "intercepteur" (interceptor) sur les requêtes sortantes.
// Un intercepteur, c'est comme un douanier qui examine chaque requête *juste avant* qu'elle ne parte vers le serveur.
axiosInstance.interceptors.request.use(config => {
  // On vérifie : est-ce que Keycloak possède actuellement un token valide ? (c'est-à-dire : l'utilisateur est-il connecté ?)
  if (keycloak.token) {
    // Si oui, on ajoute ce token dans les "headers" (les entêtes) de la requête HTTP.
    // L'entête "Authorization" avec la mention "Bearer <token>" est le standard de l'industrie pour dire au serveur : "Hé, voici mon badge, laisse-moi passer".
    config.headers.Authorization = `Bearer ${keycloak.token}`
  }

  // Qu'on ait ajouté le token ou non, on doit retourner la configuration (config) de la requête.
  // Sinon, Axios bloque l'envoi et la requête n'aboutit jamais.
  return config
})

// On exporte par défaut notre instance configurée pour pouvoir l'utiliser dans nos autres fichiers (ex: pokemonApi.ts).
export default axiosInstance
