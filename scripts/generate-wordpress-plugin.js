const fs = require('fs');
const path = require('path');

// Génération du plugin WordPress pour intégrer SIPORTS
const generateWordPressPlugin = () => {
  const pluginTemplate = `<?php
/**
 * Plugin Name: SIPORTS 2026 Integration
 * Plugin URI: https://siportevent.com
 * Description: Intégration complète de la plateforme SIPORTS 2026 dans WordPress
 * Version: 1.0.0
 * Author: SIPORTS Team
 * License: GPL v2 or later
 */

// Sécurité WordPress
if (!defined('ABSPATH')) {
    exit;
}

// Constantes du plugin
define('SIPORTS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SIPORTS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('SIPORTS_VERSION', '1.0.0');

class SiportsIntegration {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('siports_exhibitors', array($this, 'exhibitors_shortcode'));
        add_shortcode('siports_events', array($this, 'events_shortcode'));
        add_shortcode('siports_networking', array($this, 'networking_shortcode'));
        add_action('wp_ajax_siports_api', array($this, 'handle_api_request'));
        add_action('wp_ajax_nopriv_siports_api', array($this, 'handle_api_request'));
    }
    
    public function init() {
        // Initialisation du plugin
        $this->create_database_tables();
        $this->register_post_types();
    }
    
    public function enqueue_scripts() {
        // Charger les assets React compilés
        wp_enqueue_script(
            'siports-app',
            SIPORTS_PLUGIN_URL . 'dist/assets/index.js',
            array(),
            SIPORTS_VERSION,
            true
        );
        
        wp_enqueue_style(
            'siports-styles',
            SIPORTS_PLUGIN_URL . 'dist/assets/index.css',
            array(),
            SIPORTS_VERSION
        );
        
        // Variables JavaScript pour l'API
        wp_localize_script('siports-app', 'siports_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('siports_nonce'),
            'api_base' => get_option('siports_api_base', 'https://api.siports.com')
        ));
    }
    
    // Shortcode pour afficher la liste des exposants
    public function exhibitors_shortcode($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'limit' => 12,
            'layout' => 'grid'
        ), $atts);
        
        ob_start();
        ?>
        <div id="siports-exhibitors" 
             data-category="<?php echo esc_attr($atts['category']); ?>"
             data-limit="<?php echo esc_attr($atts['limit']); ?>"
             data-layout="<?php echo esc_attr($atts['layout']); ?>">
            <div class="siports-loading">Chargement des exposants...</div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour afficher les événements
    public function events_shortcode($atts) {
        $atts = shortcode_atts(array(
            'type' => '',
            'limit' => 6,
            'featured_only' => false
        ), $atts);
        
        ob_start();
        ?>
        <div id="siports-events" 
             data-type="<?php echo esc_attr($atts['type']); ?>"
             data-limit="<?php echo esc_attr($atts['limit']); ?>"
             data-featured="<?php echo $atts['featured_only'] ? 'true' : 'false'; ?>">
            <div class="siports-loading">Chargement des événements...</div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Shortcode pour le réseautage
    public function networking_shortcode($atts) {
        $atts = shortcode_atts(array(
            'user_id' => get_current_user_id(),
            'recommendations' => 6
        ), $atts);
        
        ob_start();
        ?>
        <div id="siports-networking" 
             data-user-id="<?php echo esc_attr($atts['user_id']); ?>"
             data-recommendations="<?php echo esc_attr($atts['recommendations']); ?>">
            <div class="siports-loading">Chargement du réseautage...</div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    // Gestionnaire des requêtes API
    public function handle_api_request() {
        check_ajax_referer('siports_nonce', 'nonce');
        
        $action = sanitize_text_field($_POST['siports_action']);
        $response = array();
        
        switch ($action) {
            case 'get_exhibitors':
                $response = $this->get_exhibitors_data();
                break;
            case 'get_events':
                $response = $this->get_events_data();
                break;
            case 'get_networking':
                $response = $this->get_networking_data();
                break;
            default:
                $response = array('error' => 'Action non reconnue');
        }
        
        wp_send_json($response);
    }
    
    private function create_database_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Table pour les exposants
        $table_exhibitors = $wpdb->prefix . 'siports_exhibitors';
        $sql_exhibitors = "CREATE TABLE $table_exhibitors (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            company_name varchar(255) NOT NULL,
            sector varchar(100) NOT NULL,
            country varchar(100) NOT NULL,
            description text,
            logo_url varchar(255),
            website varchar(255),
            verified boolean DEFAULT false,
            featured boolean DEFAULT false,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Table pour les événements
        $table_events = $wpdb->prefix . 'siports_events';
        $sql_events = "CREATE TABLE $table_events (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            event_type varchar(50) NOT NULL,
            event_date datetime NOT NULL,
            start_time time NOT NULL,
            end_time time NOT NULL,
            capacity int DEFAULT 0,
            registered int DEFAULT 0,
            location varchar(255),
            virtual boolean DEFAULT false,
            featured boolean DEFAULT false,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_exhibitors);
        dbDelta($sql_events);
    }
    
    private function register_post_types() {
        // Type de post personnalisé pour les actualités SIPORTS
        register_post_type('siports_news', array(
            'labels' => array(
                'name' => 'Actualités SIPORTS',
                'singular_name' => 'Actualité SIPORTS'
            ),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
            'menu_icon' => 'dashicons-megaphone'
        ));
    }
    
    private function get_exhibitors_data() {
        global $wpdb;
        $table = $wpdb->prefix . 'siports_exhibitors';
        $results = $wpdb->get_results("SELECT * FROM $table WHERE verified = 1 ORDER BY featured DESC, company_name ASC");
        return $results;
    }
    
    private function get_events_data() {
        global $wpdb;
        $table = $wpdb->prefix . 'siports_events';
        $results = $wpdb->get_results("SELECT * FROM $table WHERE event_date >= NOW() ORDER BY featured DESC, event_date ASC");
        return $results;
    }
    
    private function get_networking_data() {
        // Simulation des données de réseautage
        return array(
            'recommendations' => array(),
            'connections' => array(),
            'messages' => array()
        );
    }
}

// Initialisation du plugin
new SiportsIntegration();

// Activation du plugin
register_activation_hook(__FILE__, 'siports_activate');
function siports_activate() {
    // Actions lors de l'activation
    flush_rewrite_rules();
}

// Désactivation du plugin
register_deactivation_hook(__FILE__, 'siports_deactivate');
function siports_deactivate() {
    // Actions lors de la désactivation
    flush_rewrite_rules();
}
?>`

  // Créer le dossier du plugin WordPress
  const pluginDir = path.join(__dirname, '..', 'wordpress-plugin');
  if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
  }

  // Écrire le fichier principal du plugin
  fs.writeFileSync(path.join(pluginDir, 'siports-integration.php'), pluginTemplate);

  // Copier les assets compilés
  const distDir = path.join(__dirname, '..', 'dist');
  const pluginAssetsDir = path.join(pluginDir, 'dist');
  
  if (fs.existsSync(distDir)) {
    fs.cpSync(distDir, pluginAssetsDir, { recursive: true });
  }

  // Créer le fichier README du plugin
  const readmeContent = `=== SIPORTS 2026 Integration ===
Contributors: siports-team
Tags: events, exhibitions, networking, ports, maritime
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
License: GPLv2 or later

Intégration complète de la plateforme SIPORTS 2026 dans WordPress.

== Description ==

Ce plugin permet d'intégrer facilement la plateforme SIPORTS 2026 dans votre site WordPress.

Fonctionnalités :
* Affichage des exposants avec shortcode [siports_exhibitors]
* Liste des événements avec [siports_events]
* Système de réseautage avec [siports_networking]
* API complète pour l'intégration personnalisée
* Interface d'administration dédiée

== Installation ==

1. Uploadez le dossier du plugin dans /wp-content/plugins/
2. Activez le plugin dans l'administration WordPress
3. Configurez les paramètres dans SIPORTS → Paramètres
4. Utilisez les shortcodes dans vos pages et articles

== Shortcodes ==

[siports_exhibitors category="port-operations" limit="12" layout="grid"]
[siports_events type="conference" limit="6" featured_only="true"]
[siports_networking user_id="123" recommendations="6"]

== Changelog ==

= 1.0.0 =
* Version initiale du plugin
* Intégration complète de la plateforme SIPORTS
`;

  fs.writeFileSync(path.join(pluginDir, 'readme.txt'), readmeContent);

  console.log('✅ Plugin WordPress généré dans /wordpress-plugin/');
};

// Exécuter la génération si appelé directement
if (require.main === module) {
  generateWordPressPlugin();
}

module.exports = { generateWordPressPlugin };