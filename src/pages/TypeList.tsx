import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getAllTypes, deleteType } from '../api/typeApi'
import ConfirmDialog from '../components/ConfirmDialog'

export default function TypeList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: types, isLoading } = useQuery({
    queryKey: ['types'],
    queryFn: getAllTypes
  })

  const deleteMutation = useMutation({
    mutationFn: deleteType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types'] })
      setDeleteId(null)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Impossible de supprimer ce type'
      alert(message)
      setDeleteId(null)
    }
  })

  if (isLoading) return <div>Chargement...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Types</h1>
          <p>Gère les familles et leurs couleurs iconiques.</p>
        </div>
        <div className="page-actions">
          <button onClick={() => navigate('/types/new')} className="button button--primary">
          + Ajouter un Type
          </button>
        </div>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Couleur</th>
              <th>Nom</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {types?.map(type => (
              <tr key={type.id}>
                <td>
                  <div className="type-color-row">
                    <span className="type-color-swatch" style={{ backgroundColor: type.color }} />
                    <span style={{ fontFamily: 'monospace', color: 'var(--color-muted)' }}>{type.color}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 800 }}>{type.name}</td>
                <td>
                  <button onClick={() => navigate(`/types/${type.id}/edit`)} className="button button--primary" style={{ marginRight: '0.5rem' }}>
                    Éditer
                  </button>
                  <button onClick={() => setDeleteId(type.id)} className="button button--danger">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!types?.length && <div className="empty-state">Aucun type trouvé.</div>}

      <ConfirmDialog
        open={deleteId !== null}
        title="Supprimer un Type"
        message="Êtes-vous sûr de vouloir supprimer ce type ? Les Pokémons associés ne seront pas supprimés."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
