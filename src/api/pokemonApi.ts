import axios from './axiosInstance'
import type { Pokemon, PokemonCreate } from '../types/models'

const BASE = import.meta.env.VITE_API_URL

export const getAllPokemons = (typeId?: number) => {
  const url = typeId ? `${BASE}/pokemons?typeId=${typeId}` : `${BASE}/pokemons`
  return axios.get<Pokemon[]>(url).then(r => r.data)
}

export const getPokemonById = (id: number) => axios.get<Pokemon>(`${BASE}/pokemons/${id}`).then(r => r.data)

export const createPokemon = (data: PokemonCreate) => axios.post<Pokemon>(`${BASE}/pokemons`, data).then(r => r.data)

export const updatePokemon = (id: number, data: PokemonCreate) => axios.put<Pokemon>(`${BASE}/pokemons/${id}`, data).then(r => r.data)

export const deletePokemon = (id: number) => axios.delete(`${BASE}/pokemons/${id}`)
