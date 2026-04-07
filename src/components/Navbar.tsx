// Importation du composant 'Link' de React Router.
// Il s'utilise comme une balise <a> (lien HTML) mais au lieu de recharger la page complète,
// il modifie juste l'URL et demande à React de changer les composants affichés. C'est le principe d'une Single Page Application.
import { Link } from 'react-router-dom'
// Importation de notre instance Keycloak pour connaître l'état de l'utilisateur (connecté ou non)
// et avoir accès aux fonctions de connexion (login) et déconnexion (logout).
import keycloak from '../auth/keycloak'

// Définition d'une interface TypeScript (une sorte de "contrat" qui décrit la forme d'un objet).
// Ici, on définit ce que le composant Navbar a le droit de recevoir en paramètres (les "props").
// Navbar s'attend à recevoir 'theme' (qui ne peut valoir que 'light' ou 'dark') 
// et 'onToggleTheme' (une fonction qui ne prend aucun argument et ne renvoie rien 'void').
interface NavbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

// Fonction composant Navbar.
// "export default" permet de l'importer facilement ailleurs.
// On "destructure" les props ({ theme, onToggleTheme }) pour ne pas avoir à écrire props.theme et props.onToggleTheme partout.
export default function Navbar({ theme, onToggleTheme }: NavbarProps) {
  // L'état de connexion Keycloak (authenticated) est lu directement.
  // L'opérateur "?? false" (Nullish coalescing) signifie : 
  // "si keycloak.authenticated est null ou undefined, alors mets 'false'".
  const isConnected = keycloak.authenticated ?? false
  
  // Si l'utilisateur est connecté, keycloak décrypte le token JWT (tokenParsed) qu'il a reçu du serveur Keycloak.
  // Ce token contient des informations sur l'utilisateur, comme son nom d'utilisateur (preferred_username).
  // Le "?" (Optional chaining) permet de ne pas planter si tokenParsed est null/undefined.
  const username = keycloak.tokenParsed?.preferred_username

  // Le composant renvoie du JSX, c'est ce qui sera affiché à l'écran.
  return (
    // Balise sémantique HTML5 <nav>.
    // L'attribut 'data-theme={theme}' permet au CSS de changer les couleurs de la barre (ex: fond sombre si theme='dark').
    <nav className="navbar" data-theme={theme}>
      
      {/* 
        Le logo cliquable (Brand). 
        En cliquant dessus, on navigue vers "/pokemons" sans rechargement de page.
      */}
      <Link to="/pokemons" className="navbar__brand">
        {/* aria-hidden="true" indique aux lecteurs d'écran (pour malvoyants) d'ignorer cet élément purement décoratif. */}
        <span className="navbar__logo" aria-hidden="true" />
        <span>
          <strong>Pokédex</strong>
          <small>TP Dev Web Avancé</small>
        </span>
      </Link>

      {/* 
        La zone des liens de navigation principaux. 
        Permet à l'utilisateur de se déplacer entre les listes de Pokémons, les Types et ses Favoris.
      */}
      <div className="navbar__links">
        <Link to="/pokemons">Pokédex</Link>
        <Link to="/types">Types</Link>
        <Link to="/favorites">Favoris</Link>
      </div>

      {/* 
        La zone des actions liées à l'utilisateur : le bouton de changement de thème et le bouton de connexion.
      */}
      <div className="navbar__auth">
        
        {/* Bouton pour changer de thème.
            Au clic (onClick), il appelle la fonction 'onToggleTheme' qui a été passée par 'App.tsx'.
            L'icône change en fonction du thème (un soleil si on est en mode dark, et vice versa). */}
        <button type="button" className="navbar__theme-toggle" onClick={onToggleTheme} aria-label="Basculer le thème">
          <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>

        {/* 
          Si la variable 'username' existe (donc si on a pu lire le nom depuis le token Keycloak),
          alors (&&) on affiche un petit badge avec le nom de l'utilisateur précédé d'un '@'.
        */}
        {username && <span className="navbar__user">@{username}</span>}
        
        {/* 
          Le bouton de connexion / déconnexion.
          Son comportement change en fonction de l'état 'isConnected'.
        */}
        <button
          type="button"
          className="navbar__auth-button"
          // Si on clique et qu'on est connecté, on appelle la fonction 'logout' de Keycloak.
          // En passant { redirectUri: window.location.origin }, on dit à Keycloak : "Une fois déconnecté, ramène-moi sur la page d'accueil (ex: http://localhost:5173)".
          // Sinon (si on n'est pas connecté), on appelle 'login' qui redirigera vers la page de connexion Keycloak.
          onClick={() => (isConnected ? keycloak.logout({ redirectUri: window.location.origin }) : keycloak.login())}
        >
          {/* Le texte du bouton change aussi : "Logout" si on est connecté, "Login" sinon. */}
          {isConnected ? 'Logout' : 'Login'}
        </button>
      </div>
    </nav>
  )
}
