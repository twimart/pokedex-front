# pokedex-front

Frontend React + Vite pour la Pokédex full stack.

Ce repository contient l’interface visible par l’utilisateur.
Son rôle est de:
- afficher les Pokémon et les types
- appeler l’API du back
- gérer le login via Keycloak
- permettre la création, la modification et la suppression quand l’utilisateur est connecté
- afficher les favoris locaux
- proposer une navigation simple et compréhensible

## Idée générale

Le front ne stocke pas la vérité métier.
Il affiche des données qui viennent du back, puis envoie des actions au back.

En pratique:
- le front demande les Pokémon
- le back répond en JSON
- le front transforme ce JSON en cartes, tableaux et formulaires

## Architecture du code

```text
src/
├── api/
│   ├── pokemonApi.ts
│   ├── typeApi.ts
│   └── axiosInstance.ts
├── auth/
│   ├── keycloak.ts
│   └── PrivateRoute.tsx
├── components/
│   ├── Navbar.tsx
│   ├── ConfirmDialog.tsx
│   ├── TypeBadge.tsx
│   └── StatBar.tsx
├── pages/
│   ├── PokemonList.tsx
│   ├── PokemonDetail.tsx
│   ├── PokemonForm.tsx
│   ├── TypeList.tsx
│   ├── TypeForm.tsx
│   └── Favorites.tsx
├── types/
│   └── models.ts
└── utils/
    └── favorites.ts
```

## Rôle des dossiers

### `pages`

Ce sont les écrans complets de l’application.

Exemples:
- la liste des Pokémon
- la fiche d’un Pokémon
- le formulaire de création ou d’édition
- la liste des types
- la page des favoris

### `components`

Ce sont des morceaux d’interface réutilisables.

Exemples:
- `Navbar` pour la barre de navigation
- `TypeBadge` pour afficher un type dans une pastille colorée
- `StatBar` pour représenter une statistique visuellement
- `ConfirmDialog` pour éviter une suppression accidentelle

### `api`

Ce dossier centralise les appels HTTP.

Le but est simple:
- ne pas écrire des appels `fetch` ou `axios` partout dans le code
- garder une seule manière de parler au back
- réutiliser les mêmes fonctions dans plusieurs pages

### `auth`

Ici se trouve tout ce qui concerne Keycloak:
- l’objet Keycloak unique
- la protection des routes privées

### `types`

Ce dossier décrit la forme des données manipulées par TypeScript.

Cela aide à savoir exactement à quoi ressemble un `Pokemon` ou un `Type`.

### `utils`

Petites fonctions utilitaires.
Ici, elles servent surtout à gérer les favoris locaux.

## Services et ports

| Service | URL/Port |
|---|---|
| Frontend Vite | `http://localhost:5173` |
| API Spring Boot | `http://localhost:8080/api/v1` |
| Keycloak | `http://localhost:8180` |
| Kibana | `http://localhost:5601` |

## Point d’entrée de l’application

Le front démarre dans `src/main.tsx`.

Ce fichier:
- monte React dans la page HTML
- charge la feuille CSS globale
- initialise Keycloak en arrière-plan avec `check-sso`

`check-sso` veut dire:
- si l’utilisateur est déjà connecté, la session est récupérée
- sinon, l’application reste accessible en mode non connecté

## Organisation des pages

Dans `src/App.tsx`, on trouve le routeur principal.

Les routes importantes sont:
- `/pokemons` pour la liste principale
- `/pokemons/:id` pour la fiche détaillée
- `/pokemons/new` pour créer un Pokémon
- `/pokemons/:id/edit` pour modifier un Pokémon
- `/types` pour la liste des types
- `/types/new` pour créer un type
- `/types/:id/edit` pour modifier un type
- `/favorites` pour les favoris

La route racine `/` redirige vers `/pokemons`.

## Navigation dans l’app

La barre de navigation (`Navbar`) permet de:
- revenir au Pokédex
- aller aux types
- aller aux favoris
- changer le thème clair/sombre
- se connecter ou se déconnecter avec Keycloak

## Comment le front parle au back

Le front utilise Axios.

Le fichier `src/api/axiosInstance.ts` crée une instance partagée.

Cette instance ajoute automatiquement le token Keycloak dans l’en-tête `Authorization` quand l’utilisateur est connecté.

Pourquoi c’est utile:
- les pages n’ont pas besoin de gérer elles-mêmes le token
- les requêtes protégées marchent sans duplication de code

## Les données manipulées

Les types TypeScript sont dans `src/types/models.ts`.

Ils décrivent les objets envoyés ou reçus:
- `Type`
- `TypeCreate`
- `Pokemon`
- `PokemonCreate`

La différence entre `Pokemon` et `PokemonCreate`:
- `Pokemon` correspond à ce qu’on affiche
- `PokemonCreate` correspond à ce qu’on envoie pour créer ou modifier

## Fonctionnement des listes

### Liste des Pokémon

La page `PokemonList`:
- charge tous les Pokémon depuis l’API
- charge la liste des types pour le filtre
- permet de chercher par nom ou numéro
- permet de trier
- permet de paginer
- permet d’ajouter ou retirer des favoris
- affiche les boutons d’édition et suppression seulement si l’utilisateur est connecté

### Liste des types

La page `TypeList`:
- charge les types
- permet la recherche
- permet le tri
- permet la création, la modification et la suppression si connecté

## Fonctionnement d’une fiche détail

La page `PokemonDetail` prend l’id dans l’URL.

Elle:
- demande les données du Pokémon au back
- affiche le numéro Pokédex
- affiche l’image
- affiche le type dans un badge coloré
- affiche les stats avec des barres visuelles
- montre le bouton de modification si l’utilisateur est connecté

## Fonctionnement des formulaires

Les pages `PokemonForm` et `TypeForm` servent à la fois pour créer et pour modifier.

Le même écran change de comportement selon la présence ou non d’un `id` dans l’URL.

### Mode création

- les champs sont vides
- l’utilisateur saisit les données
- au clic sur enregistrer, le front appelle `createPokemon` ou `createType`

### Mode édition

- le front charge l’objet existant
- il remplit le formulaire avec les valeurs actuelles
- au clic sur enregistrer, il appelle `updatePokemon` ou `updateType`

### Validation locale

Le formulaire vérifie quelques règles avant d’envoyer la requête:
- nom obligatoire
- couleur valide pour un type
- stats supérieures ou égales à 1
- type obligatoire pour un Pokémon

Cela évite d’envoyer des erreurs simples au serveur.

## Sécurité côté interface

Le front ne se contente pas de laisser tout visible.

Il utilise `PrivateRoute` pour protéger les écrans de création et d’édition.

Si l’utilisateur n’est pas connecté:
- il est redirigé vers la liste publique

Si l’utilisateur est connecté:
- il peut accéder aux formulaires protégés

Les boutons sensibles comme créer, éditer et supprimer apparaissent seulement en session connectée.

## Keycloak

Keycloak gère l’authentification.

Le front lit ces variables d’environnement:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=pokedex-realm
VITE_KEYCLOAK_CLIENT_ID=pokedex-front
```

Le login se fait côté Keycloak, pas dans le front lui-même.

Une fois connecté, le front récupère:
- l’état `authenticated`
- le nom d’utilisateur
- le token JWT à envoyer au back

## Favoris

La page `Favorites` affiche les Pokémon favoris enregistrés localement.

Le mécanisme est simple:
- les ids favoris sont stockés dans `localStorage`
- ils peuvent être différents selon l’utilisateur connecté
- la page recharge la liste complète des Pokémon puis filtre selon ces ids

Important:
- les favoris ne sont pas encore une donnée serveur
- ils existent dans le navigateur local de l’utilisateur

## Composants visuels importants

### `TypeBadge`

Affiche un type dans une pastille colorée.

### `StatBar`

Montre une stat sous forme de barre de progression visuelle.

### `ConfirmDialog`

Ouvre une modale de confirmation avant une action destructive.

## Thème visuel

L’application gère un thème clair et un thème sombre.

Le thème est:
- lu au démarrage
- appliqué au document
- sauvegardé dans `localStorage`

Cela permet de conserver le choix de l’utilisateur après rechargement.

## Lancer le projet

1. Installer les dépendances:

```bash
npm install
```

2. Démarrer le serveur de développement:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Ce qu’il faut retenir

Le front est la partie visible du Pokédex:
- il organise les écrans
- il appelle le back
- il affiche les données
- il gère la connexion Keycloak
- il protège certaines actions
- il rend l’interface plus agréable et plus simple à utiliser
