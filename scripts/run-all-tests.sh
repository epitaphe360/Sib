#!/bin/bash

###############################################################################
# Script d'exécution complète de tous les tests E2E
# Usage: ./scripts/run-all-tests.sh [--headed] [--debug]
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
HEADED=""
DEBUG=""
BROWSER="chromium"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --headed)
      HEADED="--headed"
      shift
      ;;
    --debug)
      DEBUG="--debug"
      shift
      ;;
    --browser)
      BROWSER="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║         SIPORTS v3 - Suite de Tests E2E Complète         ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Playwright is installed
if ! npx playwright --version > /dev/null 2>&1; then
  echo -e "${RED}❌ Playwright n'est pas installé${NC}"
  echo -e "${YELLOW}📦 Installation de Playwright...${NC}"
  npm install -D @playwright/test
  npx playwright install
fi

# Check if dev server is running
echo -e "${BLUE}🔍 Vérification du serveur de développement...${NC}"
if ! curl -s http://localhost:5173 > /dev/null; then
  echo -e "${YELLOW}⚠️  Le serveur de développement n'est pas démarré${NC}"
  echo -e "${YELLOW}📌 Lancement du serveur...${NC}"
  npm run dev &
  SERVER_PID=$!
  echo -e "${GREEN}✓ Serveur démarré (PID: $SERVER_PID)${NC}"

  # Wait for server to be ready
  echo -e "${BLUE}⏳ Attente du démarrage du serveur...${NC}"
  timeout=60
  elapsed=0
  while ! curl -s http://localhost:5173 > /dev/null; do
    sleep 1
    elapsed=$((elapsed + 1))
    if [ $elapsed -ge $timeout ]; then
      echo -e "${RED}❌ Timeout: Le serveur n'a pas démarré dans les $timeout secondes${NC}"
      kill $SERVER_PID 2>/dev/null || true
      exit 1
    fi
  done
  echo -e "${GREEN}✓ Serveur prêt${NC}"
  STOP_SERVER=true
else
  echo -e "${GREEN}✓ Serveur déjà en cours d'exécution${NC}"
  STOP_SERVER=false
fi

echo ""
echo -e "${BLUE}🧪 Exécution des tests E2E...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run tests
START_TIME=$(date +%s)

# Test 1: Authentification
echo -e "${YELLOW}📝 Test 1/4: Authentification (Login, Logout, Inscription)${NC}"
npx playwright test tests/e2e/auth.spec.ts --project=$BROWSER $HEADED $DEBUG || true

# Test 2: Navigation
echo -e "${YELLOW}📝 Test 2/4: Navigation (Dashboards, Menus, Liens)${NC}"
npx playwright test tests/e2e/navigation.spec.ts --project=$BROWSER $HEADED $DEBUG || true

# Test 3: Événements
echo -e "${YELLOW}📝 Test 3/4: Événements (Création, Inscription)${NC}"
npx playwright test tests/e2e/events.spec.ts --project=$BROWSER $HEADED $DEBUG || true

# Test 4: Rendez-vous
echo -e "${YELLOW}📝 Test 4/4: Rendez-vous (Booking, Annulation)${NC}"
npx playwright test tests/e2e/appointments.spec.ts --project=$BROWSER $HEADED $DEBUG || true

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Tests terminés en ${DURATION}s${NC}"

# Generate HTML report
echo ""
echo -e "${BLUE}📊 Génération du rapport HTML...${NC}"
npx playwright show-report || echo -e "${YELLOW}⚠️  Rapport non disponible${NC}"

# Cleanup
if [ "$STOP_SERVER" = true ]; then
  echo -e "${BLUE}🛑 Arrêt du serveur de développement...${NC}"
  kill $SERVER_PID 2>/dev/null || true
  echo -e "${GREEN}✓ Serveur arrêté${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║              ✅ Suite de tests complétée !                ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
