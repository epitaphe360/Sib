#!/bin/bash

# Script de build pour Vercel
echo "🚀 Building SIB 2026 for Vercel..."

# Installation des dépendances
npm ci

# Build de l'application
npm run build

# Vérification du build
if [ -d "dist" ]; then
    echo "✅ Build successful - dist folder created"
    ls -la dist/
else
    echo "❌ Build failed - no dist folder found"
    exit 1
fi

echo "🎉 SIB 2026 ready for Vercel deployment!"