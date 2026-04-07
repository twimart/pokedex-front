export interface Type {
  id: number;
  // Libellé affiché dans l'interface.
  name: string;
  // Couleur associée au type pour les badges et les tableaux.
  color: string;
  // Icône optionnelle affichée si le backend en fournit une.
  iconUrl?: string;
}

export interface TypeCreate {
  name: string;
  color: string;
  iconUrl?: string;
}

export interface Pokemon {
  id: number;
  // Numéro dans le Pokédex, affiché avec un formatage sur 3 chiffres.
  pokedexNumber: number;
  // Nom humain du Pokémon.
  name: string;
  // Objet Type complet pour éviter un second appel lors de l'affichage.
  type: Type;
  // Statistiques principales du Pokémon.
  hp: number;
  attack: number;
  defense: number;
  // Ressource visuelle facultative.
  imageUrl?: string;
  // Description libre affichée dans la fiche détail.
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
