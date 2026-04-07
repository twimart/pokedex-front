import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getAllTypes, deleteType } from '../api/typeApi'
import ConfirmDialog from '../components/ConfirmDialog'
import keycloak from '../auth/keycloak'

export default function TypeList() {
  // On garde le même schéma que pour les Pokémon: navigation, cache et ouverture de modale.
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [search, setSearch] = useState(() => window.localStorage.getItem('pokedex-type-search') ?? '')
  const [sort, setSort] = useState<'name-asc' | 'name-desc' | 'color-asc'>(() => (window.localStorage.getItem('pokedex-type-sort') as 'name-asc' | 'name-desc' | 'color-asc') || 'name-asc')
  const isConnected = keycloak.authenticated === true

  // La liste des types est chargée une seule fois puis partagée via le cache.
  const { data: types, isLoading } = useQuery({
    queryKey: ['types'],
    queryFn: getAllTypes
  })

  const visibleTypes = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = (types ?? []).filter(type => !term || type.name.toLowerCase().includes(term) || type.color.toLowerCase().includes(term))

    return list.sort((a, b) => {
      if (sort === 'name-desc') return b.name.localeCompare(a.name, 'fr', { sensitivity: 'base' })
      if (sort === 'color-asc') return a.color.localeCompare(b.color, 'fr', { sensitivity: 'base' })
      return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
    })
  }, [search, sort, types])

  useEffect(() => {
    window.localStorage.setItem('pokedex-type-search', search)
    window.localStorage.setItem('pokedex-type-sort', sort)
  }, [search, sort])

  // La suppression reste une mutation dédiée, séparée du simple affichage.
  const deleteMutation = useMutation({
    mutationFn: deleteType,
    onSuccess: () => {
      // La liste des types doit être rafraîchie après suppression pour rester cohérente.
      queryClient.invalidateQueries({ queryKey: ['types'] })
      setDeleteId(null)
    },
    onError: (error: any) => {
      // Le backend peut renvoyer un message précis si un type est encore utilisé ailleurs.
      const message = error?.response?.data?.message || 'Impossible de supprimer ce type'
      alert(message)
      setDeleteId(null)
    }
  })

  // Comme pour la liste des Pokémon, on affiche un état de chargement tant que les données sont absentes.
  if (isLoading) return <div>Chargement...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Types</h1>
          <p>Gère les familles et leurs couleurs iconiques.</p>
        </div>
        <div className="page-actions">
          <input
            className="pokemon-filter pokemon-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un type"
            aria-label="Rechercher un type"
          />
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="pokemon-filter" aria-label="Trier les types">
            <option value="name-asc">Nom A-Z</option>
            <option value="name-desc">Nom Z-A</option>
            <option value="color-asc">Couleur</option>
          </select>
          {/* Les utilisateurs connectés peuvent ajouter un nouveau type depuis cette vue. */}
          {isConnected && (
            <button onClick={() => navigate('/types/new')} className="button button--primary">
              + Ajouter un Type
            </button>
          )}
        </div>
      </div>

      <div className="table-shell">
        {/* Une table est plus lisible qu'une grille pour comparer couleur et nom. */}
        <table>
          <thead>
            <tr>
              <th>Couleur</th>
              <th>Nom</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTypes.map(type => (
              <tr key={type.id}>
                <td>
                  {/* Le carré couleur permet de visualiser rapidement le style du type. */}
                  <div className="type-color-row">
                    {/* Le swatch reprend la couleur brute renvoyée par l'API. */}
                    <span className="type-color-swatch" style={{ backgroundColor: type.color }} />
                    <span style={{ fontFamily: 'monospace', color: 'var(--color-muted)' }}>{type.color}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 800 }}>{type.name}</td>
                <td>
                  {isConnected && (
                    <>
                      {/* Les actions de modification sont réservées aux utilisateurs authentifiés. */}
                      <button onClick={() => navigate(`/types/${type.id}/edit`)} className="button button--primary" style={{ marginRight: '0.5rem' }}>
                        Éditer
                      </button>
                      <button onClick={() => setDeleteId(type.id)} className="button button--danger">
                        Supprimer
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation séparée pour limiter les suppressions accidentelles. */}
      {!visibleTypes.length && <div className="empty-state">Aucun type trouvé.</div>}

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
