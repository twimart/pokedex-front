// Importation de hooks React: useEffect (pour exécuter du code à certains moments, ex: montage du composant) 
// et useState (pour créer des variables d'état qui mettront à jour l'affichage lors de leur modification).
import { useEffect, useState } from 'react'
// Importation de React Query, une librairie puissante pour récupérer, mettre en cache et synchroniser 
// des données asynchrones (ex: depuis une API REST).
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Importation du routeur React Router DOM qui permet de créer une application "Single Page" 
// et de naviguer entre différentes vues/pages sans recharger le navigateur web.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// Importation de la barre de navigation (composant réutilisable).
import Navbar from './components/Navbar'
// Importation des différentes pages (vues) de l'application (la liste, le détail, le formulaire...).
import PokemonList from './pages/PokemonList'
import PokemonDetail from './pages/PokemonDetail'
import PokemonForm from './pages/PokemonForm'
import TypeList from './pages/TypeList'
import TypeForm from './pages/TypeForm'
import Favorites from './pages/Favorites'
// Importation d'un composant de sécurité (PrivateRoute) qui va empêcher l'accès à certaines pages 
// si l'utilisateur n'est pas connecté à Keycloak.
import PrivateRoute from './auth/PrivateRoute'

// Instanciation de QueryClient : c'est le gestionnaire central de React Query.
// Il s'occupe de garder en mémoire (cache) les réponses de vos appels API pour éviter de les refaire inutilement.
// Une seule instance globale suffit pour partager cet état dans tout l'arbre de composants.
const queryClient = new QueryClient()

// Définition du composant principal "App". C'est lui qui va chapeauter tous les autres composants de notre application.
function App() {
  // Déclaration de l'état "theme" avec useState. Il gérera le mode clair ou sombre (light/dark).
  // La fonction passée à useState n'est appelée qu'une seule fois au premier montage du composant 
  // (lazy initialization) pour lire une éventuelle préférence sauvegardée.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // On essaye de lire une valeur précédemment sauvegardée dans le localStorage du navigateur 
    // (le localStorage est une mémoire persistante du navigateur, même si on ferme l'onglet).
    const savedTheme = window.localStorage.getItem('pokedex-theme')
    // Si la valeur existe et vaut 'dark', on retourne 'dark', sinon on met par défaut 'light'.
    return savedTheme === 'dark' ? 'dark' : 'light'
  })
  
  // Ce state "forceAuthRefresh" est une astuce (un "hack" léger).
  // On ne stocke aucune vraie donnée ici (d'où le premier paramètre ignoré ',').
  // L'objectif de changer cette valeur (un nombre qui s'incrémente) est de forcer 
  // React à re-rendre (recalculer et réafficher) ce composant "App" et ses enfants.
  const [, forceAuthRefresh] = useState(0)

  // useEffect se déclenche chaque fois que la variable 'theme' change (tableau de dépendances en fin de bloc).
  useEffect(() => {
    // On injecte le thème courant (light/dark) dans l'attribut "data-theme" de la balise racine HTML (document.documentElement).
    // Le CSS lira cet attribut (ex: html[data-theme='dark']) pour appliquer les bonnes couleurs partout.
    document.documentElement.dataset.theme = theme
    // On sauvegarde ce choix de thème dans le localStorage, afin que si l'utilisateur rafraîchit la page, 
    // ou ferme puis revient, le thème reste celui qu'il a choisi.
    window.localStorage.setItem('pokedex-theme', theme)
  }, [theme])

  // Ce second useEffect se déclenche uniquement une fois au montage initial du composant (grâce au tableau de dépendances vide []).
  useEffect(() => {
    // Fonction qui va déclencher un changement d'état (incrémenter le nombre), ce qui causera un rafraîchissement visuel.
    // Cela permet à l'interface de se mettre à jour si Keycloak a fini par détecter une connexion valide en arrière-plan.
    const syncAuth = () => forceAuthRefresh(value => value + 1)
    
    // On appelle la fonction immédiatement (lors de la première ouverture de l'application).
    syncAuth()
    
    // On utilise setInterval pour répéter cette synchronisation (ce rafraîchissement d'interface) toutes les 500 millisecondes.
    // Pourquoi ? Parce que Keycloak s'initialise asynchrone et ne donne pas forcément l'info tout de suite, 
    // il faut qu'on surveille l'évolution de la connexion.
    const interval = window.setInterval(syncAuth, 500)

    // La fonction retournée dans un useEffect (fonction de nettoyage ou "cleanup function") 
    // est exécutée quand le composant est retiré de la page (démonté).
    // C'est vital ici pour arrêter l'intervalle et libérer la mémoire, sinon l'application ralentirait ou buggerait.
    return () => window.clearInterval(interval)
  }, []) // Le tableau vide indique : "Ne joue ça qu'une seule fois au chargement du composant"

  // La partie "return" renvoie du JSX, c'est-à-dire le code HTML (mélangé à du JavaScript) qui sera rendu par React.
  return (
    // QueryClientProvider englobe l'application pour que tous les enfants puissent utiliser React Query.
    // On lui passe l'instance "queryClient" créée plus haut.
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter est le composant de base de React Router DOM. Il observe l'URL du navigateur 
          et détermine quelle route (composant) doit s'afficher. */}
      <BrowserRouter>
        {/* Navbar est notre barre de navigation située en haut de page. On lui passe des "props" (propriétés):
            - theme: pour lui dire quel est le thème actuel afin d'afficher le bon icône lune/soleil.
            - onToggleTheme: une fonction qu'elle pourra appeler quand on cliquera sur le bouton, 
              qui inversera la valeur de 'light' à 'dark' ou l'inverse. */}
        <Navbar theme={theme} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} />
        
        {/* Conteneur principal de la page. "container" est sûrement une classe CSS. */}
        <div className="container">
          <div className="page-shell">
            {/* Le composant "Routes" regroupe toutes nos routes. Il va chercher la route "Route" 
                qui correspond exactement au "path" actuel de l'URL du navigateur. */}
            <Routes>
              {/* Route racine: Si l'utilisateur tape juste 'monsite.com/', il est immédiatement redirigé ('Navigate') 
                  vers la liste des Pokémons ('/pokemons'). */}
              <Route path="/" element={<Navigate to="/pokemons" />} />
              
              {/* Si l'URL est '/pokemons', on affiche le composant 'PokemonList' (page contenant la liste). */}
              <Route path="/pokemons" element={<PokemonList />} />
              
              {/* Route de création de Pokémon. L'URL '/pokemons/new' va rendre le composant 'PokemonForm'.
                  Mais ce composant est "enrobé" (wrap) par PrivateRoute.
                  PrivateRoute va d'abord vérifier: L'utilisateur est-il connecté via Keycloak?
                  - Si OUI, il affiche <PokemonForm />.
                  - Si NON, il bloque l'accès et renvoie vers la page d'accueil ou demande de se connecter. */}
              <Route path="/pokemons/new" element={<PrivateRoute><PokemonForm /></PrivateRoute>} />
              
              {/* Route paramétrique : ':id' signifie que n'importe quelle valeur peut remplacer cette partie (ex: '/pokemons/25' pour Pikachu).
                  Le composant PokemonDetail pourra récupérer cet 'id' (25) pour aller chercher les infos. */}
              <Route path="/pokemons/:id" element={<PokemonDetail />} />
              
              {/* Route d'édition d'un Pokémon. Protégée par 'PrivateRoute' car seul un utilisateur connecté peut modifier. */}
              <Route path="/pokemons/:id/edit" element={<PrivateRoute><PokemonForm /></PrivateRoute>} />
              
              {/* Routes dédiées à la gestion des Types (Feu, Eau, Plante, etc.) 
                  Même principe que pour les Pokémons: liste, création protégée, édition protégée. */}
              <Route path="/types" element={<TypeList />} />
              <Route path="/types/new" element={<PrivateRoute><TypeForm /></PrivateRoute>} />
              <Route path="/types/:id/edit" element={<PrivateRoute><TypeForm /></PrivateRoute>} />
              
              {/* Route vers la page des favoris. */}
              <Route path="/favorites" element={<Favorites />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Exportation par défaut du composant App.
// Cela permet de l'importer dans d'autres fichiers en écrivant simplement: import App from './App'
export default App
