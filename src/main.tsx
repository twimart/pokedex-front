// Importation de React, la bibliothèque principale pour créer des interfaces utilisateurs.
import React from 'react'
// Importation de ReactDOM, qui sert à "brancher" (monter) l'application React dans le navigateur web (le DOM).
import ReactDOM from 'react-dom/client'
// Importation du composant racine de notre application, qui contient toute la logique et les autres composants.
import App from './App'
// Importation du fichier CSS global qui contient les styles de base de l'application.
import './index.css'
// Importation de l'instance Keycloak préconfigurée pour gérer l'authentification (connexion/déconnexion).
import keycloak from './auth/keycloak'

// Le point d'entrée monte l'application React dans l'élément HTML qui a l'ID "root".
// Cet élément se trouve généralement dans le fichier index.html.
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode est un outil de développement (il n'affecte pas la production).
  // Il aide à détecter des erreurs, des avertissements et des effets secondaires non voulus en rendant les composants deux fois.
  <React.StrictMode>
    {/* On injecte notre composant racine App ici, ce qui va démarrer toute l'application */}
    <App />
  </React.StrictMode>,
)

// L'initialisation de Keycloak (pour vérifier si l'utilisateur est connecté) se fait en arrière-plan.
// Cela se fait après le rendu initial de l'application pour ne pas bloquer l'affichage de la page.
// Le mode 'check-sso' (Single Sign-On) permet de vérifier s'il y a déjà une session active sans forcer l'utilisateur à se connecter.
void keycloak.init({
  // onLoad: 'check-sso' -> On ne redirige pas automatiquement vers la page de connexion, on vérifie juste le statut.
  onLoad: 'check-sso',
  // silentCheckSsoRedirectUri -> C're une page technique HTML vide qui permet à Keycloak de vérifier la session 
  // de manière invisible (dans un iframe caché) sans recharger l'application entière.
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
}).catch(error => {
  // En cas d'échec de l'initialisation de Keycloak (ex: serveur d'auth indisponible), 
  // on affiche une erreur dans la console du navigateur mais l'application reste utilisable (en mode non-connecté).
  console.error('Keycloak init failed', error)
})
