import axios from './axiosInstance'
import type { Type, TypeCreate } from '../types/models'

// Base commune de l'API pour toutes les opérations sur les types.
const BASE = import.meta.env.VITE_API_URL

// Liste complète des types.
export const getAllTypes = () => axios.get<Type[]>(`${BASE}/types`).then(r => r.data)

// Détail d'un type par identifiant.
export const getTypeById = (id: number) => axios.get<Type>(`${BASE}/types/${id}`).then(r => r.data)

// Création d'un type.
export const createType = (data: TypeCreate) => axios.post<Type>(`${BASE}/types`, data).then(r => r.data)

// Mise à jour d'un type.
export const updateType = (id: number, data: TypeCreate) => axios.put<Type>(`${BASE}/types/${id}`, data).then(r => r.data)

// Suppression d'un type.
export const deleteType = (id: number) => axios.delete(`${BASE}/types/${id}`)
