import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPokemon, updatePokemon, getPokemonById } from '../api/pokemonApi'
import { getAllTypes } from '../api/typeApi'
import type { PokemonCreate } from '../types/models'
import keycloak from '../auth/keycloak'

export default function PokemonForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)
  const isConnected = keycloak.authenticated === true

  const { data: types } = useQuery({
    queryKey: ['types'],
    queryFn: getAllTypes
  })

  const { data: existingPokemon } = useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => getPokemonById(Number(id)),
    enabled: isEdit
  })

  const [formData, setFormData] = useState<PokemonCreate>({
    pokedexNumber: 0,
    name: '',
    typeId: 0,
    hp: 0,
    attack: 0,
    defense: 0,
    imageUrl: '',
    description: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (existingPokemon) {
      setFormData({
        pokedexNumber: existingPokemon.pokedexNumber,
        name: existingPokemon.name,
        typeId: existingPokemon.type.id,
        hp: existingPokemon.hp,
        attack: existingPokemon.attack,
        defense: existingPokemon.defense,
        imageUrl: existingPokemon.imageUrl || '',
        description: existingPokemon.description || ''
      })
    }
  }, [existingPokemon])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    if (formData.pokedexNumber < 1) newErrors.pokedexNumber = 'Le numéro doit être >= 1'
    if (formData.typeId < 1) newErrors.typeId = 'Le type est requis'
    if (formData.hp < 1) newErrors.hp = 'HP doit être >= 1'
    if (formData.attack < 1) newErrors.attack = 'Attaque doit être >= 1'
    if (formData.defense < 1) newErrors.defense = 'Défense doit être >= 1'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const mutation = useMutation({
    mutationFn: (data: PokemonCreate) => isEdit ? updatePokemon(Number(id), data) : createPokemon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pokemons'] })
      navigate('/pokemons')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      mutation.mutate(formData)
    }
  }

  return (
    <div className="form-layout">
      {!isConnected && <div className="empty-state">Connexion requise pour modifier les données.</div>}
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Modifier' : 'Créer'} un Pokémon</h1>
          <p>Remplis les stats et associe un type à ton Pokémon.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-field">
          <input
            type="number"
            placeholder="Numéro Pokédex *"
            value={formData.pokedexNumber || ''}
            onChange={e => setFormData({ ...formData, pokedexNumber: Number(e.target.value) })}
            className="field"
            style={errors.pokedexNumber ? { borderColor: '#e53935' } : undefined}
          />
          {errors.pokedexNumber && <span style={{ color: '#e53935', fontSize: '0.8rem' }}>{errors.pokedexNumber}</span>}
        </div>

        <div className="form-field">
          <input
            type="text"
            placeholder="Nom *"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="field"
            style={errors.name ? { borderColor: '#e53935' } : undefined}
          />
          {errors.name && <span style={{ color: '#e53935', fontSize: '0.8rem' }}>{errors.name}</span>}
        </div>

        <div className="form-field">
          <select
            value={formData.typeId || ''}
            onChange={e => setFormData({ ...formData, typeId: Number(e.target.value) })}
            className="field"
            style={errors.typeId ? { borderColor: '#e53935' } : undefined}
          >
            <option value="">Sélectionner un type *</option>
            {types?.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          {errors.typeId && <span style={{ color: '#e53935', fontSize: '0.8rem' }}>{errors.typeId}</span>}
        </div>

        <div className="form-grid form-grid--three">
          <div className="form-field">
            <input
              type="number"
              placeholder="HP * (>= 1)"
              value={formData.hp || ''}
              onChange={e => setFormData({ ...formData, hp: Number(e.target.value) })}
              className="field"
              style={errors.hp ? { borderColor: '#e53935' } : undefined}
            />
            {errors.hp && <span style={{ color: '#e53935', fontSize: '0.8rem' }}>{errors.hp}</span>}
          </div>
          <div className="form-field">
            <input
              type="number"
              placeholder="Attaque * (>= 1)"
              value={formData.attack || ''}
              onChange={e => setFormData({ ...formData, attack: Number(e.target.value) })}
              className="field"
              style={errors.attack ? { borderColor: '#e53935' } : undefined}
            />
            {errors.attack && <span style={{ color: '#e53935', fontSize: '0.8rem' }}>{errors.attack}</span>}
          </div>
          <div className="form-field">
            <input
              type="number"
              placeholder="Défense * (>= 1)"
              value={formData.defense || ''}
              onChange={e => setFormData({ ...formData, defense: Number(e.target.value) })}
              className="field"
              style={errors.defense ? { borderColor: '#e53935' } : undefined}
            />
            {errors.defense && <span style={{ color: '#e53935', fontSize: '0.8rem' }}>{errors.defense}</span>}
          </div>
        </div>

        <input type="text" placeholder="URL de l'image" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="field" />

        <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="field" />

        <div className="form-grid__actions">
          <button type="submit" disabled={mutation.isPending} className="button button--primary">
            {mutation.isPending ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}
          </button>
          <button type="button" onClick={() => navigate('/pokemons')} className="button button--ghost">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
