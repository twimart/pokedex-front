# pokedex-front

Frontend React + Vite pour la Pokédex full stack.

## Lancer en local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Variables d'environnement

Créer un fichier `.env` à la racine du projet si besoin:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=pokedex-realm
VITE_KEYCLOAK_CLIENT_ID=pokedex-front
```
