<?php
/**
 * Plugin Name: SIPORTS Articles Shortcode for Elementor
 * Plugin URI: https://siportevent.com
 * Description: Affiche les articles SIPORTS via des shortcodes compatibles Elementor Pro
 * Version: 1.0.0
 * Author: SIPORTS Team
 * Author URI: https://siportevent.com
 * Text Domain: siports-articles
 * Domain Path: /languages
 */

// Sécurité: Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Configuration Supabase (API REST directe)
define('SIPORTS_SUPABASE_URL', 'https://eqjoqgpbxhsfgcovipgu.supabase.co');
define('SIPORTS_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE');
define('SIPORTS_CACHE_TIME', 300); // 5 minutes en secondes (synchronisation rapide)
define('SIPORTS_WEBHOOK_SECRET', 'siports_webhook_2024'); // Clé secrète pour le webhook

// URLs API anciennes (gardées pour compatibilité)
define('SIPORTS_API_URL', SIPORTS_SUPABASE_URL . '/rest/v1/articles');
define('SIPORTS_MEDIA_API_URL', SIPORTS_SUPABASE_URL . '/rest/v1/media_contents');

/**
 * Classe principale du plugin
 */
class SIPORTS_Articles_Shortcode {
    
    /**
     * Instance unique (Singleton)
     */
    private static $instance = null;
    
    /**
     * Obtenir l'instance du plugin
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructeur
     */
    private function __construct() {
        // Enregistrer les shortcodes
        add_shortcode('siports_article', array($this, 'render_article_shortcode'));
        add_shortcode('article', array($this, 'render_article_shortcode'));
        add_shortcode('siports_media', array($this, 'render_media_shortcode'));
        add_shortcode('media', array($this, 'render_media_shortcode'));
        add_shortcode('siports_media_list', array($this, 'render_media_list_shortcode'));
        add_shortcode('media_list', array($this, 'render_media_list_shortcode'));
        
        // Enregistrer les styles CSS
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
        
        // Ajouter le support Elementor
        add_action('elementor/widgets/register', array($this, 'register_elementor_widget'));
        add_action('elementor/widgets/widgets_registered', array($this, 'register_elementor_widget'));
        
        // Ajouter une page d'options dans l'admin
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Enregistrer le webhook pour la synchronisation automatique
        add_action('rest_api_init', array($this, 'register_webhook_endpoint'));
        
        // AJAX pour rafraîchir le cache
        add_action('wp_ajax_siports_refresh_cache', array($this, 'ajax_refresh_cache'));
    }
    
    /**
     * Enregistrer les styles CSS
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            'siports-articles',
            plugin_dir_url(__FILE__) . 'css/siports-articles.css',
            array(),
            '1.0.0'
        );
    }
    
    /**
     * Récupérer un article depuis l'API Supabase avec cache
     */
    private function fetch_article($article_id) {
        // Clé de cache unique
        $cache_key = 'siports_article_' . $article_id;
        
        // Vérifier le cache
        $cached = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }
        
        // Appel API Supabase REST
        $api_url = SIPORTS_SUPABASE_URL . '/rest/v1/articles?id=eq.' . $article_id . '&select=*';
        $response = wp_remote_get($api_url, array(
            'timeout' => 10,
            'headers' => array(
                'Accept' => 'application/json',
                'apikey' => SIPORTS_SUPABASE_ANON_KEY,
                'Authorization' => 'Bearer ' . SIPORTS_SUPABASE_ANON_KEY,
            ),
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'error' => $response->get_error_message(),
            );
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($status_code !== 200 || !is_array($data) || empty($data)) {
            return array(
                'success' => false,
                'error' => 'Article non trouvé',
            );
        }
        
        // Supabase retourne un tableau, on prend le premier élément
        $result = array(
            'success' => true,
            'data' => $data[0],
        );
        
        // Mettre en cache
        set_transient($cache_key, $result, SIPORTS_CACHE_TIME);
        
        return $result;
    }
    
    /**
     * Rendu du shortcode
     * Usage: [article id="uuid"] ou [siports_article id="uuid"]
     */
    public function render_article_shortcode($atts) {
        // Attributs par défaut
        $atts = shortcode_atts(array(
            'id' => '',
            'layout' => 'full', // full, compact, minimal
            'show_image' => 'yes',
            'show_excerpt' => 'yes',
            'show_content' => 'yes',
            'show_tags' => 'yes',
            'show_meta' => 'yes',
        ), $atts);
        
        // Validation
        if (empty($atts['id'])) {
            return '<div class="siports-article-error">⚠️ ID d\'article requis</div>';
        }
        
        // Récupérer l'article
        $result = $this->fetch_article($atts['id']);
        
        if (!$result['success']) {
            return '<div class="siports-article-error">❌ ' . esc_html($result['error']) . '</div>';
        }
        
        $article = $result['data'];
        
        // Générer le HTML
        return $this->render_article_html($article, $atts);
    }
    
    /**
     * Générer le HTML de l'article
     */
    private function render_article_html($article, $atts) {
        ob_start();
        ?>
        
        <article class="siports-article siports-article-<?php echo esc_attr($atts['layout']); ?>">
            <?php if ($atts['show_image'] === 'yes' && !empty($article['image_url'])): ?>
                <div class="siports-article-image">
                    <img src="<?php echo esc_url($article['image_url']); ?>" 
                         alt="<?php echo esc_attr($article['title']); ?>"
                         loading="lazy">
                </div>
            <?php endif; ?>
            
            <div class="siports-article-content">
                <!-- Catégorie et statut -->
                <div class="siports-article-badges">
                    <?php if (!empty($article['category'])): ?>
                        <span class="siports-badge siports-badge-category">
                            📁 <?php echo esc_html($article['category']); ?>
                        </span>
                    <?php endif; ?>
                    <span class="siports-badge siports-badge-published">
                        ✅ Publié
                    </span>
                </div>
                
                <!-- Titre -->
                <h2 class="siports-article-title">
                    <?php echo esc_html($article['title']); ?>
                </h2>
                
                <!-- Extrait -->
                <?php if ($atts['show_excerpt'] === 'yes' && !empty($article['excerpt'])): ?>
                    <div class="siports-article-excerpt">
                        <?php echo wp_kses_post($article['excerpt']); ?>
                    </div>
                <?php endif; ?>
                
                <!-- Contenu complet -->
                <?php if ($atts['show_content'] === 'yes' && !empty($article['content'])): ?>
                    <div class="siports-article-body">
                        <?php echo wp_kses_post($article['content']); ?>
                    </div>
                <?php endif; ?>
                
                <!-- Tags -->
                <?php if ($atts['show_tags'] === 'yes' && !empty($article['tags'])): ?>
                    <div class="siports-article-tags">
                        <span class="siports-tags-icon">🏷️</span>
                        <?php foreach ($article['tags'] as $tag): ?>
                            <span class="siports-tag"><?php echo esc_html($tag); ?></span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <!-- Meta info -->
                <?php if ($atts['show_meta'] === 'yes'): ?>
                    <div class="siports-article-meta">
                        <span class="siports-meta-author">
                            👤 <?php echo esc_html($article['author']); ?>
                        </span>
                        <span class="siports-meta-date">
                            📅 <?php 
                                $date = $article['published_at'] ?? $article['created_at'];
                                echo date_i18n(get_option('date_format'), strtotime($date)); 
                            ?>
                        </span>
                    </div>
                <?php endif; ?>
            </div>
        </article>
        
        <?php
        return ob_get_clean();
    }
    
    /**
     * Récupérer un média depuis l'API avec cache
     */
    private function fetch_media($media_id) {
        // Clé de cache unique
        $cache_key = 'siports_media_' . $media_id;
        
        // Vérifier le cache
        $cached = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }
        
        // Appel API Supabase REST
        $api_url = SIPORTS_SUPABASE_URL . '/rest/v1/media_contents?id=eq.' . $media_id . '&select=*';
        $response = wp_remote_get($api_url, array(
            'timeout' => 10,
            'headers' => array(
                'Accept' => 'application/json',
                'apikey' => SIPORTS_SUPABASE_ANON_KEY,
                'Authorization' => 'Bearer ' . SIPORTS_SUPABASE_ANON_KEY,
            ),
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'error' => $response->get_error_message(),
            );
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($status_code !== 200 || !is_array($data) || empty($data)) {
            return array(
                'success' => false,
                'error' => 'Média non trouvé',
            );
        }
        
        // Supabase retourne un tableau, on prend le premier élément
        $result = array(
            'success' => true,
            'data' => $data[0],
        );
        
        // Mettre en cache
        set_transient($cache_key, $result, SIPORTS_CACHE_TIME);
        
        return $result;
    }
    
    /**
     * Rendu du shortcode média
     * Usage: [media id="uuid"] ou [siports_media id="uuid"]
     */
    public function render_media_shortcode($atts) {
        // Attributs par défaut
        $atts = shortcode_atts(array(
            'id' => '',
            'layout' => 'full', // full, compact, minimal
            'show_thumbnail' => 'yes',
            'show_description' => 'yes',
            'show_tags' => 'yes',
            'show_stats' => 'yes',
            'autoplay' => 'no',
        ), $atts);
        
        // Validation
        if (empty($atts['id'])) {
            return '<div class="siports-media-error">⚠️ ID de média requis</div>';
        }
        
        // Récupérer le média
        $result = $this->fetch_media($atts['id']);
        
        if (!$result['success']) {
            return '<div class="siports-media-error">❌ ' . esc_html($result['error']) . '</div>';
        }
        
        $media = $result['data'];
        
        // Générer le HTML
        return $this->render_media_html($media, $atts);
    }
    
    /**
     * Générer le HTML du média
     */
    private function render_media_html($media, $atts) {
        ob_start();
        
        // Déterminer les icônes selon le type
        $type_icons = array(
            'webinar' => '🎥',
            'podcast' => '🎙️',
            'capsule_inside' => '📹',
            'live_studio' => '🔴',
            'best_moments' => '⭐',
            'testimonial' => '💬',
        );
        
        $type_labels = array(
            'webinar' => 'Webinaire',
            'podcast' => 'Podcast',
            'capsule_inside' => 'Capsule Inside',
            'live_studio' => 'Live Studio',
            'best_moments' => 'Best Moments',
            'testimonial' => 'Témoignage',
        );
        
        $icon = $type_icons[$media['type']] ?? '📺';
        $type_label = $type_labels[$media['type']] ?? 'Média';
        ?>
        
        <article class="siports-media siports-media-<?php echo esc_attr($atts['layout']); ?> siports-media-type-<?php echo esc_attr($media['type']); ?>">
            <?php if ($atts['show_thumbnail'] === 'yes'): ?>
                <div class="siports-media-thumbnail">
                    <?php if (!empty($media['thumbnail_url'])): ?>
                        <img src="<?php echo esc_url($media['thumbnail_url']); ?>" 
                             alt="<?php echo esc_attr($media['title']); ?>"
                             loading="lazy">
                    <?php endif; ?>
                    
                    <!-- Badge type de média -->
                    <div class="siports-media-type-badge">
                        <?php echo $icon; ?> <?php echo esc_html($type_label); ?>
                    </div>
                    
                    <?php if ($media['duration']): ?>
                        <div class="siports-media-duration">
                            ⏱️ <?php echo esc_html($this->format_duration($media['duration'])); ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
            
            <div class="siports-media-content">
                <!-- Catégorie et statut -->
                <div class="siports-media-badges">
                    <?php if (!empty($media['category'])): ?>
                        <span class="siports-badge siports-badge-category">
                            📁 <?php echo esc_html($media['category']); ?>
                        </span>
                    <?php endif; ?>
                    <span class="siports-badge siports-badge-published">
                        ✅ Publié
                    </span>
                </div>
                
                <!-- Titre -->
                <h2 class="siports-media-title">
                    <?php echo esc_html($media['title']); ?>
                </h2>
                
                <!-- Description -->
                <?php if ($atts['show_description'] === 'yes' && !empty($media['description'])): ?>
                    <div class="siports-media-description">
                        <?php echo wp_kses_post(nl2br($media['description'])); ?>
                    </div>
                <?php endif; ?>
                
                <!-- Player Vidéo/Audio -->
                <?php if (!empty($media['video_url'])): ?>
                    <div class="siports-media-player">
                        <video controls <?php echo ($atts['autoplay'] === 'yes') ? 'autoplay' : ''; ?>>
                            <source src="<?php echo esc_url($media['video_url']); ?>" type="video/mp4">
                            Votre navigateur ne supporte pas la vidéo.
                        </video>
                    </div>
                <?php elseif (!empty($media['audio_url'])): ?>
                    <div class="siports-media-player">
                        <audio controls <?php echo ($atts['autoplay'] === 'yes') ? 'autoplay' : ''; ?>>
                            <source src="<?php echo esc_url($media['audio_url']); ?>" type="audio/mpeg">
                            Votre navigateur ne supporte pas l'audio.
                        </audio>
                    </div>
                <?php endif; ?>
                
                <!-- Tags -->
                <?php if ($atts['show_tags'] === 'yes' && !empty($media['tags'])): ?>
                    <div class="siports-media-tags">
                        <span class="siports-tags-icon">🏷️</span>
                        <?php foreach ($media['tags'] as $tag): ?>
                            <span class="siports-tag"><?php echo esc_html($tag); ?></span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <!-- Statistiques -->
                <?php if ($atts['show_stats'] === 'yes'): ?>
                    <div class="siports-media-stats">
                        <span class="siports-stat">
                            👁️ <?php echo number_format($media['views_count']); ?> vues
                        </span>
                        <span class="siports-stat">
                            ❤️ <?php echo number_format($media['likes_count']); ?> likes
                        </span>
                        <span class="siports-stat">
                            📤 <?php echo number_format($media['shares_count']); ?> partages
                        </span>
                    </div>
                <?php endif; ?>
                
                <!-- Date -->
                <div class="siports-media-meta">
                    <span class="siports-meta-date">
                        📅 <?php echo date_i18n(get_option('date_format'), strtotime($media['created_at'])); ?>
                    </span>
                </div>
            </div>
        </article>
        
        <?php
        return ob_get_clean();
    }
    
    /**
     * Formater la durée en minutes:secondes
     */
    private function format_duration($seconds) {
        if (!$seconds) return '0:00';
        $minutes = floor($seconds / 60);
        $secs = $seconds % 60;
        return sprintf('%d:%02d', $minutes, $secs);
    }
    
    /**
     * Récupérer une liste de médias depuis l'API avec cache
     */
    private function fetch_media_list($type = '', $category = '', $limit = 10) {
        // Clé de cache unique
        $cache_key = 'siports_media_list_' . md5($type . '_' . $category . '_' . $limit);
        
        // Vérifier le cache
        $cached = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }
        
        // Construire l'URL Supabase REST API
        $api_url = SIPORTS_SUPABASE_URL . '/rest/v1/media_contents';
        $params = array(
            'select' => '*',
            'status' => 'eq.published',
            'order' => 'created_at.desc',
            'limit' => $limit
        );
        
        if (!empty($type)) {
            $params['type'] = 'eq.' . $type;
        }
        
        if (!empty($category)) {
            $params['category'] = 'eq.' . $category;
        }
        
        $api_url .= '?' . http_build_query($params);
        
        // Appel API Supabase avec clé anonyme
        $response = wp_remote_get($api_url, array(
            'timeout' => 15,
            'headers' => array(
                'Accept' => 'application/json',
                'apikey' => SIPORTS_SUPABASE_ANON_KEY,
                'Authorization' => 'Bearer ' . SIPORTS_SUPABASE_ANON_KEY,
            ),
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'error' => $response->get_error_message(),
            );
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($status_code !== 200 || !is_array($data)) {
            return array(
                'success' => false,
                'error' => 'Erreur API Supabase: ' . ($data['message'] ?? 'Inconnue'),
            );
        }
        
        // Formater la réponse
        $result = array(
            'success' => true,
            'data' => $data,
        );
        
        // Mettre en cache
        set_transient($cache_key, $result, SIPORTS_CACHE_TIME);
        
        return $result;
    }
    
    /**
     * Rendu du shortcode liste de médias
     * Usage: [media_list type="webinar" limit="6" layout="grid"]
     */
    public function render_media_list_shortcode($atts) {
        // Attributs par défaut
        $atts = shortcode_atts(array(
            'type' => '', // webinar, podcast, capsule_inside, live_studio, best_moments, testimonial
            'category' => '',
            'limit' => '10',
            'layout' => 'grid', // grid, list
            'columns' => '3', // 2, 3, 4
            'show_thumbnail' => 'yes',
            'show_description' => 'yes',
            'show_stats' => 'no',
        ), $atts);
        
        // Récupérer la liste des médias
        $result = $this->fetch_media_list($atts['type'], $atts['category'], intval($atts['limit']));
        
        if (!$result['success']) {
            return '<div class="siports-media-error">❌ ' . esc_html($result['error']) . '</div>';
        }
        
        $media_list = $result['data'];
        
        if (empty($media_list)) {
            return '<div class="siports-media-list-empty">📭 Aucun média disponible pour le moment</div>';
        }
        
        // Générer le HTML
        return $this->render_media_list_html($media_list, $atts);
    }
    
    /**
     * Générer le HTML de la liste de médias
     */
    private function render_media_list_html($media_list, $atts) {
        ob_start();
        
        $type_icons = array(
            'webinar' => '🎥',
            'podcast' => '🎙️',
            'capsule_inside' => '📹',
            'live_studio' => '🔴',
            'best_moments' => '⭐',
            'testimonial' => '💬',
        );
        
        $type_labels = array(
            'webinar' => 'Webinaire',
            'podcast' => 'Podcast',
            'capsule_inside' => 'Capsule Inside',
            'live_studio' => 'Live Studio',
            'best_moments' => 'Best Moments',
            'testimonial' => 'Témoignage',
        );
        
        $columns_class = 'siports-media-list-cols-' . $atts['columns'];
        $layout_class = 'siports-media-list-' . $atts['layout'];
        
        ?>
        
        <div class="siports-media-list <?php echo esc_attr($layout_class); ?> <?php echo esc_attr($columns_class); ?>">
            <?php foreach ($media_list as $media): 
                $icon = $type_icons[$media['type']] ?? '📺';
                $type_label = $type_labels[$media['type']] ?? 'Média';
            ?>
                
                <article class="siports-media-list-item siports-media-type-<?php echo esc_attr($media['type']); ?>">
                    <?php if ($atts['show_thumbnail'] === 'yes'): ?>
                        <div class="siports-media-list-thumbnail">
                            <?php if (!empty($media['thumbnail_url'])): ?>
                                <img src="<?php echo esc_url($media['thumbnail_url']); ?>" 
                                     alt="<?php echo esc_attr($media['title']); ?>"
                                     loading="lazy">
                            <?php else: ?>
                                <div class="siports-media-list-no-thumb">
                                    <span class="siports-media-list-icon"><?php echo $icon; ?></span>
                                </div>
                            <?php endif; ?>
                            
                            <!-- Badge type -->
                            <div class="siports-media-type-badge-small">
                                <?php echo $icon; ?> <?php echo esc_html($type_label); ?>
                            </div>
                            
                            <?php if ($media['duration']): ?>
                                <div class="siports-media-duration-small">
                                    ⏱️ <?php echo esc_html($this->format_duration($media['duration'])); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                    
                    <div class="siports-media-list-content">
                        <h3 class="siports-media-list-title">
                            <?php echo esc_html($media['title']); ?>
                        </h3>
                        
                        <?php if ($atts['show_description'] === 'yes' && !empty($media['description'])): ?>
                            <p class="siports-media-list-description">
                                <?php echo esc_html(wp_trim_words($media['description'], 20)); ?>
                            </p>
                        <?php endif; ?>
                        
                        <?php if ($atts['show_stats'] === 'yes'): ?>
                            <div class="siports-media-list-stats">
                                <span>👁️ <?php echo number_format($media['views_count']); ?></span>
                                <span>❤️ <?php echo number_format($media['likes_count']); ?></span>
                            </div>
                        <?php endif; ?>
                        
                        <div class="siports-media-list-footer">
                            <span class="siports-media-list-date">
                                📅 <?php echo date_i18n(get_option('date_format'), strtotime($media['created_at'])); ?>
                            </span>
                        </div>
                    </div>
                </article>
                
            <?php endforeach; ?>
        </div>
        
        <?php
        return ob_get_clean();
    }
    
    /**
     * Enregistrer le widget Elementor
     */
    public function register_elementor_widget($widgets_manager = null) {
        // Sécurité : Vérifier si Elementor est chargé
        if (!did_action('elementor/loaded')) {
            return;
        }
        
        if (!class_exists('\Elementor\Widget_Base')) {
            return;
        }
        
        // Éviter le double chargement
        static $loaded = false;
        if ($loaded) {
            return;
        }
        
        // Charger les fichiers widget en toute sécurité
        $article_widget_file = plugin_dir_path(__FILE__) . 'widgets/elementor-siports-article.php';
        $media_widget_file = plugin_dir_path(__FILE__) . 'widgets/elementor-siports-media.php';
        
        if (file_exists($article_widget_file)) {
            require_once $article_widget_file;
        }
        
        if (file_exists($media_widget_file)) {
            require_once $media_widget_file;
        }
        
        // Vérifier que les classes existent avant de les instancier
        if (!class_exists('Elementor_SIPORTS_Article_Widget') || !class_exists('Elementor_SIPORTS_Media_Widget')) {
            return;
        }
        
        // Si $widgets_manager n'est pas fourni, essayer de le récupérer
        if ($widgets_manager === null && class_exists('\Elementor\Plugin')) {
            $widgets_manager = \Elementor\Plugin::instance()->widgets_manager;
        }
        
        if ($widgets_manager === null) {
            return;
        }

        // Vérifier si la méthode register existe (Elementor 3.5+)
        if (method_exists($widgets_manager, 'register')) {
            $widgets_manager->register(new \Elementor_SIPORTS_Article_Widget());
            $widgets_manager->register(new \Elementor_SIPORTS_Media_Widget());
        } 
        // Fallback pour les anciennes versions
        elseif (method_exists($widgets_manager, 'register_widget_type')) {
            $widgets_manager->register_widget_type(new \Elementor_SIPORTS_Article_Widget());
            $widgets_manager->register_widget_type(new \Elementor_SIPORTS_Media_Widget());
        }
        
        $loaded = true;
    }
    
    /**
     * Enregistrer l'endpoint webhook pour la synchronisation automatique
     * URL: https://votre-site.com/wp-json/siports/v1/sync
     */
    public function register_webhook_endpoint() {
        register_rest_route('siports/v1', '/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_webhook_sync'),
            'permission_callback' => '__return_true', // Authentification via secret
        ));
        
        // Endpoint pour vérifier le statut
        register_rest_route('siports/v1', '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'handle_status_check'),
            'permission_callback' => '__return_true',
        ));
    }
    
    /**
     * Gérer le webhook de synchronisation depuis Supabase
     */
    public function handle_webhook_sync($request) {
        // Vérifier le secret
        $secret = $request->get_header('X-Webhook-Secret');
        if ($secret !== SIPORTS_WEBHOOK_SECRET) {
            return new WP_REST_Response(array(
                'success' => false,
                'error' => 'Unauthorized'
            ), 401);
        }
        
        // Récupérer les données du webhook
        $body = $request->get_json_params();
        $table = isset($body['table']) ? $body['table'] : '';
        $type = isset($body['type']) ? $body['type'] : ''; // INSERT, UPDATE, DELETE
        $record = isset($body['record']) ? $body['record'] : array();
        
        // Invalider le cache approprié
        $this->clear_all_cache();
        
        // Logger l'événement (optionnel)
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('SIPORTS Webhook: ' . $type . ' on ' . $table);
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Cache invalidated',
            'table' => $table,
            'type' => $type
        ), 200);
    }
    
    /**
     * Endpoint de vérification du statut
     */
    public function handle_status_check($request) {
        return new WP_REST_Response(array(
            'success' => true,
            'plugin' => 'SIPORTS Articles Shortcode',
            'version' => '1.0.0',
            'cache_time' => SIPORTS_CACHE_TIME,
            'webhook_url' => rest_url('siports/v1/sync'),
            'supabase_url' => SIPORTS_SUPABASE_URL
        ), 200);
    }
    
    /**
     * Vider tout le cache SIPORTS
     */
    public function clear_all_cache() {
        global $wpdb;
        
        // Supprimer tous les transients SIPORTS
        $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_siports_%'");
        $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_siports_%'");
        
        // Mettre à jour le timestamp de dernière synchronisation
        update_option('siports_last_sync', current_time('mysql'));
        
        return true;
    }
    
    /**
     * AJAX pour rafraîchir le cache manuellement
     */
    public function ajax_refresh_cache() {
        // Vérifier le nonce
        if (!check_ajax_referer('siports_ajax_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => 'Nonce invalide'));
        }
        
        // Vérifier les permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Permission refusée'));
        }
        
        // Vider le cache
        $this->clear_all_cache();
        
        wp_send_json_success(array(
            'message' => 'Cache rafraîchi avec succès',
            'time' => current_time('mysql')
        ));
    }
    
    /**
     * Ajouter le menu admin
     */
    public function add_admin_menu() {
        add_options_page(
            'SIPORTS Articles',
            'SIPORTS Articles',
            'manage_options',
            'siports-articles',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Rendu de la page admin
     */
    public function render_admin_page() {
        // Traiter le vidage de cache
        if (isset($_POST['clear_cache']) && check_admin_referer('siports_clear_cache')) {
            $this->clear_all_cache();
            echo '<div class="notice notice-success"><p>✅ Cache vidé avec succès !</p></div>';
        }
        
        $last_sync = get_option('siports_last_sync', 'Jamais');
        $webhook_url = rest_url('siports/v1/sync');
        ?>
        <div class="wrap">
            <h1>🏆 SIPORTS Articles - Configuration</h1>
            
            <div class="card" style="max-width: 800px;">
                <h2>🔄 Synchronisation Automatique</h2>
                <table class="form-table">
                    <tr>
                        <th>Statut</th>
                        <td><span style="color: green; font-weight: bold;">✅ Actif</span></td>
                    </tr>
                    <tr>
                        <th>Durée du cache</th>
                        <td><?php echo (SIPORTS_CACHE_TIME / 60); ?> minutes</td>
                    </tr>
                    <tr>
                        <th>Dernière synchronisation</th>
                        <td id="last-sync-time"><?php echo esc_html($last_sync); ?></td>
                    </tr>
                    <tr>
                        <th>URL Webhook</th>
                        <td>
                            <code style="background: #f0f0f0; padding: 5px 10px; display: block; word-break: break-all;">
                                <?php echo esc_html($webhook_url); ?>
                            </code>
                            <p class="description">Configurez cette URL dans Supabase Database Webhooks pour recevoir les mises à jour en temps réel.</p>
                        </td>
                    </tr>
                </table>
                
                <h3>Actions</h3>
                <form method="post" action="" style="display: inline-block; margin-right: 10px;">
                    <?php wp_nonce_field('siports_clear_cache'); ?>
                    <button type="submit" name="clear_cache" class="button button-primary">
                        🔄 Rafraîchir maintenant
                    </button>
                </form>
                
                <button type="button" id="test-api-btn" class="button button-secondary">
                    🧪 Tester l'API
                </button>
                
                <div id="api-test-result" style="margin-top: 15px;"></div>
            </div>
            
            <div class="card" style="max-width: 800px;">
                <h2>📺 Shortcodes Médias</h2>
                <p><strong>Liste de médias (webinaires, podcasts, etc.) :</strong></p>
                <code>[media_list type="webinar" limit="6" columns="3"]</code>
                
                <h3>Types disponibles :</h3>
                <ul>
                    <li><code>webinar</code> - Webinaires</li>
                    <li><code>podcast</code> - Podcasts</li>
                    <li><code>capsule_inside</code> - Capsules Inside</li>
                    <li><code>live_studio</code> - Lives Studio</li>
                    <li><code>best_moments</code> - Best Moments</li>
                    <li><code>testimonial</code> - Témoignages</li>
                </ul>
                
                <h3>Options :</h3>
                <ul>
                    <li><strong>type</strong> : Type de média (voir ci-dessus)</li>
                    <li><strong>limit</strong> : Nombre de médias à afficher (défaut: 10)</li>
                    <li><strong>columns</strong> : Nombre de colonnes (défaut: 3)</li>
                    <li><strong>layout</strong> : grid / list (défaut: grid)</li>
                </ul>
            </div>
            
            <div class="card" style="max-width: 800px;">
                <h2>📄 Shortcodes Articles</h2>
                <p><strong>Shortcode simple :</strong></p>
                <code>[article id="00000000-0000-0000-0000-000000000401"]</code>
                
                <p><strong>Avec options :</strong></p>
                <code>[article id="uuid" layout="compact" show_image="yes" show_tags="no"]</code>
                
                <h3>Options disponibles :</h3>
                <ul>
                    <li><strong>id</strong> : UUID de l'article (requis)</li>
                    <li><strong>layout</strong> : full, compact, minimal (défaut: full)</li>
                    <li><strong>show_image</strong> : yes/no (défaut: yes)</li>
                    <li><strong>show_excerpt</strong> : yes/no (défaut: yes)</li>
                    <li><strong>show_content</strong> : yes/no (défaut: yes)</li>
                    <li><strong>show_tags</strong> : yes/no (défaut: yes)</li>
                    <li><strong>show_meta</strong> : yes/no (défaut: yes)</li>
                </ul>
            </div>
            
            <div class="card" style="max-width: 800px;">
                <h2>🔗 Configuration API</h2>
                <table class="form-table">
                    <tr>
                        <th>URL Supabase</th>
                        <td><code><?php echo esc_html(SIPORTS_SUPABASE_URL); ?></code></td>
                    </tr>
                    <tr>
                        <th>API Articles</th>
                        <td><code><?php echo esc_html(SIPORTS_API_URL); ?></code></td>
                    </tr>
                    <tr>
                        <th>API Médias</th>
                        <td><code><?php echo esc_html(SIPORTS_MEDIA_API_URL); ?></code></td>
                    </tr>
                </table>
            </div>
            
            <div class="card" style="max-width: 800px;">
                <h2>📊 Elementor Pro</h2>
                <?php if (defined('ELEMENTOR_VERSION')): ?>
                    <p class="notice notice-success" style="padding: 10px;">✅ Elementor détecté (v<?php echo ELEMENTOR_VERSION; ?>)</p>
                    <p>Vous pouvez utiliser les widgets <strong>"SIPORTS Article"</strong> et <strong>"SIPORTS Media"</strong> dans Elementor.</p>
                <?php else: ?>
                    <p class="notice notice-warning" style="padding: 10px;">⚠️ Elementor non détecté. Les widgets Elementor ne seront pas disponibles.</p>
                <?php endif; ?>
            </div>
            
            <div class="card" style="max-width: 800px; background: #f0f8ff;">
                <h2>🔧 Configuration Supabase Webhook (Optionnel)</h2>
                <p>Pour une synchronisation instantanée quand vous ajoutez des médias dans l'application SIPORTS, configurez un webhook dans Supabase :</p>
                <ol>
                    <li>Allez dans <strong>Supabase Dashboard → Database → Webhooks</strong></li>
                    <li>Cliquez sur <strong>"Create a new webhook"</strong></li>
                    <li>Configurez comme suit :
                        <ul>
                            <li><strong>Name:</strong> wordpress_sync</li>
                            <li><strong>Table:</strong> media_contents</li>
                            <li><strong>Events:</strong> INSERT, UPDATE, DELETE</li>
                            <li><strong>URL:</strong> <code><?php echo esc_html($webhook_url); ?></code></li>
                            <li><strong>HTTP Headers:</strong><br>
                                <code>X-Webhook-Secret: <?php echo esc_html(SIPORTS_WEBHOOK_SECRET); ?></code>
                            </li>
                        </ul>
                    </li>
                    <li>Cliquez sur <strong>"Create webhook"</strong></li>
                </ol>
                <p><strong>Note :</strong> Sans webhook, les médias se synchronisent automatiquement toutes les <?php echo (SIPORTS_CACHE_TIME / 60); ?> minutes.</p>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            // Test API
            $('#test-api-btn').on('click', function() {
                var $btn = $(this);
                var $result = $('#api-test-result');
                
                $btn.prop('disabled', true).text('Test en cours...');
                $result.html('<p>🔄 Connexion à Supabase...</p>');
                
                $.ajax({
                    url: '<?php echo esc_js(SIPORTS_SUPABASE_URL); ?>/rest/v1/media_contents?select=id,title,type&status=eq.published&limit=5',
                    headers: {
                        'apikey': '<?php echo esc_js(SIPORTS_SUPABASE_ANON_KEY); ?>',
                        'Authorization': 'Bearer <?php echo esc_js(SIPORTS_SUPABASE_ANON_KEY); ?>'
                    },
                    success: function(data) {
                        if (Array.isArray(data)) {
                            var html = '<div class="notice notice-success"><p>✅ Connexion réussie ! ' + data.length + ' média(s) trouvé(s)</p>';
                            if (data.length > 0) {
                                html += '<ul>';
                                data.forEach(function(item) {
                                    html += '<li><strong>' + (item.title || 'Sans titre') + '</strong> (' + item.type + ')</li>';
                                });
                                html += '</ul>';
                            }
                            html += '</div>';
                            $result.html(html);
                        } else {
                            $result.html('<div class="notice notice-error"><p>❌ Réponse invalide</p></div>');
                        }
                    },
                    error: function(xhr, status, error) {
                        $result.html('<div class="notice notice-error"><p>❌ Erreur: ' + error + '</p></div>');
                    },
                    complete: function() {
                        $btn.prop('disabled', false).text('🧪 Tester l\'API');
                    }
                });
            });
        });
        </script>
        <?php
    }
}

// Initialiser le plugin
SIPORTS_Articles_Shortcode::get_instance();
