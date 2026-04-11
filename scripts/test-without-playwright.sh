#!/bin/bash

###############################################################################
# Script de tests automatisés alternatif - Sans Playwright
# Teste l'application via curl et validation HTML/API
###############################################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:5173"
PASSED=0
FAILED=0

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║    SIPORTS v3 - Tests Automatisés (Sans Playwright)      ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour tester une URL
test_url() {
    local url=$1
    local test_name=$2
    local expected_code=${3:-200}

    echo -n "Testing: $test_name... "

    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url" 2>/dev/null)

    if [ "$response_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $response_code)"
        ((FAILED++))
        return 1
    fi
}

# Fonction pour tester présence de texte dans la page
test_content() {
    local url=$1
    local search_text=$2
    local test_name=$3

    echo -n "Testing: $test_name... "

    content=$(curl -s "$BASE_URL$url" 2>/dev/null)

    if echo "$content" | grep -q "$search_text"; then
        echo -e "${GREEN}✓ PASS${NC} (Found '$search_text')"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Text '$search_text' not found)"
        ((FAILED++))
        return 1
    fi
}

echo -e "${YELLOW}═══ 1. Tests de Routes Principales ═══${NC}"
echo ""

test_url "/" "Page d'accueil"
test_url "/login" "Page de login"
test_url "/register" "Page d'inscription"
test_url "/dashboard" "Page dashboard"
test_url "/events" "Page événements"
test_url "/exhibitors" "Page exposants"
test_url "/networking" "Page networking"
test_url "/appointments" "Page rendez-vous"
test_url "/profile" "Page profil"
test_url "/messages" "Page messages"

echo ""
echo -e "${YELLOW}═══ 2. Tests de Routes Admin ═══${NC}"
echo ""

test_url "/admin/users" "Admin - Gestion utilisateurs"
test_url "/admin/requests" "Admin - Demandes inscription"
test_url "/admin/dashboard" "Admin - Dashboard"

echo ""
echo -e "${YELLOW}═══ 3. Tests de Routes Auth ═══${NC}"
echo ""

test_url "/auth/exhibitor-signup" "Inscription exposant"
test_url "/auth/partner-signup" "Inscription partenaire"
test_url "/auth/forgot-password" "Mot de passe oublié"

echo ""
echo -e "${YELLOW}═══ 4. Tests de Contenu HTML ═══${NC}"
echo ""

test_content "/login" "SIPORTS" "Logo SIPORTS sur page login"
test_content "/login" "Connexion" "Titre connexion"
test_content "/register" "Créer un compte" "Titre inscription"
test_content "/" "SIPORTS" "Logo sur page accueil"

echo ""
echo -e "${YELLOW}═══ 5. Vérification Scripts/Assets ═══${NC}"
echo ""

# Vérifier que le HTML contient les scripts essentiels
html_content=$(curl -s "$BASE_URL/" 2>/dev/null)

echo -n "Testing: Vite script chargé... "
if echo "$html_content" | grep -q "vite"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

echo -n "Testing: React script chargé... "
if echo "$html_content" | grep -q "react"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

echo -n "Testing: Google reCAPTCHA script... "
if echo "$html_content" | grep -q "recaptcha"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

echo ""
echo -e "${YELLOW}═══ 6. Tests de Sécurité ═══${NC}"
echo ""

echo -n "Testing: HTTPS redirect headers... "
headers=$(curl -sI "$BASE_URL/" 2>/dev/null | grep -i "strict-transport-security" || echo "")
if [ -n "$headers" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ SKIP${NC} (Dev mode - HSTS non requis)"
fi

echo -n "Testing: X-Frame-Options... "
headers=$(curl -sI "$BASE_URL/" 2>/dev/null | grep -i "x-frame-options" || echo "")
if [ -n "$headers" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ INFO${NC} (Header X-Frame-Options non défini)"
fi

echo ""
echo -e "${YELLOW}═══ 7. Tests API Endpoints (si disponibles) ═══${NC}"
echo ""

# Test endpoint API (si configuré)
echo -n "Testing: API health check... "
api_response=$(curl -s "$BASE_URL/api/health" 2>/dev/null || echo "")
if [ -n "$api_response" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ SKIP${NC} (Endpoint API non configuré)"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    RÉSULTATS FINAUX                       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=0
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
fi

echo -e "Total tests: ${BLUE}$TOTAL${NC}"
echo -e "Tests passés: ${GREEN}$PASSED${NC}"
echo -e "Tests échoués: ${RED}$FAILED${NC}"
echo -e "Taux de réussite: ${BLUE}${SUCCESS_RATE}%${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}║              ✅ TOUS LES TESTS SONT PASSÉS !             ║${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}║         ⚠️  Certains tests ont échoué                    ║${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
