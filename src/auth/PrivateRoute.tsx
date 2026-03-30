import { Navigate } from 'react-router-dom'
import keycloak from './keycloak'
import type { ReactElement } from 'react'

interface PrivateRouteProps {
  children: ReactElement
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  if (!keycloak.authenticated) {
    return <Navigate to="/pokemons" replace />
  }

  return children
}
