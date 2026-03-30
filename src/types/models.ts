export interface Type {
  id: number;
  name: string;
  color: string;
  iconUrl?: string;
}

export interface TypeCreate {
  name: string;
  color: string;
  iconUrl?: string;
}

export interface Pokemon {
  id: number;
  pokedexNumber: number;
  name: string;
  type: Type;
  hp: number;
  attack: number;
  defense: number;
  imageUrl?: string;
  description?: string;
}

export interface PokemonCreate {
  pokedexNumber: number;
  name: string;
  typeId: number;
  hp: number;
  attack: number;
  defense: number;
  imageUrl?: string;
  description?: string;
}
