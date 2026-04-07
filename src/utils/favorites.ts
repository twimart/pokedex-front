export const FAVORITES_STORAGE_PREFIX = 'pokedex-favorites'

export const getFavoritesStorageKey = (username?: string | null) => {
  return `${FAVORITES_STORAGE_PREFIX}:${username || 'guest'}`
}

export const readFavoriteIds = (username?: string | null) => {
  if (typeof window === 'undefined') return [] as number[]

  try {
    const raw = window.localStorage.getItem(getFavoritesStorageKey(username))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : []
  } catch {
    return [] as number[]
  }
}

export const writeFavoriteIds = (ids: number[], username?: string | null) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getFavoritesStorageKey(username), JSON.stringify(ids))
}

export const toggleFavoriteId = (id: number, username?: string | null) => {
  const current = readFavoriteIds(username)
  const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id]
  writeFavoriteIds(next, username)
  return next
}
