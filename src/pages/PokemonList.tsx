// Importation des hooks React de base: 
// useEffect (pour exécuter du code à certains moments), useMemo (pour mémoriser des calculs lourds) et useState (pour créer des variables d'état).
import { useEffect, useMemo, useState } from 'react'
// Importation des hooks de React Query pour gérer les requêtes serveur:
// useQuery (pour lire des données) et useMutation/useQueryClient (pour modifier des données et rafraîchir le cache).
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// Importation du hook pour changer de page sans recharger le navigateur.
import { useNavigate } from 'react-router-dom'
// Importation de nos fonctions qui font les appels réseaux (définies dans api/pokemonApi.ts et api/typeApi.ts).
import { getAllPokemons, deletePokemon } from '../api/pokemonApi'
import { getAllTypes } from '../api/typeApi'
// Importation de petits composants visuels réutilisables.
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'
import ConfirmDialog from '../components/ConfirmDialog'
// Importation de Keycloak pour vérifier si l'utilisateur a le droit de voir certains boutons.
import keycloak from '../auth/keycloak'
// Utilitaires locaux pour gérer les favoris (lire depuis le cache/stockage).
import { readFavoriteIds, toggleFavoriteId } from '../utils/favorites'
// Type TypeScript qui décrit à quoi ressemble un Pokémon.
import type { Pokemon } from '../types/models'

// Définition des différentes manières possibles de trier la liste (Numéro croissant, Nom, etc.)
type PokemonSort = 'number-asc' | 'name-asc' | 'hp-desc' | 'attack-desc' | 'defense-desc'

// Options pour le nombre de Pokémons à afficher par page.
const PAGE_SIZES = [8, 12, 16]

// Fonction "utilitaire" qui permet de comparer deux Pokémons (a et b) selon un critère de tri.
// Elle est utilisée plus bas par la méthode javascript ".sort()".
const comparePokemon = (a: Pokemon, b: Pokemon, sort: PokemonSort) => {
  if (sort === 'number-asc') return a.pokedexNumber - b.pokedexNumber
  // localeCompare permet de trier alphabétiquement en gérant bien les accents ('fr').
  if (sort === 'name-asc') return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
  if (sort === 'hp-desc') return b.hp - a.hp // Tri décroissant: on met le 'b' avant le 'a'
  if (sort === 'attack-desc') return b.attack - a.attack
  return b.defense - a.defense
}

// Fonction générique (<T,>) pour lire un réglage dans la mémoire du navigateur (localStorage).
// Si le réglage n'existe pas, elle renvoie une valeur par défaut (fallback).
const readSetting = <T,>(key: string, fallback: T, parse: (value: string) => T) => {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return parse(raw)
  } catch {
    return fallback
  }
}

// ==========================================
// COMPOSANT PRINCIPAL DE LA PAGE
// ==========================================
export default function PokemonList() {
  // Navigation permet de changer d'URL programmatiquement (ex: navigate('/pokemons/25')).
  const navigate = useNavigate()
  // queryClient permet de contrôler le cache de React Query (ex: pour forcer le re-téléchargement de la liste).
  const queryClient = useQueryClient()
  
  // -- DÉCLARATION DES ÉTATS (STATES) --
  // typeFilter: retient l'ID du type sélectionné dans la liste déroulante (ex: 2 pour 'Eau'). S'il est undefined, on voit tout.
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined)
  
  // search: le texte tapé dans la barre de recherche. (On initialise en lisant le localStorage).
  const [search, setSearch] = useState(() => readSetting('pokedex-pokemon-search', '', value => value))
  // sort: le critère de tri actuel (ex: 'name-asc').
  const [sort, setSort] = useState<PokemonSort>(() => readSetting('pokedex-pokemon-sort', 'number-asc', value => value as PokemonSort))
  // pageSize: combien d'éléments on affiche par page.
  const [pageSize, setPageSize] = useState(() => readSetting('pokedex-pokemon-pagesize', 12, value => Number(value)))
  // page: le numéro de la page actuelle.
  const [page, setPage] = useState(1)
  // deleteId: stocke temporairement l'ID du Pokémon qu'on est sur le point de supprimer (pour afficher la popup de confirmation).
  const [deleteId, setDeleteId] = useState<number | null>(null)
  // favoriteIds: tableau contenant les IDs des Pokémons favoris.
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  // Variables calculées pour l'authentification :
  // On vérifie si keycloak.authenticated vaut VRAIMENT true (et pas null/undefined).
  const isConnected = keycloak.authenticated === true
  // On récupère le nom de l'utilisateur s'il est connecté.
  const username = keycloak.tokenParsed?.preferred_username ?? null

  // Ce useEffect s'exécute quand la variable 'username' change (donc quand on se connecte ou déconnecte).
  // Il va charger les favoris spécifiques à cet utilisateur depuis le stockage.
  useEffect(() => {
    setFavoriteIds(readFavoriteIds(username))
  }, [username])

  // Ce useEffect s'exécute à chaque fois que la taille de page, la recherche ou le tri changent.
  // Son but est de sauvegarder ces choix dans le localStorage pour les retrouver si on ferme l'onglet.
  useEffect(() => {
    window.localStorage.setItem('pokedex-pokemon-search', search)
    window.localStorage.setItem('pokedex-pokemon-sort', sort)
    window.localStorage.setItem('pokedex-pokemon-pagesize', String(pageSize))
  }, [pageSize, search, sort])

  // -- RÉCUPÉRATION DES DONNÉES (FETCH) --
  // useQuery pour télécharger la liste de tous les types (Feu, Eau...).
  // La "queryKey" ('types') est le nom de cette donnée dans le cache.
  const { data: types } = useQuery({
    queryKey: ['types'],
    queryFn: getAllTypes
  })

  // useQuery pour télécharger la liste des Pokémons.
  // La clé de cache inclut "typeFilter". Ça veut dire que si on filtre sur "Feu" (id:2), 
  // React Query va créer un cache spécifique pour ['pokemons', 2].
  const { data: pokemons, isLoading } = useQuery({
    queryKey: ['pokemons', typeFilter],
    // La fonction qui fait vraiment la requête HTTP.
    queryFn: () => getAllPokemons(typeFilter)
  })

  // -- CALCULS LOURDS --
  // useMemo permet de mémoriser le résultat du filtrage et du tri. 
  // Ce code ne sera ré-exécuté QUE SI 'pokemons', 'search' ou 'sort' changent.
  // Sans useMemo, React referait tout ce calcul à chaque fois que tu tapes une lettre dans la recherche, ce qui pourrait ralentir.
  const filteredPokemons = useMemo(() => {
    // On met la recherche en minuscule pour ne pas être sensible à la casse (A = a).
    const term = search.trim().toLowerCase()
    return (pokemons ?? [])
      .filter(pokemon => {
        if (!term) return true // Si la barre est vide, on garde tout le monde.
        // Sinon, on garde si le nom contient le texte, ou si le numéro correspond.
        return pokemon.name.toLowerCase().includes(term) || String(pokemon.pokedexNumber).includes(term)
      })
      // Enfin, on trie le tableau résultant en utilisant notre fonction 'comparePokemon'.
      .sort((a, b) => comparePokemon(a, b, sort))
  }, [pokemons, search, sort])

  // -- PAGINATION --
  // On calcule le nombre total de pages nécessaires. 
  // Math.max(1, ...) assure qu'on aura toujours au moins 1 page, même s'il n'y a aucun résultat.
  const totalPages = Math.max(1, Math.ceil(filteredPokemons.length / pageSize))
  // Sécurité: Si on est sur la page 4 mais qu'on lance une recherche qui n'a que 1 page de résultats, 
  // on force currentPage à 1 au lieu de rester bloqué sur la page 4 (qui est vide).
  const currentPage = Math.min(page, totalPages)
  
  // On découpe la grosse liste filtrée pour ne garder que la tranche correspondant à la page actuelle.
  const visiblePokemons = filteredPokemons.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // -- MUTATIONS (MODIFICATION DE DONNÉES) --
  // useMutation gère les appels réseaux qui modifient des données (POST, PUT, DELETE).
  const deleteMutation = useMutation({
    mutationFn: deletePokemon, // La fonction qui fait la requête DELETE
    onSuccess: () => {
      // Une fois la suppression réussie sur le serveur :
      // 1. On dit à React Query "attention, ta liste de pokémons est obsolète, retélécharge-la !".
      queryClient.invalidateQueries({ queryKey: ['pokemons'] })
      // 2. On ferme la modale de confirmation en remettant deleteId à null.
      setDeleteId(null)
    }
  })

  // Si on change les filtres, le tri, ou le nombre d'éléments, on force un retour à la page 1.
  useEffect(() => {
    setPage(1)
  }, [search, sort, pageSize, typeFilter])

  // -- RENDU VISUEL --
  // Si la première requête des pokémons est en cours, on affiche un message d'attente pour ne pas crasher.
  if (isLoading) return <div>Chargement...</div>

  return (
    <div>
      {/* En-tête de la page avec le titre et les filtres */}
      <div className="page-header">
        <div>
          <h1>Pokédex</h1>
          <p>Explore les créatures, filtre par type et gère ton équipe.</p>
        </div>
        
        {/* Conteneur pour la barre de recherche et les listes déroulantes (selects) */}
        <div className="page-actions">
          {/* Input contrôlé: sa valeur est liée à l'état 'search' et onChange met à jour cet état. */}
          <input
            className="pokemon-filter pokemon-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un Pokémon"
            aria-label="Rechercher un Pokémon"
          />
          
          {/* Sélecteur de Type (Feu, Eau...) */}
          <select
            value={typeFilter || ''}
            // Si l'utilisateur choisit l'option vide (Tous les types), e.target.value est vide, donc on met 'undefined'.
            // Sinon on convertit la valeur textuelle en Nombre (ex: "2" devient 2).
            onChange={e => setTypeFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="pokemon-filter"
          >
            <option value="">Tous les types</option>
            {/* On boucle sur les types téléchargés pour créer les options du menu */}
            {types?.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          
          {/* Sélecteur de Tri */}
          <select value={sort} onChange={e => setSort(e.target.value as PokemonSort)} className="pokemon-filter" aria-label="Trier les Pokémon">
            <option value="number-asc">Numéro</option>
            <option value="name-asc">Nom</option>
            <option value="hp-desc">HP</option>
            <option value="attack-desc">Attaque</option>
            <option value="defense-desc">Défense</option>
          </select>
          
          {/* Sélecteur du nombre d'éléments par page */}
          <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="pokemon-filter" aria-label="Nombre d'éléments par page">
            {PAGE_SIZES.map(size => <option key={size} value={size}>{size}/page</option>)}
          </select>
          
          {/* Le bouton d'ajout n'apparaît que si la variable 'isConnected' est vraie. */}
          {isConnected && (
            <button onClick={() => navigate('/pokemons/new')} className="button button--primary">
              + Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Grille principale affichant les cartes des Pokémons */}
      <div className="pokemon-grid">
        {/* On boucle uniquement sur les pokémons "visibles" (ceux de la page actuelle, après filtrage). */}
        {visiblePokemons.map(pokemon => (
          <div
            key={pokemon.id} // Obligatoire dans React : une clé unique pour chaque élément généré par une boucle.
            // Quand on clique sur n'importe quel endroit de la carte, on navigue vers la page détail du Pokémon.
            onClick={() => navigate(`/pokemons/${pokemon.id}`)}
            className="pokemon-card"
            // On utilise la couleur du type du pokémon pour teinter la bordure de la carte (avec '55' pour la rendre semi-transparente en Hexadécimal).
            style={{ borderColor: `${pokemon.type.color}55` }}
          >
            {/* Section Image et Numéro */}
            <div className="pokemon-card__image-wrap">
              <img
                className="pokemon-card__image"
                src={pokemon.imageUrl}
                alt={pokemon.name}
                loading="lazy" // Optimisation navigateur: l'image ne se charge que si elle est sur le point d'apparaître à l'écran.
                // onError : Si l'URL de l'image est cassée ou introuvable, on remplace la source par une image par défaut (un œuf ou un point d'interrogation).
                onError={e => {
                  e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'
                }}
              />
              <span className="pokemon-card__number">
                {/* Affiche le numéro formaté sur 3 chiffres (ex: 7 devient '007') */}
                #{String(pokemon.pokedexNumber).padStart(3, '0')}
              </span>
            </div>
            
            <p className="pokemon-card__title"><strong>{pokemon.name}</strong></p>
            
            <div className="pokemon-card__type">
              {/* On appelle notre composant TypeBadge en lui donnant le nom et la couleur du type. */}
              <TypeBadge name={pokemon.type.name} color={pokemon.type.color} />
            </div>
            
            {/* Bouton pour ajouter/retirer des Favoris (Le petit cœur) */}
            <button
              type="button"
              className={`pokemon-card__favorite ${favoriteIds.includes(pokemon.id) ? 'is-active' : ''}`}
              onClick={e => {
                // e.stopPropagation() est TRÈS IMPORTANT ici.
                // Sans ça, cliquer sur le cœur cliquerait AUSSI sur la carte entière (qui a un onClick pour changer de page).
                // Ça permet d'isoler l'action de "mise en favoris" sans quitter la page.
                e.stopPropagation()
                setFavoriteIds(toggleFavoriteId(pokemon.id, username))
              }}
              aria-label={favoriteIds.includes(pokemon.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              {favoriteIds.includes(pokemon.id) ? '♥' : '♡'}
            </button>
            
            {/* Section des statistiques */}
            <div>
              {/* StatBar est un autre composant de ton dossier src/components. On lui passe les valeurs. */}
              <StatBar label="HP" value={pokemon.hp} color="#FF5959" />
              <StatBar label="ATK" value={pokemon.attack} color="#F5AC78" />
              <StatBar label="DEF" value={pokemon.defense} color="#FAE078" />
            </div>
            
            {/* Boutons d'édition et suppression (visibles uniquement pour les connectés) */}
            {isConnected && (
              // Même chose qu'avec le cœur : on empêche le clic d'activer la navigation de la carte.
              <div className="card-actions" onClick={e => e.stopPropagation()}>
                <button onClick={() => navigate(`/pokemons/${pokemon.id}/edit`)} className="button button--primary">
                  Éditer
                </button>
                {/* Au lieu de supprimer direct, on stocke l'ID dans 'deleteId'.
                    Cela va déclencher l'ouverture de la popup ConfirmDialog plus bas. */}
                <button onClick={() => setDeleteId(pokemon.id)} className="button button--danger">
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Barre de Pagination (en bas de la liste) */}
      <div className="pagination-shell">
        <span>{filteredPokemons.length} résultat(s)</span>
        <div className="pagination-shell__actions">
          {/* Bouton Précédent: On empêche de descendre sous la page 1. Le bouton est 'disabled' si on est déjà page 1. */}
          <button className="button button--ghost" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={currentPage === 1}>Précédent</button>
          <span>Page {currentPage} / {totalPages}</span>
          {/* Bouton Suivant: On empêche de dépasser le totalPages. */}
          <button className="button button--ghost" onClick={() => setPage(value => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages}>Suivant</button>
        </div>
      </div>

      {/* Message affiché si la recherche/filtre ne trouve absolument aucun Pokémon */}
      {!visiblePokemons.length && <div className="empty-state">Aucun Pokémon trouvé.</div>}

      {/* Composant ConfirmDialog : une modale personnalisée (popup).
          Elle est ouverte (open=true) SEULEMENT SI 'deleteId' n'est pas 'null' (donc si on a cliqué sur 'Supprimer'). */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Supprimer un Pokémon"
        message="Êtes-vous sûr de vouloir supprimer ce Pokémon ? Cette action est irréversible."
        // Si l'utilisateur clique sur Confirmer dans la popup, on lance la mutation (l'appel réseau DELETE).
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        // S'il clique sur Annuler, on remet deleteId à null, ce qui ferme la popup.
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
