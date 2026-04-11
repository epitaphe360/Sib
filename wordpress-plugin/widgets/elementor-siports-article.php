<?php
/**
 * Widget Elementor pour afficher les articles SIPORTS
 * Compatible avec Elementor Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

// Vérifier si Elementor est disponible
if (!class_exists('\Elementor\Widget_Base')) {
    return;
}

class Elementor_SIPORTS_Article_Widget extends \Elementor\Widget_Base {
    
    /**
     * Nom du widget
     */
    public function get_name() {
        return 'siports_article';
    }
    
    /**
     * Titre du widget
     */
    public function get_title() {
        return __('SIPORTS Article', 'siports-articles');
    }
    
    /**
     * Icône du widget
     */
    public function get_icon() {
        return 'eicon-post';
    }
    
    /**
     * Catégorie du widget
     */
    public function get_categories() {
        return ['general'];
    }
    
    /**
     * Mots-clés pour la recherche
     */
    public function get_keywords() {
        return ['article', 'siports', 'blog', 'post', 'news'];
    }
    
    /**
     * Enregistrer les contrôles du widget
     */
    protected function register_controls() {
        
        // Section Contenu
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Contenu', 'siports-articles'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );
        
        // ID de l'article
        $this->add_control(
            'article_id',
            [
                'label' => __('ID de l\'article', 'siports-articles'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'placeholder' => '00000000-0000-0000-0000-000000000401',
                'description' => __('UUID de l\'article depuis le Dashboard Marketing', 'siports-articles'),
            ]
        );
        
        // Layout
        $this->add_control(
            'layout',
            [
                'label' => __('Mise en page', 'siports-articles'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'full',
                'options' => [
                    'full' => __('Complète', 'siports-articles'),
                    'compact' => __('Compacte', 'siports-articles'),
                    'minimal' => __('Minimale', 'siports-articles'),
                ],
            ]
        );
        
        $this->end_controls_section();
        
        // Section Affichage
        $this->start_controls_section(
            'display_section',
            [
                'label' => __('Options d\'affichage', 'siports-articles'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );
        
        // Afficher l'image
        $this->add_control(
            'show_image',
            [
                'label' => __('Afficher l\'image', 'siports-articles'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles'),
                'label_off' => __('Non', 'siports-articles'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );
        
        // Afficher l'extrait
        $this->add_control(
            'show_excerpt',
            [
                'label' => __('Afficher l\'extrait', 'siports-articles'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles'),
                'label_off' => __('Non', 'siports-articles'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );
        
        // Afficher le contenu
        $this->add_control(
            'show_content',
            [
                'label' => __('Afficher le contenu', 'siports-articles'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles'),
                'label_off' => __('Non', 'siports-articles'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );
        
        // Afficher les tags
        $this->add_control(
            'show_tags',
            [
                'label' => __('Afficher les tags', 'siports-articles'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles'),
                'label_off' => __('Non', 'siports-articles'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );
        
        // Afficher les meta
        $this->add_control(
            'show_meta',
            [
                'label' => __('Afficher auteur et date', 'siports-articles'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles'),
                'label_off' => __('Non', 'siports-articles'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );
        
        $this->end_controls_section();
        
        // Section Style
        $this->start_controls_section(
            'style_section',
            [
                'label' => __('Style', 'siports-articles'),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );
        
        // Couleur du titre
        $this->add_control(
            'title_color',
            [
                'label' => __('Couleur du titre', 'siports-articles'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .siports-article-title' => 'color: {{VALUE}}',
                ],
            ]
        );
        
        // Taille du titre
        $this->add_control(
            'title_size',
            [
                'label' => __('Taille du titre', 'siports-articles'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px', 'em', 'rem'],
                'range' => [
                    'px' => [
                        'min' => 14,
                        'max' => 60,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .siports-article-title' => 'font-size: {{SIZE}}{{UNIT}}',
                ],
            ]
        );
        
        // Bordure
        $this->add_group_control(
            \Elementor\Group_Control_Border::get_type(),
            [
                'name' => 'article_border',
                'selector' => '{{WRAPPER}} .siports-article',
            ]
        );
        
        // Box Shadow
        $this->add_group_control(
            \Elementor\Group_Control_Box_Shadow::get_type(),
            [
                'name' => 'article_box_shadow',
                'selector' => '{{WRAPPER}} .siports-article',
            ]
        );
        
        $this->end_controls_section();
    }
    
    /**
     * Rendu du widget
     */
    protected function render() {
        $settings = $this->get_settings_for_display();
        
        // Validation
        if (empty($settings['article_id'])) {
            echo '<div class="elementor-alert elementor-alert-warning">';
            echo __('⚠️ Veuillez entrer un ID d\'article', 'siports-articles');
            echo '</div>';
            return;
        }
        
        // Générer le shortcode
        $shortcode = sprintf(
            '[article id="%s" layout="%s" show_image="%s" show_excerpt="%s" show_content="%s" show_tags="%s" show_meta="%s"]',
            esc_attr($settings['article_id']),
            esc_attr($settings['layout']),
            esc_attr($settings['show_image']),
            esc_attr($settings['show_excerpt']),
            esc_attr($settings['show_content']),
            esc_attr($settings['show_tags']),
            esc_attr($settings['show_meta'])
        );
        
        // Exécuter le shortcode
        echo do_shortcode($shortcode);
    }
    
    /**
     * Rendu du contenu pour l'éditeur (mode éditeur Elementor)
     */
    protected function content_template() {
        ?>
        <# 
        if (!settings.article_id) {
            #>
            <div class="elementor-alert elementor-alert-warning">
                ⚠️ Veuillez entrer un ID d'article
            </div>
            <#
        } else {
            #>
            <div class="elementor-alert elementor-alert-info">
                📋 Article ID: {{ settings.article_id }}<br>
                🎨 Layout: {{ settings.layout }}<br>
                👁️ Prévisualisation disponible en mode frontend
            </div>
            <#
        }
        #>
        <?php
    }
}
