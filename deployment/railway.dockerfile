# Railway Dockerfile pour SIPORTS 2026
# Vite v6 is compatible with Node.js 18+
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# ============================================================================
# IMPORTANT: Docker Lint Warning "SecretsUsedInArgOrEnv" - FALSE POSITIVE
# ============================================================================
# Les variables VITE_* ci-dessous sont des variables PUBLIQUES (client-side)
# qui sont INTENTIONNELLEMENT embarquées dans le bundle JavaScript final.
# Ce ne sont PAS des secrets serveur :
#   - VITE_FIREBASE_*: Clés publiques Firebase pour l'auth client
#   - VITE_SUPABASE_ANON_KEY: Clé anonyme publique Supabase (row-level security)
#   - VITE_STRIPE_PUBLISHABLE_KEY: Clé PUBLIQUE Stripe (pk_live_...)
# 
# Ces variables sont visibles dans le code source du navigateur par design.
# C'est la pratique standard pour les applications Vite/React.
# Les secrets serveur (API keys privées) sont gérés via variables d'env Railway.
# ============================================================================

ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY

# Set as environment variables for the build process
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (including devDependencies for build)
# Use npm install as fallback if npm ci fails due to lock file sync issues
RUN npm ci || npm install

# Copier le code source
COPY . .

# Build de l'application
# ARG CACHE_BUST est mis à jour à chaque déploiement pour invalider le cache Docker
ARG CACHE_BUST=1
RUN npm run build

# Stage de production
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour le serveur
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Installer uniquement les dépendances de production pour le serveur
# Use npm install as fallback if npm ci fails due to lock file sync issues
RUN npm ci --omit=dev || npm install --omit=dev

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["node", "server.js"]