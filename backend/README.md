# API Espace Pastel

Backend Node.js/Express securise pour le front existant. Aucun fichier de src n'est modifie : le front reste en mode demonstration jusqu'a ce qu'une integration API soit demandee.

## Installation

1. Installer Node.js 20 LTS ou superieur, puis executer npm install a la racine.
2. Creer la base MySQL et importer backend/schema.sql.
3. Copier backend/.env.example vers .env et renseigner les valeurs reelles.
4. Creer le premier administrateur : npm run create-admin -- email mot-de-passe-solide.
5. Lancer npm run api.

## Deploiement Hostinger

Creer une application Node.js (Node 20+), definir les variables dans le panneau Hostinger, executer npm install --omit=dev, importer le schema SQL, puis utiliser backend/server.js comme fichier de demarrage. Tu peux utiliser soit DATABASE_URL, soit les variables separees DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD. Le domaine du front doit figurer exactement dans CORS_ORIGIN.

## Endpoints

- Authentification : POST /api/auth/register, POST /api/auth/login, GET/PATCH /api/auth/me
- Adresses client : POST/DELETE /api/addresses
- Catalogue public : GET /api/brands, GET /api/subcategories, GET /api/products, GET /api/products/:idOrSlug
- Avis : GET/POST /api/products/:productId/reviews
- Commandes client : POST/GET /api/orders
- Administration : CRUD marques, sous-categories, produits, avis et suivi des commandes sous /api/admin

Pour chaque route protegee, envoyer le jeton recu a la connexion avec l'en-tete Authorization: Bearer VOTRE_JETON.

Les prix, le stock et les totaux sont toujours recalcules cote serveur. Les secrets restent exclusivement dans les variables d'environnement.

