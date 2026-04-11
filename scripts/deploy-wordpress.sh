#!/bin/bash

###############################################################################
# Script de déploiement WordPress pour SIPORTS 2026
# Usage: ./scripts/deploy-wordpress.sh [options]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/user/siportv3"
PLUGIN_DIR="$PROJECT_DIR/wordpress-plugin"
DIST_DIR="$PROJECT_DIR/dist"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SIPORTS WordPress Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${YELLOW}▶ $1${NC}"
    echo ""
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Step 1: Clean previous build
print_section "1. Cleaning previous build"
if [ -d "$DIST_DIR" ]; then
    rm -rf "$DIST_DIR"
    print_success "Previous build cleaned"
else
    print_info "No previous build found"
fi

# Step 2: Build React application
print_section "2. Building React application"
print_info "Running: npm run build"
if npm run build; then
    print_success "React build completed successfully"
else
    print_error "React build failed"
    exit 1
fi

# Check if dist directory was created
if [ ! -d "$DIST_DIR" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

# Step 3: Copy dist to WordPress plugin
print_section "3. Copying build files to WordPress plugin"

# Remove old dist in plugin
if [ -d "$PLUGIN_DIR/dist" ]; then
    rm -rf "$PLUGIN_DIR/dist"
    print_info "Removed old dist from plugin"
fi

# Copy new dist
cp -r "$DIST_DIR" "$PLUGIN_DIR/"
print_success "Build files copied to plugin directory"

# Step 4: Verify files
print_section "4. Verifying plugin files"

required_files=(
    "siports-comprehensive-shortcodes.php"
    "includes/class-siports-complete-api.php"
    "includes/class-siports-supabase-api.php"
    "templates/exhibitors-list.php"
    "WORDPRESS-INTEGRATION-GUIDE.md"
    "README.md"
    "dist/index.html"
)

all_files_present=true
for file in "${required_files[@]}"; do
    if [ -f "$PLUGIN_DIR/$file" ] || [ -d "$PLUGIN_DIR/$file" ]; then
        print_success "$file"
    else
        print_error "$file NOT FOUND"
        all_files_present=false
    fi
done

if [ "$all_files_present" = false ]; then
    print_error "Some required files are missing"
    exit 1
fi

# Step 5: Check assets
print_section "5. Checking build assets"

css_files=$(find "$PLUGIN_DIR/dist/assets" -name "index-*.css" 2>/dev/null | wc -l)
js_files=$(find "$PLUGIN_DIR/dist/assets" -name "index-*.js" 2>/dev/null | wc -l)

if [ "$css_files" -gt 0 ]; then
    print_success "Found $css_files CSS file(s)"
else
    print_error "No CSS files found in dist/assets"
fi

if [ "$js_files" -gt 0 ]; then
    print_success "Found $js_files JS file(s)"
else
    print_error "No JS files found in dist/assets"
fi

# Step 6: Create plugin zip for distribution
print_section "6. Creating plugin archive"

cd "$PROJECT_DIR"
ZIP_NAME="siports-wordpress-plugin-$(date +%Y%m%d-%H%M%S).zip"

if command -v zip &> /dev/null; then
    cd wordpress-plugin
    zip -r "../$ZIP_NAME" . -x "*.git*" -x "node_modules/*" -x "*.DS_Store"
    cd ..
    print_success "Plugin archive created: $ZIP_NAME"
    print_info "Size: $(du -h "$ZIP_NAME" | cut -f1)"
else
    print_info "zip command not found - skipping archive creation"
fi

# Step 7: Optional - Deploy to WordPress installation
print_section "7. WordPress Installation (Optional)"

if [ -n "$1" ] && [ "$1" = "--deploy" ]; then
    WP_PLUGINS_DIR="${2:-/var/www/html/wp-content/plugins}"
    WP_PLUGIN_TARGET="$WP_PLUGINS_DIR/siports-integration"

    print_info "Deploy target: $WP_PLUGIN_TARGET"

    if [ -d "$WP_PLUGINS_DIR" ]; then
        # Backup existing plugin if it exists
        if [ -d "$WP_PLUGIN_TARGET" ]; then
            BACKUP_NAME="siports-integration-backup-$(date +%Y%m%d-%H%M%S)"
            mv "$WP_PLUGIN_TARGET" "$WP_PLUGINS_DIR/$BACKUP_NAME"
            print_info "Existing plugin backed up to: $BACKUP_NAME"
        fi

        # Copy plugin
        cp -r "$PLUGIN_DIR" "$WP_PLUGIN_TARGET"
        print_success "Plugin deployed to WordPress"

        # Set correct permissions
        if command -v chown &> /dev/null; then
            chown -R www-data:www-data "$WP_PLUGIN_TARGET" 2>/dev/null || true
            print_info "Permissions set for web server"
        fi
    else
        print_error "WordPress plugins directory not found: $WP_PLUGINS_DIR"
        print_info "Use: ./deploy-wordpress.sh --deploy /path/to/wp-content/plugins"
    fi
else
    print_info "To deploy directly to WordPress, use: ./deploy-wordpress.sh --deploy [wp-plugins-path]"
fi

# Step 8: Summary
print_section "8. Deployment Summary"

echo ""
echo -e "${GREEN}✓ Build completed successfully${NC}"
echo -e "${GREEN}✓ Plugin ready for installation${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Manual Installation:"
echo "   → Upload wordpress-plugin/ to WordPress"
echo "   → Or upload $ZIP_NAME via WordPress admin"
echo ""
echo "2. Automatic Deployment:"
echo "   → ./scripts/deploy-wordpress.sh --deploy /path/to/wp-content/plugins"
echo ""
echo "3. Configuration:"
echo "   → Add Supabase credentials to wp-config.php"
echo "   → Activate plugin in WordPress admin"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "   → wordpress-plugin/WORDPRESS-INTEGRATION-GUIDE.md"
echo "   → wordpress-plugin/README.md"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🚀${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
