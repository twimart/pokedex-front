import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getAllPokemons } from '../api/pokemonApi'
import { getAllTypes } from '../api/typeApi'
import { deletePokemon } from '../api/pokemonApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'
import ConfirmDialog from '../components/ConfirmDialog'
import keycloak from '../auth/keycloak'

export default function PokemonList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const isConnected = keycloak.authenticated === true

  const { data: types } = useQuery({
    queryKey: ['types'],
    queryFn: getAllTypes
  })

  const { data: pokemons, isLoading } = useQuery({
    queryKey: ['pokemons', typeFilter],
    queryFn: () => getAllPokemons(typeFilter)
  })

  const deleteMutation = useMutation({
    mutationFn: deletePokemon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pokemons'] })
      setDeleteId(null)
    }
  })

  if (isLoading) return <div>Chargement...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pokédex</h1>
          <p>Explore les créatures, filtre par type et gère ton équipe.</p>
        </div>
        <div className="page-actions">
          <select
            value={typeFilter || ''}
            onChange={e => setTypeFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="pokemon-filter"
          >
            <option value="">Tous les types</option>
            {types?.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          {isConnected && (
            <button onClick={() => navigate('/pokemons/new')} className="button button--primary">
              + Ajouter
            </button>
          )}
        </div>
      </div>

      <div className="pokemon-grid">
        {pokemons?.map(pokemon => (
          <div
            key={pokemon.id}
            onClick={() => navigate(`/pokemons/${pokemon.id}`)}
            className="pokemon-card"
            style={{ borderColor: `${pokemon.type.color}55` }}
          >
            <div className="pokemon-card__image-wrap">
              <img
                className="pokemon-card__image"
                src={pokemon.imageUrl}
                alt={pokemon.name}
                loading="lazy"
                onError={e => {
                  e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'
                }}
              />
              <span className="pokemon-card__number">
                #{String(pokemon.pokedexNumber).padStart(3, '0')}
              </span>
            </div>
            <p className="pokemon-card__title"><strong>{pokemon.name}</strong></p>
            <div className="pokemon-card__type">
              <TypeBadge name={pokemon.type.name} color={pokemon.type.color} />
            </div>
            <div>
              <StatBar label="HP" value={pokemon.hp} color="#FF5959" />
              <StatBar label="ATK" value={pokemon.attack} color="#F5AC78" />
              <StatBar label="DEF" value={pokemon.defense} color="#FAE078" />
            </div>
              {isConnected && (
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/pokemons/${pokemon.id}/edit`)} className="button button--primary">
                    Éditer
                  </button>
                  <button onClick={() => setDeleteId(pokemon.id)} className="button button--danger">
                    Supprimer
                  </button>
                </div>
              )}
          </div>
        ))}
      </div>

      {!pokemons?.length && <div className="empty-state">Aucun Pokémon trouvé.</div>}

      <ConfirmDialog
        open={deleteId !== null}
        title="Supprimer un Pokémon"
        message="Êtes-vous sûr de vouloir supprimer ce Pokémon ? Cette action est irréversible."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
