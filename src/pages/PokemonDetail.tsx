import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPokemonById } from '../api/pokemonApi'
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'

export default function PokemonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: pokemon, isLoading } = useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => getPokemonById(Number(id))
  })

  if (isLoading) return <div>Chargement...</div>
  if (!pokemon) return <div>Pokémon non trouvé</div>

  return (
    <div className="pokemon-detail">
      <button onClick={() => navigate('/pokemons')} className="button button--ghost" style={{ marginBottom: '1rem' }}>
        ← Retour
      </button>

      <div className="pokemon-detail__card" style={{ borderColor: `${pokemon.type.color}66` }}>
        <div className="pokemon-detail__hero">
          <span className="pokemon-detail__number">
            #{String(pokemon.pokedexNumber).padStart(3, '0')}
          </span>

          <img className="pokemon-detail__image" src={pokemon.imageUrl} alt={pokemon.name} />

          <h1 className="pokemon-detail__title">{pokemon.name}</h1>

          <div>
            <TypeBadge name={pokemon.type.name} color={pokemon.type.color} />
          </div>

          {pokemon.description && (
            <p className="pokemon-detail__description">
              {pokemon.description}
            </p>
          )}

          <div className="pokemon-detail__stats">
            <StatBar label="PV" value={pokemon.hp} color="#FF5959" />
            <StatBar label="Attaque" value={pokemon.attack} color="#F5AC78" />
            <StatBar label="Défense" value={pokemon.defense} color="#FAE078" />
          </div>

          <div className="form-grid__actions" style={{ marginTop: '0.5rem' }}>
            <button onClick={() => navigate(`/pokemons/${pokemon.id}/edit`)} className="button button--primary">
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
