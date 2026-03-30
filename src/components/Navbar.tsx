import { Link } from 'react-router-dom'
import keycloak from '../auth/keycloak'

interface NavbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const isConnected = keycloak.authenticated ?? false
  const username = keycloak.tokenParsed?.preferred_username

  return (
    <nav className="navbar" data-theme={theme}>
      <Link to="/pokemons" className="navbar__brand">
        <span className="navbar__logo" aria-hidden="true" />
        <span>
          <strong>Pokédex</strong>
          <small>TP Dev Web Avancé</small>
        </span>
      </Link>

      <div className="navbar__links">
        <Link to="/pokemons">Pokédex</Link>
        <Link to="/types">Types</Link>
      </div>

      <div className="navbar__auth">
        <button type="button" className="navbar__theme-toggle" onClick={onToggleTheme} aria-label="Basculer le thème">
          <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
        {username && <span className="navbar__user">@{username}</span>}
        <button
          type="button"
          className="navbar__auth-button"
          onClick={() => (isConnected ? keycloak.logout({ redirectUri: window.location.origin }) : keycloak.login())}
        >
          {isConnected ? 'Logout' : 'Login'}
        </button>
      </div>
    </nav>
  )
}
