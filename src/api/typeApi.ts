import axios from './axiosInstance'
import type { Type, TypeCreate } from '../types/models'

const BASE = import.meta.env.VITE_API_URL

export const getAllTypes = () => axios.get<Type[]>(`${BASE}/types`).then(r => r.data)

export const getTypeById = (id: number) => axios.get<Type>(`${BASE}/types/${id}`).then(r => r.data)

export const createType = (data: TypeCreate) => axios.post<Type>(`${BASE}/types`, data).then(r => r.data)

export const updateType = (id: number, data: TypeCreate) => axios.put<Type>(`${BASE}/types/${id}`, data).then(r => r.data)

export const deleteType = (id: number) => axios.delete(`${BASE}/types/${id}`)
