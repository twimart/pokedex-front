// Importation de notre 'axiosInstance' qu'on a créé (celui qui ajoute le token).
// Ça veut dire que toutes les requêtes faites ici auront automatiquement le "badge" Keycloak si on est connecté.
import axios from './axiosInstance'
// Importation des 'types' (comme des modèles ou moules). 
// 'Pokemon' définit la forme complète d'un pokémon (id, nom, etc.).
// 'PokemonCreate' définit ce qu'on a le droit d'envoyer pour le créer (sans l'id qui sera généré par le serveur).
import type { Pokemon, PokemonCreate } from '../types/models'

// Récupération de l'adresse de notre serveur (l'API Backend).
// 'import.meta.env' est la façon dont Vite (l'outil de build) accède aux variables d'environnement (ex: fichier .env).
// VITE_API_URL vaut probablement "http://localhost:3000/api" par exemple.
const BASE = import.meta.env.VITE_API_URL

// Fonction pour récupérer la liste de tous les Pokémons.
// Elle accepte un paramètre optionnel "typeId" (ex: 2 pour le type 'Eau') grâce au point d'interrogation "?".
export const getAllPokemons = (typeId?: number) => {
  // On construit l'URL de la requête dynamiquement.
  // Si "typeId" existe (n'est pas undefined), on ajoute le paramètre de recherche "?typeId=..." à l'URL.
  // Sinon on fait une requête simple sur "/pokemons".
  const url = typeId ? `${BASE}/pokemons?typeId=${typeId}` : `${BASE}/pokemons`
  
  // axios.get effectue une requête HTTP de type "GET" (pour lire des données) vers l'URL calculée.
  // <Pokemon[]> précise à TypeScript que l'on attend un tableau (Array) d'objets Pokemon.
  // ".then(r => r.data)" signifie : quand le serveur répond, ne garde que la partie 'data' (les données) de la réponse,
  // et ignore les informations techniques (statut HTTP, en-têtes...).
  return axios.get<Pokemon[]>(url).then(r => r.data)
}

// Fonction pour lire les détails d'un SEUL Pokémon en fonction de son "id" (identifiant unique, ex: 25).
export const getPokemonById = (id: number) => {
  // On appelle la route "/pokemons/25" en GET.
  return axios.get<Pokemon>(`${BASE}/pokemons/${id}`).then(r => r.data)
}

// Fonction pour créer (ajouter) un nouveau Pokémon dans la base de données.
// Elle prend en paramètre un objet de type 'PokemonCreate' (les infos saisies dans le formulaire).
export const createPokemon = (data: PokemonCreate) => {
  // axios.post effectue une requête HTTP de type "POST" (pour envoyer/créer des données).
  // On envoie 'data' (les infos du pokémon) dans le "corps" (body) de la requête.
  return axios.post<Pokemon>(`${BASE}/pokemons`, data).then(r => r.data)
}

// Fonction pour mettre à jour (modifier) un Pokémon existant.
// Elle a besoin de l'id du pokémon à modifier, et des nouvelles données ('PokemonCreate').
export const updatePokemon = (id: number, data: PokemonCreate) => {
  // axios.put effectue une requête HTTP de type "PUT" (souvent utilisé pour les mises à jour complètes).
  return axios.put<Pokemon>(`${BASE}/pokemons/${id}`, data).then(r => r.data)
}

// Fonction pour supprimer un Pokémon.
export const deletePokemon = (id: number) => {
  // axios.delete effectue une requête HTTP de type "DELETE". 
  // Pas besoin de '.then' ici si on se fiche de la réponse (on veut juste déclencher la suppression).
  return axios.delete(`${BASE}/pokemons/${id}`)
}
