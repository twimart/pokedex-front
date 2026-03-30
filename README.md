# pokedex-front

Frontend React + Vite pour la Pokédex full stack.

## Services et ports

| Service | URL/Port |
|---|---|
| Frontend Vite | `http://localhost:5173` |
| API Spring Boot | `http://localhost:8080/api/v1` |
| Keycloak | `http://localhost:8180` |
| Kibana | `http://localhost:5601` |

## Auth Keycloak

- Le login se fait via Keycloak sur `http://localhost:8180`
- Les boutons de création/édition/suppression n'apparaissent qu'une fois connecté
- Le front lit les variables `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM` et `VITE_KEYCLOAK_CLIENT_ID`

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
