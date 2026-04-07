import { Navigate } from 'react-router-dom'
import keycloak from './keycloak'
import type { ReactElement } from 'react'

interface PrivateRouteProps {
  children: ReactElement
}

// Ce composant protège un écran entier et redirige vers la liste publique si l'utilisateur
// n'est pas connecté. On évite ainsi de répéter la logique d'accès partout.
export default function PrivateRoute({ children }: PrivateRouteProps) {
  // Si Keycloak n'a pas encore confirmé une session, on refuse l'accès à l'écran protégé.
  if (!keycloak.authenticated) {
    // replace évite d'ajouter une entrée inutile dans l'historique du navigateur.
    return <Navigate to="/pokemons" replace />
  }

  // Si la session est valide, on affiche simplement le contenu demandé.
  return children
}
