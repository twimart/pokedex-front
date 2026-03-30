import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createType, updateType, getTypeById } from '../api/typeApi'
import type { TypeCreate } from '../types/models'
import keycloak from '../auth/keycloak'

export default function TypeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)
  const isConnected = keycloak.authenticated === true

  const { data: existingType } = useQuery({
    queryKey: ['type', id],
    queryFn: () => getTypeById(Number(id)),
    enabled: isEdit
  })

  const [formData, setFormData] = useState<TypeCreate>({
    name: '',
    color: '#000000',
    iconUrl: ''
  })

  const [error, setError] = useState('')

  useEffect(() => {
    if (existingType) {
      setFormData({
        name: existingType.name,
        color: existingType.color,
        iconUrl: existingType.iconUrl || ''
      })
    }
  }, [existingType])

  const mutation = useMutation({
    mutationFn: (data: TypeCreate) => isEdit ? updateType(Number(id), data) : createType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types'] })
      navigate('/types')
    },
    onError: () => {
      setError('Une erreur est survenue')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Le nom est requis')
      return
    }
    if (!formData.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      setError('Couleur invalide')
      return
    }
    setError('')
    mutation.mutate(formData)
  }

  return (
    <div className="form-layout">
      {!isConnected && <div className="empty-state">Connexion requise pour modifier les données.</div>}
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Modifier' : 'Créer'} un Type</h1>
          <p>Définis un nom, une couleur et une icône optionnelle.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-field">
          <input
            type="text"
            placeholder="Nom *"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="field"
            style={error && !formData.name ? { borderColor: '#e53935' } : undefined}
          />
        </div>

        <div className="type-color-row">
          <label style={{ fontWeight: 800 }}>Couleur</label>
          <input
            type="color"
            value={formData.color}
            onChange={e => setFormData({ ...formData, color: e.target.value })}
            className="type-color-swatch"
            style={{ padding: 0, border: 'none', backgroundColor: formData.color }}
          />
          <span style={{ fontFamily: 'monospace', color: 'var(--color-muted)' }}>{formData.color}</span>
        </div>

        <input
          type="text"
          placeholder="URL de l'icône (optionnel)"
          value={formData.iconUrl || ''}
          onChange={e => setFormData({ ...formData, iconUrl: e.target.value })}
          className="field"
        />

        {error && <span style={{ color: '#e53935' }}>{error}</span>}

        <div className="form-grid__actions">
          <button type="submit" disabled={mutation.isPending} className="button button--primary">
            {mutation.isPending ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}
          </button>
          <button type="button" onClick={() => navigate('/types')} className="button button--ghost">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
