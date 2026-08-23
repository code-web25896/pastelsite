<div align="center">
  <img width="1200" height="475" alt="Espace Pastel" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Espace Pastel

Projet React + backend Node.js prêt pour un déploiement Hostinger.

## Lancer en local sans MySQL

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer le faux backend local :
   ```bash
   npm run api
   ```
3. Lancer le front :
   ```bash
   npm run dev
   ```

Front : `http://127.0.0.1:3000`

API mock : `http://127.0.0.1:3001`

Comptes de test :

- Admin : `admin@espacepastel.tn` / `Admin123!`
- Client : `client@espacepastel.tn` / `Client123!`

## Déploiement Hostinger

Le projet est prévu pour un déploiement Node.js avec build du front intégré au backend.

### 1) Variables d’environnement backend

Copier `backend/.env.example` et renseigner :

- `NODE_ENV=production`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

### 2) Build du front

```bash
npm run build
```

Le backend sert alors automatiquement le dossier `dist/`.

### 3) Démarrage production

```bash
npm start
```

### 4) Base de données

Le backend de production utilise MySQL. Il faut donc créer les tables attendues dans la base `DATABASE_URL` puis lancer l’application avec `npm start`.

## Notes utiles

- Les uploads d’images de marques/sous-catégories acceptent des URLs publiques ou des images en base64 au format `data:image/...`.
- Les marques et sous-catégories sont synchronisées avec l’API pour rester visibles après refresh et après déploiement.
