import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getAllPokemons } from '../api/pokemonApi'
import TypeBadge from '../components/TypeBadge'
import keycloak from '../auth/keycloak'
import { readFavoriteIds, toggleFavoriteId } from '../utils/favorites'

export default function Favorites() {
  const navigate = useNavigate()
  const username = keycloak.tokenParsed?.preferred_username ?? null
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => readFavoriteIds(username))

  useEffect(() => {
    setFavoriteIds(readFavoriteIds(username))
  }, [username])

  const { data: pokemons, isLoading } = useQuery({
    queryKey: ['pokemons'],
    queryFn: () => getAllPokemons()
  })

  const favorites = useMemo(() => {
    return (pokemons ?? []).filter(pokemon => favoriteIds.includes(pokemon.id))
  }, [favoriteIds, pokemons])

  if (isLoading) return <div className="loading-state">Chargement...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Collection</h1>
          <p>{favorites.length} favori(s) enregistré(s).</p>
        </div>
      </div>

      <div className="pokemon-grid">
        {favorites.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card" onClick={() => navigate(`/pokemons/${pokemon.id}`)}>
            <div className="pokemon-card__image-wrap">
              <img className="pokemon-card__image" src={pokemon.imageUrl} alt={pokemon.name} loading="lazy" />
              <span className="pokemon-card__number">#{String(pokemon.pokedexNumber).padStart(3, '0')}</span>
            </div>
            <p className="pokemon-card__title"><strong>{pokemon.name}</strong></p>
            <div className="pokemon-card__type"><TypeBadge name={pokemon.type.name} color={pokemon.type.color} /></div>
            <button
              type="button"
              className="pokemon-card__favorite is-active"
              onClick={e => {
                e.stopPropagation()
                setFavoriteIds(toggleFavoriteId(pokemon.id, username))
              }}
            >
              ♥
            </button>
          </div>
        ))}
      </div>

      {!favorites.length && <div className="empty-state">Aucun favori pour le moment.</div>}
    </div>
  )
}
