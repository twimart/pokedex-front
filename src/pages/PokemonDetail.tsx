import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPokemonById } from '../api/pokemonApi'
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'
import keycloak from '../auth/keycloak'

export default function PokemonDetail() {
  // L'ID vient de l'URL; on l'utilise ensuite pour charger la fiche complète.
  const { id } = useParams()
  const navigate = useNavigate()
  const isConnected = keycloak.authenticated === true
  // La clé de cache inclut l'identifiant pour isoler chaque fiche détaillée.
  const { data: pokemon, isLoading } = useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => getPokemonById(Number(id))
  })

  // Gestion des états asynchrones avant l'affichage du contenu détaillé.
  if (isLoading) return <div>Chargement...</div>
  if (!pokemon) return <div>Pokémon non trouvé</div>

  return (
    <div className="pokemon-detail">
      <button onClick={() => navigate('/pokemons')} className="button button--ghost" style={{ marginBottom: '1rem' }}>
        ← Retour
      </button>

      <div className="pokemon-detail__card" style={{ borderColor: `${pokemon.type.color}66` }}>
        <div className="pokemon-detail__hero">
          {/* Le numéro métier est affiché avant le nom pour faciliter l'orientation. */}
          <span className="pokemon-detail__number">
            #{String(pokemon.pokedexNumber).padStart(3, '0')}
          </span>

          {/* L'image reste optionnelle: si l'API ne renvoie rien, le navigateur ne bloque pas le rendu. */}
          <img className="pokemon-detail__image" src={pokemon.imageUrl} alt={pokemon.name} />

          {/* Le nom constitue le titre principal de la fiche. */}
          <h1 className="pokemon-detail__title">{pokemon.name}</h1>

          <div>
            {/* Le type est affiché seul car il s'agit de l'information de classification la plus visible. */}
            <TypeBadge name={pokemon.type.name} color={pokemon.type.color} />
          </div>

          {/* La description est optionnelle car tous les Pokémon n'en ont pas forcément une. */}
          {pokemon.description && (
            <p className="pokemon-detail__description">
              {pokemon.description}
            </p>
          )}

          <div className="pokemon-detail__stats">
            {/* On garde les mêmes couleurs que dans la liste pour une cohérence visuelle. */}
            <StatBar label="PV" value={pokemon.hp} color="#FF5959" />
            <StatBar label="Attaque" value={pokemon.attack} color="#F5AC78" />
            <StatBar label="Défense" value={pokemon.defense} color="#FAE078" />
          </div>

          {/* L'édition reste réservée aux utilisateurs connectés. */}
          {isConnected && (
            <div className="form-grid__actions" style={{ marginTop: '0.5rem' }}>
              <button onClick={() => navigate(`/pokemons/${pokemon.id}/edit`)} className="button button--primary">
                Modifier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
